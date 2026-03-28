const { buildStatusResponse } = require('../services/auth.service');

const getStatus = (req, res) => {
  const status = buildStatusResponse();

  res.status(200).json(status);
};

module.exports = {
  getStatus
};
