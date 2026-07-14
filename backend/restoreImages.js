// Re-applies product images from the most recent backup onto current products
// by matching product name (case-insensitive). Cloudinary URLs stay valid.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/osipp_delivery';
const norm = s => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

(async () => {
  try {
    // load newest backup
    const backupsDir = path.join(__dirname, 'backups');
    const folder = fs.readdirSync(backupsDir).sort().reverse()[0];
    const docs = JSON.parse(fs.readFileSync(path.join(backupsDir, folder, 'products.json'), 'utf8'));

    // name -> image (first one wins)
    const imgByName = {};
    for (const d of docs) {
      if (d.image && d.image.trim()) {
        const k = norm(d.name);
        if (!imgByName[k]) imgByName[k] = d.image;
      }
    }
    console.log('Backup:', folder, '| image names:', Object.keys(imgByName).length);

    await mongoose.connect(MONGO_URI);
    const products = await Product.find({ $or: [{ image: '' }, { image: { $exists: false } }] });
    let matched = 0;
    for (const p of products) {
      const img = imgByName[norm(p.name)];
      if (img) { p.image = img; await p.save(); matched++; }
    }
    console.log(`Updated ${matched} products with images (of ${products.length} without).`);
    process.exit(0);
  } catch (err) {
    console.error('Restore error:', err.message);
    process.exit(1);
  }
})();
