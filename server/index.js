// server/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const { connectToDatabase } = require('./mongo');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// Handle other routes (you might want to add more routes later)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

app.post('/saveGameState', async (req, res) => {
  const db = await connectToDatabase();

  // Get the game state from the request body (modify this based on your actual data structure)
  const gameState = req.body;

  try {
    // Save the game state to the database (modify this based on your actual collection and data structure)
    const result = await db.collection('history').insertOne(gameState);
    console.log('Game state saved to the database:', result.insertedId);
    res.status(200).send('Game state saved successfully');
  } catch (error) {
    console.error('Error saving game state to the database', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.get('/history', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const historyCollection = db.collection('history'); // Replace 'history' with your actual collection name
    const historyData = await historyCollection.find().toArray();
    res.json(historyData);
  } catch (error) {
    console.error('Error fetching history data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/clearHistory', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const historyCollection = db.collection('history'); // Replace 'history' with your actual collection name

    // Implement logic to clear history data (adjust this based on your actual data structure)
    await historyCollection.deleteMany({});
    res.json({ message: 'History cleared successfully' });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
