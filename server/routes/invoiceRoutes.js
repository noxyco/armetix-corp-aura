const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Expense = require("../models/Expense");
const pdfService = require("../services/pdfService");

// --- FIX: Remove the blocking logic entirely ---
const isAdmin = (req, res, next) => {
  next(); // Always allow
};

// 1. MONTHLY REPORT
// 1. MONTHLY REPORT
router.get("/report/:month/:year", async (req, res) => {
  try {
    const { month, year } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const [invoices, expensesData, allProducts] = await Promise.all([
      Invoice.find({ date: { $gte: startDate, $lte: endDate } }),
      Expense.find({ date: { $gte: startDate, $lte: endDate } }),
      Product.find({}), // Fetch all products for stock valuation
    ]);

    // Financial Calculations
    const salesInvoices = invoices.filter((i) => i.type === "SALE");
    const purchaseInvoices = invoices.filter((i) => i.type === "PURCHASE");

    const salesTotal = salesInvoices.reduce((a, b) => a + (b.totalTTC || 0), 0);
    const purchaseTotal = purchaseInvoices.reduce(
      (a, b) => a + (b.totalTTC || 0),
      0,
    );
    const expenseTotal = expensesData.reduce((a, b) => a + (b.amount || 0), 0);

    // Stock Valuation (Quantity * Unit Price HT)
    const totalStockValue = allProducts.reduce(
      (a, b) => a + b.stockQuantity * b.priceHT,
      0,
    );

    const reportData = {
      month,
      year,
      sales: salesTotal,
      purchases: purchaseTotal,
      expenses: expenseTotal,
      salesTVA: salesInvoices.reduce((a, b) => a + (b.totalTVA || 0), 0),
      purchasesTVA: purchaseInvoices.reduce((a, b) => a + (b.totalTVA || 0), 0),
      netProfit: salesTotal - purchaseTotal - expenseTotal,
      stockValue: totalStockValue,
      invoiceCount: invoices.length,
      expenseCount: expensesData.length,
    };

    pdfService.generateMonthlyReport(reportData, (binary) => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Rapport_${month}_${year}.pdf`,
      );
      res.send(binary);
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la génération du rapport" });
  }
});

// 2. GET ALL
router.get("/", async (req, res) => {
  try {
    const invoices = await Invoice.find().populate("partner items.product");
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. CREATE INVOICE
router.post("/", async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    for (const item of newInvoice.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (newInvoice.type === "SALE")
          product.stockQuantity -= Number(item.quantity);
        else product.stockQuantity += Number(item.quantity);
        await product.save();
      }
    }
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. PDF BY ID
router.get("/pdf/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "partner items.product",
    );
    if (!invoice) return res.status(404).send("Facture introuvable");
    pdfService.generateInvoicePDF(invoice, (binary) => {
      res.setHeader("Content-Type", "application/pdf");
      res.send(binary);
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// GET single invoice by ID
router.get("/:id", async (req, res) => {
  try {
    // Populate partner AND the product details within the items array
    const invoice = await Invoice.findById(req.params.id)
      .populate("partner")
      .populate("items.product");

    if (!invoice) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DELETE
router.delete("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice)
      return res.status(404).json({ message: "Facture introuvable" });

    for (const item of invoice.items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (invoice.type === "SALE")
          product.stockQuantity += Number(item.quantity);
        else product.stockQuantity -= Number(item.quantity);
        await product.save();
      }
    }
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: "Supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
