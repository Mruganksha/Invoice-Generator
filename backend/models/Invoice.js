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
    address: String,
  },
  billFrom: {
    name: String,
    email: String,
    address: String,
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
});

module.exports = mongoose.model("Invoice", invoiceSchema);