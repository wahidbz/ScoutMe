const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const lucideTag = '  <script src="https://unpkg.com/lucide@latest"></script>';

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('lucide@latest')) {
    if (content.includes('</head>')) {
      content = content.replace('</head>', `${lucideTag}\n</head>`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected Lucide into ${file}`);
    }
  }
});
