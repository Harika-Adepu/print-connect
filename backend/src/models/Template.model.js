const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    previewImage: { type: String }, // URL or cloud storage path
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Template", templateSchema);
