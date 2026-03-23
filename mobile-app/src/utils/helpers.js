// src/utils/helpers.js

import { COLORS } from "../config/theme";
import { ORDER_STATUS_COLOR } from "./constants";

/**
 * Format a number as Indian Rupee currency
 * e.g. 2500 → "₹2,500"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "₹0";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

/**
 * Format an ISO date string to a readable format
 * e.g. "2024-01-15T10:30:00Z" → "15 Jan 2024"
 */
export const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/**
 * Returns a theme color for a given order status
 */
export const getStatusColor = (status) => {
  const colorKey = ORDER_STATUS_COLOR[status];
  return COLORS[colorKey] || COLORS.muted;
};

export const getStatusLightColor = (status) => {
  const colorKey = ORDER_STATUS_COLOR[status];
  const lightKey = colorKey ? colorKey + "Light" : null;
  return COLORS[lightKey] || "#F1F5F9";
};

/**
 * Truncate a string to maxLength with ellipsis
 */
export const truncate = (str, maxLength = 40) => {
  if (!str) return "";
  return str.length > maxLength ? str.substring(0, maxLength) + "…" : str;
};

/**
 * Generate order display ID from MongoDB _id
 * e.g. "664abc123def456789" → "#464789"
 */
export const shortOrderId = (id) => {
  if (!id) return "";
  return "#" + id.slice(-6).toUpperCase();
};