# Habit Quest ✅⭐

A gamified habit tracker for iOS and Android, built with Expo + React Native + TypeScript.
Check off daily habits, earn XP, level up, and chat with an AI coach that knows your real progress.

## Features

- **Daily dashboard** – a big completion ring, mini bars for habits / XP / streak / level progress, and a to-do / done list for the selected day.
- **Week strip with rings** – seven pill-shaped day buttons whose outline fills as you complete that day's habits. Tap a day to view or fix it (future days are locked); swipe weeks with the ‹ › arrows.
- **Add / edit / remove habits** – pick an icon and an XP reward (5–30) per habit.
- **XP & levels** – every completion earns XP; finishing *all* habits gives a +20 XP perfect-day bonus.
  Levels get progressively harder (L2 = 100 XP, L3 = 300, L4 = 600, …) with titles from *Rookie* to *Mythic*.
- **Streaks** – current and best streak, plus perfect-day count.
- **Progress screen** – 4-week heat map and a per-habit weekly grid with 30-day completion rates.
- **AI coach (✨)** – chat with "Quest", powered by the Anthropic API. Tap ✨ on any habit for three tiny steps to
  start it right now. The coach sees today's habits, your level and streak.
- **Saved every day** – all data is written to on-device storage on each change and keyed by date, so history
  carries over from day to day. The app rolls over to the new day automatically at midnight / when reopened.
- **Backup** – export your data as JSON from Settings and restore it on any device.

<p align="center"><img src="docs/dashboard.png" width="300" alt="Habit Quest dashboard"></p>

## Put it online (GitHub Pages) and install it on your iPhone

The repo ships with a workflow (`.github/workflows/deploy.yml`) that builds the web app and publishes it.

1. Create a new GitHub repo and push this project to the `main` branch.
2. In the repo go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. The **Deploy to GitHub Pages** action runs on every push. When it finishes your site is live at
   `https://<your-username>.github.io/<repo-name>/`.
4. On your iPhone open that link in **Safari**, tap **Share → Add to Home Screen**. You get a full-screen app
   with the Habit Quest icon (`public/apple-touch-icon.png`) that also opens offline.

Your habits and history are stored in that browser's local storage, so they stay on the device you use. Use
**More → Settings → Export backup** to move them. (Home-screen apps keep their own storage on iOS, so if you
started in Safari tabs, export there and restore inside the home-screen app.)

Build the site locally with `EXPO_BASE_URL=/<repo-name> npm run build:web`, then `npm run serve:web`.
Leave `EXPO_BASE_URL` unset if you host it at a domain root.

## Run it (phone / dev)

```bash
npm install
npx expo start
```

Then scan the QR code with the **Expo Go** app (iOS / Android), or press `a` / `i` for an emulator.

## AI setup

Open **More → Settings** in the app and paste an [Anthropic API key](https://console.anthropic.com/). On phones it
is stored in the device keystore (`expo-secure-store`); on the website it is kept in that browser's local storage.
It is never committed to the repo. The default model is
`claude-haiku-5-5` (fast and cheap); change it in Settings.

> The key is used directly from your device/browser, which is fine for personal use on your own site. Do not
> share a public deployment with your key entered. If you publish the app widely,
> route requests through your own small backend instead so no user needs (or can extract) a key.

## Project layout

```
App.tsx                 header, week strip, tab bar, habit modal, toasts
src/
  types.ts              data model
  xp.ts                 levels, streaks, XP math
  storage.ts            AsyncStorage + SecureStore persistence
  useHabitStore.ts      state, daily rollover, toggle logic
  ai.ts                 Anthropic Messages API client + coach prompt
  screens/              Dashboard, Habits, Coach, More (Progress + Settings)
  components/           Ring/PillRing (react-native-svg), WeekStrip, LevelCard, HabitModal, Toast
public/                 PWA files: iPhone home-screen icon, manifest
scripts/postbuild-web.js adds iOS meta tags + offline service worker to the web build
scripts/make_icons.py   regenerates the app icon (npm run icons; needs Pillow)
```

## Build a real app

```bash
npx eas-cli@latest build --platform android   # or ios
```

Change `com.example.habitquest` in `app.json` to your own bundle id first.

## Scripts

- `npm run typecheck` – TypeScript check (also runs in GitHub Actions)
- `npm run build:web` – static website into `dist/`
- `npm run serve:web` – preview `dist/` locally

## License

MIT
