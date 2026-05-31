const express = require('express');
const controller = require('../controllers/auth.controller');
const { verifyToken } = require('../config/middleware');

const router = express.Router();

router.get('/status', controller.getStatus);
router.post('/login', controller.login);
router.all('/logout', controller.logout);
router.get('/me', verifyToken, controller.getMe);

module.exports = router;
