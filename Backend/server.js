require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const WebSocket = require('ws');
const Message = require('./models/Message');
const cors = require('cors');

console.log('Checking Routes ...\n');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/user');
const tradeRoutes = require('./routes/tradeRoutes');
const tradeHistoryRoutes = require('./routes/TradeHistoryRoutes'); // ADD THIS LINE

const app = express();
const port = 3000;

// IMPORTANT: Add body size limits BEFORE other middleware
app.use(express.json({ limit: '50mb' }));
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

// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use("/api/item", tradeRoutes);
app.use('/api/tradeHistory', tradeHistoryRoutes); // ADD THIS LINE

// Create the HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('Client connected.');

  ws.on('message', async message => {
    try {
      const messageData = JSON.parse(message.toString());

      const newMessage = new Message({
        tradeSession: messageData.tradeSession,
        sender: messageData.sender,
        text: messageData.text
      });

      await newMessage.save();
      console.log('Message saved to database.');

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

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});