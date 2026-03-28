const { buildStatusResponse } = require('../services/status.service');

const getStatus = (req, res) => {
  const status = buildStatusResponse();

  res.status(200).json(status);
};

module.exports = {
  getStatus
};
