// src/services/order.service.js
import api from "./api";

/**
 * POST /api/orders
 * Creates a new order (customer only)
 * Body: { product, template?, quantity, language?, color?, pictures?, timeRequired?, details? }
 */
export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);
  return response.data; // { message, order }
};

/**
 * GET /api/orders/my-orders
 * Returns all orders for the logged-in customer
 */
export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");
  return response.data; // Order[]
};

/**
 * GET /api/products
 * Returns all active products
 */
export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data; // Product[]
};

/**
 * GET /api/templates?productId=xxx
 * Returns templates for a given product
 */
export const getTemplates = async (productId) => {
  const response = await api.get(`/templates?productId=${productId}`);
  return response.data; // Template[]
};