const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'assets', 'lang', 'ar.json');
const enPath = path.join(__dirname, 'assets', 'lang', 'en.json');

const arJson = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// common
arJson.common.subtitle = "اكتشاف المواهب Web3 داخل متصفح Pi";
enJson.common.subtitle = "Web3 scouting inside Pi Browser";

// hero
arJson.hero.badge_pi = "منظومة شبكة Pi";
enJson.hero.badge_pi = "Pi Network Ecosystem";
arJson.hero.badge_web3 = "اكتشاف Web3";
enJson.hero.badge_web3 = "Web3 Scouting";
arJson.hero.badge_rewards = "مكافآت SMTK";
enJson.hero.badge_rewards = "SMTK Rewards";

// metrics
arJson.metrics = {
  sports: "رياضات متكاملة",
  sports_value: "+12",
  sports_hint: "كرة القدم، كرة السلة، التنس والمزيد",
  regions: "مناطق عالمية",
  regions_value: "11",
  regions_hint: "دعم كامل للغة العربية والانجليزية",
  trust: "مؤشر الثقة",
  trust_value: "99%",
  trust_hint: "موثق بواسطة نظام Pi Network"
};
enJson.metrics = {
  sports: "Integrated Sports",
  sports_value: "12+",
  sports_hint: "Football, Basketball, Tennis & more",
  regions: "Global Regions",
  regions_value: "11",
  regions_hint: "Full RTL (Arabic) & LTR support",
  trust: "Trust Index",
  trust_value: "99%",
  trust_hint: "Verified by Pi Network Auth"
};

// ecosystem
arJson.ecosystem = {
  title: "المنظومة المتكاملة",
  mission: "مهمات يومية",
  mission_desc: "أكمل المهمات لاكتساب نقاط الخبرة وزيادة ظهورك ككشاف.",
  mining: "تعدين SMTK مدار الساعة",
  mining_desc: "قم بتفعيل جلستك يوميا لتوليد العملات المجتمعية.",
  leaderboard: "قوائم الصدارة المباشرة",
  leaderboard_desc: "تسلق مراتب التصنيف واجذب انتباه الأندية المحترفة."
};
enJson.ecosystem = {
  title: "Platform Ecosystem",
  mission: "Daily Mission Loop",
  mission_desc: "Complete tasks to earn XP and boost your scout visibility.",
  mining: "SMTK 24h Mining",
  mining_desc: "Activate your session daily to generate community tokens.",
  leaderboard: "Live Leaderboards",
  leaderboard_desc: "Climb the ranks and get noticed by professional clubs."
};

// features
arJson.features = {
  ranking: "تصنيف متقدم",
  ranking_desc: "تقييم إمكانات المواهب بتقنيات الذكاء الاصطناعي وتتبع النشاط الموثق.",
  synergy: "تواصل في الوقت الفعلي",
  synergy_desc: "رسائل مباشرة بين الكشافة واللاعبين مع إشعارات فورية وتخزين مستمر.",
  museum: "متحف المواهب",
  museum_desc: "اعرض مهاراتك في قاعات الميتافيرس عبر A-Frame للاكتشاف الافتراضي."
};
enJson.features = {
  ranking: "Advanced Ranking",
  ranking_desc: "AI-driven potential scoring and verified activity tracking for elite talent discovery.",
  synergy: "Real-time Synergy",
  synergy_desc: "Direct messaging between scouts and players with persistence and instant notifications.",
  museum: "Museum of Talent",
  museum_desc: "Showcase your highlights in an immersive A-Frame metaverse hall for virtual scouting."
};

fs.writeFileSync(arPath, JSON.stringify(arJson, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');

console.log('Translations updated.');
