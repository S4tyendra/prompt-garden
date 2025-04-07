const { MongoClient } = require('mongodb');

async function main() {
  const client = await MongoClient.connect('mongodb://localhost:27017');
  const db = client.db('prompt_garden');

  // Create collections
  await db.createCollection('users');
  await db.createCollection('prompts');

  // Create default user
  const existingUser = await db.collection('users').findOne({ username: 'satya' });
  if (!existingUser) {
    await db.collection('users').insertOne({
      username: 'satya',
      password: 'satya',
      createdAt: new Date()
    });
    console.log('Created default user: satya');
  }

  await client.close();
  console.log('Database initialized successfully');
}

main().catch(console.error);