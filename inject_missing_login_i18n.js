const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, 'assets/lang');
const files = fs.readdirSync(langDir).filter(f => f.endsWith('.json'));

const newKeys = {
  "en": {
    "pi_notice": "Open this page inside Pi Browser for full authentication and payment support.",
    "back_home": "Back to home",
    "before_start": "Before you start",
    "connecting": "Connecting with Pi Network…"
  },
  "ar": {
    "pi_notice": "افتح هذه الصفحة داخل متصفح Pi للحصول على دعم كامل للمصادقة والدفع.",
    "back_home": "العودة للرئيسية",
    "before_start": "قبل البدء",
    "connecting": "جاري الاتصال بـ Pi Network…"
  },
  "fr": {
    "pi_notice": "Ouvrez cette page dans le navigateur Pi pour un support complet d'authentification et de paiement.",
    "back_home": "Retour à l'accueil",
    "before_start": "Avant de commencer",
    "connecting": "Connexion à Pi Network…"
  },
  "es": {
    "pi_notice": "Abra esta página dentro de Pi Browser para soporte completo de autenticación y pago.",
    "back_home": "Volver al inicio",
    "before_start": "Antes de empezar",
    "connecting": "Conectando con Pi Network…"
  },
  "pt": {
    "pi_notice": "Abra esta página no navegador Pi para suporte total de autenticação e pagamento.",
    "back_home": "Voltar ao início",
    "before_start": "Antes de começar",
    "connecting": "Conectando ao Pi Network…"
  },
  "de": {
    "pi_notice": "Öffnen Sie diese Seite im Pi Browser für volle Authentifizierungs- und Zahlungsunterstützung.",
    "back_home": "Zurück zur Startseite",
    "before_start": "Bevor Sie beginnen",
    "connecting": "Verbindung mit Pi Network wird hergestellt…"
  },
  "it": {
    "pi_notice": "Apri questa pagina nel browser Pi per il supporto completo di autenticazione e pagamento.",
    "back_home": "Torna alla home",
    "before_start": "Prima di iniziare",
    "connecting": "Connessione a Pi Network…"
  },
  "tr": {
    "pi_notice": "Tam kimlik doğrulama ve ödeme desteği için bu sayfayı Pi Tarayıcı içinde açın.",
    "back_home": "Anasayfaya dön",
    "before_start": "Başlamadan önce",
    "connecting": "Pi Network ile bağlantı kuruluyor…"
  },
  "hi": {
    "pi_notice": "पूर्ण प्रमाणीकरण और भुगतान समर्थन के लिए इस पृष्ठ को Pi ब्राउज़र के अंदर खोलें।",
    "back_home": "होम पर वापस जाएं",
    "before_start": "शुरू करने से पहले",
    "connecting": "Pi नेटवर्क से कनेक्ट हो रहा है…"
  },
  "zh": {
    "pi_notice": "在 Pi 浏览器中打开此页面以获得完整的身份验证和支付支持。",
    "back_home": "返回首页",
    "before_start": "在开始之前",
    "connecting": "正在连接 Pi Network…"
  },
  "ja": {
    "pi_notice": "完全な認証と支払いサポートのために、Piブラウザ内でこのページを開いてください。",
    "back_home": "ホームに戻る",
    "before_start": "始める前に",
    "connecting": "Pi Networkに接続中…"
  }
};

files.forEach(file => {
  const lang = file.split('.')[0];
  const filePath = path.join(langDir, file);
  try {
    let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.login) data.login = {};
    
    const translations = newKeys[lang] || newKeys['en'];
    data.login.pi_notice = translations.pi_notice;
    data.login.back_home = translations.back_home;
    data.login.before_start = translations.before_start;
    data.login.connecting = translations.connecting;
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${file}`);
  } catch (e) {
    console.error(`Error updating ${file}:`, e);
  }
});
