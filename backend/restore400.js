// Restores the products collection from the newest backup (the 400-product
// catalog WITH images). Only touches products — users/settings/orders untouched.
// To switch to the full 1825 catalog later: run `npm run seed`.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/osipp_delivery';

(async () => {
  try {
    const backupsDir = path.join(__dirname, 'backups');
    const folder = fs.readdirSync(backupsDir).sort().reverse()[0];
    const docs = JSON.parse(fs.readFileSync(path.join(backupsDir, folder, 'products.json'), 'utf8'));

    await mongoose.connect(MONGO_URI);
    await Product.deleteMany({});
    await Product.insertMany(docs, { ordered: false });

    const withImg = await Product.countDocuments({ image: { $ne: '' } });
    const total = await Product.countDocuments();
    console.log(`Restored from backup ${folder}: ${total} products (${withImg} with images).`);
    process.exit(0);
  } catch (err) {
    console.error('Restore error:', err.message);
    process.exit(1);
  }
})();
