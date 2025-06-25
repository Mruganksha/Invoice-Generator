const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const invoicesDir = path.join(__dirname, '../invoices');
if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir, { recursive: true });

const generateInvoicePDF = (invoice, filePath) => {
  console.log("Generating PDF for invoice:", invoice.invoiceNo || invoice._id);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('INVOICE', { align: 'center' }).moveDown();

    doc.fontSize(12).text(`Invoice No: ${invoice.invoiceNo}`);
    doc.text(`Date: ${invoice.date}`);
    doc.text(`Due Date: ${invoice.dueDate}`).moveDown();

    doc.text(`From: ${invoice.billFrom.name}`);
    doc.text(`${invoice.billFrom.email}`);
    doc.text(`${invoice.billFrom.address}`).moveDown();

    doc.text(`To: ${invoice.billTo.name}`);
    doc.text(`${invoice.billTo.email}`);
    doc.text(`${invoice.billTo.address}`).moveDown();

    doc.text('Items:');
    invoice.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.item} — ${item.quantity} × ${item.price} = ₹${item.quantity * item.price}`);
    });
    doc.moveDown();

    doc.text(`Subtotal: ₹${invoice.subtotal}`);
    doc.text(`Tax (${invoice.taxRate}%): ₹${invoice.taxAmount}`);
    doc.text(`Discount (${invoice.discountRate}%): ₹${invoice.discountAmount}`);
    doc.text(`Total: ₹${invoice.total}`).moveDown();

    doc.text(`Notes: ${invoice.notes || 'N/A'}`);

    doc.end();

    stream.on('finish', () => resolve());
    stream.on('error', (err) => reject(err));
  });
};

module.exports = generateInvoicePDF;