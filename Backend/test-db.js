const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://1234:1234@cluster0.eegpygg.mongodb.net/';

async function main() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('solvative-live-reviews');

    const collection = database.collection('reviews');

    // const deleteResult = await collection.deleteMany({
    //   name: { $in: ['John Doe'] }
    // });

    // console.log(`Deleted ${deleteResult.deletedCount} documents`);

    const documents = await collection.find({}).toArray();
    console.log('Documents:', documents);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main();