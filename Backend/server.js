require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Import the http module
const WebSocket = require('ws'); // Import the WebSocket library

console.log('Checking Routes ...\n');

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
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));


// Use the authentication routes here, outside of app.listen()
app.use('/api/auth', authRoutes);

// Use the new user routes here, outside of app.listen()
app.use('/api/user', userRoutes);

// Use the trade routes here, outside of app.listen()
app.use("/api/item", tradeRoutes);

// Create the HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected.');

  ws.on('message', message => {
    // Broadcast the message to all other connected clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

// Have the HTTP server listen on the port
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});