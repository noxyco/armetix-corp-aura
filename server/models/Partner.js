const mongoose = require("mongoose");

const PartnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["CLIENT", "SUPPLIER"], required: true },
    ice: { type: String, required: true }, // Identifiant Commun de l’Entreprise
    if: String, // Identifiant Fiscal
    address: String,
    phone: String,
    email: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Partner", PartnerSchema);
