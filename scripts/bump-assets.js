// Adds a content hash to CSS/JS links (?v=xxxx) in every HTML page so
// Cloudflare and browsers fetch the new file after each change.
// Usage: node scripts/bump-assets.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const assets = [
  '/assets/css/style.css', '/assets/js/main.js', '/assets/img/og-image.jpg',
  '/favicon.ico', '/assets/img/favicon.svg', '/assets/img/favicon-32.png', '/assets/img/apple-touch-icon.png'
];
const hash = f => crypto.createHash('md5').update(fs.readFileSync(path.join(root, f))).digest('hex').slice(0, 8);
const versions = Object.fromEntries(assets.map(a => [a, hash(a)]));

const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
  if (d.name.startsWith('.') || d.name === 'node_modules') return [];
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

for (const file of walk(root)) {
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const [a, v] of Object.entries(versions)) {
    const re = new RegExp(a.replace(/[.]/g, '\\.') + '(\\?v=[0-9a-f]+)?', 'g');
    html = html.replace(re, `${a}?v=${v}`);
  }
  if (html !== before) { fs.writeFileSync(file, html); console.log('updated', path.relative(root, file)); }
}
console.log(versions);
