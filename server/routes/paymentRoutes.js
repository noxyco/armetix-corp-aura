const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");

router.post("/", async (req, res) => {
  try {
    // Added 'date' to the destructuring
    const { invoiceId, amount, method, note, date } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice)
      return res.status(404).json({ message: "Facture non trouvée" });

    if (invoice.amountPaid === undefined) invoice.amountPaid = 0;

    const count = await Payment.countDocuments();
    const paymentRef = `REG-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, "0")}`;

    const payment = new Payment({
      paymentNumber: paymentRef,
      invoice: invoiceId,
      amount: Number(amount),
      method,
      note,
      date: date || Date.now(), // Save the custom date
    });
    await payment.save();

    invoice.amountPaid += Number(amount);
    invoice.amountRemaining = invoice.totalTTC - invoice.amountPaid;

    // Status logic
    if (invoice.amountRemaining <= 0.1) {
      invoice.status = "Payée";
      invoice.amountRemaining = 0;
    } else if (invoice.amountPaid > 0) {
      invoice.status = "Partielle";
    }

    await invoice.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET all payments with full population
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({ path: "invoice", populate: { path: "partner" } })
      .sort({ date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
