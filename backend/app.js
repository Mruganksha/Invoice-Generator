const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

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