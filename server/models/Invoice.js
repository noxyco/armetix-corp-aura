const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ["SALE", "PURCHASE"], required: true },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Partner",
      required: true,
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        priceHT: { type: Number, required: true },
        tvaRate: { type: Number, required: true },
      },
    ],
    totalHT: { type: Number, default: 0 },
    totalTVA: { type: Number, default: 0 },
    totalTTC: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Non Payée", "Partielle", "Payée"],
      default: "Non Payée",
    },
    amountPaid: { type: Number, default: 0 },
    amountRemaining: {
      type: Number,
      default: function () {
        return this.totalTTC;
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
