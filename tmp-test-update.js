const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db();
  
  try {
    const res = await db.collection('users').findOneAndUpdate(
      { email: 'ayushwange11@gmail.com' },
      { $set: { steamId: 'test1234', valorantId: 'sass#123' } },
      { returnDocument: 'after' }
    );
    console.log('Update result:', res);
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await client.close();
}
main().catch(console.error);
