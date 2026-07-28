# 🌐 Publish China Explorer

Quick way to share your China Travel site publicly via ngrok.

---

## One-Click Shortcut

Double-click **`publish.bat`** in this folder — it runs both commands automatically:

```batch
@echo off
cd /d "%~dp0"
start "Python Server" cmd /c "python -m http.server 8080 & pause"
timeout /t 3 /nobreak >nul
ngrok http http://localhost:8080
```

Then copy the ngrok URL (looks like `https://xxxx.ngrok-free.dev`) and share it.

---

## Manual Steps

### 1. Start a local server
```powershell
python -m http.server 8080
```
Serves everything in the `china_travel` folder at `http://localhost:8080`.

### 2. Expose via ngrok
Open a **new** terminal and run:
```powershell
ngrok http http://localhost:8080
```
ngrok will give you a public URL like:
```
https://opium-pleading-crevice.ngrok-free.dev/
```

### 3. Open in browser
Navigate to:
```
https://YOUR-URL.ngrok-free.dev/html/index.html
```

---

## Notes

- Both terminals must stay open while sharing.
- The ngrok URL changes each time you restart it (unless you have a paid plan).
- The free plan shows a ngrok interstitial page — visitors just click **"Visit Site"**.
- Only static files work (HTML/CSS/JS). The price server (`serve_prices.py`) is not included — prices use embedded fallback data instead.
