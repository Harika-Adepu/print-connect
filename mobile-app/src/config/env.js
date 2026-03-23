// src/config/env.js
// 👉 Change BASE_URL to your deployed backend URL in production

const ENV = {
  BASE_URL: "http://192.168.1.100:5001/api", // ← Replace with your local IP when testing on device
  RAZORPAY_KEY_ID: "YOUR_RAZORPAY_KEY_ID",   // ← Replace before payment testing
};

export default ENV;