# 🌐 Publish China Explorer

Quick way to share your China Travel site publicly via ngrok.

---

## One-Click Shortcut

Double-click **`publish.bat`** in this folder — it runs both commands automatically:

- Starts **`serve_prices.py`** on port **8080** (serves the whole site **and** the
  price API — prices and the **Refresh** button work on the public URL too).
- Opens an **ngrok** tunnel to `http://localhost:8080`.

Then copy the ngrok "Forwarding" URL (looks like `https://xxxx.ngrok-free.dev`)
and share it. The home page loads at the root of that URL.

---

## Manual Steps

### 1. Start the price + site server
```powershell
python serve_prices.py 8080
```
Serves the whole `china_travel` site plus `/api/prices` and `/api/refresh` at
`http://localhost:8080`.

### 2. Expose via ngrok
Open a **new** terminal and run:
```powershell
ngrok http http://localhost:8080
```
ngrok gives you a public URL like:
```
https://opium-pleading-crevice.ngrok-free.dev/
```

### 3. Open in browser
Open the ngrok URL (root = home page). Prices load automatically, and the
**Refresh** button re-runs `flight_ticket/refresh_prices.py` for you.

---

## Local only (no publishing)

Double-click **`start.bat`** — it starts the same server on port **8765**,
regenerates prices, and opens your browser automatically. Clicking **Refresh**
on the Prices page re-runs the Python generator without you typing anything.

## Notes

- Keep the terminal / bat window open while sharing; closing it stops the server.
- The ngrok URL changes each restart (unless you have a paid plan).
- The free plan shows an ngrok interstitial page — visitors just click **"Visit Site"**.
