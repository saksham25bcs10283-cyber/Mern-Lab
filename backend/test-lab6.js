import crypto from "crypto";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Customer from "./models/customer.model.js";
import Product from "./models/product.model.js";
import Order from "./models/order.model.js";

dotenv.config();

const BASE_URL = "http://localhost:8082";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runLab6Tests() {
  console.log("\n========================================================");
  console.log("🧪 Running ShopKart Lab 06 (Checkout & Orders) Test Suite");
  console.log("========================================================\n");

  const timestamp = Date.now();
  const userAEmail = `lab6_userA_${timestamp}@shopkart.com`;
  const userBEmail = `lab6_userB_${timestamp}@shopkart.com`;
  const userPassword = "password123";

  let cookieUserA = "";
  let cookieUserB = "";
  let sampleProductId = "";
  let sampleProductPrice = 0;

  // 1. Register User A
  console.log("👤 Step 1: Registering Test Customer A...");
  try {
    const regRes = await fetch(`${BASE_URL}/customers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Aarav Sharma",
        email: userAEmail,
        password: userPassword,
        phone: "9876543210",
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, "User A registered successfully");

    // Login User A
    const loginRes = await fetch(`${BASE_URL}/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userAEmail, password: userPassword }),
    });
    const setCookie = loginRes.headers.get("set-cookie");
    if (setCookie) {
      cookieUserA = setCookie.split(";")[0];
    }
    assert(loginRes.status === 200, "User A logged in & received auth cookie");
  } catch (err) {
    console.error("Setup error User A:", err);
  }

  // 2. Register & Login User B (for cross-user authorization tests)
  console.log("\n👤 Step 2: Registering Test Customer B (for authorization checks)...");
  try {
    await fetch(`${BASE_URL}/customers/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Rohan Patel",
        email: userBEmail,
        password: userPassword,
        phone: "9123456780",
      }),
    });
    const loginBRes = await fetch(`${BASE_URL}/customers/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userBEmail, password: userPassword }),
    });
    const setCookieB = loginBRes.headers.get("set-cookie");
    if (setCookieB) {
      cookieUserB = setCookieB.split(";")[0];
    }
    assert(loginBRes.status === 200, "User B logged in & received auth cookie");
  } catch (err) {
    console.error("Setup error User B:", err);
  }

  // 3. Get a sample product
  console.log("\n📦 Step 3: Fetching catalogue product for testing...");
  try {
    const prodRes = await fetch(`${BASE_URL}/products`);
    const prodData = await prodRes.json();
    if (prodData.products && prodData.products.length > 0) {
      const prod = prodData.products[0];
      sampleProductId = prod._id;
      sampleProductPrice = prod.price;
      console.log(`   Using product: "${prod.name}" (₹${prod.price}, Stock: ${prod.stock})`);
    }
    assert(Boolean(sampleProductId), "Found catalogue product for testing");
  } catch (err) {
    console.error("Product fetch error:", err);
  }

  // ----------------------------------------------------
  // TEST SUITE EVALUATION
  // ----------------------------------------------------

  // Test 1: Empty cart rejection
  console.log("\n🧪 Test 1: Empty cart checkout rejection (400 Bad Request)");
  try {
    const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserA,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "22 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
      }),
    });
    const data = await res.json();
    assert(res.status === 400, `Empty cart returns 400 Bad Request (Got ${res.status})`);
    assert(data.success === false, "Response returns success: false");
  } catch (e) {
    assert(false, `Test 1 failed: ${e.message}`);
  }

  // Test 2: Unauthenticated order request
  console.log("\n🧪 Test 2: Unauthenticated order creation (401 Unauthorized)");
  try {
    const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "22 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
      }),
    });
    assert(res.status === 401, `Unauthenticated request blocked with 401 (Got ${res.status})`);
  } catch (e) {
    assert(false, `Test 2 failed: ${e.message}`);
  }

  // Test 3: Shipping address validation (Invalid phone & pincode)
  console.log("\n🧪 Test 3: Shipping address field validation rules");
  try {
    // Add item to cart first so cart isn't empty
    await fetch(`${BASE_URL}/cart/${sampleProductId}`, {
      method: "POST",
      headers: { Cookie: cookieUserA },
    });

    const resInvalidPincode = await fetch(`${BASE_URL}/orders/create-payment-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserA,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "22 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "123", // Invalid pincode
        },
      }),
    });
    assert(resInvalidPincode.status === 400, `Short pincode rejected with 400 (Got ${resInvalidPincode.status})`);

    const resInvalidPhone = await fetch(`${BASE_URL}/orders/create-payment-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserA,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "Aarav Sharma",
          phone: "abc", // Invalid phone
          addressLine1: "22 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
      }),
    });
    assert(resInvalidPhone.status === 400, `Non-numeric phone rejected with 400 (Got ${resInvalidPhone.status})`);
  } catch (e) {
    assert(false, `Test 3 failed: ${e.message}`);
  }

  // Test 4: Fake total amount sent from frontend is ignored
  console.log("\n🧪 Test 4: Fake total amount sent from frontend is ignored by server");
  let shopKartOrderId = "";
  let razorpayOrderId = "";
  try {
    const res = await fetch(`${BASE_URL}/orders/create-payment-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserA,
      },
      body: JSON.stringify({
        shippingAddress: {
          fullName: "Aarav Sharma",
          phone: "9876543210",
          addressLine1: "22 MG Road",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
        },
        totalAmount: 1, // Fake total injected by client!
      }),
    });
    const data = await res.json();
    assert(res.status === 200, `Order creation endpoint returned 200 (Got ${res.status})`);
    assert(data.success === true, "Response has success: true");
    assert(Boolean(data.shopKartOrderId), "ShopKart pending order ID returned");
    assert(Boolean(data.razorpayOrderId), "Razorpay order ID returned");
    assert(data.currency === "INR", "Currency is INR");

    // The amount in paise must match DB product price * 100, NOT 1 * 100
    const expectedPaise = Math.round(sampleProductPrice * 100);
    assert(
      data.amount === expectedPaise,
      `Server ignored fake total (1) and calculated authoritative price (Expected: ${expectedPaise} paise, Got: ${data.amount})`
    );

    shopKartOrderId = data.shopKartOrderId;
    razorpayOrderId = data.razorpayOrderId;
  } catch (e) {
    assert(false, `Test 4 failed: ${e.message}`);
  }

  // Test 5: Cart remains intact before payment verification
  console.log("\n🧪 Test 5: Cart items preserved before payment verification");
  try {
    const cartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: cookieUserA },
    });
    const cartData = await cartRes.json();
    assert(cartData.cart && cartData.cart.length > 0, "Cart still contains items after order creation");
  } catch (e) {
    assert(false, `Test 5 failed: ${e.message}`);
  }

  // Test 6: Fake payment verification rejected
  console.log("\n🧪 Test 6: Fake payment signature rejected (400 Bad Request)");
  try {
    const verifyRes = await fetch(`${BASE_URL}/orders/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserA,
      },
      body: JSON.stringify({
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: "pay_fake123",
        razorpay_signature: "tampered_fake_signature_hash",
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 400, `Tampered signature rejected with 400 (Got ${verifyRes.status})`);
    assert(verifyData.success === false, "Verification success is false");

    // Cart must still not be cleared
    const cartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: cookieUserA },
    });
    const cartData = await cartRes.json();
    assert(cartData.cart && cartData.cart.length > 0, "Cart is still preserved after failed payment");
  } catch (e) {
    assert(false, `Test 6 failed: ${e.message}`);
  }

  // Test 7: Valid payment signature verification succeeds, updates order, clears cart
  console.log("\n🧪 Test 7: Valid payment signature verification (Order PLACED & Cart Cleared)");
  try {
    const dummyPaymentId = `pay_test_${Date.now()}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "razorpay_secret_placeholder";
    const body = razorpayOrderId + "|" + dummyPaymentId;
    const validSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    const verifyRes = await fetch(`${BASE_URL}/orders/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieUserA,
      },
      body: JSON.stringify({
        shopKartOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: dummyPaymentId,
        razorpay_signature: validSignature,
      }),
    });
    const verifyData = await verifyRes.json();
    assert(verifyRes.status === 200, `Valid signature accepted with 200 (Got ${verifyRes.status})`);
    assert(verifyData.success === true, "Verification success is true");
    assert(verifyData.order.status === "PLACED", "Order status updated to PLACED");
    assert(verifyData.order.paymentStatus === "PAID", "Payment status updated to PAID");
    assert(verifyData.order.razorpayPaymentId === dummyPaymentId, "Payment ID recorded in order");

    // Now confirm cart is cleared
    const cartRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Cookie: cookieUserA },
    });
    const cartData = await cartRes.json();
    assert(cartData.cart && cartData.cart.length === 0, "Customer cart is now empty after successful payment verification");
  } catch (e) {
    assert(false, `Test 7 failed: ${e.message}`);
  }

  // Test 8: Fetch user orders (GET /orders)
  console.log("\n🧪 Test 8: Get user orders (GET /orders)");
  try {
    const ordersRes = await fetch(`${BASE_URL}/orders`, {
      headers: { Cookie: cookieUserA },
    });
    const ordersData = await ordersRes.json();
    assert(ordersRes.status === 200, `Get orders returned 200 (Got ${ordersRes.status})`);
    assert(Array.isArray(ordersData.orders), "Orders is an array");
    const foundOrder = ordersData.orders.find((o) => o._id === shopKartOrderId);
    assert(Boolean(foundOrder), "Newly created order is present in user orders list");
    assert(foundOrder.items.length > 0, "Order items snapshot preserved");
    assert(Boolean(foundOrder.items[0].name), "Product name is snapshotted");
    assert(Boolean(foundOrder.items[0].price), "Product price is snapshotted");
  } catch (e) {
    assert(false, `Test 8 failed: ${e.message}`);
  }

  // Test 9: Get single order by ID (GET /orders/:id)
  console.log("\n🧪 Test 9: Get single order by ID (GET /orders/:id)");
  try {
    const orderRes = await fetch(`${BASE_URL}/orders/${shopKartOrderId}`, {
      headers: { Cookie: cookieUserA },
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 200, `Get single order returned 200 (Got ${orderRes.status})`);
    assert(orderData.order && orderData.order._id === shopKartOrderId, "Returned order ID matches");
  } catch (e) {
    assert(false, `Test 9 failed: ${e.message}`);
  }

  // Test 10: Cross-user order ownership isolation (User B accessing User A's order)
  console.log("\n🧪 Test 10: Cross-user order ownership isolation (403 Forbidden)");
  try {
    const forbiddenRes = await fetch(`${BASE_URL}/orders/${shopKartOrderId}`, {
      headers: { Cookie: cookieUserB },
    });
    assert(
      forbiddenRes.status === 403,
      `User B blocked from accessing User A's order with 403 Forbidden (Got ${forbiddenRes.status})`
    );
  } catch (e) {
    assert(false, `Test 10 failed: ${e.message}`);
  }

  console.log("\n========================================================");
  console.log(`📊 Test Summary: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
  console.log("========================================================\n");
}

runLab6Tests().catch(console.error);
