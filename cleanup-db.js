const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  try {
    const res = await db.collection('users').deleteMany({ email: { $exists: false } });
    console.log('Deleted orphaned Discord-only records:', res.deletedCount);
  } catch (e) {
    console.log('Error deleting records', e);
  }

  try {
    await db.collection('users').dropIndex('discordId_1');
    console.log('Successfully dropped discordId unique index');
  } catch (e) {
    console.log('Index discordId_1 does not exist, safe to proceed');
  }

  process.exit();
}

main().catch(console.error);
