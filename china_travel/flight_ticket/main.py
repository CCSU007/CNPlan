"""
Flight Monitor — Orchestrator
Entry point. Manages browser lifecycle, runs scrapers, saves data, classifies, alerts.
"""

import sys
import os
import time
import argparse
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import (
    ROUTES,
    CURRENCY_SYMBOL,
    SOURCES,
    validate_config,
)
from database import save_flights
from scraper import (
    create_browser,
    create_page,
    close_browser,
    search_all_sources_for_route,
)
from analyzer import classify_flights
from alert import check_and_alert


def date_range(start: str, end: str):
    """Yield all dates from start to end (inclusive)."""
    start_dt = datetime.strptime(start, "%Y-%m-%d")
    end_dt = datetime.strptime(end, "%Y-%m-%d")
    for i in range((end_dt - start_dt).days + 1):
        yield (start_dt + timedelta(days=i)).strftime("%Y-%m-%d")


def print_summary(flights: list[dict]):
    """Print a formatted summary of flight results."""
    if not flights:
        print("\n  No flights found in this run.")
        return

    classified = classify_flights(flights)

    print(f"\n  {'─' * 85}")
    print(f"  {'Source':<10} {'Origin':<6} {'Dest':<6} {'Airline':<20} {'Price':>8} {'Stops':<6} {'Label':<20}")
    print(f"  {'─' * 85}")

    for f in classified:
        source = f.get("source", "?")[:8]
        origin = f.get("origin", "?")
        dest = f.get("dest", "?")
        airline = (f.get("airline", "?") or "?")[:18]
        price = f"{CURRENCY_SYMBOL}{float(f.get('price_nzd', 0)):.0f}"
        stops = f.get("stops", "?")
        label = f.get("label", "")
        print(f"  {source:<10} {origin:<6} {dest:<6} {airline:<20} {price:>8} {stops:<6} {label:<20}")

    print(f"  {'─' * 85}")
    print(f"  Total: {len(classified)} flights\n")


def run():
    """Main execution flow."""
    start_time = datetime.now()
    print(f"\n{'=' * 65}")
    print(f"  ✈️ Flight Monitor — {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'=' * 65}")

    # Validate config
    warnings = validate_config()
    for w in warnings:
        print(f"  ⚠ {w}")

    # Enabled sources summary
    enabled = [name for name, e in SOURCES.items() if e]
    print(f"  Sources: {', '.join(enabled)}")
    print(f"  Routes:")
    for o, d, label, sd, ed in ROUTES:
        print(f"    {o}→{d}  {sd} → {ed}")
    print()

    # ─── Initialize browser (once, shared across all sources) ───
    print("  🔄 Launching Chrome (a window will appear — this is normal)...")
    p, context, page = create_browser()
    print("  ✅ Chrome ready\n")

    total_saved = 0
    all_flights: list[dict] = []

    try:
        for origin, dest, label, start_date, end_date in ROUTES:
            print(f"  ── {label} ({start_date} → {end_date}) ──")
            for date in date_range(start_date, end_date):
                flights = search_all_sources_for_route(page, origin, dest, date)
                all_flights.extend(flights)

                if flights:
                    saved = save_flights(flights)
                    total_saved += saved

                if len(all_flights) % 30 == 0 and all_flights:
                    print(f"  ... {len(all_flights)} total results so far")

            print()

        # Classify and print summary
        print(f"{'=' * 65}")
        print(f"  📊 Summary")
        print(f"{'=' * 65}")
        print_summary(all_flights)

        # Send alerts for good deals
        print(f"{'=' * 65}")
        print(f"  📧 Checking alerts...")
        alerts_sent = check_and_alert(all_flights)
        print(f"  Alerts sent: {alerts_sent}")

    finally:
        # ─── Always clean up the browser ───
        close_browser(p, context)

    # Done
    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"\n{'=' * 65}")
    print(f"  ✅ Done — {total_saved} rows saved to prices.csv")
    print(f"  ⏱  Elapsed: {elapsed:.1f}s")
    print(f"{'=' * 65}\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Flight Monitor — NZ ↔ China")
    parser.add_argument("--loop", action="store_true",
                        help="Run continuously every N hours (no Task Scheduler needed)")
    parser.add_argument("--interval", type=float, default=4.0,
                        help="Hours between runs in loop mode (default: 4)")
    args = parser.parse_args()

    if args.loop:
        print(f"\n{'=' * 65}")
        print(f"  🔁 Loop Mode — runs every {args.interval} hour(s)")
        print(f"  Press Ctrl+C to stop")
        print(f"{'=' * 65}")
        while True:
            run()
            next_run = datetime.now() + timedelta(hours=args.interval)
            print(f"\n  💤 Sleeping until {next_run.strftime('%H:%M:%S')} ...")
            print(f"{'=' * 65}\n")
            time.sleep(args.interval * 3600)
    else:
        run()
