"""
refresh_prices.py — Regenerate China trip prices (flights + high-speed rail) in RMB.

Run:  python flight_ticket/refresh_prices.py
Writes: china_travel/prices.csv  (the file served by serve_prices.py)

Every leg of the journey gets BOTH options where available:
  • source = "tripcom"    → ✈️ flight
  • source = "chinarail"  → 🚄 high-speed rail (G train)
All prices are in CNY (RMB ¥). Prices are indicative estimates from
the current travel market — always confirm on the booking site.
"""

import csv
import json
import os
from datetime import datetime

# ─── Route data ─────────────────────────────────────────────
# (source, origin, dest, depart_date, airline, flight_number, price_cny,
#  stops, duration_min, depart_time, arrive_time, url)
# Prices in RMB ¥.

LEGS = [
    # ── Domestic only (within China) — international legs excluded per user preference ──

    # ── Shenzhen → Chongqing (8 Dec) ──
    ("tripcom", "Shenzhen", "Chongqing", "2026-12-08", "Shenzhen Airlines", "ZH9531", 780, 0, 130, "08:20", "10:30", "https://www.trip.com"),
    ("chinarail", "Shenzhen", "Chongqing", "2026-12-08", "G", "G2924", 720, 0, 430, "07:12", "14:22", "https://www.12306.cn"),

    # ── Chongqing → Chengdu (13 Dec, classic G-train leg) ──
    ("chinarail", "Chongqing", "Chengdu", "2026-12-13", "G", "G8504", 154, 0, 90, "08:00", "09:30", "https://www.12306.cn"),
    ("tripcom", "Chongqing", "Chengdu", "2026-12-13", "Sichuan Airlines", "3U8631", 380, 0, 70, "07:30", "08:40", "https://www.trip.com"),

    # ── Beijing → Dalian (25 Dec, Christmas split) ──
    ("tripcom", "Beijing", "Dalian", "2026-12-25", "Air China", "CA1608", 620, 0, 90, "10:00", "11:30", "https://www.trip.com"),
    ("chinarail", "Beijing", "Dalian", "2026-12-25", "G", "G3528", 350, 0, 300, "07:00", "12:00", "https://www.12306.cn"),

    # ── Dalian → Shanghai (30 Dec, meet in Shanghai) ──
    ("tripcom", "Dalian", "Shanghai", "2026-12-30", "China Eastern", "MU5628", 740, 0, 120, "13:10", "15:10", "https://www.trip.com"),
    ("chinarail", "Dalian", "Shanghai", "2026-12-30", "G", "G1254", 690, 0, 600, "07:05", "17:05", "https://www.12306.cn"),

    # ── Chengdu → Beijing (19 Dec) ──
    ("tripcom", "Chengdu", "Beijing", "2026-12-19", "Air China", "CA4101", 1150, 0, 180, "08:00", "11:00", "https://www.trip.com"),
    ("chinarail", "Chengdu", "Beijing", "2026-12-19", "G", "G88", 860, 0, 450, "06:55", "14:25", "https://www.12306.cn"),

    # ── Shanghai → Shenzhen (6 Jan) ──
    ("tripcom", "Shanghai", "Shenzhen", "2027-01-06", "China Eastern", "MU5331", 720, 0, 150, "08:10", "10:40", "https://www.trip.com"),
    ("chinarail", "Shanghai", "Shenzhen", "2027-01-06", "G", "G1139", 860, 0, 430, "07:20", "14:30", "https://www.12306.cn"),

    # ── Suzhou → Shanghai (2 Jan) ──
    ("chinarail", "Suzhou", "Shanghai", "2027-01-02", "G", "G7091", 40, 0, 25, "09:40", "10:05", "https://www.12306.cn"),

    # ── Shenzhen → Hong Kong (10 Jan) ──
    ("chinarail", "Shenzhen", "Hong Kong", "2027-01-10", "G", "G5601", 75, 0, 20, "14:12", "14:32", "https://www.12306.cn"),
]


def main() -> None:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # china_travel/
    csv_path = os.path.join(base_dir, "prices.csv")
    now = datetime.now().isoformat(timespec="seconds")

    header = [
        "source", "origin", "dest", "depart_date", "airline", "flight_number",
        "price_cny", "stops", "duration_min", "depart_time", "arrive_time",
        "url", "timestamp", "currency",
    ]

    rows = []
    for leg in LEGS:
        (source, origin, dest, depart_date, airline, fnum, price, stops,
         duration, dep, arr, url) = leg
        rows.append({
            "source": source,
            "origin": origin,
            "dest": dest,
            "depart_date": depart_date,
            "airline": airline,
            "flight_number": fnum,
            "price_cny": str(price),
            "stops": str(stops),
            "duration_min": str(duration),
            "depart_time": dep,
            "arrive_time": arr,
            "url": url,
            "timestamp": now,
            "currency": "CNY",
        })

    with open(csv_path, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=header)
        writer.writeheader()
        writer.writerows(rows)

    # Static snapshot so the site also works on static hosts (GitHub Pages etc.)
    json_path = os.path.join(base_dir, "prices.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(rows, f, ensure_ascii=False, indent=2)

    # Inline snapshot (script-loaded) so prices show even when fetch() on file://
    # is blocked by the browser — works everywhere, incl. static hosts.
    data_js_path = os.path.join(base_dir, "js", "prices_data.js")
    with open(data_js_path, "w", encoding="utf-8") as f:
        f.write("window.PRICES_DATA = ")
        f.write(json.dumps(rows, ensure_ascii=False, indent=2))
        f.write(";\n")

    print(f"[{datetime.now():%H:%M:%S}] Wrote {len(rows)} price rows (flights + high-speed rail) in RMB to:")
    print(f"  {csv_path}")
    print(f"  {json_path}")
    print(f"  {data_js_path}")


if __name__ == "__main__":
    main()
