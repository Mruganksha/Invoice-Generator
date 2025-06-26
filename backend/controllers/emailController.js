const nodemailer = require('nodemailer');
const Invoice = require('../models/Invoice');
const generateInvoicePDF = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    // 1. Find the invoice from DB
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // 2. Generate the PDF
    const pdfPath = path.resolve(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
    await generateInvoicePDF(invoice, pdfPath);

    // 3. Ensure PDF was created
    if (!fs.existsSync(pdfPath)) {
      console.error("PDF generation failed. File does not exist:", pdfPath);
      return res.status(500).json({ message: 'Failed to generate invoice PDF' });
    }

    // 4. Read the PDF as buffer
    const pdfBuffer = fs.readFileSync(pdfPath);

    // 5. Create the Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // your gmail
        pass: process.env.MAIL_PASS, // your Gmail App Password (NOT your real password)
      },
    });

    // Optional: verify connection
    await transporter.verify().catch(err => {
      console.error("Nodemailer verification failed:", err);
      return res.status(500).json({ message: "Gmail authentication failed", error: err.message });
    });

    // 6. Compose the email
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

    // 7. Send the email
    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent to:", invoice.billTo.email);

    // 8. Respond success
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
