// Parses catalog.txt into a products JSON array.
// Format of catalog.txt:
//   #Category|SubCategory|Store        <- section header (sets context)
//   Product Name|size|price            <- one product line
// Blank lines and lines starting with // are ignored.
// Prices: take the plain number (ignore any "($x save)" text).
const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, 'catalog.txt'), 'utf8');
const lines = raw.split(/\r?\n/);

let ctx = { category: '', subCategory: '', store: '' };
const products = [];
let lineNo = 0, skipped = [];

for (const line of lines) {
  lineNo++;
  const t = line.trim();
  if (!t || t.startsWith('//')) continue;
  if (t.startsWith('#')) {
    const [category, subCategory, store] = t.slice(1).split('|').map(s => (s || '').trim());
    ctx = { category, subCategory, store };
    continue;
  }
  const parts = t.split('|');
  if (parts.length < 3) { skipped.push(`L${lineNo}: ${t}`); continue; }
  const name = parts[0].trim();
  const volume = parts[1].trim();
  const priceNum = parseFloat(String(parts[2]).replace(/[^0-9.]/g, ''));
  if (!name || isNaN(priceNum)) { skipped.push(`L${lineNo}: ${t}`); continue; }
  products.push({
    name, volume, price: priceNum,
    category: ctx.category, subCategory: ctx.subCategory, store: ctx.store,
    badge: '', stock: 100
  });
}

fs.writeFileSync(path.join(__dirname, 'catalogProducts.json'), JSON.stringify(products, null, 2));
console.log(`Parsed ${products.length} products.`);
if (skipped.length) console.log(`Skipped ${skipped.length} lines:\n` + skipped.slice(0, 20).join('\n'));

// quick category breakdown
const byCat = {};
products.forEach(p => { byCat[p.category] = (byCat[p.category] || 0) + 1; });
console.log('By category:', byCat);
