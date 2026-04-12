const express = require('express');
const controller = require('../controllers/product.controller');
const { verifyToken } = require('../config/middleware');

const router = express.Router();

router.post('/add', verifyToken, controller.createProduct);
router.get('/list', verifyToken, controller.listProducts);
router.put('/edit/:id', verifyToken, controller.updateProduct);
router.delete('/delete/:id', verifyToken, controller.deleteProduct);

module.exports = router;
