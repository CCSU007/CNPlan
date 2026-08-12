# 🚀 Deploy China Explorer (make it public)

The site is a plain HTML/CSS/JS app, so it runs on any static host. The only
piece that could need a backend is the price data — and it now ships a bundled
**static snapshot** (`prices.json`) in addition to the live Python API. So
prices display **everywhere**, even with no server at all.

---

## Option A — Static hosting (easiest, free, no server)
Works on **GitHub Pages**, **Vercel**, **Netlify**, **Cloudflare Pages**, etc.

- Prices load from the bundled `prices.json` (you'll see a small
  "static snapshot" tag next to "Last updated").
- To update prices: run `python flight_ticket/refresh_prices.py`, then redeploy.
- The **Refresh** button re-reads the bundled data on static hosts (it can't
  run Python). Everything else — weather, maps, photos, Todo, Collections —
  works 100%.

### GitHub Pages
1. Create a repo, e.g. `china-explorer`.
2. Push the contents of `china_travel/` (the whole folder) into the repo:
   ```powershell
   cd china_travel
   git init
   git add .
   git commit -m "deploy china explorer"
   git branch -M main
   git remote add origin https://github.com/YOURNAME/china-explorer.git
   git push -u origin main
   ```
3. On GitHub: repo → **Settings → Pages** → Source = **Deploy from a branch** →
   `main` / root → Save.
4. Your site: `https://YOURNAME.github.io/china-explorer/`

### Vercel / Netlify
- Import the repo (or drag the `china_travel` folder into the dashboard).
- Framework preset: **Other / Static** · Build command: *(none)* · Output: root.
- You get a public `https://….vercel.app` / `https://….netlify.app` URL.

---

## Option B — With live price refresh (Python host)
If you want the **Refresh** button to re-run the price generator for visitors,
host it somewhere that runs Python: **Railway**, **Render**, **PythonAnywhere**,
or your own VPS.

- Start command: `python serve_prices.py`  (port 8765, or set `PRICES_PORT`)
- `serve_prices.py` serves the whole site **and** `/api/prices` + `/api/refresh`.
- The page auto-detects this backend and switches to live refresh (no "static
  snapshot" tag, and Refresh really regenerates prices).

---

## Option C — Quick temporary share (ngrok)
Already set up: double-click `publish.bat` → you get a public ngrok URL.
Good for a quick demo; the free-plan URL changes each restart.

---

## Before deploying
- Run `python flight_ticket/refresh_prices.py` so `prices.json` is current.
- The PWA service worker (`sw.js`) activates over **https** only — fine on all
  hosts above.
- All assets use relative paths, so the site works from any subpath/folder.
