require('dotenv').config();

const express = require('express');
const apiRoutes = require('./src/routes');
const apiAuthRoutes = require('./src/routes/auth.router');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Intellexa Backend API is running'
  });
});

app.use('/api', apiRoutes);
app.use('/api/auth', apiAuthRoutes);


const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
