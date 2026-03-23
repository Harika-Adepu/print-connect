// src/services/payment.service.js
import api from "./api";

/**
 * POST /api/payments/advance/:orderId
 * Creates a Razorpay advance payment order
 * Returns: { razorpayOrder, amount }
 */
export const createAdvanceOrder = async (orderId) => {
  const response = await api.post(`/payments/advance/${orderId}`);
  return response.data; // { razorpayOrder, amount }
};

/**
 * POST /api/payments/remaining/:orderId
 * Creates a Razorpay remaining payment order
 * Returns: { razorpayOrder, amount }
 */
export const createRemainingOrder = async (orderId) => {
  const response = await api.post(`/payments/remaining/${orderId}`);
  return response.data; // { razorpayOrder, amount }
};

/**
 * POST /api/payments/verify
 * Verifies payment signature after Razorpay checkout
 * Body: { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, orderType }
 */
export const verifyPayment = async ({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  orderType, // "ADVANCE" | "REMAINING"
}) => {
  const response = await api.post("/payments/verify", {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderType,
  });
  return response.data; // { message, order }
};