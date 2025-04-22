const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');
const {authenticate}= require('../middleware/auth');

// Iyzico ile ödeme işlemi için gerekli olan route
router.post('/courses/:courseId/purchase', authenticate, paymentController.purchaseCourse);
router.get('/',paymentController.getPayments); // Ödeme kayıtlarını listele (admin için)

module.exports = router;