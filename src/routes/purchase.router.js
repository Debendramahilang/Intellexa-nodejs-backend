const express = require('express');
const controller = require('../controllers/purchase.controller');
const { verifyToken } = require('../config/middleware');

const router = express.Router();

router.get('/product/:productId', verifyToken, controller.getPurchasesByProduct);
router.get('/list', verifyToken, controller.listPurchases);
router.post('/add', verifyToken, controller.createPurchase);

module.exports = router;
