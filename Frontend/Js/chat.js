// Establish a WebSocket connection to your backend
const ws = new WebSocket('ws://localhost:8080');

const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const chatBox = document.getElementById('chatBox');

// Event listener for incoming messages
ws.onmessage = event => {
  const message = JSON.parse(event.data);
  const messageElement = document.createElement('div');
  messageElement.textContent = `Seller: ${message.content}`;
  chatBox.appendChild(messageElement);
};

// Event listener for the send button
sendButton.addEventListener('click', () => {
  const messageContent = messageInput.value;
  if (messageContent) {
    const message = {
      sender: 'buyer', 
      content: messageContent
    };
    ws.send(JSON.stringify(message));

    // Display your own message in the chat box
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${message.content}`;
    chatBox.appendChild(messageElement);
    messageInput.value = ''; // Clear the input field
  }
});