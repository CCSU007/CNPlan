# ✈️ Flight Monitor — User Guide

Automatically search NZ$←→China flight prices from multiple sources. No daily manual checking required.

---

## Quick Start

### 1. Install

```bash
cd china_travel/flight_ticket
pip install -r requirements.txt
playwright install chromium
```

### 2. Configure

Open **`config.py`** — all settings are in one place:

| What to set | Where | Example |
|---|---|---|
| Routes & dates | `ROUTES` list | `("AKL", "HKG", ...)` |
| Alert thresholds | `PRICE_ALERT_THRESHOLDS` | `("AKL","HKG"): 1000` means alert if under NZ$1,000 |
| Airlines to avoid | `AVOID_AIRLINES` | Add budget carriers you don't want |
| Sources to use | `SOURCES` dict | Set `False` to disable a source |

Open **`.env`** and fill in your Gmail credentials (needed for email alerts):

```
SMTP_SENDER=your.email@gmail.com
SMTP_APP_PASSWORD=your-16-char-app-password
ALERT_RECIPIENT=who@gets-alerts.com
```

> **To get a Gmail App Password:** Google Account → Security → 2-Step Verification → App Passwords. Generate one for "Mail".

### 3. Run

**Option A** — Double-click `run.bat`

**Option B** — In terminal:

```bash
python main.py
```

---

## What Happens When You Run

1. A headless browser opens and visits Trip.com, Air NZ, and Cathay Pacific
2. For each route & date in your config, it scrapes available flights
3. Results are saved to **`prices.csv`** (append-only history)
4. A summary table is printed to the console
5. If any price is below your threshold, an email alert is sent

---

## Routes Configured

| Direction | Dates | Days scanned |
|---|---|---|
| Auckland → Hong Kong | Dec 4–8, 2026 | 5 |
| Auckland → Shanghai | Dec 4–8, 2026 | 5 |
| Hong Kong → Auckland | Jan 5–15, 2027 | 11 |
| Shanghai → Auckland | Jan 5–15, 2027 | 11 |

To change these, edit the `ROUTES` list and `PRICE_ALERT_THRESHOLDS` in `config.py`.

---

## How the Classifier Works

Each flight gets a **value score** based on:

| Factor | What's better |
|---|---|
| **Price** | Lower price = higher score |
| **Stops** | Direct flights score highest |
| **Airline** | Budget carriers (Jetstar, AirAsia, etc.) are penalized |
| **Departure time** | Night flights (after 6 PM) get a bonus |

The tool labels the top results as:

- **💰 Cheapest** — lowest price
- **⭐ 性价比最高** — best value for money

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| `No flights found` | Website selectors out of date | Run with `tripcom` only, check the HTML, update selectors in `scraper.py` |
| `Email not configured` warning | `.env` missing or incomplete | Fill in `SMTP_SENDER`, `SMTP_APP_PASSWORD`, `ALERT_RECIPIENT` |
| Alert email not sent | Price above threshold | Lower the number in `PRICE_ALERT_THRESHOLDS` |
| Browser won't launch | Playwright not installed | Run `playwright install chromium` |
| Script runs too long | Too many dates × sources | Narrow date range or disable slow sources in `SOURCES` |

---

## File Reference

| File | What it does |
|---|---|
| `config.py` | All settings — modify this to customize |
| `main.py` | Entry point — run this |
| `scraper.py` | Scrapes flight websites via Playwright |
| `analyzer.py` | Classifies cheapest / best-value flights |
| `database.py` | Reads & writes `prices.csv` |
| `alert.py` | Sends email alerts |
| `.env` | Gmail credentials (keep private!) |
| `prices.csv` | Auto-generated price history |
| `alerts.log` | Auto-generated log of sent alerts |
| `run.bat` | One-click launcher (loop mode) |

---

## Running 24/7 — No Task Scheduler Needed

The tool has a built-in **loop mode** — it runs itself every 4 hours automatically. No Windows Task Scheduler, no passwords required.

### Option A: Double-click `run.bat`

A terminal window opens, the scraper runs, then it sleeps for 4 hours and runs again. **Just leave the window open.** Close it when you want to stop.

### Option B: Run from terminal

```bash
python main.py --loop --interval 4
```

Change `--interval 4` to any number of hours you prefer.

### Keeping your PC awake

Since the terminal needs to stay open, make sure your PC doesn't go to sleep:

- **Settings → System → Power & sleep** → Set to **Never**
- Or just keep the lid open if on a laptop

To run automatically every 4 hours:

1. Open **Task Scheduler**
2. Create Basic Task → Name: `Flight Monitor`
3. Trigger: **Daily, repeat every 4 hours**
4. Action: Start a program → Browse → select `run.bat`
5. Check "Run whether user is logged on or not"
6. Keep your PC powered on (disable sleep mode)
