const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true }, // e.g., SKU
    designation: { type: String, required: true },
    priceHT: { type: Number, required: true }, // Price before tax
    tvaRate: {
      type: Number,
      required: true,
      enum: [7, 10, 14, 20], // Standard Moroccan VAT rates
      default: 20,
    },
    stockQuantity: { type: Number, default: 0 },
    category: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", ProductSchema);
