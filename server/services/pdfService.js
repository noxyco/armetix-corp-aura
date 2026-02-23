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
    stockValue,
    invoiceCount,
    expenseCount,
  } = data;

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  let chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => callback(Buffer.concat(chunks)));

  // --- 1. HEADER (SLATE THEME) ---
  doc.rect(0, 0, 612, 120).fill("#0f172a");

  doc
    .fillColor("#38bdf8")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("SYSTÈME DE GESTION INTERNE", 40, 35, { characterSpacing: 1 });

  doc
    .fillColor("white")
    .fontSize(22)
    .font("Helvetica-Bold")
    .text("RAPPORT MENSUEL", 40, 50);

  doc
    .fillColor("#94a3b8")
    .fontSize(11)
    .font("Helvetica")
    .text(`Période: ${month.toString().padStart(2, "0")} / ${year}`, 40, 78);

  // Status Badge (Top Right)
  const statusLabel = netProfit >= 0 ? "BÉNÉFICIAIRE" : "DÉFICITAIRE";
  const statusColor = netProfit >= 0 ? "#10b981" : "#ef4444";
  doc.roundedRect(430, 50, 120, 22, 4).fill(statusColor);
  doc
    .fillColor("white")
    .fontSize(8)
    .font("Helvetica-Bold")
    .text(statusLabel, 430, 57, { align: "center", width: 120 });

  // --- 2. KPI CARDS ---
  const drawMetricCard = (label, value, x, y, accentColor) => {
    doc.roundedRect(x, y, 160, 75, 10).fill("#ffffff");
    doc
      .roundedRect(x, y, 160, 75, 10)
      .strokeColor("#f1f5f9")
      .lineWidth(1)
      .stroke();
    doc
      .path(`M ${x + 12} ${y + 20} L ${x + 30} ${y + 20}`)
      .strokeColor(accentColor)
      .lineWidth(2.5)
      .stroke();

    doc
      .fillColor("#64748b")
      .fontSize(8)
      .font("Helvetica-Bold")
      .text(label.toUpperCase(), x + 12, y + 30);

    doc
      .fillColor("#1e293b")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(`${Number(value).toLocaleString()} DH`, x + 12, y + 48);
  };

  let currentY = 140;
  drawMetricCard("Chiffre d'Affaires", sales, 45, currentY, "#3b82f6");
  drawMetricCard("Total Achats", purchases, 215, currentY, "#94a3b8");
  drawMetricCard("Charges / Frais", expenses, 385, currentY, "#f43f5e");

  // --- 3. DYNAMC TABLE LOGIC ---
  currentY += 105;
  doc
    .fillColor("#0f172a")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("DÉTAILS DES FLUX & TAXES", 45, currentY);

  currentY += 20;
  const drawListRow = (label, value, y, isTotal = false, suffix = " DH") => {
    if (isTotal) {
      doc.rect(40, y - 5, 532, 25).fill("#f8fafc");
    }

    doc
      .fillColor(isTotal ? "#0f172a" : "#475569")
      .fontSize(9)
      .font(isTotal ? "Helvetica-Bold" : "Helvetica")
      .text(label, 55, y + 4);

    const formattedValue =
      suffix === " DH"
        ? `${Number(value).toLocaleString()} DH`
        : Number(value).toLocaleString();

    doc.text(formattedValue, 390, y + 4, { align: "right", width: 160 });

    if (!isTotal) {
      doc
        .moveTo(45, y + 20)
        .lineTo(560, y + 20)
        .strokeColor("#f1f5f9")
        .lineWidth(0.5)
        .stroke();
    }
  };

  drawListRow("TVA Collectée (Ventes)", salesTVA, currentY);
  currentY += 25;
  drawListRow("TVA Déductible (Achats/Charges)", -purchasesTVA, currentY);
  currentY += 25;
  drawListRow(
    "SOLDE DE TVA À DÉCLARER",
    salesTVA - purchasesTVA,
    currentY,
    true,
  );

  // --- 4. INVENTORY & VOLUME ---
  currentY += 50;
  doc
    .fillColor("#0f172a")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("INVENTAIRE & ACTIVITÉ", 45, currentY);

  currentY += 20;
  drawListRow("Valeur de Stock Estimée (HT)", stockValue, currentY);
  currentY += 25;
  drawListRow("Nombre de Factures Émises", invoiceCount, currentY, false, "");
  currentY += 25;
  drawListRow(
    "Nombre de Justificatifs Frais",
    expenseCount,
    currentY,
    false,
    "",
  );

  // --- 5. BOTTOM SUMMARY (BENTO BOX) ---
  currentY += 55;
  const finalColor = netProfit >= 0 ? "#059669" : "#dc2626";

  doc.roundedRect(45, currentY, 515, 70, 12).fill("#f1f5f9");

  doc
    .fillColor("#475569")
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("RÉSULTAT NET COMPTABLE", 65, currentY + 20);

  doc
    .fillColor(finalColor)
    .fontSize(24)
    .font("Helvetica-Bold")
    .text(`${Number(netProfit).toLocaleString()} DH`, 240, currentY + 35, {
      align: "right",
      width: 290,
    });

  // --- 6. OFFICIAL FOOTER ---
  const footerY = 745;

  doc
    .moveTo(45, footerY - 10)
    .lineTo(565, footerY - 10)
    .strokeColor("#e2e8f0")
    .lineWidth(0.5)
    .stroke();

  doc
    .fontSize(8)
    .fillColor("#1e293b")
    .font("Helvetica-Bold")
    .text("VOTRE NOM D'ENTREPRISE", 0, footerY, {
      align: "center",
      width: 612,
    });

  doc
    .font("Helvetica")
    .fillColor("#64748b")
    .fontSize(7)
    .text("123 Adresse de l'Entreprise, Casablanca, Maroc", 0, footerY + 12, {
      align: "center",
      width: 612,
    })
    .text(
      "+212 5XX XX XX XX  |  contact@entreprise.ma  |  www.entreprise.ma",
      0,
      footerY + 22,
      { align: "center", width: 612 },
    )
    .fillColor("#94a3b8")
    .font("Helvetica-Bold")
    .text("ICE: 001234567890012", 0, footerY + 35, {
      align: "center",
      width: 612,
    });

  doc.end();
};
