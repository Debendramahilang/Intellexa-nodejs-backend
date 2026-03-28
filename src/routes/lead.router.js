const express = require('express');
const controller = require('../controllers/lead.controller');
const { verifyToken } = require('../config/middleware');
const router = express.Router();

router.post('/add-lead', verifyToken, controller.createLead);
router.get('/get-leads', verifyToken, controller.getLeads);
router.get('/list', verifyToken, controller.getLeads);
router.get('/get-lead/:id', verifyToken, controller.getLeadById);
router.get('/preview/:id', verifyToken, controller.getLeadById);
router.put('/update-lead/:id', verifyToken, controller.updateLead);
router.delete('/delete-lead/:id', verifyToken, controller.deleteLead);

module.exports = router;
