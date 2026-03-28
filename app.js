require('dotenv').config();

const express = require('express');
const apiRoutes = require('./src/routes');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Intellexa Backend API is running'
  });
});

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
