const Invoice = require("../models/Invoice");


exports.createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);

    const isValidPincode = (pin) => /^\d{6}$/.test(pin);

    if (
      !isValidPincode(invoice.billTo.pincode) ||
      !isValidPincode(invoice.billFrom.pincode)
    ) {
      return res.status(400).json({ message: "Pincode must be a valid 6-digit number." });
    }

    if (!invoice.billTo.address || invoice.billTo.address.length < 10) {
      return res.status(400).json({ message: "Buyer address is too short." });
    }

    if (!invoice.billFrom.address || invoice.billFrom.address.length < 10) {
      return res.status(400).json({ message: "Seller address is too short." });
    }

    await invoice.save();
    res.status(201).json({ invoice });


  } catch (err) {
    res.status(500).json({ message: "Error saving invoice", error: err.message });
  }
};

exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json(invoices);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invoices" });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.status(200).json(invoice);
  } catch (err) {
    res.status(500).json({ message: "Error fetching invoice" });
  }
};