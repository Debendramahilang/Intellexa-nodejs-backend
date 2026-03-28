const express = require('express');
const statusRouter = require('./status.routes');

const router = express.Router();

router.use('/status', statusRouter);

module.exports = router;
