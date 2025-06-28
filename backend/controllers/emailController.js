const Invoice = require('../models/Invoice');
const generateInvoicePDF = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY); 

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Generate PDF
    const pdfPath = path.resolve(__dirname, `../invoices/invoice_${invoice._id}.pdf`);
    await generateInvoicePDF(invoice, pdfPath);

    if (!fs.existsSync(pdfPath)) {
      console.error("PDF generation failed:", pdfPath);
      return res.status(500).json({ message: 'Failed to generate invoice PDF' });
    }

    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString('base64');

    // Send email using Resend
    const response = await resend.emails.send({
      from: 'Your Name <inovice-generator.example.com>', 
      to: invoice.billTo.email,
      subject: `Invoice #${invoice.invoiceNo}`,
      html: '<p>Please find your invoice attached.</p>',
      attachments: [
        {
          filename: `invoice_${invoice.invoiceNo}.pdf`,
          content: pdfBase64,
          type: 'application/pdf'
        }
      ]
    });

    console.log("Resend response:", response);
    res.status(200).json({ message: 'Invoice emailed successfully' });

  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({
      message: 'Failed to send invoice',
      error: err.message,
      stack: err.stack,
    });
  }
};
