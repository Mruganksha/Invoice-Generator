const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  item: String,
  description: String,
  quantity: Number,
  price: Number,
})

const invoiceSchema = new mongoose.Schema({
  invoiceNo: String,
  date: String,
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
  taxAmount: Number,
  discountAmount: Number,
  total: Number,
  notes: String,
  logo: String,
});

module.exports = mongoose.model("Invoice", invoiceSchema);