const { runQuery } = require('../config/db_connection');

const normalizeLead = (lead) => ({
    ...lead,
    interestedProducts: lead.interestedProducts
        ? lead.interestedProducts.split(',')
        : []
});

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

const insertInterestedProducts = (leadId, products) => {
    return new Promise((resolve, reject) => {
        if (!products?.length) return resolve([]);

        Promise.all(
            products.map(product =>
                runQuery(
                    `INSERT INTO lead_interested_products (lead_id, product_name) VALUES (?, ?)`,
                    [leadId, product]
                )
            )
        )
            .then(resolve)
            .catch(reject);
    });
};

const createLead = (req, leadData) => {
    return new Promise((resolve, reject) => {
        // console.log('leaddats', leadData.company_name);

        runQuery(`
            INSERT INTO tbl_leads (
                company_name, contact_person, email, phone, location,
                industry, company_size, revenue, status, priority,
                source, budget, added_date, last_contact, ai_call_status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                leadData.company_name, leadData.contact_person, leadData.email,
                leadData.phone, leadData.location, leadData.industry,
                leadData.company_size, leadData.revenue, leadData.status,
                leadData.priority, leadData.source, leadData.budget,
                leadData.added_date, leadData.last_contact, leadData.ai_call_status,
                leadData.notes
            ]
        )
            .then(result =>
                insertInterestedProducts(result.insertId, leadData.interestedProducts)
                    .then(() => resolve({ id: result.insertId, ...leadData }))
            )
            .catch(reject);
    });
};


const getLeads = (req) => {
    return new Promise((resolve, reject) => {
        console.log('req ', req.query.status);
        
        const statusFilter = req.query.status;
        runQuery(`
            SELECT l.*, GROUP_CONCAT(p.product_name) AS interestedProducts
            FROM tbl_leads l
            LEFT JOIN lead_interested_products p ON l.id = p.lead_id
            where l.status = ?
            GROUP BY l.id
        `, [statusFilter])
            .then(leads => {
                const result = leads.map(normalizeLead);
                resolve(result);
            })
            .catch(reject);
    });
};

const getLeadById = async (id) => {
    return new Promise((resolve, reject) => {
        runQuery(`
            SELECT l.*, GROUP_CONCAT(p.product_name) AS interestedProducts
            FROM tbl_leads l
            LEFT JOIN lead_interested_products p ON l.id = p.lead_id
            WHERE l.id = ?
            GROUP BY l.id
        `, [id])
            .then(leads => {
                if (!leads.length) {
                    resolve(null);
                    return;
                }

                resolve(normalizeLead(leads[0]));
            })
            .catch(reject);
    });
};

const deleteLeadProducts = (lead_id) => {
    return runQuery(
        `DELETE FROM lead_interested_products WHERE lead_id = ?`,
        [lead_id]
    );
};

const insertLeadProducts = (lead_id, products) => {
    if (!products || products.length === 0) return Promise.resolve();
    const placeholders = products.map(() => '(?, ?)').join(', ');
    const values = products.flatMap(product => [lead_id, product]);
    return runQuery(
        `INSERT INTO lead_interested_products (lead_id, product_name) VALUES ${placeholders}`,
        values
    );
};

const getLeadProducts = (lead_id) => {
    return runQuery(
        `SELECT COUNT(*) as count FROM lead_interested_products WHERE lead_id = ?`,
        [lead_id]
    );
};

const updateLead = (id, leadData) => {
    return new Promise((resolve, reject) => {
        const hasInterestedProducts = Object.prototype.hasOwnProperty.call(leadData, 'interestedProducts');
        const interestedProducts = normalizeProductsInput(leadData.interestedProducts);
        console.log('added_date ', leadData.added_date);
        

        runQuery(`
            UPDATE tbl_leads SET
                company_name = ?,
                contact_person = ?,
                email = ?,
                phone = ?,
                location = ?,
                industry = ?,
                company_size = ?,
                revenue = ?,
                status = ?,
                priority = ?,
                source = ?,
                budget = ?,
                added_date = ?,
                last_contact = ?,
                ai_call_status = ?,
                notes = ?
            WHERE id = ?`,
            [
                leadData.company_name, leadData.contact_person, leadData.email,
                leadData.phone, leadData.location, leadData.industry,
                leadData.company_size, leadData.revenue, leadData.status,
                leadData.priority, leadData.source, leadData.budget,
                leadData.added_date, leadData.last_contact, leadData.ai_call_status,
                leadData.notes, id
            ]
        )
            .then((result) => {
                if (result.affectedRows === 0) {
                    resolve(null);
                    return null;
                }

                if (!hasInterestedProducts) {
                    return getLeadById(id).then(resolve);
                }

                return getLeadProducts(id)
                    .then((productResult) => {
                        const exists = productResult[0]?.count > 0;
                        if (exists) {
                            return deleteLeadProducts(id).then(() => insertLeadProducts(id, interestedProducts));
                        }

                        return insertLeadProducts(id, interestedProducts);
                    })
                    .then(() => getLeadById(id))
                    .then(resolve);
            })
            .catch(reject);
    });
};
const deleteLead = (id) => {
    return new Promise((resolve, reject) => {
        runQuery(`DELETE FROM tbl_leads WHERE id = ?`, [id])
            .then(() => resolve({ message: 'Lead deleted successfully' }))
            .catch(reject);
    });
};

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead
};  
