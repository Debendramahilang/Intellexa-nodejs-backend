const service = require('../services/agent.service');

const createAgent = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: 'Agent name is required' });
        }

        const agent = await service.createAgent(req.body);
        return res.status(201).json(agent);
    } catch (error) {
        return res.status(500).json({
            message: 'Error creating agent',
            error: error.message
        });
    }
};

const listAgents = async (req, res) => {
    try {
        const agents = await service.listAgents();
        return res.json(agents);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching agents',
            error: error.message
        });
    }
};

const getAgentById = async (req, res) => {
    try {
        const agent = await service.getAgentById(req.params.id);

        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        return res.json(agent);
    } catch (error) {
        return res.status(500).json({
            message: 'Error fetching agent',
            error: error.message
        });
    }
};

const updateAgent = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: 'Agent name is required' });
        }

        const agent = await service.updateAgent(req.params.id, req.body);

        if (!agent) {
            return res.status(404).json({ message: 'Agent not found' });
        }

        return res.json(agent);
    } catch (error) {
        return res.status(500).json({
            message: 'Error updating agent',
            error: error.message
        });
    }
};

module.exports = {
    createAgent,
    listAgents,
    getAgentById,
    updateAgent
};
