const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'assets', 'lang', 'ar.json');
const enPath = path.join(__dirname, 'assets', 'lang', 'en.json');

const arJson = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Nav
arJson.nav = {
  ecosystem: "المنظومة",
  network: "الشبكة",
  explore: "استكشاف",
  missions: "المهمات",
  mining: "التعدين",
  spin: "الحظ",
  ranking: "التصنيف",
  transfer: "الانتقالات",
  messages: "الرسائل",
  hall: "قاعة المشاهير",
  metaverse: "الميتافيرس",
  menu: "القائمة"
};
enJson.nav = {
  ecosystem: "Ecosystem",
  network: "Network",
  explore: "Explore",
  missions: "Missions",
  mining: "Mining",
  spin: "Spin",
  ranking: "Ranking",
  transfer: "Transfers",
  messages: "Messages",
  hall: "Hall of Fame",
  metaverse: "Metaverse",
  menu: "Menu"
};

// Dashboard additions
arJson.dashboard.trending = "المواهب الصاعدة";
arJson.dashboard.smart = "توصيات ذكية";
arJson.dashboard.plans = "باقات Pi";
arJson.dashboard.growth = "النمو الفيروسي";
arJson.dashboard.actions = "إجراءات سريعة";
arJson.dashboard.videos = "مقاطع الفيديو";

enJson.dashboard.trending = "Trending talents";
enJson.dashboard.smart = "Smart recommendations";
enJson.dashboard.plans = "Pi payment plans";
enJson.dashboard.growth = "Viral growth";
enJson.dashboard.actions = "Quick actions";
enJson.dashboard.videos = "Videos";

fs.writeFileSync(arPath, JSON.stringify(arJson, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');

console.log('Nav and Dashboard Translations added.');
