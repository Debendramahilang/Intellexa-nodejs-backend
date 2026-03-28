require('dotenv').config();

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes');
const apiAuthRoutes = require('./src/routes/auth.router');

const app = express();

// Enable CORS for all origins (adjust origin as needed)
app.use(cors({
  origin: 'http://localhost:5173',          // allow all origins
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true     // allow cookies
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Intellexa Backend API is running'
  });
});

app.use('/api', apiRoutes);
app.use('/api/auth', apiAuthRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});