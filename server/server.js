const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check route ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'AI E-Learning API is running.' });
});

// ── Database connection + Server start ────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
