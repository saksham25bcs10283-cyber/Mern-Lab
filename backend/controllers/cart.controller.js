import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user._id;

        if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid product ID format" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const customer = await Customer.findById(customerId);
        
        const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex > -1) {
            if (customer.cart[cartItemIndex].quantity + 1 > product.stock) {
                return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
            }
            customer.cart[cartItemIndex].quantity += 1;
        } else {
            if (product.stock < 1) {
                return res.status(400).json({ success: false, message: "Product is out of stock" });
            }
            customer.cart.push({ product: productId, quantity: 1 });
        }

        await customer.save();

        const updatedCustomer = await Customer.findById(customerId).populate({
            path: 'cart.product',
            select: 'name price image stock category'
        });

        res.status(200).json({ success: true, message: "Cart updated", cart: updatedCustomer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getCart = async (req, res) => {
    try {
        const customerId = req.user._id;
        
        const customer = await Customer.findById(customerId).populate({
            path: 'cart.product',
            select: 'name price image stock category'
        });

        res.status(200).json({ success: true, cart: customer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const customerId = req.user._id;

        if (!quantity || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ success: false, message: "Quantity must be at least 1" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: "Quantity exceeds available stock" });
        }

        const customer = await Customer.findById(customerId);
        const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);

        if (cartItemIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not in cart" });
        }

        customer.cart[cartItemIndex].quantity = quantity;
        await customer.save();

        const updatedCustomer = await Customer.findById(customerId).populate('cart.product', 'name price image stock category');
        res.status(200).json({ success: true, message: "Quantity updated", cart: updatedCustomer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const customerId = req.user._id;

        const customer = await Customer.findById(customerId);
        customer.cart = customer.cart.filter(item => item.product.toString() !== productId);
        
        await customer.save();

        const updatedCustomer = await Customer.findById(customerId).populate('cart.product', 'name price image stock category');
        res.status(200).json({ success: true, message: "Product removed from cart", cart: updatedCustomer.cart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
