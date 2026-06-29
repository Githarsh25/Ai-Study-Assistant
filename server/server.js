const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = 3000;

// Allow Angular dev server (port 4200) to call this backend
app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://ai-stud-asst.netlify.app'
  ]
}));
// Allow the server to understand JSON request bodies
app.use(express.json());

// Import and use routes
app.use('/api/upload', require('./routes/upload'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/flashcards', require('./routes/flashcards'));// Health check route — visit http://localhost:3000/api/health to confirm it's running
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Handle the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the Backend API! Visit /api/health to check the server status.');
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});