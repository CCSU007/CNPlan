"""
Flight Monitor — Email Alert Module
Sends Gmail SMTP alerts when prices drop below configured thresholds.
"""

import smtplib
import os
from datetime import datetime
from email.message import EmailMessage
from typing import Optional

from config import (
    SMTP_SENDER,
    SMTP_APP_PASSWORD,
    ALERT_RECIPIENT,
    PRICE_ALERT_THRESHOLDS,
    CURRENCY_SYMBOL,
    ALERT_LOG_PATH,
)


def _log_alert(flight: dict):
    """Append alert to log file to avoid duplicate alerts."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = (
        f"[{timestamp}] {flight.get('origin','?')}→{flight.get('dest','?')} | "
        f"{flight.get('airline','?')} | {CURRENCY_SYMBOL}{flight.get('price_nzd','?')} | "
        f"source={flight.get('source','?')} | date={flight.get('depart_date','?')}\n"
    )
    with open(ALERT_LOG_PATH, "a", encoding="utf-8") as f:
        f.write(line)


def _already_alerted(flight: dict) -> bool:
    """Check if this exact deal was already alerted."""
    if not os.path.isfile(ALERT_LOG_PATH):
        return False

    key = (
        f"{flight.get('origin','?')}→{flight.get('dest','?')}"
        f"{flight.get('airline','?')}"
        f"{flight.get('price_nzd','?')}"
        f"{flight.get('depart_date','?')}"
    )
    with open(ALERT_LOG_PATH, "r", encoding="utf-8") as f:
        for line in f:
            if key in line:
                return True
    return False


def send_alert(flight: dict) -> bool:
    """
    Send an email alert for a good deal.
    Returns True if sent, False otherwise.
    """
    if _already_alerted(flight):
        return False

    if not all([SMTP_SENDER, SMTP_APP_PASSWORD, ALERT_RECIPIENT]):
        print("  ⚠ Email not configured — skipping alert")
        return False

    origin = flight.get("origin", "?")
    dest = flight.get("dest", "?")
    airline = flight.get("airline", "?")
    price = flight.get("price_nzd", "?")
    stops = flight.get("stops", "?")
    depart_date = flight.get("depart_date", "?")
    depart_time = flight.get("depart_time", "?")
    arrive_time = flight.get("arrive_time", "?")
    source = flight.get("source", "?")
    url = flight.get("url", "")
    label = flight.get("label", "")

    subject = f"✈️ DEAL: {origin}→{dest} {CURRENCY_SYMBOL}{price} ({airline})"

    body = f"""
🚀 Flight Deal Alert!

Route:     {origin} → {dest}
Date:      {depart_date}
Airline:   {airline}
Price:     {CURRENCY_SYMBOL}{price}
Stops:     {stops}
Time:      {depart_time} - {arrive_time}
Source:    {source}
Label:     {label}

🔗 Book here: {url}

---
Flight Monitor · scraped at {datetime.now().strftime('%Y-%m-%d %H:%M')}
"""

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = SMTP_SENDER
        msg["To"] = ALERT_RECIPIENT
        msg.set_content(body)

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=30) as server:
            server.login(SMTP_SENDER, SMTP_APP_PASSWORD)
            server.send_message(msg)

        _log_alert(flight)
        print(f"  📧 Alert sent: {origin}→{dest} {CURRENCY_SYMBOL}{price}")
        return True

    except Exception as e:
        print(f"  ❌ Email failed: {e}")
        return False


def check_and_alert(flights: list[dict]) -> int:
    """
    Check all flights against price thresholds and send alerts.
    Returns number of alerts sent.
    """
    alerts_sent = 0

    for flight in flights:
        try:
            price = float(flight.get("price_nzd", 0))
        except (ValueError, TypeError):
            continue

        if price <= 0:
            continue

        key = (flight.get("origin", ""), flight.get("dest", ""))
        threshold = PRICE_ALERT_THRESHOLDS.get(key)

        if threshold and price <= threshold:
            if send_alert(flight):
                alerts_sent += 1

    return alerts_sent
