// server/mongo.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster326.sozvdq5.mongodb.net/?retryWrites=true&w=majority`;
const dbName = 'wordleHelper';

async function connectToDatabase() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    return client.db(dbName);
  } catch (error) {
    console.error('Error connecting to the database', error);
    throw error;
  }
}

module.exports = { connectToDatabase };
