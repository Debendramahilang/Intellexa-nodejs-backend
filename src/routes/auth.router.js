const express = require('express');
const { getStatus } = require('../controllers/auth.controller');

const router = express.Router();

router.get('/status', getStatus);

module.exports = router;
