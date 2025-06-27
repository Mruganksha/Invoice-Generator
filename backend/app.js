const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({
  origin: ['https://invoice-generator-frontend-a8kt.onrender.com'], 
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ extended: true, limit: '5mb' }));


mongoose
.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
        console.log(`server running on port ${process.env.PORT}`)
    });
})
.catch((err) => {
    console.error("MongoDB connection failed: ", err.message);
})

const invoiceRoutes = require("./routes/invoices")
app.use("/api/invoices", invoiceRoutes);

const emailRoutes = require("./routes/email");
app.use('/email', emailRoutes);
