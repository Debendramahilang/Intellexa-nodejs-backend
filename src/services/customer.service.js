const { runQuery } = require('../config/db_connection');

const normalizeProductsInput = (products) => {
    if (Array.isArray(products)) {
        return products
            .map(product => typeof product === 'string' ? product.trim() : String(product).trim())
            .filter(Boolean);
    }

    if (typeof products === 'string') {
        return products
            .split(',')
            .map(product => product.trim())
            .filter(Boolean);
    }

    return [];
};

const normalizeMoneyInput = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') return value;

    const cleanedValue = String(value).replace(/[^0-9.-]/g, '');
    const parsedValue = Number.parseFloat(cleanedValue);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

const formatMoneyOutput = (value) => {
    const numericValue = Number.parseFloat(value ?? 0);

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(Number.isNaN(numericValue) ? 0 : numericValue);
};

const formatDateOutput = (value) => {
    if (!value) return null;

    return new Date(value).toISOString().split('T')[0];
};

const normalizeCustomer = (customer) => ({
    id: customer.id,
    companyName: customer.company_name,
    contactPerson: customer.contact_person,
    email: customer.email,
    phone: customer.phone,
    location: customer.location || '',
    industry: customer.industry || '',
    companySize: customer.company_size || '',
    revenue: customer.revenue || '',
    status: customer.status,
    customerSince: formatDateOutput(customer.customer_since),
    lastContact: formatDateOutput(customer.last_contact),
    products: customer.products
        ? customer.products.split(',').map(product => product.trim()).filter(Boolean)
        : [],
    totalSpent: formatMoneyOutput(customer.total_spent),
    notes: customer.notes || '',
    contractEndDate: formatDateOutput(customer.contract_end_date),
    renewalStatus: customer.renewal_status,
    accountManager: customer.account_manager || '',
    satisfaction: customer.satisfaction,
    lifetimeValue: formatMoneyOutput(customer.lifetime_value),
    tier: customer.tier,
    nps: customer.nps,
    quotations: [],
    orders: []
});

const insertCustomerProducts = (customerId, products) => {
    if (!products.length) return Promise.resolve();

    const placeholders = products.map(() => '(?, ?)').join(', ');
    const values = products.flatMap(product => [customerId, product]);

    return runQuery(
        `INSERT INTO customer_products (customer_id, product_name) VALUES ${placeholders}`,
        values
    );
};

const deleteCustomerProducts = (customerId) => {
    return runQuery(
        `DELETE FROM customer_products WHERE customer_id = ?`,
        [customerId]
    );
};

const getCustomerById = (id) => {
    return runQuery(`
        SELECT c.*, GROUP_CONCAT(cp.product_name) AS products
        FROM tbl_customers c
        LEFT JOIN customer_products cp ON c.id = cp.customer_id
        WHERE c.id = ?
        GROUP BY c.id
        LIMIT 1
    `, [id])
        .then((customers) => customers[0] ? normalizeCustomer(customers[0]) : null);
};

const createCustomer = (customerData) => {
    return new Promise((resolve, reject) => {
        const products = normalizeProductsInput(customerData.products);
        const totalSpent = normalizeMoneyInput(customerData.total_spent);
        const lifetimeValue = normalizeMoneyInput(customerData.lifetime_value);

        runQuery(`
            INSERT INTO tbl_customers (
                company_name, contact_person, email, phone, location,
                industry, company_size, revenue, status, customer_since,
                last_contact, total_spent, notes, contract_end_date,
                renewal_status, account_manager, satisfaction, lifetime_value,
                tier, nps
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            customerData.company_name,
            customerData.contact_person,
            customerData.email,
            customerData.phone,
            customerData.location || '',
            customerData.industry || '',
            customerData.company_size || '',
            customerData.revenue || '',
            customerData.status || 'active',
            customerData.customer_since,
            customerData.last_contact,
            totalSpent,
            customerData.notes || '',
            customerData.contract_end_date,
            customerData.renewal_status || 'upcoming',
            customerData.account_manager || '',
            customerData.satisfaction ?? 3,
            lifetimeValue,
            customerData.tier || 'standard',
            customerData.nps ?? 0
        ])
            .then((result) =>
                insertCustomerProducts(result.insertId, products)
                    .then(() => resolve({ id: result.insertId, ...customerData, products }))
            )
            .catch(reject);
    });
};

const getCustomers = () => {
    return new Promise((resolve, reject) => {
        runQuery(`
            SELECT c.*, GROUP_CONCAT(cp.product_name) AS products
            FROM tbl_customers c
            LEFT JOIN customer_products cp ON c.id = cp.customer_id
            GROUP BY c.id
            ORDER BY c.id DESC
        `)
            .then((customers) => resolve(customers.map(normalizeCustomer)))
            .catch(reject);
    });
};

const updateCustomer = (id, customerData) => {
    return new Promise((resolve, reject) => {
        const products = normalizeProductsInput(customerData.products);
        const totalSpent = normalizeMoneyInput(customerData.total_spent);
        const lifetimeValue = normalizeMoneyInput(customerData.lifetime_value);

        runQuery(`
            UPDATE tbl_customers SET
                company_name = ?,
                contact_person = ?,
                email = ?,
                phone = ?,
                location = ?,
                industry = ?,
                company_size = ?,
                revenue = ?,
                status = ?,
                customer_since = ?,
                last_contact = ?,
                total_spent = ?,
                notes = ?,
                contract_end_date = ?,
                renewal_status = ?,
                account_manager = ?,
                satisfaction = ?,
                lifetime_value = ?,
                tier = ?,
                nps = ?
            WHERE id = ?
        `, [
            customerData.company_name,
            customerData.contact_person,
            customerData.email,
            customerData.phone,
            customerData.location || '',
            customerData.industry || '',
            customerData.company_size || '',
            customerData.revenue || '',
            customerData.status || 'active',
            customerData.customer_since,
            customerData.last_contact,
            totalSpent,
            customerData.notes || '',
            customerData.contract_end_date,
            customerData.renewal_status || 'upcoming',
            customerData.account_manager || '',
            customerData.satisfaction ?? 3,
            lifetimeValue,
            customerData.tier || 'standard',
            customerData.nps ?? 0,
            id
        ])
            .then((result) => {
                if (result.affectedRows === 0) {
                    resolve(null);
                    return null;
                }

                return deleteCustomerProducts(id)
                    .then(() => insertCustomerProducts(id, products))
                    .then(() => getCustomerById(id))
                    .then(resolve);
            })
            .catch(reject);
    });
};

module.exports = {
    createCustomer,
    getCustomers,
    updateCustomer
};
