const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const FOOTER_HEIGHT = 40;


const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

const generateInvoicePDF = (invoice, filePath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // ========== 1. Header with Logo and Title ==========
    if (invoice.logo && invoice.logo.startsWith("data:image")) {
      try {
        const base64Data = invoice.logo.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        doc.image(buffer, doc.page.width - 130, 20, { width: 100 });
      } catch (e) {
        console.error("Error rendering logo:", e.message);
      }
    }

    doc
      .fillColor("#1E3A8A")
      .fontSize(26)
      .font("Helvetica-Bold")
      .text(invoice.invoiceTitle || 'INVOICE', 50, 30)
      .moveDown();

    doc
      .fontSize(10)
      .fillColor("black")
      .font("Helvetica")
      .text(`Invoice #: ${invoice.invoiceNumber || "N/A"}`)
      .text(`Date: ${invoice.invoiceDate || "N/A"}`)
      .text(`Due Date: ${invoice.dueDate || "N/A"}`)
      .moveDown(2);

    // ========== 2. Billing Sections ==========
    const billFromTop = doc.y;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("From:", 50, billFromTop)
      .font("Helvetica")
      .fontSize(10)
      .text(invoice.billFrom.name, 50)
      .text(invoice.billFrom.address, 50)
      .text(`${invoice.billFrom.state} - ${invoice.billFrom.pincode}`, 50)
      .text(invoice.billFrom.email, 50);

    const billToTop = billFromTop;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Bill To:", 300, billToTop)
      .font("Helvetica")
      .fontSize(10)
      .text(invoice.billTo.name, 300)
      .text(invoice.billTo.address, 300)
      .text(`${invoice.billTo.state} - ${invoice.billTo.pincode}`, 300)
      .text(invoice.billTo.email, 300);

    doc.moveDown(2);
    
    
    // ========== 3. Items Table ==========
    const tableTop = doc.y + 10;
    const itemX = 50;
    const qtyX = 260;
    const rateX = 340;
    const amountX = 440;

    doc
      .fillColor("#F3F4F6")
      .rect(itemX - 2, tableTop - 2, 510, 20)
      .fill();

    doc
      .fillColor("#1F2937")
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor("black")
      .text("Description", itemX, tableTop)
      .text("Qty", qtyX, tableTop)
      .text(`Rate (${invoice.currency || "INR"})`, rateX, tableTop)
      .text(`Amount (${invoice.currency || "INR"})`, amountX, tableTop);

    doc.moveTo(itemX, tableTop + 15).lineTo(560, tableTop + 15).strokeColor("#D1D5DB").stroke();

    let i = 0;
    invoice.items.forEach((item) => {
      const y = tableTop + 30 + (i * 20);

      // Prevent content from overlapping footer
      if (y > doc.page.height - FOOTER_HEIGHT - 100) doc.addPage();

      doc
        .font("Helvetica")
        .fontSize(10)
        .text(item.name || "-", itemX, y)
        .text(item.quantity || "1", qtyX, y, { width: 40, align: "right" })
        .text(item.rate?.toFixed(2) || "0.00", rateX, y, { width: 60, align: "right" })
        .text(item.total?.toFixed(2) || "0.00", amountX, y, { width: 60, align: "right" });

      doc.moveTo(itemX, y + 15).lineTo(560, y + 15).strokeColor("#E5E7EB").stroke();
      i++;
    });

    // ========== 4. Summary ==========
    let currentY = tableTop + 30 + (i * 20) + 20;
    if (currentY > doc.page.height - FOOTER_HEIGHT - 100) doc.addPage();

    const rightAlign = (label, value, y) => {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("black")
        .text(label, 350, y, { width: 100, align: "right" })
        .text(`${invoice.currency || "INR"} ${value.toFixed(2)}`, 460, y, { align: "right" });
    };

    rightAlign("Subtotal:", invoice.subtotal || 0, currentY);
    if (invoice.cgst > 0) {
      currentY += 15;
      rightAlign(`CGST (${invoice.taxRate / 2}%)`, invoice.cgst, currentY);
    }
    if (invoice.sgst > 0) {
      currentY += 15;
      rightAlign(`SGST (${invoice.taxRate / 2}%)`, invoice.sgst, currentY);
    }
    if (invoice.igst > 0) {
      currentY += 15;
      rightAlign(`IGST (${invoice.taxRate}%)`, invoice.igst, currentY);
    }

    currentY += 20;
    doc.rect(340, currentY, 210, 20).fill("#F9FAFB");
    doc
      .fillColor("black")
      .font("Helvetica-Bold")
      .text("Total:", 350, currentY + 5, { width: 100, align: "right" })
      .text(`${invoice.currency || "INR"} ${(invoice.total || 0).toFixed(2)}`, 460, currentY + 5, { align: "right" });

    // ========== 5. Notes ==========
      if (invoice.notes || (Array.isArray(invoice.notesImage) && invoice.notesImage.length > 0)) {
  let y = doc.y + 20;

  if (y > doc.page.height - FOOTER_HEIGHT - 120) {
    doc.addPage();
    y = doc.y;
  }

  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Additional Notes", 50, y);

  y += 20;

  if (invoice.notes) {
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(invoice.notes, 50, y, {
        width: 500,
        align: "left"
      });

    y = doc.y + 20;
  }

  if (Array.isArray(invoice.notesImage)) {
    const imageWidth = 120;
    const imageHeight = 90;
    const margin = 20;
    let x = 50;

    invoice.notesImage.forEach((imgData, idx) => {
      if (y + imageHeight > doc.page.height - FOOTER_HEIGHT - 30) {
        doc.addPage();
        x = 50;
        y = doc.y;
      }

      try {
        const base64Data = imgData.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        doc.image(buffer, x, y, { width: imageWidth, height: imageHeight });

        x += imageWidth + margin;
        if (x + imageWidth > doc.page.width - 50) {
          x = 50;
          y += imageHeight + 20;
        }
      } catch (err) {
        console.error("Failed to load notes image:", err.message);
      }
    });
  }
}

    // ========== 6. Footer (Always on First Page) ==========
    doc.switchToPage(0);
    const footerY = doc.page.height - FOOTER_HEIGHT + 10;

    doc
      .fontSize(10)
      .fillColor("#6B7280")
      .text("Thank you for your business.", 0, footerY - 10, { align: "center" })
      .text(`Generated on: ${new Date().toLocaleDateString()}`, {
        align: "center"
      });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });
};

module.exports = generateInvoicePDF;
