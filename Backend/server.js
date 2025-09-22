// Import the express library
const express = require('express');

const app = express();
const port = 3000; // Define the port number


app.get('/', (req, res) => {
  res.send('Hello World! This is the backend.');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});