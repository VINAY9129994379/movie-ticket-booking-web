const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const checkClerkUser = require('../middleware/auth.js');

router.post('/create', checkClerkUser, createPaymentIntent);
router.post('/confirm', checkClerkUser, confirmPayment);

module.exports = router;