"""
Flight Monitor — CSV Database Layer
Simple append-only CSV storage for flight price history.
"""

import csv
import os
from datetime import datetime
from typing import Optional
from config import CSV_PATH

CSV_HEADERS = [
    "timestamp",        # When the scrape ran
    "source",           # Which website (tripcom, airnz, cathay, ctrip)
    "origin",           # IATA code (AKL, HKG, PVG)
    "dest",             # IATA code
    "depart_date",      # Flight departure date (YYYY-MM-DD)
    "airline",          # Airline name
    "flight_number",    # Optional: flight number
    "price_nzd",        # Price in NZD (float)
    "stops",            # Number of stops (0, 1, 2)
    "duration_min",     # Total travel time in minutes
    "depart_time",      # Departure time (HH:MM)
    "arrive_time",      # Arrival time (HH:MM)
    "label",            # Cheapest / 性价比最高 / Standard
    "url",              # Booking URL
]


def save_flights(flights: list[dict]) -> int:
    """
    Append scraped flights to prices.csv.
    Returns number of rows written.
    """
    file_exists = os.path.isfile(CSV_PATH)
    rows_written = 0

    with open(CSV_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_HEADERS, extrasaction="ignore")
        if not file_exists:
            writer.writeheader()

        for flight in flights:
            row = {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "source": flight.get("source", "unknown"),
                "origin": flight.get("origin", ""),
                "dest": flight.get("dest", ""),
                "depart_date": flight.get("depart_date", ""),
                "airline": flight.get("airline", ""),
                "flight_number": flight.get("flight_number", ""),
                "price_nzd": flight.get("price_nzd", 0),
                "stops": flight.get("stops", 0),
                "duration_min": flight.get("duration_min", 0),
                "depart_time": flight.get("depart_time", ""),
                "arrive_time": flight.get("arrive_time", ""),
                "label": flight.get("label", ""),
                "url": flight.get("url", ""),
            }
            writer.writerow(row)
            rows_written += 1

    return rows_written


def load_all_flights() -> list[dict]:
    """Load all historical flight data from CSV."""
    if not os.path.isfile(CSV_PATH):
        return []

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def get_latest_prices() -> list[dict]:
    """
    Get the most recent scrape result for each (source, origin, dest, depart_date).
    """
    all_flights = load_all_flights()
    latest: dict[str, dict] = {}

    for flight in all_flights:
        key = (
            flight.get("source", ""),
            flight.get("origin", ""),
            flight.get("dest", ""),
            flight.get("depart_date", ""),
        )
        key_str = "|".join(key)
        if key_str not in latest or flight["timestamp"] > latest[key_str]["timestamp"]:
            latest[key_str] = flight

    return list(latest.values())


def get_price_history(origin: str, dest: str, source: Optional[str] = None) -> list[dict]:
    """
    Get price history for a specific route, optionally filtered by source.
    """
    all_flights = load_all_flights()
    filtered = []

    for flight in all_flights:
        if flight.get("origin") == origin and flight.get("dest") == dest:
            if source is None or flight.get("source") == source:
                filtered.append(flight)

    return filtered
