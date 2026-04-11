const fs = require('fs');
const path = require('path');

const arPath = path.join(__dirname, 'assets', 'lang', 'ar.json');
const enPath = path.join(__dirname, 'assets', 'lang', 'en.json');

const arJson = JSON.parse(fs.readFileSync(arPath, 'utf8'));
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// Login Page
arJson.login = {
  title: "تسجيل الدخول باستخدام Pi لأجل الرياضة",
  desc: "استخدم مصادقة Pi لفتح الدورة الكاملة لـ ScoutMe، حفظ تفضيلاتك من لغة ورياضة ورصيد ومحفظة في قاعدة البيانات، وتسجيل الدخول التلقائي عند العودة.",
  mission_title: "دورة المهمات",
  mission_desc: "مهمات يومية، مستوى الكشاف، مكافآت التعدين وعجلة الحظ.",
  lang_title: "11 لغة",
  lang_desc: "دعم مدمج للغة العربية مع حفظ تفضيلاتك.",
  pi_title: "مدفوعات Pi",
  pi_desc: "عزز ملفك، افتح جهات الاتصال، وادخل قاعة المشاهير.",
  button: "المتابعة باستخدام شبكة Pi"
};
enJson.login = {
  title: "Pi login for sports discovery.",
  desc: "Use Pi authentication to unlock the full ScoutMe loop, save your language, sport, level, streak, and wallet in Firestore, and auto-login on return.",
  mission_title: "Mission loop",
  mission_desc: "Daily missions, streaks, scout level, mining and spin rewards.",
  lang_title: "11 languages",
  lang_desc: "Arabic RTL included with persistent preference in Firestore.",
  pi_title: "Pi payments",
  pi_desc: "Boost profile, unlock contacts, Hall of Fame entry, club subscription.",
  button: "Continue with Pi Network"
};

// Overview/Dashboard
arJson.dashboard = {
  total_smtk: "إجمالي SMTK",
  platform_rank: "تصنيف المنصة",
  active_streak: "أيام النشاط المتتالية",
  daily_spins: "دورات عجلة الحظ",
  overview: "نظرة عامة",
  unlock_advanced: "فتح التحليلات المتقدمة",
  unlock_cost: "التكلفة: 0.5 Pi"
};
enJson.dashboard = {
  total_smtk: "Total SMTK",
  platform_rank: "Platform Rank",
  active_streak: "Active Streak",
  daily_spins: "Daily Spins",
  overview: "Analytics Overview",
  unlock_advanced: "Unlock Advanced Analytics",
  unlock_cost: "Cost: 0.5 Pi"
};

// Mining
arJson.mining.status = "حالة العقدة";
arJson.mining.speed = "سرعة التعدين الأساسية";
enJson.mining.status = "Node Status";
enJson.mining.speed = "Base Mining Rate";

// Spin
arJson.spin.play = "العب الآن";
enJson.spin.play = "Play Now";

// Missions
arJson.missions = {
  title: "المهام اليومية",
  points: "نقاط",
  claim: "استلام المكافأة",
  completed: "مكتملة",
  reset: "إعادة تعيين المهام في"
};
enJson.missions = {
  title: "Daily Missions",
  points: "pts",
  claim: "Claim Reward",
  completed: "Completed",
  reset: "Missions reset in"
};

// Ranking
arJson.ranking = {
  title: "التصنيف العالمي",
  player: "اللاعب",
  rating: "التقييم",
  trend: "الاتجاه",
  scout_action: "طلب كشاف",
  cost: "0.2 Pi"
};
enJson.ranking = {
  title: "Global Leaderboard",
  player: "Player",
  rating: "Rating",
  trend: "Trend",
  scout_action: "Scout Request",
  cost: "0.2 Pi"
};

// Transfer
arJson.transfer = {
  title: "سوق الانتقالات",
  market_value: "القيمة السوقية",
  status: "الحالة",
  bid: "تقديم عرض",
  available: "متاح",
  signed: "مُوقّع"
};
enJson.transfer = {
  title: "Transfer Market",
  market_value: "Market Value",
  status: "Status",
  bid: "Place Bid",
  available: "Available",
  signed: "Signed"
};

// Chat
arJson.chat = {
  title: "الرسائل المباشرة",
  placeholder: "اكتب رسالة...",
  send: "إرسال",
  empty: "لا توجد رسائل سابقة. ابدأ المحادثة الآن!"
};
enJson.chat = {
  title: "Direct Messages",
  placeholder: "Type a message...",
  send: "Send",
  empty: "No previous messages. Start a conversation!"
};

// Profile
arJson.profile = {
  title: "الملف الشخصي",
  edit: "تعديل الملف",
  wallet: "المحفظة المرتبطة",
  sport: "الرياضة",
  position: "المركز",
  country: "البلد",
  bio: "السيرة الذاتية",
  highlights: "مقاطع الفيديو"
};
enJson.profile = {
  title: "Player Profile",
  edit: "Edit Profile",
  wallet: "Linked Wallet",
  sport: "Sport",
  position: "Position",
  country: "Country",
  bio: "Bio",
  highlights: "Highlights"
};

fs.writeFileSync(arPath, JSON.stringify(arJson, null, 2), 'utf8');
fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');

console.log('Full App Translations added successfully.');
