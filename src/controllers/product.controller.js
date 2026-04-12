const service = require('../services/product.service');

const createProduct = async (req, res) => {
    try {
        const product = await service.createProduct(req.body);
        return res.status(201).json(product);
    } catch (error) {
        return res.status(500).json({
            message: 'Error creating product',
            error: error.message,
        });
    }
};

const listProducts = async (req, res) => {
    try {
        const products = await service.listProducts();
        return res.json(products);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching products',
            error: error.message,
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const updatedProduct = await service.updateProduct(req.params.id, req.body);

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.json(updatedProduct);
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating product',
            error: error.message,
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const isDeleted = await service.deleteProduct(req.params.id);

        if (!isDeleted) {
            return res.status(404).json({ message: 'Product not found' });
        }

        return res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting product',
            error: error.message,
        });
    }
};

module.exports = {
    createProduct,
    listProducts,
    updateProduct,
    deleteProduct,
};
