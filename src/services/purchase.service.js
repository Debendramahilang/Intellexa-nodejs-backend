const { runQuery } = require('../config/db_connection');
const productService = require('./product.service');

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

const formatDate = (value) => {
    if (!value) return null;
    return new Date(value).toISOString().split('T')[0];
};

const normalizePurchase = (row) => ({
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    productSku: row.product_sku,
    vendorName: row.vendor_name,
    vendorSource: row.vendor_source,
    vendorCustomerId: row.vendor_customer_id,
    quantity: toInteger(row.quantity),
    unitPrice: toNumber(row.unit_price),
    totalAmount: toNumber(row.total_amount),
    lotNumber: row.lot_number || '',
    warehouse: row.warehouse || '',
    purchaseDate: formatDate(row.purchase_date),
    documentName: row.document_name || '',
    documentUrl: row.document_url || '',
    notes: row.notes || '',
});

const listPurchases = async () => {
    const rows = await runQuery(`
        SELECT p.*, pr.name AS product_name, pr.sku AS product_sku
        FROM tbl_purchases p
        INNER JOIN tbl_products pr ON pr.id = p.product_id
        ORDER BY p.purchase_date DESC, p.id DESC
    `);

    return rows.map(normalizePurchase);
};

const createPurchase = async (purchaseData) => {

    const quantity = toInteger(purchaseData.quantity);
    const unitPrice = toNumber(purchaseData.unit_price);
    const totalAmount = quantity * unitPrice;
    const purchaseDate = formatDate(purchaseData.purchase_date) || new Date().toISOString().split('T')[0];
    const lotNumber = String(purchaseData.lot_number || `${product.sku}-PO-${Date.now()}`).trim();
    const warehouse = String(purchaseData.warehouse || 'Main Warehouse').trim();
    const documentName = String(purchaseData.document_name || '').trim();
    const documentUrl = String(purchaseData.document_url || '').trim();
    const notes = String(purchaseData.notes || '').trim();
    const vendorSource = ['customer', 'product', 'manual'].includes(purchaseData.vendor_source) ? purchaseData.vendor_source : 'manual';
    const vendorCustomerId = purchaseData.vendor_customer_id ? toInteger(purchaseData.vendor_customer_id) : null;
    const productId = toInteger(purchaseData.product_id);

    const result = await runQuery(`
        INSERT INTO tbl_purchases (
            product_id, vendor_source, vendor_customer_id, quantity,
            unit_price, total_amount, lot_number, warehouse, purchase_date,
            document_name, document_url, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        productId,
        vendorSource,
        vendorCustomerId,
        quantity,
        unitPrice,
        totalAmount,
        lotNumber,
        warehouse,
        purchaseDate,
        documentName,
        documentUrl,
        notes,
    ]);

    const rows = await runQuery(`
        SELECT p.*, pr.name AS product_name, pr.sku AS product_sku
        FROM tbl_purchases p
        INNER JOIN tbl_products pr ON pr.id = p.product_id
        WHERE p.id = ?
        LIMIT 1
    `, [result.insertId]);

    return {
        purchase: rows[0] ? normalizePurchase(rows[0]) : null,
    };
};

module.exports = {
    listPurchases,
    createPurchase,
};
