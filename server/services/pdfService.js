const PDFDocument = require("pdfkit");

// --- HELPER FOR INVOICE PDF ---
exports.generateInvoicePDF = (invoiceData, callback) => {
  const {
    invoiceNumber,
    partner,
    items,
    totalHT,
    totalTVA,
    totalTTC,
    type,
    date,
  } = invoiceData;
  const doc = new PDFDocument({ margin: 50 });
  let chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => callback(Buffer.concat(chunks)));

  // Design Header
  doc
    .fillColor("#1e293b")
    .fontSize(20)
    .text(type === "SALE" ? "FACTURE" : "FACTURE FOURNISSEUR", {
      align: "center",
    });
  doc.moveDown();
  doc
    .fontSize(10)
    .fillColor("#64748b")
    .text(`N°: ${invoiceNumber}`, { align: "right" });
  doc.text(`Date: ${new Date(date).toLocaleDateString("fr-FR")}`, {
    align: "right",
  });

  doc.moveDown();
  doc
    .fillColor("#1e293b")
    .fontSize(12)
    .text("Partenaire:", { underline: true });
  doc
    .fontSize(10)
    .fillColor("#334155")
    .text(`Nom: ${partner?.name || "N/A"}`);
  doc.text(`ICE: ${partner?.ice || "N/A"}`);

  doc.moveDown(2);
  const tableTop = 250;
  doc.font("Helvetica-Bold").text("Désignation", 50, tableTop);
  doc.text("Qté", 250, tableTop);
  doc.text("P.U HT", 350, tableTop);
  doc.text("Total HT", 450, tableTop);
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .strokeColor("#e2e8f0")
    .stroke();

  doc.font("Helvetica");
  items.forEach((item, i) => {
    const y = tableTop + 25 + i * 25;
    // Fix: Access designation and priceHT correctly from populated product or item
    const desc = item.product?.designation || item.productName || "Produit";
    const price = item.priceHT || item.price || 0;

    doc.text(desc, 50, y);
    doc.text(item.quantity.toString(), 250, y);
    doc.text(`${Number(price).toLocaleString()} DH`, 350, y);
    doc.text(`${(item.quantity * price).toLocaleString()} DH`, 450, y);
  });

  const footerTop = tableTop + 50 + items.length * 25;
  doc
    .moveTo(340, footerTop - 10)
    .lineTo(550, footerTop - 10)
    .stroke();
  doc.text(`Total HT:`, 350, footerTop);
  doc.text(`${totalHT.toLocaleString()} DH`, 480, footerTop, {
    align: "right",
  });

  doc.text(`Total TVA (20%):`, 350, footerTop + 20);
  doc.text(`${totalTVA.toLocaleString()} DH`, 480, footerTop + 20, {
    align: "right",
  });

  doc.rect(340, footerTop + 40, 215, 30).fill("#f8fafc");
  doc
    .fillColor("#1e293b")
    .font("Helvetica-Bold")
    .text(`TOTAL TTC:`, 350, footerTop + 50);
  doc.text(`${totalTTC.toLocaleString()} DH`, 480, footerTop + 50, {
    align: "right",
  });

  doc.end();
};

// --- HELPER FOR IMPROVED MONTHLY REPORT ---
exports.generateMonthlyReport = (data, callback) => {
  const {
    month,
    year,
    sales,
    purchases,
    expenses,
    netProfit,
    salesTVA,
    purchasesTVA,
    stockValue, // New data
    invoiceCount, // New data
    expenseCount, // New data
  } = data;

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  let chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => callback(Buffer.concat(chunks)));

  // 1. Header with Dark Theme
  doc.rect(0, 0, 612, 120).fill("#1e293b");
  doc
    .fillColor("white")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("RAPPORT FINANCIER", 50, 40);
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Période: ${month}/${year} | État de l'activité commerciale`, 50, 75);

  // 2. Metric Boxes (KPIs)
  const drawMetric = (label, value, x, y, color = "#1e293b") => {
    doc.rect(x, y, 160, 70).strokeColor("#e2e8f0").stroke();
    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(label.toUpperCase(), x + 10, y + 15);
    doc
      .fillColor(color)
      .fontSize(14)
      .text(`${Number(value).toLocaleString()} DH`, x + 10, y + 35);
  };

  let currentY = 150;
  drawMetric("Ventes (TTC)", sales, 50, currentY, "#2563eb");
  drawMetric("Achats (TTC)", purchases, 220, currentY, "#64748b");
  drawMetric("Frais (Généraux)", expenses, 390, currentY, "#e11d48");

  // 3. Flow Summary Table
  currentY += 100;
  doc
    .fillColor("#1e293b")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("DÉTAILS DES OPÉRATIONS", 50, currentY);
  currentY += 25;

  const drawRow = (label, value, y, isBold = false, color = "#334155") => {
    doc
      .font(isBold ? "Helvetica-Bold" : "Helvetica")
      .fontSize(10)
      .fillColor(color);
    doc.text(label, 50, y);
    doc.text(`${Number(value).toLocaleString()} DH`, 400, y, {
      align: "right",
      width: 140,
    });
    doc
      .moveTo(50, y + 15)
      .lineTo(540, y + 15)
      .strokeColor("#f1f5f9")
      .stroke();
  };

  drawRow("Total TVA Collectée (Ventes)", salesTVA, currentY);
  currentY += 25;
  drawRow("Total TVA Déductible (Achats)", -purchasesTVA, currentY);
  currentY += 25;
  const netTVA = salesTVA - purchasesTVA;
  drawRow(
    "TVA NETTE À DÉCLARER",
    netTVA,
    currentY,
    true,
    netTVA > 0 ? "#b45309" : "#15803d",
  );

  // 4. Activity & Stock Section
  currentY += 50;
  doc
    .fillColor("#1e293b")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("INVENTAIRE ET STATISTIQUES", 50, currentY);
  currentY += 25;

  drawRow("Valeur Estimée du Stock (HT)", stockValue || 0, currentY);
  currentY += 25;
  drawRow("Volume de Factures Générées", invoiceCount || 0, currentY); // Shown as DH for row consistency, can be adjusted
  currentY += 25;
  drawRow("Nombre de Notes de Frais", expenseCount || 0, currentY);

  // 5. Final Result Banner
  currentY += 50;
  const profitColor = netProfit >= 0 ? "#16a34a" : "#dc2626";
  doc.rect(50, currentY, 490, 60).fill(netProfit >= 0 ? "#f0fdf4" : "#fef2f2");
  doc
    .fillColor(profitColor)
    .fontSize(16)
    .font("Helvetica-Bold")
    .text("RÉSULTAT NET DU MOIS", 70, currentY + 22);
  doc
    .fontSize(20)
    .text(`${Number(netProfit).toLocaleString()} DH`, 350, currentY + 20, {
      align: "right",
      width: 170,
    });

  // Footer
  doc
    .fontSize(8)
    .fillColor("#94a3b8")
    .text(
      "Document confidentiel généré par le système de gestion interne.",
      50,
      780,
      { align: "center", width: 500 },
    );

  doc.end();
};
