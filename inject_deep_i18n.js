const fs = require('fs');
const path = require('path');

function replaceInFile(relativePath, replacements) {
  const filePath = path.join(__dirname, relativePath);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  replacements.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${relativePath}`);
  }
}

// 1. Missions
replaceInFile('js/missions.js', [
  { search: `<h3 class="panel-title">✅ Daily mission loop</h3>`, replace: `<h3 class="panel-title" data-i18n="missions.title">✅ Daily mission loop</h3>` },
  { search: `<strong>\${mission.icon} \${mission.title}</strong>`, replace: `<strong>\${mission.icon} <span data-i18n="\${mission.id}">\${mission.title}</span></strong>` },
  { search: `<div class="small text-muted mt-1">\${mission.description}</div>`, replace: `<div class="small text-muted mt-1" data-i18n="\${mission.id}_desc">\${mission.description}</div>` },
  { search: `Reward: \${mission.reward}`, replace: `<span data-i18n="missions.reward">Reward:</span> \${mission.reward}` },
  { search: `\${completed.includes(mission.id) ? 'Done' : 'Complete'}`, replace: `<span data-i18n="\${completed.includes(mission.id) ? 'missions.done' : 'missions.complete'}">\${completed.includes(mission.id) ? 'Done' : 'Complete'}</span>` },
  { search: `<h3 class="panel-title">🔥 Dopamine feedback loop</h3>`, replace: `<h3 class="panel-title" data-i18n="missions.feedback">🔥 Dopamine feedback loop</h3>` },
  { search: `});\n\n    return { mount };`, replace: `});\n\n    if (window.I18n) I18n.translateDOM(root);\n  }` }
]);

// 2. Ranking
replaceInFile('js/ranking.js', [
  { search: `<h3 class="panel-title">🏆 Global Leaderboard</h3>`, replace: `<h3 class="panel-title" data-i18n="ranking.title">🏆 Global Leaderboard</h3>` },
  { search: `<div class="label">Total players</div>`, replace: `<div class="label" data-i18n="ranking.total_players">Total players</div>` },
  { search: `<div class="label">Top trend</div>`, replace: `<div class="label" data-i18n="ranking.top_trend">Top trend</div>` },
  { search: `<div class="label">Top score</div>`, replace: `<div class="label" data-i18n="ranking.top_score">Top score</div>` },
  { search: `<span>Player</span>`, replace: `<span data-i18n="ranking.player">Player</span>` },
  { search: `<span>Score</span>`, replace: `<span data-i18n="ranking.score">Score</span>` },
  { search: `location.reload();\n      }\n    });`, replace: `location.reload();\n      }\n    });\n    if (window.I18n) I18n.translateDOM(root);` }
]);

// 3. Transfer
replaceInFile('js/transfer.js', [
  { search: `<h3 class="panel-title">💰 Transfer Market</h3>`, replace: `<h3 class="panel-title" data-i18n="transfer.title">💰 Transfer Market</h3>` },
  { search: `<span>Value</span>`, replace: `<span data-i18n="transfer.value">Value</span>` },
  { search: `<span>Action</span>`, replace: `<span data-i18n="transfer.action">Action</span>` },
  { search: `<button class="btn btn-primary btn-sm"`, replace: `<button class="btn btn-primary btn-sm" data-i18n="transfer.bid"` },
  { search: `<button class="btn btn-success btn-sm" disabled`, replace: `<button class="btn btn-success btn-sm" disabled data-i18n="transfer.signed"` },
  { search: `return { mount };\n})();`, replace: `if (window.I18n) I18n.translateDOM(root);\n  }\n  return { mount };\n})();` }
]);

// 4. Chat
replaceInFile('js/chat.js', [
  { search: `<h3 class="panel-title">💬 Direct Messages</h3>`, replace: `<h3 class="panel-title" data-i18n="chat.title">💬 Direct Messages</h3>` },
  { search: `placeholder="Type a message..."`, replace: `placeholder="Type a message..." data-i18n-placeholder="chat.placeholder"` },
  { search: `>Send</button>`, replace: ` data-i18n="chat.send">Send</button>` },
  { search: `>No previous messages. Start a conversation!</`, replace: ` data-i18n="chat.empty">No previous messages. Start a conversation!</` },
  { search: `window.scrollTo(0, document.body.scrollHeight);\n  }`, replace: `window.scrollTo(0, document.body.scrollHeight);\n    if (window.I18n) I18n.translateDOM(root);\n  }` }
]);

// 5. Profile
replaceInFile('js/profile.js', [
  { search: `<h3 class="panel-title">👤 Player Profile</h3>`, replace: `<h3 class="panel-title" data-i18n="profile.title">👤 Player Profile</h3>` },
  { search: `>Linked Wallet<`, replace: ` data-i18n="profile.wallet">Linked Wallet<` },
  { search: `>Sport<`, replace: ` data-i18n="profile.sport">Sport<` },
  { search: `>Position / Speciality<`, replace: ` data-i18n="profile.position">Position<` },
  { search: `>Country<`, replace: ` data-i18n="profile.country">Country<` },
  { search: `>Highlight URL<`, replace: ` data-i18n="profile.highlights">Highlight URL<` },
  { search: `>Bio<`, replace: ` data-i18n="profile.bio">Bio<` },
  { search: `>Update profile</button>`, replace: ` data-i18n="profile.edit">Update profile</button>` },
  { search: `} finally { Utils.hideLoader(); }\n    });`, replace: `} finally { Utils.hideLoader(); }\n    });\n    if (window.I18n) I18n.translateDOM(root);` }
]);

console.log("Deep pages UI injected with data-i18n");
