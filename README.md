# EHS Activity Tracker

Offline-capable EHS activity, legal, certificate, competence, permit and contractor tracker.

**Live app:** https://hanumanthgodase342-spec.github.io/ehs-tracker/

## Install on your phone (no app store needed)

### Android (Chrome)
1. Open the live app link above in **Chrome**.
2. Tap the menu (⋮) at the top right.
3. Tap **Install app** (or **Add to Home screen**).
4. Open **EHS Tracker** from your home screen.

### iPhone / iPad (Safari)
1. Open the live app link above in **Safari**.
2. Tap the **Share** button (square with arrow).
3. Tap **Add to Home Screen**, then **Add**.

### Computer (Chrome or Edge)
1. Open the live app link above.
2. Click the install icon at the right end of the address bar, or menu → **Install EHS Tracker**.

The app needs an internet connection to save and sync data. Previously opened pages and the app shell also open offline.

## For maintainers

- The app is a static site (`index.html`, `app.js`, `sw.js`, `manifest.json`) served by GitHub Pages.
- Data is stored in Supabase; the publishable key in `app.js` is safe to be public. Never put a `service_role` key in this repo.
- After changing `app.js` or `index.html`, bump `CACHE` in `sw.js` so phones pick up the new version.
- Keep the `theme_color` in `manifest.json` and the `theme-color` meta tag in `index.html` the same.
