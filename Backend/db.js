const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://1234:1234@cluster0.eegpygg.mongodb.net/solvative-live-reviews'; 

const client = new MongoClient(uri);

module.exports = connectToMongoDB = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}