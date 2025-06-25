const express = require('express');
const router = express.Router();
const { sendInvoiceEmail } = require('../controllers/emailController');

router.post('/send', sendInvoiceEmail);

module.exports = router;
