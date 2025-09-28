require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http'); // Import the http module
const WebSocket = require('ws'); // Import the WebSocket library
const Message = require('./models/Message');
const cors = require('cors');

console.log('Checking Routes ...\n');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user');
const tradeRoutes = require('./routes/tradeRoutes');

const app = express();
const port = 3000;

// IMPORTANT: Add body size limits BEFORE other middleware
app.use(express.json({ limit: '50mb' })); // Increase from default ~1mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add the CORS middleware
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));

// Use the authentication routes
app.use('/api/auth', authRoutes);

// Use the user routes
app.use('/api/user', userRoutes);

// Use the trade routes
app.use("/api/item", tradeRoutes);

// Create the HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected.');

  ws.on('message', async message => {
    try {
      // Parse the incoming message to get the data
      const messageData = JSON.parse(message.toString());

      // Create a new message document using the Message model
      const newMessage = new Message({
        tradeSession: messageData.tradeSession, // You need to provide the session ID from the client
        sender: messageData.sender, // You need to provide the sender ID from the client
        text: messageData.text
      });

      // Save the message to the database
      await newMessage.save();
      console.log('Message saved to database.');

      // Broadcast the message to all other connected clients
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageData));
        }
      });

    } catch (error) {
      console.error('Failed to save or broadcast message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected.');
  });
});

// Have the HTTP server listen on the port
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});