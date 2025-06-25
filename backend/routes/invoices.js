const express = require("express");
const fs = require('fs');

const router = express.Router();
const {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
} = require("../controllers/invoiceController");
const Invoice = require('../models/Invoice');
const generateInvoicePDF = require('../utils/pdfGenerator');
const path = require('path');

router.post("/", createInvoice);
router.get("/", getAllInvoices);
router.get("/:id", getInvoiceById);


router.get("/pdf/:id", async (req, res) => {
  console.log("PDF request for invoice ID:", req.params.id);

  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      console.log("Invoice not found in DB");
      return res.status(404).json({ message: "Invoice not found" });
    }

    const invoicesDir = path.join(__dirname, "../invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
      console.log(" Created invoices directory at:", invoicesDir);
    }

    const pdfPath = path.join(invoicesDir, `invoice_${invoice._id}.pdf`);
    console.log("Generating PDF at:", pdfPath);

    await generateInvoicePDF(invoice, pdfPath);
    console.log("PDF generated successfully");

    res.download(pdfPath, `invoice_${invoice.invoiceNo}.pdf`, (err) => {
      if (err) console.error("Download error:", err);
      else {
        fs.unlink(pdfPath, (unlinkErr) => {
          if (unlinkErr) console.error("Error deleting PDF:", unlinkErr);
          else console.log("PDF file deleted after sending");
        });
      }
    });
  } catch (err) {
    console.error("Error in /pdf route:", err);
    res.status(500).json({ message: "Error generating PDF", error: err.message });
  }
});

module.exports = router;