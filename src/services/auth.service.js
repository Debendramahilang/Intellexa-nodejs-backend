const buildStatusResponse = () => {
  return {
    status: 'Running',
    project: 'Intellexa Backend',
    timestamp: new Date().toISOString()
  };
};

module.exports = {
  buildStatusResponse
};
