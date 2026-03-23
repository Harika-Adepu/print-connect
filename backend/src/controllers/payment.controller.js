const Payment = require("../models/Payment.model");
const Order = require("../models/Order.model");
const { ORDER_STATUS } = require("../constants/orderStatus");
const razorpayService = require("../services/razorpay.service");
const crypto = require("crypto");

const ADVANCE_PERCENTAGE = 0.4;

/**
 * CREATE ADVANCE PAYMENT ORDER
 */
exports.createAdvanceOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.customer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your order" });
    if (order.payment.advancePaid)
      return res.status(400).json({ message: "Advance already paid" });
    if (order.status !== ORDER_STATUS.ADVANCE_PAYMENT_PENDING)
      return res.status(400).json({ message: "Advance not allowed at this stage" });

    const advanceAmount = Math.round(order.price * ADVANCE_PERCENTAGE);

    const razorpayOrder = await razorpayService.createOrder({
      amount: advanceAmount,
      receipt: `advance_${order._id}`,
    });

    // ✅ STEP 5 — STORE RAZORPAY ORDER ID
    order.razorpay.advanceOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      message: "Advance Razorpay order created",
      razorpayOrder,
      amount: advanceAmount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * CREATE REMAINING PAYMENT ORDER
 */
exports.createRemainingOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.customer.toString() !== req.user.id)
      return res.status(403).json({ message: "Not your order" });
    if (!order.payment.advancePaid)
      return res.status(400).json({ message: "Advance required first" });
    if (order.payment.remainingPaid)
      return res.status(400).json({ message: "Remaining already paid" });
    if (order.status !== ORDER_STATUS.REMAINING_PAYMENT_PENDING)
      return res.status(400).json({ message: "Remaining not allowed at this stage" });

    const advanceAmount = Math.round(order.price * ADVANCE_PERCENTAGE);
    const remainingAmount = order.price - advanceAmount;

    const razorpayOrder = await razorpayService.createOrder({
      amount: remainingAmount,
      receipt: `remaining_${order._id}`,
    });

    // ✅ STEP 5 — STORE RAZORPAY ORDER ID
    order.razorpay.remainingOrderId = razorpayOrder.id;
    await order.save();

    res.status(200).json({
      message: "Remaining Razorpay order created",
      razorpayOrder,
      amount: remainingAmount,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * VERIFY PAYMENT (Frontend Based Verification)
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderType
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isValid = razorpayService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid)
      return res.status(400).json({ message: "Invalid payment signature" });

    const advanceAmount = Math.round(order.price * ADVANCE_PERCENTAGE);
    const remainingAmount = order.price - advanceAmount;

    let paidAmount = 0;

    if (orderType === "ADVANCE") {
      if (order.payment.advancePaid)
        return res.status(400).json({ message: "Advance already paid" });

      order.payment.advancePaid = true;
      order.advanceAmount = advanceAmount;
      order.remainingAmount = remainingAmount;
      order.status = ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED;
      paidAmount = advanceAmount;
    }

    if (orderType === "REMAINING") {
      if (order.payment.remainingPaid)
        return res.status(400).json({ message: "Remaining already paid" });

      order.payment.remainingPaid = true;
      order.remainingAmount = 0;
      order.status = ORDER_STATUS.REMAINING_PAYMENT_COMPLETED;
      paidAmount = remainingAmount;
    }

    await order.save();

    await Payment.create({
      order: order._id,
      user: order.customer,
      amount: paidAmount,
      type: orderType,
      status: "COMPLETED",
      provider: "RAZORPAY",
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
    });

    res.status(200).json({
      message: "Payment verified",
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());

    if (event.event !== "payment.captured") {
      return res.status(200).json({ message: "Event ignored" });
    }

    const paymentEntity = event.payload.payment.entity;

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;
    const amount = paymentEntity.amount / 100;

    // 🔍 Find order using stored razorpay order ids
    const order = await Order.findOne({
      $or: [
        { "razorpay.advanceOrderId": razorpayOrderId },
        { "razorpay.remainingOrderId": razorpayOrderId }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🛑 Prevent duplicate payment entry
    const existingPayment = await Payment.findOne({
      razorpayPaymentId
    });

    if (existingPayment) {
      return res.status(200).json({ message: "Payment already processed" });
    }

    const advanceAmount = Math.round(order.price * 0.4);
    const remainingAmount = order.price - advanceAmount;

    let paymentType = null;

    // 🎯 Determine payment type
    if (order.razorpay.advanceOrderId === razorpayOrderId) {
      paymentType = "ADVANCE";

      order.payment.advancePaid = true;
      order.advanceAmount = advanceAmount;
      order.remainingAmount = remainingAmount;
      order.status = ORDER_STATUS.ADVANCE_PAYMENT_COMPLETED;
    }

    if (order.razorpay.remainingOrderId === razorpayOrderId) {
      paymentType = "REMAINING";

      order.payment.remainingPaid = true;
      order.remainingAmount = 0;
      order.status = ORDER_STATUS.REMAINING_PAYMENT_COMPLETED;
    }

    if (!paymentType) {
      return res.status(200).json({ message: "Unknown payment mapping" });
    }


    await order.save();

    // 💾 Create Payment record
    await Payment.create({
      order: order._id,
      user: order.customer,
      amount,
      type: paymentType,
      status: "COMPLETED",
      provider: "RAZORPAY",
      razorpayPaymentId,
      razorpayOrderId
    });

    return res.status(200).json({ message: "Webhook processed successfully" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
