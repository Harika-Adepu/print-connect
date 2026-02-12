const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Important: raw body required for Razorpay signature verification
router.post(
  "/razorpay",
  express.raw({ type: "application/json" }),
  paymentController.handleRazorpayWebhook
);

module.exports = router;
