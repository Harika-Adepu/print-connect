const mongoose = require("mongoose");
const { ORDER_STATUS } = require("../constants/orderStatus");

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Template"
    },

    quantity: {
      type: Number,
      required: true
    },

    language: {
      type: String,
      enum: ["ENGLISH", "TELUGU", "BOTH"],
      default: "ENGLISH"
    },

    color: {
      type: String,
      enum: ["SINGLE", "MULTI"],
      default: "SINGLE"
    },

    pictures: [
      {
        type: String
      }
    ],

    timeRequired: Number,

    details: String,

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.ORDER_PLACED
    },

    price: Number,

    advanceAmount: Number,

    remainingAmount: Number,

    payment: {
      advancePaid: {
        type: Boolean,
        default: false
      },
      remainingPaid: {
        type: Boolean,
        default: false
      }
    },

    razorpay: {
      advanceOrderId: { type: String },
      remainingOrderId: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
