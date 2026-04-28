const crypto = require('crypto');
const jwt = require('jsonwebtoken');

async function testApi() {
  const token = jwt.sign({ id: '60d0fe4f5311236168a109ca', role: 'customer' }, 'farmlink_jwt_secret_2024');
  
  const razorpayOrderId = 'order_test_125';
  const razorpayPaymentId = 'pay_test_xyzzz';
  const razorpaySignature = crypto
      .createHmac("sha256", "bT2cOlvPm1HeiPmPQ24fWmNC")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

  const payload = {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    items: [
      {
        productId: '60d0fe4f5311236168a109cb',
        name: 'Organic Apples',
        price: '100',
        quantity: 2,
        farmerName: 'John',
        farmer: { _id: '60d0fe4f5311236168a109cc', name: 'John Doe' }, // HERE IS THE OBJECT
        image: ''
      }
    ],
    address: '123 Test St',
    paymentMethod: 'upi',
    total: 200,
    userName: 'Tester'
  };

  try {
    const res = await fetch('http://localhost:5000/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testApi();
