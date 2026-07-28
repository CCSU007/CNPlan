"""
Flight Monitor — Configuration
All user-adjustable settings in one place.
"""

from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

# ─── Currency ─────────────────────────────────────────────
CURRENCY = "NZD"
CURRENCY_SYMBOL = "NZ$"

# ─── Routes ───────────────────────────────────────────────
# (origin, dest, label, start_date, end_date)
# Each route has its own date window
ROUTES = [
    ("AKL", "HKG", "Auckland → Hong Kong",   "2026-12-04", "2026-12-08"),
    ("AKL", "PVG", "Auckland → Shanghai",    "2026-12-04", "2026-12-08"),
    ("HKG", "AKL", "Hong Kong → Auckland",   "2027-01-05", "2027-01-15"),
    ("PVG", "AKL", "Shanghai → Auckland",    "2027-01-05", "2027-01-15"),
]

# ─── Price Alert Thresholds (NZD) ────────────────────────
# You'll get an email when a price drops BELOW these numbers.
# Tune these after seeing real data.
PRICE_ALERT_THRESHOLDS = {
    ("AKL", "HKG"): 1000,   # Alert if AKL→HKG < NZ$1,000
    ("AKL", "PVG"): 1100,   # Alert if AKL→PVG < NZ$1,100
    ("HKG", "AKL"): 1000,   # Alert if HKG→AKL < NZ$1,000
    ("PVG", "AKL"): 1100,   # Alert if PVG→AKL < NZ$1,100
}

# ─── Flight Preferences (for 性价比最高 scoring) ──────────
AVOID_AIRLINES = [
    "spring airlines", "spring", "airasia", "jetstar",
    "scoot", "ryanair",
]  # Budget carriers — case-insensitive partial match

MAX_STOPS = 1              # Prefer direct or 1-stop max
PREFER_NIGHT_DEPARTURE = True  # Departure after 18:00 gets a score bonus

# ─── Source Toggles ───────────────────────────────────────
# Set False to disable a source
SOURCES = {
    "tripcom": True,
    "airnz": True,
    "cathay": True,
    "ctrip": False,  # Ctrip is stretch — enable when needed
}

# ─── Scraping Settings ────────────────────────────────────
REQUEST_DELAY_MIN = 2.0    # Seconds between requests
REQUEST_DELAY_MAX = 5.0
REQUEST_TIMEOUT = 30       # HTTP timeout

# ─── Email Settings (loaded from .env) ────────────────────
SMTP_SENDER = os.getenv("SMTP_SENDER", "")
SMTP_APP_PASSWORD = os.getenv("SMTP_APP_PASSWORD", "")
ALERT_RECIPIENT = os.getenv("ALERT_RECIPIENT", "")

# ─── File Paths ───────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "prices.csv")
ALERT_LOG_PATH = os.path.join(BASE_DIR, "alerts.log")


def validate_config() -> list[str]:
    """Run basic sanity checks. Returns list of warnings (empty = all good)."""
    warnings: list[str] = []
    if not SMTP_SENDER or not SMTP_APP_PASSWORD or not ALERT_RECIPIENT:
        warnings.append(
            "Email not configured. Set SMTP_SENDER, SMTP_APP_PASSWORD, "
            "and ALERT_RECIPIENT in .env to enable alerts."
        )
    for route in ROUTES:
        key = (route[0], route[1])
        if key not in PRICE_ALERT_THRESHOLDS:
            warnings.append(f"No alert threshold set for {route[0]}→{route[1]}")
    return warnings
