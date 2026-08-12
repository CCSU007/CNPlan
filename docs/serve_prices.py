"""
serve_prices.py — Lightweight HTTP server for flight prices.
Reads the latest prices from prices.csv and serves them as JSON.
Run: python serve_prices.py
Then open the China Explorer page — prices will load automatically.
"""

import csv
import json
import os
import subprocess
import sys
import mimetypes
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

# Resolve paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_PATH = os.path.join(BASE_DIR, "prices.csv")
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PRICES_PORT", 8765))


def load_latest_prices() -> list[dict]:
    """Load and deduplicate prices from CSV, returning the latest per route."""
    if not os.path.isfile(CSV_PATH):
        return []

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Prices are in CNY (RMB) — pass them through as-is
    for row in rows:
        row["currency"] = row.get("currency", "CNY")
        if not row.get("price_cny"):
            row["price_cny"] = row.get("price_nzd", "0")

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


def run_refresh() -> bool:
    """Regenerate prices by running flight_ticket/refresh_prices.py."""
    script = os.path.join(BASE_DIR, "flight_ticket", "refresh_prices.py")
    try:
        subprocess.run(
            [sys.executable, script],
            capture_output=True,
            timeout=120,
            cwd=BASE_DIR,
        )
        return True
    except Exception:
        return False


class PriceHandler(BaseHTTPRequestHandler):
    """Simple HTTP handler serving prices as JSON."""

    def _set_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")

    def do_OPTIONS(self):
        self.send_response(204)
        self._set_cors()
        self.end_headers()

    def _serve_static(self, path):
        """Serve static files from the china_travel directory."""
        # Strip query strings and normalize
        clean_path = path.split("?")[0]
        if clean_path == "/" or clean_path == "":
            clean_path = "/index.html"

        # Map URL paths to filesystem paths
        if clean_path.startswith("/html/") or clean_path == "/index.html":
            file_path = os.path.join(BASE_DIR, clean_path.lstrip("/"))
        elif clean_path.startswith("/css/") or clean_path.startswith("/js/"):
            file_path = os.path.join(BASE_DIR, clean_path.lstrip("/"))
        else:
            file_path = os.path.join(BASE_DIR, clean_path.lstrip("/"))

        # Redirect /prices to the prices page
        if clean_path == "/prices":
            file_path = os.path.join(BASE_DIR, "html", "prices.html")

        if not os.path.isfile(file_path):
            self.send_response(404)
            self._set_cors()
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"Not found")
            return

        # Guess content type
        content_type, _ = mimetypes.guess_type(file_path)
        if content_type is None:
            content_type = "application/octet-stream"

        self.send_response(200)
        self._set_cors()
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        with open(file_path, "rb") as f:
            self.wfile.write(f.read())

    def _run_refresh(self):
        """Regenerate prices by running flight_ticket/refresh_prices.py."""
        run_refresh()

    def do_GET(self):
        if self.path == "/api/prices":
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()

            prices = load_latest_prices()
            self.wfile.write(json.dumps(prices, indent=2).encode("utf-8"))

        elif self.path == "/api/refresh":
            # Regenerate prices with the flight_ticket script, then serve them
            self._run_refresh()
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache")
            self.end_headers()

            prices = load_latest_prices()
            self.wfile.write(json.dumps(prices, indent=2).encode("utf-8"))

        elif self.path == "/api/health":
            self.send_response(200)
            self._set_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "csv_exists": os.path.isfile(CSV_PATH)}).encode("utf-8"))

        else:
            self._serve_static(self.path)

    def log_message(self, format, *args):
        """Add timestamp to log messages."""
        sys.stderr.write(f"[{datetime.now():%H:%M:%S}] {args[0]} {args[1]} {args[2]}\n")


def main():
    print(f"\n{'=' * 50}")
    print(f"  📡 China Explorer · Price + Site Server")
    print(f"  CSV:  {CSV_PATH}")
    print(f"{'=' * 50}")

    # Regenerate prices on start so the page is fresh without extra steps
    print("  Generating fresh prices (flight_ticket/refresh_prices.py)…")
    if run_refresh():
        print("  ✔ Prices updated.")
    else:
        print("  ⚠ Could not regenerate prices — will retry on Refresh.")

    # Bind to PORT, or the next free port if it's taken
    server = None
    port = PORT
    for _ in range(5):
        try:
            server = HTTPServer(("0.0.0.0", port), PriceHandler)
            break
        except OSError:
            port += 1
    if server is None:
        print(f"  ✖ Could not bind any port from {PORT} to {PORT + 4} — "
              "close the old server (Ctrl+C in its window) and retry.")
        return

    # Open the site in the default browser automatically
    try:
        webbrowser.open(f"http://localhost:{port}/")
    except Exception:
        pass

    print(f"  ✔ Server running at http://localhost:{port}/  (Ctrl+C to stop)\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
