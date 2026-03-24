// src/services/owner.service.js
import api from "./api";

// ─── Orders ──────────────────────────────────────────────────────────────────

export const getAllOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

// ─── Products ────────────────────────────────────────────────────────────────

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// ─── Templates ───────────────────────────────────────────────────────────────

export const getTemplates = async (productId) => {
  const response = await api.get(`/templates?productId=${productId}`);
  return response.data;
};

export const createTemplate = async (templateData) => {
  const response = await api.post("/templates", templateData);
  return response.data;
};

// ─── Admin Requests ───────────────────────────────────────────────────────────

export const submitAdminRequest = async (requestData) => {
  const response = await api.post("/admin-requests", requestData);
  return response.data;
};

export const getMyRequests = async () => {
  const response = await api.get("/admin-requests/my-requests");
  return response.data;
};