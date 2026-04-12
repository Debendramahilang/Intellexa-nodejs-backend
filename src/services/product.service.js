const { runQuery } = require('../config/db_connection');

const safeJsonParse = (value, fallback = []) => {
    if (!value) return fallback;

    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (error) {
        return fallback;
    }
};

const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const toInteger = (value) => {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeProduct = (product) => ({
    id: product.id,
    sku: product.sku,
    name: product.name,
    type: product.type,
    category: product.category || '',
    status: product.status,
    unit: product.unit || '',
    description: product.description || '',
});

const buildProductPayload = (productData) => ({
    sku: String(productData.sku || '').trim(),
    name: String(productData.name || '').trim(),
    type: productData.type === 'service' ? 'service' : 'product',
    category: String(productData.category || '').trim(),
    status: ['active', 'draft', 'inactive'].includes(productData.status) ? productData.status : 'draft',
    unit: String(productData.unit || '').trim(),
    description: String(productData.description || '').trim(),
});

const getProductById = async (id) => {
    const rows = await runQuery('SELECT * FROM tbl_products WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? normalizeProduct(rows[0]) : null;
};

const listProducts = async () => {
    const rows = await runQuery('SELECT id, name, sku, type, category, status, unit, description FROM tbl_products ORDER BY id DESC');
    return rows;
};

const createProduct = async (productData) => {
    const payload = buildProductPayload(productData);

    const result = await runQuery(`
        INSERT INTO tbl_products (
            sku, name, type, category, status, unit, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        payload.sku,
        payload.name,
        payload.type,
        payload.category,
        payload.status,
        payload.unit,
        payload.description,
    ]);

    return getProductById(result.insertId);
};

const updateProduct = async (id, productData) => {
    const payload = buildProductPayload(productData);

    const result = await runQuery(`
        UPDATE tbl_products SET
            sku = ?,
            name = ?,
            type = ?,
            category = ?,
            vendor_name = ?,
            purchase_price = ?,
            selling_price = ?,
            website = ?,
            contact_person = ?,
            contact_email = ?,
            contact_phone = ?,
            status = ?,
            unit = ?,
            description = ?,
            documentation_url = ?,
            available_qty = ?,
            reserved_qty = ?,
            reorder_point = ?,
            lots_json = ?,
            tiers_json = ?,
            sales_json = ?
        WHERE id = ?
    `, [
        payload.sku,
        payload.name,
        payload.type,
        payload.category,
        payload.vendor_name,
        payload.purchase_price,
        payload.selling_price,
        payload.website,
        payload.contact_person,
        payload.contact_email,
        payload.contact_phone,
        payload.status,
        payload.unit,
        payload.description,
        payload.documentation_url,
        payload.available_qty,
        payload.reserved_qty,
        payload.reorder_point,
        payload.lots_json,
        payload.tiers_json,
        payload.sales_json,
        id,
    ]);

    if (result.affectedRows === 0) {
        return null;
    }

    return getProductById(id);
};

const deleteProduct = async (id) => {
    const result = await runQuery('DELETE FROM tbl_products WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    createProduct,
    listProducts,
    updateProduct,
    deleteProduct,
    getProductById,
};
