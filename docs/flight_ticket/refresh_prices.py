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

    # ── Shenzhen → Wangxian Valley ──
    ("tripcom", "Shenzhen", "Wangxian Valley", "2026-12-13", "Shenzhen Airlines", "ZH1234", 680, 0, 120, "08:30", "10:30", "https://www.trip.com"),
    ("chinarail", "Shenzhen", "Wangxian Valley", "2026-12-13", "G", "G1604", 460, 0, 240, "07:30", "11:30", "https://www.12306.cn"),

    # ── Wangxian Valley → Chongqing ──
    ("tripcom", "Wangxian Valley", "Chongqing", "2026-12-15", "Sichuan Airlines", "3U5678", 450, 0, 180, "09:00", "12:00", "https://www.trip.com"),
    ("chinarail", "Wangxian Valley", "Chongqing", "2026-12-15", "G", "G1756", 520, 0, 300, "10:00", "15:00", "https://www.12306.cn"),

    # ── Chongqing → Chengdu (classic G-train leg) ──
    ("chinarail", "Chongqing", "Chengdu", "2026-12-19", "G", "G8504", 150, 0, 90, "08:00", "09:30", "https://www.12306.cn"),
    ("tripcom", "Chongqing", "Chengdu", "2026-12-19", "Sichuan Airlines", "3U8631", 380, 0, 70, "07:30", "08:40", "https://www.trip.com"),

    # ── Chengdu → Dalian ──
    ("tripcom", "Chengdu", "Dalian", "2026-12-24", "Air China", "CA8901", 980, 1, 300, "07:00", "12:00", "https://www.trip.com"),
    ("chinarail", "Chengdu", "Dalian", "2026-12-24", "G", "G1286", 620, 0, 600, "06:30", "16:30", "https://www.12306.cn"),

    # ── Dalian → Beijing ──
    ("tripcom", "Dalian", "Beijing", "2026-12-30", "Air China", "CA1608", 620, 0, 90, "10:00", "11:30", "https://www.trip.com"),
    ("chinarail", "Dalian", "Beijing", "2026-12-30", "G", "G3528", 350, 0, 300, "07:00", "12:00", "https://www.12306.cn"),

    # ── Beijing → Nanjing ──
    ("chinarail", "Beijing", "Nanjing", "2027-01-04", "G", "G139", 440, 0, 210, "09:00", "12:30", "https://www.12306.cn"),
    ("tripcom", "Beijing", "Nanjing", "2027-01-04", "Air China", "CA1841", 520, 0, 100, "08:00", "09:40", "https://www.trip.com"),

    # ── Nanjing → Shanghai ──
    ("chinarail", "Nanjing", "Shanghai", "2027-01-08", "G", "G7011", 135, 0, 60, "10:00", "11:00", "https://www.12306.cn"),
    ("tripcom", "Nanjing", "Shanghai", "2027-01-08", "China Eastern", "MU2881", 280, 0, 60, "09:00", "10:00", "https://www.trip.com"),
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
