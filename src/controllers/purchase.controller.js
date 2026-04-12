const service = require('../services/purchase.service');

const listPurchases = async (req, res) => {
    try {
        const purchases = await service.listPurchases();
        return res.json(purchases);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching purchases',
            error: error.message,
        });
    }
};
const getPurchasesByProduct = async (req, res) => {
    try {
        const purchases = await service.getPurchasesByProduct(req.params.productId);
        return res.json(purchases);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching purchases',
            error: error.message,
        });
    }
};

const createPurchase = async (req, res) => {
    try {
        const result = await service.createPurchase(req.body);
        return res.status(201).json(result);
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            message: error.message || 'Error creating purchase',
            error: error.message,
        });
    }
};

module.exports = {
    listPurchases,
    createPurchase,
    getPurchasesByProduct,
};
