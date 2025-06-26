const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

const generateInvoicePDF = (invoice, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // 1. Header with Logo
    if (invoice.logo && invoice.logo.startsWith("data:image")) {
  try {
    const base64Data = invoice.logo.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    doc.image(buffer, doc.page.width - 150, 30, { width: 100 });
  } catch (e) {
    console.error("Error rendering logo:", e.message);
  }
  }

    doc.fontSize(20).text('INVOICE', { align: 'center' }).moveDown();

    doc
      .fontSize(10)
      .text(`Invoice #: ${invoice.invoiceNumber || "N/A"}`)
      .text(`Date: ${invoice.invoiceDate || "N/A"}`)
      .text(`Due Date: ${invoice.dueDate || "N/A"}`)
      .moveDown();

    // 2. From and To Sections
    doc
      .fontSize(12)
      .text("From:", { underline: true })
      .font("Helvetica-Bold").text(invoice.billFrom.name)
      .font("Helvetica").text(invoice.billFrom.address)
      .text(`${invoice.billFrom.state} - ${invoice.billFrom.pincode}`)
      .text(invoice.billFrom.email)
      .moveDown();

    doc
      .font("Helvetica-Bold")
      .text("Bill To:", { underline: true })
      .font("Helvetica-Bold").text(invoice.billTo.name)
      .font("Helvetica").text(invoice.billTo.address)
      .text(`${invoice.billTo.state} - ${invoice.billTo.pincode}`)
      .text(invoice.billTo.email)
      .moveDown();

    // 3. Items Table
    const tableTop = doc.y + 20;
    const itemX = 50;
    const qtyX = 250;
    const rateX = 320;
    const amountX = 420;

    doc
      .font("Helvetica-Bold")
      .text("Description", itemX, tableTop)
      .text("Qty", qtyX, tableTop)
      .text(`Rate (${invoice.currency || "INR"})`, rateX, tableTop)
      .text(`Amount (${invoice.currency || "INR"})`, amountX, tableTop);

    let i = 0;
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    invoice.items.forEach((item) => {
      const y = tableTop + 30 + (i * 20);
      doc
        .font("Helvetica")
        .text(item.name || "-", itemX, y)
        .text(item.quantity || "1", qtyX, y, { width: 40, align: "right" })
        .text(item.rate?.toFixed(2) || "0.00", rateX, y, { width: 60, align: "right" })
        .text(item.total?.toFixed(2) || "0.00", amountX, y, { width: 60, align: "right" });
      i++;
    });

    doc.moveDown(2);

    // 4. Totals Summary
    const summaryTop = tableTop + 30 + (i * 20) + 20;
    doc.font("Helvetica");

    const rightAlign = (label, value, y) => {
      doc.text(label, 350, y, { width: 100, align: "right" });
      doc.text(`${invoice.currency || "INR"} ${value.toFixed(2)}`, 460, y, { align: "right" });
    };

    rightAlign("Subtotal:", invoice.subtotal || 0, summaryTop);
    if (invoice.cgst > 0)
      rightAlign(`CGST (${invoice.taxRate / 2}%)`, invoice.cgst, summaryTop + 15);
    if (invoice.sgst > 0)
      rightAlign(`SGST (${invoice.taxRate / 2}%)`, invoice.sgst, summaryTop + 30);
    if (invoice.igst > 0)
      rightAlign(`IGST (${invoice.taxRate}%)`, invoice.igst, summaryTop + 45);

    doc
      .font("Helvetica-Bold")
      .text("Total:", 350, summaryTop + 60, { width: 100, align: "right" })
      .text(`${invoice.currency || "INR"} ${(invoice.total || 0).toFixed(2)}`, 460, summaryTop + 60, { align: "right" });

    // 5. Notes
    if (invoice.notes) {
      doc.moveDown(2);
      doc.font("Helvetica-Bold").text("Additional Notes:");
      doc.font("Helvetica").text(invoice.notes);
    }

    // 6. Footer
    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("gray")
      .text("Thank you for your business.", { align: "center" })
      .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });
};

module.exports = generateInvoicePDF;
