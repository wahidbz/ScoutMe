# ScoutMe — Global Web3 Sports Scouting Ecosystem

ScoutMe is a startup-grade talent discovery platform designed for the **Pi Network Browser**. It empowers athletes, clubs, and scouts with AI-driven intelligence, real-time rankings, and a secure SMTK token economy.

## 🌍 Key Features

- **Pi SDK Core**: Full authentication and payment flow (1 Pi Boost, 2 Pi Contacts, 3 Pi Hall).
- **Startup Loop**: Daily Missions → Scouting → Mining → Spin → Ranking.
- **Multilingual (11 Languages)**: Full RTL support (Arabic) and 10 other major global languages.
- **AI Scouting Engine**: Potential scoring, trending detection, and anti-farming watchdog.
- **Sports Metaverse**: A-Frame 3D museum to showcase top talent.
- **Real-time Engine**: Chat with typing indicators, presence, and instant transfer offers.

---

## 🛠️ Technical Setup

### 1. Firebase Configuration
Update `js/firebase.js` with your Firebase project credentials.
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
```

### 2. Pi Network SDK
Ensure the app is registered in the Pi Developer Portal.
- **Wallet Address**: `GC7KBK7553NTMDD4O6OJBUY2QOPSVW7SKXWOJITVMKPIVD6ZDSPMGWPH`
- **Sandbox Mode**: Toggle `isSandbox: true` in `js/firebase.js` for testing.

### 3. Netlify Functions (Payments)
Deploy the following functions to secure payments:
- `/netlify/functions/pi-approve`: Validates and approves Pi payments on the server side.
- `/netlify/functions/pi-complete`: Finalizes the transaction and updates Firestore balances.

---

## 📂 Project Structure

- `/public`: Core HTML entry points (Landing, Login, Dashboard, etc.)
- `/js`: Modular business logic (Auth, AI, Database, i18n, Mining, Missions, Spin)
- `/assets/lang`: 11 Localization JSON files (En, Ar, Fr, Es, Pt, De, It, Tr, Hi, Zh, Ja)
- `/css`: Premium Glassmorphism design system.
- `firestore.rules`: Production-grade security for user data and economy.

---

## 🚀 Deployment

1. **GitHub**: Push the code to a private or public repository.
2. **Netlify**: Connect the repository to Netlify for continuous deployment.
3. **Pi Browser**: Add your URL to the Pi Developer Portal to enable Pi Network features.

---
*Created by Antigravity for the ScoutMe Ecosystem.*
