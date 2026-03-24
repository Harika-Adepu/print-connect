// src/models/AdminRequest.model.js
const mongoose = require("mongoose");

const adminRequestSchema = new mongoose.Schema(
  {
    // Who sent it
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Type of request
    type: {
      type: String,
      enum: [
        "PRICE_UPDATE",       // Owner wants to change product price
        "TEMPLATE_UPDATE",    // Owner submitting new design/template
        "PRODUCT_CHANGE",     // Owner requesting product/category change
        "DISCOUNT_REQUEST",   // Owner requesting discount/offer
        "OPERATIONAL_FEEDBACK", // General operational feedback
      ],
      required: true,
    },

    // Optional reference to a product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    // Optional reference to a template
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template",
    },

    // The actual request content
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    // For price update requests
    currentPrice: { type: Number },
    requestedPrice: { type: Number },

    // For discount requests
    discountPercentage: { type: Number },
    discountReason: { type: String },

    // Admin response
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "REVIEWED"],
      default: "PENDING",
    },

    adminNote: { type: String }, // Admin's reply/note
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminRequest", adminRequestSchema);