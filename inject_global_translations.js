const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, 'assets', 'lang');

const translations = {
  fr: {
    common: { subtitle: "Le scouting Web3 dans Pi Browser" },
    hero: { badge_pi: "Écosystème Pi", badge_web3: "Scouting Web3", badge_rewards: "Récompenses SMTK" },
    metrics: { sports: "Sports Intégrés", sports_hint: "Football, Basket, etc.", regions: "Régions Globales", regions_hint: "Support RTL & LTR", trust: "Indice de Confiance", trust_hint: "Vérifié par Pi" },
    nav: { ecosystem: "Écosystème", network: "Réseau", explore: "Explorer", missions: "Missions", mining: "Minage", spin: "Tourner", ranking: "Classement", transfer: "Transferts", messages: "Messages", hall: "Temple", metaverse: "Métavers", menu: "Menu" },
    login: { title: "Connexion Pi pour le sport.", desc: "Utilisez Pi pour débloquer ScoutMe.", mission_title: "Boucle de mission", mission_desc: "Missions quotidiennes, minage.", lang_title: "11 langues", lang_desc: "Préférences sauvegardées.", pi_title: "Paiements Pi", pi_desc: "Boostez votre profil.", button: "Continuer avec Pi" },
    dashboard: { active_streak: "Série active", total_smtk: "Solde SMTK", ai_potential: "Potentiel IA", videos: "Vidéos", momentum: "Dynamique Hebdo", scout_progress: "Progression Scout", actions: "Actions rapides", loop_active: "Boucle active", trending: "Talents tendances", smart: "Recommandations IA", plans: "Forfaits Pi", growth: "Croissance virale", referral_link: "Lien de parrainage", copy_link: "Copier le lien" }
  },
  es: {
    common: { subtitle: "Scouting Web3 en Pi Browser" },
    hero: { badge_pi: "Ecosistema Pi", badge_web3: "Scouting Web3", badge_rewards: "Recompensas SMTK" },
    metrics: { sports: "Deportes Integrados", sports_hint: "Fútbol, Baloncesto, etc.", regions: "Regiones Globales", regions_hint: "Soporte RTL y LTR", trust: "Índice de Confianza", trust_hint: "Verificado por Pi" },
    nav: { ecosystem: "Ecosistema", network: "Red", explore: "Explorar", missions: "Misiones", mining: "Minería", spin: "Girar", ranking: "Ranking", transfer: "Traspasos", messages: "Mensajes", hall: "Salón de la Fama", metaverse: "Metaverso", menu: "Menú" },
    login: { title: "Inicio de sesión Pi.", desc: "Usa Pi para desbloquear ScoutMe.", mission_title: "Misiones", mission_desc: "Misiones diarias y minería.", lang_title: "11 idiomas", lang_desc: "Guardado en la nube.", pi_title: "Pagos Pi", pi_desc: "Mejora tu perfil.", button: "Continuar con Pi" },
    dashboard: { active_streak: "Racha activa", total_smtk: "Saldo SMTK", ai_potential: "Potencial IA", videos: "Videos", momentum: "Impulso Semanal", scout_progress: "Progreso Scout", actions: "Acciones rápidas", loop_active: "Bucle activo", trending: "Talentos virales", smart: "Recomendaciones", plans: "Planes Pi", growth: "Crecimiento", referral_link: "Enlace de referido", copy_link: "Copiar enlace" }
  },
  hi: {
    common: { subtitle: "Pi ब्राउज़र में Web3 स्काउटिंग" },
    hero: { badge_pi: "Pi नेटवर्क इकोसिस्टम", badge_web3: "Web3 स्काउटिंग", badge_rewards: "SMTK इनाम" },
    metrics: { sports: "एकीकृत खेल", sports_hint: "फुटबॉल, बास्केटबॉल, आदि", regions: "वैश्विक क्षेत्र", regions_hint: "RTL और LTR समर्थन", trust: "विश्वास सूचकांक", trust_hint: "Pi द्वारा सत्यापित" },
    nav: { ecosystem: "पारिस्थितिकी तंत्र", network: "नेटवर्क", explore: "एक्सप्लोर करें", missions: "मिशन", mining: "माइनिंग", spin: "स्पिन", ranking: "रैंकिंग", transfer: "ट्रांसफर", messages: "संदेश", hall: "हॉल ऑफ फेम", metaverse: "मेटावर्स", menu: "मेनू" },
    login: { title: "खेल खोज के लिए Pi लॉगिन।", desc: "ScoutMe अनलॉक करने के लिए Pi का उपयोग करें।", mission_title: "मिशन लूप", mission_desc: "दैनिक मिशन और माइनिंग।", lang_title: "11 भाषाएं", lang_desc: "वरीयताएं सहेजी गईं।", pi_title: "Pi भुगतान", pi_desc: "अपना प्रोफाइल बढ़ाएं।", button: "Pi नेटवर्क के साथ जारी रखें" },
    dashboard: { active_streak: "सक्रिय सिलसिला", total_smtk: "SMTK बैलेंस", ai_potential: "एआई क्षमता", videos: "वीडियो", momentum: "साप्ताहिक गति", scout_progress: "स्काउट प्रगति", actions: "त्वरित कार्रवाई", loop_active: "लूप सक्रिय", trending: "ट्रेंडिंग टैलेंट", smart: "स्मार्ट सिफारिशें", plans: "Pi भुगतान योजना", growth: "वायरल विकास", referral_link: "रेफरल लिंक", copy_link: "लिंक कॉपी करें" }
  },
  zh: {
    common: { subtitle: "Pi浏览器内的Web3星探" },
    hero: { badge_pi: "Pi网络生态系统", badge_web3: "Web3星探", badge_rewards: "SMTK奖励" },
    metrics: { sports: "综合体育", sports_hint: "足球，篮球等", regions: "全球区域", regions_hint: "支持RTL和LTR", trust: "信任指数", trust_hint: "经Pi验证" },
    nav: { ecosystem: "生态系统", network: "网络", explore: "探索", missions: "任务", mining: "挖矿", spin: "抽奖", ranking: "排名", transfer: "转会", messages: "消息", hall: "名人堂", metaverse: "元宇宙", menu: "菜单" },
    login: { title: "Pi 体育发现登录", desc: "使用Pi解锁ScoutMe。", mission_title: "任务循环", mission_desc: "每日任务和挖矿。", lang_title: "11种语言", lang_desc: "保存的首选项。", pi_title: "Pi支付", pi_desc: "提升您的个人资料。", button: "使用Pi Network继续" },
    dashboard: { active_streak: "连续活跃", total_smtk: "SMTK余额", ai_potential: "AI潜力", videos: "视频", momentum: "每周动态", scout_progress: "星探进度", actions: "快速操作", loop_active: "循环活跃", trending: "热门人才", smart: "智能推荐", plans: "Pi支付计划", growth: "病毒式增长", referral_link: "推荐链接", copy_link: "复制链接" }
  },
  pt: {
    common: { subtitle: "Scouting Web3 no Pi Browser" },
    hero: { badge_pi: "Ecossistema Pi", badge_web3: "Scouting Web3", badge_rewards: "Recompensas SMTK" },
    metrics: { sports: "Esportes Integrados", sports_hint: "Futebol, Basquete, etc.", regions: "Regiões Globais", regions_hint: "Suporte RTL e LTR", trust: "Índice de Confiança", trust_hint: "Verificado pelo Pi" },
    nav: { ecosystem: "Ecossistema", network: "Rede", explore: "Explorar", missions: "Missões", mining: "Mineração", spin: "Girar", ranking: "Ranking", transfer: "Transferências", messages: "Mensagens", hall: "Hall da Fama", metaverse: "Metaverso", menu: "Menu" },
    login: { title: "Login do Pi para esportes.", desc: "Use o Pi para desbloquear o ScoutMe.", mission_title: "Missões", mission_desc: "Missões diárias e mineração.", lang_title: "11 idiomas", lang_desc: "Preferências salvas.", pi_title: "Pagamentos Pi", pi_desc: "Impulsione seu perfil.", button: "Continuar com Pi" },
    dashboard: { active_streak: "Sequência ativa", total_smtk: "Saldo SMTK", ai_potential: "Potencial de IA", videos: "Vídeos", momentum: "Momento Semanal", scout_progress: "Progresso do Scout", actions: "Ações rápidas", loop_active: "Ciclo ativo", trending: "Talentos em alta", smart: "Recomendações", plans: "Planos Pi", growth: "Crescimento", referral_link: "Link de indicação", copy_link: "Copiar link" }
  },
  de: {
    common: { subtitle: "Web3-Scouting im Pi-Browser" },
    hero: { badge_pi: "Pi-Netzwerk-Ökosystem", badge_web3: "Web3 Scouting", badge_rewards: "SMTK-Belohnungen" },
    metrics: { sports: "Integrierte Sportarten", sports_hint: "Fußball, Basketball, usw.", regions: "Globale Regionen", regions_hint: "RTL- und LTR-Unterstützung", trust: "Vertrauensindex", trust_hint: "Zertifiziert durch Pi" },
    nav: { ecosystem: "Ökosystem", network: "Netzwerk", explore: "Erkunden", missions: "Missionen", mining: "Bergbau", spin: "Drehen", ranking: "Rangliste", transfer: "Transfers", messages: "Nachrichten", hall: "Ruhmeshalle", metaverse: "Metaverse", menu: "Menü" },
    login: { title: "Pi-Login für die Sportentdeckung.", desc: "Verwenden Sie Pi, um ScoutMe zu entsperren.", mission_title: "Missionsschleife", mission_desc: "Tägliche Missionen und Bergbau.", lang_title: "11 Sprachen", lang_desc: "Gespeicherte Einstellungen.", pi_title: "Pi-Zahlungen", pi_desc: "Steigern Sie Ihr Profil.", button: "Weiter mit Pi" },
    dashboard: { active_streak: "Aktive Serie", total_smtk: "SMTK-Guthaben", ai_potential: "KI-Potenzial", videos: "Videos", momentum: "Wöchentliche Dynamik", scout_progress: "Scout-Fortschritt", actions: "Schnelle Aktionen", loop_active: "Schleife aktiv", trending: "Trendende Talente", smart: "Intelligente Empfehlungen", plans: "Pi-Zahlungspläne", growth: "Virales Wachstum", referral_link: "Empfehlungslink", copy_link: "Link kopieren" }
  },
  it: {
    common: { subtitle: "Scouting Web3 in Pi Browser" },
    hero: { badge_pi: "Ecosistema Pi Network", badge_web3: "Scouting Web3", badge_rewards: "Premi SMTK" },
    metrics: { sports: "Sport Integrati", sports_hint: "Calcio, Basket, ecc.", regions: "Regioni Globali", regions_hint: "Supporto RTL e LTR", trust: "Indice di Fiducia", trust_hint: "Verificato da Pi" },
    nav: { ecosystem: "Ecosistema", network: "Rete", explore: "Esplora", missions: "Missioni", mining: "Estrazione", spin: "Gira", ranking: "Classifica", transfer: "Trasferimenti", messages: "Messaggi", hall: "Hall of Fame", metaverse: "Metaverso", menu: "Menu" },
    login: { title: "Accesso Pi per lo sport.", desc: "Usa Pi per sbloccare ScoutMe.", mission_title: "Ciclo di missioni", mission_desc: "Missioni e mining.", lang_title: "11 lingue", lang_desc: "Preferenze salvate.", pi_title: "Pagamenti Pi", pi_desc: "Aumenta il tuo profilo.", button: "Continua con Pi" },
    dashboard: { active_streak: "Serie attiva", total_smtk: "Saldo SMTK", ai_potential: "Potenziale IA", videos: "Video", momentum: "Dinamica Settimanale", scout_progress: "Progresso Scout", actions: "Azioni rapide", loop_active: "Ciclo attivo", trending: "Talenti di tendenza", smart: "Raccomandazioni", plans: "Piani Pi", growth: "Crescita", referral_link: "Link di invito", copy_link: "Copia link" }
  },
  tr: {
    common: { subtitle: "Pi Tarayıcısı içinde Web3 scouting" },
    hero: { badge_pi: "Pi Ağı Ekosistemi", badge_web3: "Web3 Scouting", badge_rewards: "SMTK Ödülleri" },
    metrics: { sports: "Entegre Sporlar", sports_hint: "Futbol, Basketbol, vb.", regions: "Küresel Bölgeler", regions_hint: "RTL ve LTR desteği", trust: "Güven Endeksi", trust_hint: "Pi tarafından doğrulandı" },
    nav: { ecosystem: "Ekosistem", network: "Ağ", explore: "Keşfet", missions: "Görevler", mining: "Madencilik", spin: "Çevir", ranking: "Sıralama", transfer: "Transferler", messages: "Mesajlar", hall: "Şöhretler Salonu", metaverse: "Metaverse", menu: "Menü" },
    login: { title: "Spor keşfi için Pi girişi.", desc: "ScoutMe kilidini açmak için Pi kullanın.", mission_title: "Görev döngüsü", mission_desc: "Günlük görevler ve madencilik.", lang_title: "11 dil", lang_desc: "Kaydedilen tercihler.", pi_title: "Pi Ödemeleri", pi_desc: "Profilinizi güçlendirin.", button: "Pi Ağı ile Devam Et" },
    dashboard: { active_streak: "Aktif Seri", total_smtk: "SMTK Bakiyesi", ai_potential: "YZ Potansiyeli", videos: "Videolar", momentum: "Haftalık İvme", scout_progress: "Scout İlerlemesi", actions: "Hızlı işlemler", loop_active: "Döngü aktif", trending: "Popüler yetenekler", smart: "Akıllı öneriler", plans: "Pi ödeme planları", growth: "Viral büyüme", referral_link: "Tavsiye bağlantısı", copy_link: "Bağlantıyı kopyala" }
  },
  ja: {
    common: { subtitle: "Piブラウザ内のWeb3スカウト" },
    hero: { badge_pi: "Piネットワークエコシステム", badge_web3: "Web3スカウト", badge_rewards: "SMTK報酬" },
    metrics: { sports: "統合スポーツ", sports_hint: "サッカー、バスケなど", regions: "グローバル地域", regions_hint: "RTLおよびLTRサポート", trust: "信頼指数", trust_hint: "Piによる認証" },
    nav: { ecosystem: "エコシステム", network: "ネットワーク", explore: "探索", missions: "ミッション", mining: "マイニング", spin: "スピン", ranking: "ランキング", transfer: "移籍", messages: "メッセージ", hall: "殿堂", metaverse: "メタバース", menu: "メニュー" },
    login: { title: "スポーツ発見のためのPiログイン。", desc: "Piを使用してScoutMeのロックを解除します。", mission_title: "ミッションループ", mission_desc: "毎日のミッションとマイニング。", lang_title: "11の言語", lang_desc: "保存された設定。", pi_title: "Pi支払い", pi_desc: "プロフィールを強化する。", button: "Piネットワークで続行" },
    dashboard: { active_streak: "アクティブな連続", total_smtk: "SMTK残高", ai_potential: "AIポテンシャル", videos: "動画", momentum: "毎週の勢い", scout_progress: "スカウトの進捗", actions: "クイックアクション", loop_active: "ループがアクティブ", trending: "注目タレント", smart: "スマートな推奨", plans: "Pi支払いプラン", growth: "バイラル成長", referral_link: "紹介リンク", copy_link: "リンクをコピー" }
  }
};

fs.readdirSync(langDir).forEach(file => {
  if (file.endsWith('.json') && file !== 'en.json' && file !== 'ar.json') {
    const langKey = file.replace('.json', '');
    if (translations[langKey]) {
      const filePath = path.join(langDir, file);
      const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Merge values deeply
      const merge = (target, source) => {
        for (const key in source) {
          if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key]) target[key] = {};
            merge(target[key], source[key]);
          } else {
            target[key] = source[key];
          }
        }
      };

      merge(json, translations[langKey]);
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
console.log('All missing language keys injected into international files.');
