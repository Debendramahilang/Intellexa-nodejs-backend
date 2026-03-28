const service = require('../services/lead.service');

const createLead = async (req, res) => {
  try {
    const leadData = req.body; 
    console.log('leadData ', leadData);
     
    const newLead = await service.createLead(req,leadData);
    return res.status(201).json(newLead);
  } catch (error) {
    return res.status(500).json({
      message: 'Error creating lead',   
        error: error.message
    });
  }
};

const getLeads = async (req, res) => {
    try {
        const leads = await service.getLeads();
        return res.json(leads);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching leads',    
            error: error.message
        });
    }   
};

const getLeadById = async (req, res) => {
    try {
        const leadId = req.params.id;
        const lead = await service.getLeadById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        return res.json(lead);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching lead',
            error: error.message
        });
    }
};

const updateLead = async (req, res) => {    
    try {
        const leadId = req.params.id;
        const updateData = req.body;
        const updatedLead = await service.updateLead(leadId, updateData);
        if (!updatedLead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        return res.json(updatedLead);
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating lead',
            error: error.message
        });
    }
};

const deleteLead = async (req, res) => {    
    try {
        const leadId = req.params.id;
        const deleted = await service.deleteLead(leadId);   
        if (!deleted) {
            return res.status(404).json({ message: 'Lead not found' });
        }   
        return res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        return res.status(500).json({
            message: 'Error deleting lead', 
            error: error.message
        });
    }
};

module.exports = {
    createLead,
    getLeads,
    getLeadById,
    updateLead,
    deleteLead
};