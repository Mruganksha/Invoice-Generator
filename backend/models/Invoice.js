const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  rate: Number,
  total: Number,
});


const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  invoiceDate: String,
  dueDate: String,
  billTo: {
    name: String,
    email: String,
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true }
  },
  billFrom: {
    name: String,
    email: String,
    address: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true }
  },
  items: [itemSchema],
  currency: String,
  taxRate: Number,
  discountRate: Number,
  subtotal: Number,
  cgst: Number,           
  sgst: Number,           
  igst: Number,           
  discountAmount: Number,
  total: Number,
  notes: String,
  logo: String,
  notesImage: [String],
});

module.exports = mongoose.model("Invoice", invoiceSchema);