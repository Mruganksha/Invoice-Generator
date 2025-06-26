const nodemailer = require('nodemailer');
const Invoice = require('../models/Invoice');
const generateInvoicePDF = require('../utils/pdfGenerator');
const path = require('path');

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    const pdfPath = path.join(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
    await generateInvoicePDF(invoice, pdfPath);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: invoice.billTo.email,
      subject: `Invoice #${invoice.invoiceNo}`,
      text: 'Please find your invoice attached.',
      attachments: [{ filename: `invoice_${invoice.invoiceNo}.pdf`, path: pdfPath }],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Invoice emailed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send invoice', error: err.message });
  }
};
