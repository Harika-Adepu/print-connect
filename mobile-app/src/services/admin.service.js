// src/services/admin.service.js
import api from "./api";

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getAdminStats = async () => {
  const r = await api.get("/admin/stats");
  return r.data;
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const getAllUsers = async (role) => {
  const r = await api.get("/admin/users", { params: role ? { role } : {} });
  return r.data;
};

export const deleteUser = async (userId) => {
  const r = await api.delete(`/admin/users/${userId}`);
  return r.data;
};

// ── Orders ────────────────────────────────────────────────────────────────────
export const getAllOrders = async () => {
  const r = await api.get("/admin/orders");
  return r.data;
};

// ── Products ──────────────────────────────────────────────────────────────────
export const getAllProducts = async () => {
  const r = await api.get("/admin/products");
  return r.data;
};

export const updateProduct = async (productId, data) => {
  const r = await api.put(`/admin/products/${productId}`, data);
  return r.data;
};

export const deactivateProduct = async (productId) => {
  const r = await api.delete(`/admin/products/${productId}`);
  return r.data;
};

// ── Templates ─────────────────────────────────────────────────────────────────
export const getAllTemplates = async () => {
  const r = await api.get("/admin/templates");
  return r.data;
};

export const updateTemplate = async (templateId, data) => {
  const r = await api.put(`/admin/templates/${templateId}`, data);
  return r.data;
};

// ── Requests ──────────────────────────────────────────────────────────────────
export const getAdminRequests = async (filters = {}) => {
  const r = await api.get("/admin/requests", { params: filters });
  return r.data;
};

export const reviewRequest = async (requestId, { status, adminNote }) => {
  const r = await api.put(`/admin/requests/${requestId}/review`, { status, adminNote });
  return r.data;
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const getAllPayments = async () => {
  const r = await api.get("/admin/payments");
  return r.data;
};