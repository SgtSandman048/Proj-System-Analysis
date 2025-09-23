require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user');
const tradeRoutes = require('./routes/tradeRoutes');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Add the CORS middleware here, outside of app.listen()
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Use the authentication routes here, outside of app.listen()
app.use('/api/auth', authRoutes);

// Use the new user routes here, outside of app.listen()
app.use('/api/user', userRoutes);

// Use the trade routes here, outside of app.listen()
app.use("/api/trade", tradeRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});