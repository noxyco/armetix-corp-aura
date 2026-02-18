const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: "invoice",
        populate: { path: "partner" }, // This gets the Client/Supplier name
      })
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { invoiceId, amount, method, note } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice)
      return res.status(404).json({ message: "Facture non trouvée" });

    // --- SAFETY FIX: Initialize fields if they are empty ---
    if (invoice.amountPaid === undefined) invoice.amountPaid = 0;
    if (invoice.amountRemaining === undefined)
      invoice.amountRemaining = invoice.totalTTC;

    // 1. Generate a unique Payment Number (Reference)
    const count = await Payment.countDocuments();
    const paymentRef = `REG-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    // 2. Create the payment record
    const payment = new Payment({
      paymentNumber: paymentRef,
      invoice: invoiceId,
      amount: Number(amount),
      method,
      note,
    });
    await payment.save();

    // 3. Update Invoice
    invoice.amountPaid += Number(amount);
    invoice.amountRemaining = invoice.totalTTC - invoice.amountPaid;

    // 4. Status Logic
    if (invoice.amountRemaining <= 0.01) {
      // Use 0.01 to handle floating point math
      invoice.status = "Payée";
      invoice.amountRemaining = 0;
    } else if (invoice.amountPaid > 0) {
      invoice.status = "Partielle";
    }

    await invoice.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error("Payment Error:", err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
