const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, 'assets/lang');
const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));

const shopKeys = {
  "en": {
    "title": "Pi Sports Shop",
    "subtitle": "Boost your career with Pi tokens.",
    "boost_name": "Profile Boost",
    "boost_desc": "7 days of high visibility to scouts.",
    "contact_name": "Direct Contact",
    "contact_desc": "Unlock message access to any club.",
    "hall_name": "Hall of Fame",
    "hall_desc": "Instant premium card in the Metaverse.",
    "club_name": "Club Premium",
    "club_desc": "30 days of advanced club management.",
    "pay": "Pay with Pi"
  },
  "ar": {
    "title": "متجر Pi الرياضي",
    "subtitle": "عزز مسيرتك باستخدام عملات Pi.",
    "boost_name": "تعزيز الملف",
    "boost_desc": "7 أيام من الظهور العالي للكشافة.",
    "contact_name": "اتصال مباشر",
    "contact_desc": "فتح الوصول للمراسلة لأي نادٍ.",
    "hall_name": "قاعة المشاهير",
    "hall_desc": "بطاقة بريميوم فورية في الميتافيرس.",
    "club_name": "اشتراك الأندية",
    "club_desc": "30 يوماً من إدارة الأندية المتقدمة.",
    "pay": "ادفع بـ Pi"
  },
  "fr": {
    "title": "Boutique Pi Sports",
    "subtitle": "Boostez votre carrière avec Pi.",
    "boost_name": "Boost de Profil",
    "boost_desc": "7 jours de haute visibilité.",
    "contact_name": "Contact Direct",
    "contact_desc": "Débloquez l'accès aux messages.",
    "hall_name": "Hall of Fame",
    "hall_desc": "Carte premium instantanée.",
    "club_name": "Club Premium",
    "club_desc": "30 jours de gestion avancée.",
    "pay": "Payer avec Pi"
  }
  // Simplified for script, will use English for others if needed, 
  // but I'll provide the rest to ensure it works.
};

files.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(langDir, file);
  try {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.shop = shopKeys[lang] || shopKeys['en'];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Injected Shop i18n into ${file}`);
  } catch (e) {
    console.error(`Error ${file}:`, e);
  }
});
