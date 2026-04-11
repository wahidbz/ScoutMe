const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'assets', 'lang');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let stripped = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  const buffer = fs.readFileSync(filePath);
  
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    fs.writeFileSync(filePath, buffer.slice(3));
    stripped++;
  }
}
console.log('Stripped BOM from ' + stripped + ' files.');
