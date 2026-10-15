import crypto from "crypto";
import Order from "../models/order.model.js";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import razorpay from "../config/razorpay.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    const customerId = req.user._id;

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are required and cannot be empty",
      });
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be a valid 10-digit number",
      });
    }

    const pincodeRegex = /^[0-9]{6}$/;
    if (!pincodeRegex.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain 6 digits",
      });
    }

    const customer = await Customer.findById(customerId).populate("cart.product");

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty. Add products to checkout.",
      });
    }

    for (const item of customer.cart) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available",
        });
      }

      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
        });
      }
    }

    const totalAmount = customer.cart.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const orderItems = customer.cart.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    const shopKartOrder = new Order({
      user: customer._id,
      items: orderItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    await shopKartOrder.save();

    const amountInPaise = Math.round(totalAmount * 100);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString(),
      });
    } catch (rzpErr) {
      console.error("Razorpay order creation error:", rzpErr);
      return res.status(500).json({
        success: false,
        message: "Failed to initiate payment gateway: " + (rzpErr.error?.description || rzpErr.message),
      });
    }

    shopKartOrder.razorpayOrderId = razorpayOrder.id;
    await shopKartOrder.save();

    res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const customerId = req.user._id;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are incomplete",
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== customerId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access to order" });
    }

    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    const customer = await Customer.findById(customerId);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment verified and order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const customerId = req.user._id;

    const orders = await Order.find({ user: customerId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user._id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: "Invalid order ID format" });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== customerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot access another user's order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order By Id Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
