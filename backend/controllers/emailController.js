const nodemailer = require('nodemailer');
const Invoice = require('../models/Invoice');
const generateInvoicePDF = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const pdfPath = path.resolve(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
    await generateInvoicePDF(invoice, pdfPath);

    if (!fs.existsSync(pdfPath)) {
      console.error("PDF generation failed. File does not exist:", pdfPath);
      return res.status(500).json({ message: 'Failed to generate invoice PDF' });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.verify().catch(err => {
      console.error("Nodemailer verification failed:", err);
      return res.status(500).json({ message: "Gmail authentication failed", error: err.message });
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: invoice.billTo.email,
      subject: `Invoice #${invoice.invoiceNo}`,
      text: 'Please find your invoice attached.',
      attachments: [{
        filename: `invoice_${invoice.invoiceNo}.pdf`,
        content: pdfBuffer,
      }],
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", invoice.billTo.email);

    res.status(200).json({ message: 'Invoice emailed successfully' });

  } catch (err) {
    console.error("❌ Email send error:", err);
    res.status(500).json({
      message: 'Failed to send invoice',
      error: err.message,
      stack: err.stack,
    });
  }
};
