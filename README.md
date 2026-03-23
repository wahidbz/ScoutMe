# ScoutMe

ScoutMe is a Pi Browser-ready Web3 scouting platform for multi-sport discovery, realtime ranking, club transfers, direct messaging, Pi payments, multilingual UI, and a 3D metaverse hall.

## Features
- Pi Browser authentication with username + payments scopes
- Firebase Authentication, Firestore, offline persistence, and security rules
- Eleven-language i18n with Arabic RTL support
- Multi-sport onboarding and sport-specific position logic
- Realtime leaderboard and transfer market
- Direct chat with typing indicators, seen states, and online presence
- Pi payment flow for profile boosts, contact unlocks, and Hall of Fame entries
- A-Frame metaverse museum

## Project structure
- Root HTML pages (`index.html`, `login.html`, `dashboard.html`, etc.)
- `css/style.css` global design system
- `js/` modular frontend logic
- `assets/images/logo.png` shared brand asset
- `assets/lang/*.json` translation files
- `firebase/` rules, indexes, and hosting config

## Firebase setup
1. Create a Firebase project.
2. Enable **Authentication > Anonymous**.
3. Create a Firestore database in production mode.
4. Open `js/firebase.js` and replace the `REPLACE_WITH_...` values with your real web app config.
5. Deploy rules and indexes:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only firestore:indexes
   ```

## Firestore collections
- `users`
- `talents`
- `transfers`
- `messages`
- `hall_of_fame`
- `notifications`
- `payments`
- `typing`

## Pi Browser setup
1. Open the app inside Pi Browser.
2. Make sure the Pi SDK is available in the browser environment.
3. The app calls `Pi.authenticate(['username','payments'])` on login.
4. The payment flow stores payment state in Firestore and simulates the requested approval lifecycle before completion.

## Netlify hosting
1. Upload the project root to a Git repository.
2. Create a new Netlify site from that repository.
3. Set the publish directory to the project root.
4. Optional: add a small snippet before loading `js/app.js` to inject `window.SCOUTME_FIREBASE_CONFIG` if you prefer not to hardcode the values in `js/firebase.js`.

## GitHub Pages deployment
1. Push the full project to a GitHub repository.
2. In **Settings → Pages**, deploy from the `main` branch and root folder.
3. Because all asset and navigation paths are relative, the app works on both custom domains and `https://username.github.io/repository-name/`.
4. Before publishing, replace the Firebase config values in `js/firebase.js` with your real Firebase web app config.
5. If you use Pi Browser with a custom domain, point GitHub Pages or a reverse proxy to that domain and make sure the Pi SDK is available.

## Firebase Hosting
1. Install the Firebase CLI.
2. From the project root run:
   ```bash
   firebase deploy --only hosting
   ```
3. The included `firebase/firebase.json` serves the root site directly.

## Language system
- Translation files live under `assets/lang/`.
- Add new keys to `en.json` first, then mirror them in the other language files.
- Selected language is stored in both `localStorage` and the user document in Firestore.

## Production notes
- For hardened Pi payment verification, replace the simulated approval stage with a secure backend endpoint or Cloud Function.
- For scale, move the client-side filtering logic to indexed Firestore queries or server-driven APIs.
- If you want secure user identity mapping from Pi auth to Firebase auth, add a backend token exchange that mints Firebase custom tokens.
