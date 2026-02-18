const PDFDocument = require("pdfkit");

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

  doc.fontSize(20).text(type === "SALE" ? "FACTURE" : "FACTURE FOURNISSEUR", {
    align: "center",
  });
  doc.moveDown();
  doc.fontSize(10).text(`N°: ${invoiceNumber}`, { align: "right" });
  doc.text(`Date: ${new Date(date).toLocaleDateString("fr-FR")}`, {
    align: "right",
  });

  doc.moveDown();
  doc.fontSize(12).text("Partenaire:", { underline: true });
  doc.fontSize(10).text(`Nom: ${partner.name}`);
  doc.text(`ICE: ${partner.ice || "N/A"}`);

  doc.moveDown(2);
  const tableTop = 250;
  doc.fontSize(10).text("Désignation", 50, tableTop, { bold: true });
  doc.text("Qté", 250, tableTop);
  doc.text("P.U HT", 350, tableTop);
  doc.text("Total HT", 450, tableTop);
  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  items.forEach((item, i) => {
    const y = tableTop + 25 + i * 20;
    doc.text(item.product.designation || "Produit", 50, y);
    doc.text(item.quantity.toString(), 250, y);
    doc.text(`${item.priceHT} DH`, 350, y);
    doc.text(`${(item.quantity * item.priceHT).toFixed(2)} DH`, 450, y);
  });

  const footerTop = tableTop + 60 + items.length * 20;
  doc.text(`Total HT: ${totalHT.toFixed(2)} DH`, 350, footerTop);
  doc.text(`Total TVA: ${totalTVA.toFixed(2)} DH`, 350, footerTop + 15);
  doc
    .fontSize(12)
    .text(`TOTAL TTC: ${totalTTC.toFixed(2)} DH`, 350, footerTop + 35, {
      bold: true,
    });
  doc.end();
};

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
  } = data;
  const doc = new PDFDocument({ margin: 50 });
  let chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => callback(Buffer.concat(chunks)));

  // Header
  doc.rect(0, 0, 612, 100).fill("#0f172a");
  doc.fillColor("white").fontSize(22).text("RAPPORT FINANCIER MENSUEL", 50, 40);
  doc.fontSize(12).text(`Période: ${month}/${year}`, 50, 70);

  // Summary
  doc.fillColor("black").moveDown(6);
  doc.fontSize(14).text("RÉSUMÉ DES FLUX", { underline: true });
  doc.moveDown();

  doc.fontSize(10);
  doc.text(`Ventes Totales (TTC):`, 50, 220);
  doc.text(`${sales.toFixed(2)} DH`, 400, 220, { bold: true });

  doc.text(`Achats Totaux (TTC):`, 50, 240);
  doc.text(`${purchases.toFixed(2)} DH`, 400, 240, { bold: true });

  doc.text(`Frais Généraux:`, 50, 260);
  doc.text(`${expenses.toFixed(2)} DH`, 400, 260, { bold: true });

  doc.fontSize(12).text(`RÉSULTAT NET:`, 50, 290);
  doc
    .fillColor(netProfit >= 0 ? "green" : "red")
    .text(`${netProfit.toFixed(2)} DH`, 400, 290, { bold: true });

  // VAT Section
  doc.fillColor("black").moveDown(2);
  doc.fontSize(14).text("DÉTAIL TVA (DÉCLARATION)", { underline: true });
  doc.moveDown();

  doc.fontSize(10);
  doc.text(`TVA Collectée (sur Ventes):`, 50, 360);
  doc.text(`+ ${salesTVA.toFixed(2)} DH`, 400, 360);

  doc.text(`TVA Déductible (sur Achats):`, 50, 380);
  doc.text(`- ${purchasesTVA.toFixed(2)} DH`, 400, 380);

  const netTVA = salesTVA - purchasesTVA;
  doc.moveTo(50, 400).lineTo(550, 400).stroke();
  doc.fontSize(11).text(`TVA NETTE À PAYER:`, 50, 415, { bold: true });
  doc.text(`${netTVA.toFixed(2)} DH`, 400, 415, { bold: true });

  doc.end();
};
