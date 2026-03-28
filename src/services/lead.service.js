const { runQuery } = require('../config/db_connection');

const normalizeLead = (lead) => ({
    ...lead,
    interestedProducts: lead.interestedProducts
        ? lead.interestedProducts.split(',')
        : []
});

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
        console.log('leaddats', leadData.company_name);
        
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


const getLeads = () => {
    return new Promise((resolve, reject) => {
        runQuery(`
            SELECT l.*, GROUP_CONCAT(p.product_name) AS interestedProducts
            FROM tbl_leads l
            LEFT JOIN lead_interested_products p ON l.id = p.lead_id
            GROUP BY l.id
        `)
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

const updateLead = async (id, updateData) => {
    const query = `
        UPDATE tbl_leads    
        SET name = ?, email = ?, phone = ?, company = ?, status = ?
        WHERE id = ?
    `;
    await sequelize.query(query, {
        replacements: [
            updateData.name,
            updateData.email,
            updateData.phone,
            updateData.company,
            updateData.status,
            id
        ]
    });
    return getLeadById(id);
}

const deleteLead = async (id) => {
    const query = `DELETE FROM tbl_leads WHERE id = ?`;
    await sequelize.query(query, {
        replacements: [id]
    });
    return { message: 'Lead deleted successfully' };
}

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead
};  
