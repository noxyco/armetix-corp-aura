const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

exports.createInvoice = async (req, res) => {
  try {
    const { invoiceNumber, type, partner, items } = req.body;

    let totalHT = 0;
    let totalTVA = 0;

    // Calculate totals and update stock
    for (let item of items) {
      const lineHT = item.quantity * item.priceHT;
      const lineTVA = lineHT * (item.tvaRate / 100);

      totalHT += lineHT;
      totalTVA += lineTVA;

      // STOCK LOGIC: If it's a SALE, decrease stock. If PURCHASE, increase it.
      const stockAdjustment = type === "SALE" ? -item.quantity : item.quantity;
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stockQuantity: stockAdjustment },
      });
    }

    const totalTTC = totalHT + totalTVA;

    const newInvoice = new Invoice({
      invoiceNumber,
      type,
      partner,
      items,
      totalHT,
      totalTVA,
      totalTTC,
    });

    const savedInvoice = await newInvoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoices = async (req, res) => {
  try {
    // .populate('partner') brings the Client/Supplier details into the view
    const invoices = await Invoice.find()
      .populate("partner")
      .populate("items.product");
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
