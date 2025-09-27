// const express = require('express');
// const mongoose = require('mongoose');
// const profileRoutes = require('./profile'); // Adjust the path as needed
// const historyRoutes = require('./history'); // Adjust the path as needed

// // Initialize Express app
// const app = express();
// const port = 3000;

// // Middleware to parse JSON bodies
// app.use(express.json());

// // --- 1. MongoDB Connection ---
// mongoose.connect('mongodb://localhost:27017/user_app', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// }).then(() => {
//     console.log('Connected to MongoDB');
// }).catch(err => {
//     console.error('Could not connect to MongoDB', err);
// });

// // --- 2. Mongoose Models (from the 'models' folder) ---
// // Assuming you have User.js and History.js in a models folder
// const User = require('./models/User');
// const History = require('./models/History');

// // --- 3. API Routes and Controllers (from 'routes' & 'controllers' folders) ---
// app.use('/api/profile', profileRoutes);
// app.use('/api/history', historyRoutes);

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });