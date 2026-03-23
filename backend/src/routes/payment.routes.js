const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const paymentController = require("../controllers/payment.controller");

// Customer payments
router.post("/advance/:orderId", protect, authorizeRoles("customer"), paymentController.createAdvanceOrder);
router.post("/remaining/:orderId", protect, authorizeRoles("customer"), paymentController.createRemainingOrder);
router.post("/verify", protect, authorizeRoles("customer"), paymentController.verifyPayment);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleRazorpayWebhook
);


module.exports = router;
