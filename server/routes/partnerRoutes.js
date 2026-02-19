const express = require("express");
const router = express.Router();
const Partner = require("../models/Partner");

router.post("/", async (req, res) => {
  try {
    const p = new Partner(req.body);
    await p.save();
    res.status(201).json(p);
  } catch (e) {
    res.status(500).json(e);
  }
});

router.get("/", async (req, res) => {
  const partners = await Partner.find();
  res.json(partners);
});

// In partnerRoutes.js
router.get("/:id/stats", async (req, res) => {
  try {
    const partnerId = req.params.id;
    const invoices = await Invoice.find({ partner: partnerId });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    const totalPaid = invoices
      .filter((inv) => inv.status === "PAID")
      .reduce((sum, inv) => sum + inv.totalTTC, 0);
    const balance = totalInvoiced - totalPaid;

    res.json({
      totalInvoiced,
      totalPaid,
      balance,
      invoiceCount: invoices.length,
      history: invoices,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// router.get("/:id/ledger", async (req, res) => {
//   try {
//     const partnerId = req.params.id;

//     // Fetch all invoices (Sales and Purchases)
//     const invoices = await Invoice.find({ partner: partnerId })
//       .sort({ date: 1 })
//       .populate("items.product");

//     // Map invoices to a "Transaction" format
//     const transactions = invoices.map((inv) => {
//       const isSale = inv.type === "SALE";
//       return {
//         _id: inv._id,
//         date: inv.date,
//         type: inv.type, // SALE or PURCHASE
//         reference: inv.invoiceNumber,
//         amount: inv.totalTTC,
//         // For a Client (SALE): Invoice increases what they owe us (+)
//         // For a Supplier (PURCHASE): Invoice increases what we owe them (-)
//         impact: isSale ? inv.totalTTC : -inv.totalTTC,
//         status: inv.status,
//         paymentStatus: inv.paymentStatus || "Unpaid",
//         itemsCount: inv.items.length,
//       };
//     });

//     // Calculate the "Solde de compte"
//     // Positive = They owe us money | Negative = We owe them money
//     const solde = transactions.reduce((acc, curr) => acc + curr.impact, 0);

//     res.json({
//       transactions,
//       solde,
//       partnerId,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
