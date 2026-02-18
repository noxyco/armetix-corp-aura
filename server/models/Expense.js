const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "Loyer",
        "Electricité",
        "Transport",
        "Salaire",
        "Marketing",
        "Autre",
      ],
      default: "Autre",
    },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ["Espèces", "Virement", "Chèque"],
      default: "Espèces",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", ExpenseSchema);
