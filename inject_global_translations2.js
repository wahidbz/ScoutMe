const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, 'assets', 'lang');

const translations = {
  fr: { ecosystem: { title: "Écosystème", mission: "Mission Quotidienne", mission_desc: "Terminez des tâches.", mining: "Minage 24h", mining_desc: "Générez des SMTK.", leaderboard: "Classement", leaderboard_desc: "Montez en grade." }, features: { ranking: "Classement IA", ranking_desc: "Suivi avancé.", synergy: "Synergie", synergy_desc: "Messages d'équipe.", museum: "Musée", museum_desc: "Salle A-Frame." } },
  es: { ecosystem: { title: "Ecosistema", mission: "Misión Diaria", mission_desc: "Completa tareas.", mining: "Minería 24h", mining_desc: "Genera SMTK.", leaderboard: "Clasificación", leaderboard_desc: "Sube de rango." }, features: { ranking: "Ranking Inteligente", ranking_desc: "Seguimiento avanzado.", synergy: "Sinergia", synergy_desc: "Mensajes directos.", museum: "Museo", museum_desc: "Salón A-Frame." } },
  hi: { ecosystem: { title: "पारिस्थितिकी तंत्र", mission: "दैनिक मिशन", mission_desc: "कार्य पूरे करें।", mining: "24 घंटे माइनिंग", mining_desc: "SMTK जेनरेट करें।", leaderboard: "लीडरबोर्ड", leaderboard_desc: "रैंक बढ़ाएं।" }, features: { ranking: "उन्नत रैंकिंग", ranking_desc: "एआई स्मार्ट स्कोरिंग।", synergy: "रीयल-टाइम तालमेल", synergy_desc: "डायरेक्ट মেসেজিং।", museum: "टैलेंट का संग्रहालय", museum_desc: "ए-फ्रेम मेटावर्स।" } },
  zh: { ecosystem: { title: "生态系统", mission: "每日任务", mission_desc: "完成任务。", mining: "24小时挖矿", mining_desc: "生成SMTK。", leaderboard: "排行榜", leaderboard_desc: "提升排名。" }, features: { ranking: "高级排名", ranking_desc: "人工智能评分。", synergy: "实时协同", synergy_desc: "直接发短信。", museum: "人才博物馆", museum_desc: "A-Frame展厅。" } },
  pt: { ecosystem: { title: "Ecossistema", mission: "Missão Diária", mission_desc: "Completar tarefas.", mining: "Mineração 24h", mining_desc: "Gere SMTK.", leaderboard: "Classificação", leaderboard_desc: "Suba na classificação." }, features: { ranking: "Classificação IA", ranking_desc: "Acompanhamento avançado.", synergy: "Sinergia", synergy_desc: "Mensagens diretas.", museum: "Museu", museum_desc: "Salão A-Frame." } },
  de: { ecosystem: { title: "Ökosystem", mission: "Tägliche Mission", mission_desc: "Aufgaben erfüllen.", mining: "24h Bergbau", mining_desc: "SMTK generieren.", leaderboard: "Bestenliste", leaderboard_desc: "Steigen Sie auf." }, features: { ranking: "KI-Ranking", ranking_desc: "Erweitertes Tracking.", synergy: "Synergie", synergy_desc: "Direktnachrichten.", museum: "Museum", museum_desc: "A-Frame-Halle." } },
  it: { ecosystem: { title: "Ecosistema", mission: "Missione", mission_desc: "Completa compiti.", mining: "Estrazione 24h", mining_desc: "Genera SMTK.", leaderboard: "Classifica", leaderboard_desc: "Sali di grado." }, features: { ranking: "Ranking IA", ranking_desc: "Tracciamento avanzato.", synergy: "Sinergia", synergy_desc: "Messaggi diretti.", museum: "Museo", museum_desc: "Sala A-Frame." } },
  tr: { ecosystem: { title: "Ekosistem", mission: "Günlük Görev", mission_desc: "Görevleri tamamla.", mining: "24 Saat Madencilik", mining_desc: "SMTK üretin.", leaderboard: "Liderler", leaderboard_desc: "Sıralamada yükselin." }, features: { ranking: "Yapay Zeka", ranking_desc: "Gelişmiş izleme.", synergy: "Sinerji", synergy_desc: "Direkt mesajlaşma.", museum: "Müze", museum_desc: "A-Frame salonu." } },
  ja: { ecosystem: { title: "エコシステム", mission: "毎日のミッション", mission_desc: "タスクを完了する。", mining: "24時間マイニング", mining_desc: "SMTKを生成します。", leaderboard: "リーダーボード", leaderboard_desc: "ランクを上げる。" }, features: { ranking: "高度なランキング", ranking_desc: "AIによるスコアリング。", synergy: "リアルタイムの相乗効果", synergy_desc: "ダイレクトメッセージ。", museum: "才能の博物館", museum_desc: "A-Frameホール。" } }
};

fs.readdirSync(langDir).forEach(file => {
  if (file.endsWith('.json') && file !== 'en.json' && file !== 'ar.json') {
    const langKey = file.replace('.json', '');
    if (translations[langKey]) {
      const filePath = path.join(langDir, file);
      const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
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
      console.log(`Updated ecosystem/features for ${file}`);
    }
  }
});
