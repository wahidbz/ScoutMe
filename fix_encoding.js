const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'login.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix the lang-grid mojibake
const startMarker = '<div class="lang-grid">';
const endMarker = '</div>\n      </div>\n    </section>';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newGrid = `<div class="lang-grid">
          <div class="select-card" onclick="I18n.load('en')">🇺🇸 English</div>
          <div class="select-card" onclick="I18n.load('ar')">🇸🇦 العربية</div>
          <div class="select-card" onclick="I18n.load('fr')">🇫🇷 Français</div>
          <div class="select-card" onclick="I18n.load('es')">🇪🇸 Español</div>
          <div class="select-card" onclick="I18n.load('pt')">🇧🇷 Português</div>
          <div class="select-card" onclick="I18n.load('de')">🇩🇪 Deutsch</div>
          <div class="select-card" onclick="I18n.load('it')">🇮🇹 Italiano</div>
          <div class="select-card" onclick="I18n.load('tr')">🇹🇷 Türkçe</div>
          <div class="select-card" onclick="I18n.load('hi')">🇮🇳 हिन्दी</div>
          <div class="select-card" onclick="I18n.load('zh')">🇨🇳 中文</div>
          <div class="select-card" onclick="I18n.load('ja')">🇯🇵 日本語</div>
        </div>`;
  content = content.substring(0, startIndex) + newGrid + content.substring(endIndex + 7);
}

// 2. Fix the Lucide initialization
if (!content.includes('lucide.createIcons()')) {
  content = content.replace('await I18n.init();', 'await I18n.init();\n      if (window.lucide) lucide.createIcons();');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed login.html encoding and icons.');
