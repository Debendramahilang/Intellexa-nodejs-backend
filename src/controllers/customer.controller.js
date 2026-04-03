const service = require('../services/customer.service');

const createCustomer = async (req, res) => {
    try {
        const customerData = req.body;
        const newCustomer = await service.createCustomer(customerData);
        return res.status(201).json(newCustomer);
    } catch (error) {
        return res.status(500).json({
            message: 'Error creating customer',
            error: error.message
        });
    }
};

const getCustomers = async (req, res) => {
    try {
        const customers = await service.getCustomers();
        return res.json(customers);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

const updateCustomer = async (req, res) => {
    try {
        const customerId = req.params.id;
        const updateData = req.body;
        const updatedCustomer = await service.updateCustomer(customerId, updateData);

        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        return res.json(updatedCustomer);
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating customer',
            error: error.message
        });
    }
};

module.exports = {
    createCustomer,
    getCustomers,
    updateCustomer
};
