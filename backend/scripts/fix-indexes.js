import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function fixIndexes() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const collection = db.collection('users');

  // List current indexes
  const indexes = await collection.indexes();
  console.log('Current indexes:', indexes.map(i => i.name));

  // Drop the old phoneOrEmail index if it exists
  const hasOldIndex = indexes.some(i => i.name === 'phoneOrEmail_1');
  if (hasOldIndex) {
    await collection.dropIndex('phoneOrEmail_1');
    console.log('Dropped old phoneOrEmail_1 index');
  } else {
    console.log('Old index not found — nothing to drop');
  }

  await mongoose.disconnect();
  console.log('Done');
}

fixIndexes().catch(err => { console.error(err); process.exit(1); });
