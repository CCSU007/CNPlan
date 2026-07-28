"""
serve_prices.py — Lightweight HTTP server for flight prices.
Reads the latest scraped prices from flight_ticket/prices.csv and serves them as JSON.
Run: python serve_prices.py
Then open the China Explorer page — prices will load automatically.
"""

import csv
import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

# Resolve paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "flight_ticket", "prices.csv")
PORT = int(os.environ.get("PRICES_PORT", 8765))


def load_latest_prices() -> list[dict]:
    """Load and deduplicate prices from CSV, returning the latest per route."""
    if not os.path.isfile(CSV_PATH):
        return []

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Deduplicate: keep latest per (source, origin, dest, depart_date)
    latest: dict[str, dict] = {}
    for row in rows:
        key = "|".join([
            row.get("source", ""),
            row.get("origin", ""),
            row.get("dest", ""),
            row.get("depart_date", ""),
        ])
        if key not in latest or row.get("timestamp", "") > latest[key].get("timestamp", ""):
            latest[key] = row

    # Sort by timestamp descending, limit to 50
    result = sorted(latest.values(), key=lambda r: r.get("timestamp", ""), reverse=True)
    return result[:50]


class PriceHandler(BaseHTTPRequestHandler):
    """Simple HTTP handler serving prices as JSON."""

    def do_GET(self):
        if self.path == "/api/prices":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()

            prices = load_latest_prices()
            self.wfile.write(json.dumps(prices, indent=2).encode("utf-8"))

        elif self.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "csv_exists": os.path.isfile(CSV_PATH)}).encode("utf-8"))

        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not found. Try /api/prices"}).encode("utf-8"))

    def log_message(self, format, *args):
        """Add timestamp to log messages."""
        sys.stderr.write(f"[{datetime.now():%H:%M:%S}] {args[0]} {args[1]} {args[2]}\n")


def main():
    server = HTTPServer(("0.0.0.0", PORT), PriceHandler)
    print(f"\n{'=' * 50}")
    print(f"  📡 Flight Price Server")
    print(f"  Port: {PORT}")
    print(f"  CSV:  {CSV_PATH}")
    print(f"  URL:  http://localhost:{PORT}/api/prices")
    print(f"{'=' * 50}")
    print(f"  Press Ctrl+C to stop.\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
