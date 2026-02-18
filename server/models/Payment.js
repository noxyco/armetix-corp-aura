const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  // Automatic payment number: e.g., REG-2024-001
  paymentNumber: { type: String, unique: true },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Invoice",
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: {
    type: String,
    enum: ["Espèces", "Virement", "Chèque", "Carte", "Effet"],
    required: true,
  },
  note: String,
});

module.exports = mongoose.model("Payment", PaymentSchema);
