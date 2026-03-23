// src/utils/constants.js

export const ORDER_STATUS = {
  ORDER_PLACED: "ORDER_PLACED",
  DESIGN_APPROVED: "DESIGN_APPROVED",
  DESIGN_REJECTED: "DESIGN_REJECTED",
  ADVANCE_PAYMENT_PENDING: "ADVANCE_PAYMENT_PENDING",
  ADVANCE_PAYMENT_COMPLETED: "ADVANCE_PAYMENT_COMPLETED",
  PRINTING_IN_PROGRESS: "PRINTING_IN_PROGRESS",
  PRINTING_COMPLETED: "PRINTING_COMPLETED",
  REMAINING_PAYMENT_PENDING: "REMAINING_PAYMENT_PENDING",
  REMAINING_PAYMENT_COMPLETED: "REMAINING_PAYMENT_COMPLETED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  ORDER_COMPLETED: "ORDER_COMPLETED",
};

// Human-readable labels
export const ORDER_STATUS_LABELS = {
  ORDER_PLACED: "Order Placed",
  DESIGN_APPROVED: "Design Approved",
  DESIGN_REJECTED: "Design Rejected",
  ADVANCE_PAYMENT_PENDING: "Advance Payment Due",
  ADVANCE_PAYMENT_COMPLETED: "Advance Paid",
  PRINTING_IN_PROGRESS: "Printing In Progress",
  PRINTING_COMPLETED: "Printing Done",
  REMAINING_PAYMENT_PENDING: "Remaining Payment Due",
  REMAINING_PAYMENT_COMPLETED: "Remaining Paid",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
  ORDER_COMPLETED: "Completed",
};

// Color mapping per status (keys match COLORS in theme.js)
export const ORDER_STATUS_COLOR = {
  ORDER_PLACED: "info",
  DESIGN_APPROVED: "info",
  DESIGN_REJECTED: "danger",
  ADVANCE_PAYMENT_PENDING: "warning",
  ADVANCE_PAYMENT_COMPLETED: "success",
  PRINTING_IN_PROGRESS: "info",
  PRINTING_COMPLETED: "info",
  REMAINING_PAYMENT_PENDING: "warning",
  REMAINING_PAYMENT_COMPLETED: "success",
  OUT_FOR_DELIVERY: "info",
  DELIVERED: "success",
  ORDER_COMPLETED: "success",
};

export const LANGUAGE_OPTIONS = [
  { label: "English", value: "ENGLISH" },
  { label: "Telugu", value: "TELUGU" },
  { label: "Both", value: "BOTH" },
];

export const COLOR_OPTIONS = [
  { label: "Single Color", value: "SINGLE" },
  { label: "Multi Color", value: "MULTI" },
];

export const USER_ROLES = {
  CUSTOMER: "customer",
  OWNER: "owner",
  ADMIN: "admin",
  DELIVERY: "delivery",
};