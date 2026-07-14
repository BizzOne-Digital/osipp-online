// Exports every collection in the database to timestamped JSON files.
// Usage: cd backend && node backup.js
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/osipp_delivery';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const dir = path.join(__dirname, 'backups', stamp);
    fs.mkdirSync(dir, { recursive: true });

    let total = 0;
    for (const c of collections) {
      const docs = await db.collection(c.name).find({}).toArray();
      fs.writeFileSync(path.join(dir, c.name + '.json'), JSON.stringify(docs, null, 2));
      console.log(`  ${c.name}: ${docs.length} documents`);
      total += docs.length;
    }

    console.log(`\nBackup complete: ${total} documents across ${collections.length} collections`);
    console.log('Saved to: ' + dir);
    process.exit(0);
  } catch (err) {
    console.error('Backup error:', err.message);
    process.exit(1);
  }
})();
