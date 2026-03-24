// src/services/delivery.service.js
import api from "./api";

/**
 * GET /api/delivery/my-deliveries
 * All deliveries assigned to logged-in agent
 */
export const getMyDeliveries = async () => {
  const response = await api.get("/delivery/my-deliveries");
  return response.data; // Delivery[]
};

/**
 * GET /api/delivery/available
 * Orders that are OUT_FOR_DELIVERY and not yet assigned
 */
export const getAvailableOrders = async () => {
  const response = await api.get("/delivery/available");
  return response.data; // Order[]
};

/**
 * GET /api/delivery/stats
 * Agent stats: total, assigned, picked, delivered
 */
export const getDeliveryStats = async () => {
  const response = await api.get("/delivery/stats");
  return response.data; // { total, assigned, picked, delivered }
};

/**
 * POST /api/delivery/accept/:orderId
 * Agent self-assigns an available order
 */
export const acceptDelivery = async (orderId) => {
  const response = await api.post(`/delivery/accept/${orderId}`);
  return response.data; // { message, delivery }
};

/**
 * PUT /api/delivery/:deliveryId/pickup
 * Agent confirms they picked up the order
 * Delivery status: assigned → picked
 */
export const confirmPickup = async (deliveryId) => {
  const response = await api.put(`/delivery/${deliveryId}/pickup`);
  return response.data; // { message, delivery }
};

/**
 * PUT /api/delivery/:deliveryId/deliver
 * Agent marks order as delivered
 * Delivery status: picked → delivered
 * Order status: OUT_FOR_DELIVERY → DELIVERED
 */
export const markDelivered = async (deliveryId) => {
  const response = await api.put(`/delivery/${deliveryId}/deliver`);
  return response.data; // { message, delivery }
};