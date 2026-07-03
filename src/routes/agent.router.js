const express = require('express');
const controller = require('../controllers/agent.controller');

const router = express.Router();

router.post('/add', controller.createAgent);
router.post('/create', controller.createAgent);
router.get('/list', controller.listAgents);
router.get('/get/:id', controller.getAgentById);
router.put('/edit/:id', controller.updateAgent);
router.put('/update/:id', controller.updateAgent);

module.exports = router;
