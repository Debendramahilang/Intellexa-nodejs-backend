const express = require('express');
const controller = require('../controllers/customer.controller');
const { verifyToken } = require('../config/middleware');

const router = express.Router();

router.post('/add', verifyToken, controller.createCustomer);
router.get('/list', verifyToken, controller.getCustomers);
router.put('/edit/:id', verifyToken, controller.updateCustomer);

module.exports = router;
