"""
Flight Monitor — Multi-Source Scraper
Scrapes flight prices using real Chrome profile (bypasses bot detection).

Sources:
  - tripcom: Trip.com (primary — fills search form, extracts results)
  - airnz:   Air New Zealand (placeholder)
  - cathay:  Cathay Pacific (placeholder)
  - ctrip:   Ctrip / fliggy (placeholder)

All source functions return the same dict format:
  {
    "source": str,
    "origin": str,
    "dest": str,
    "depart_date": str (YYYY-MM-DD),
    "airline": str,
    "flight_number": str,
    "price_nzd": float,
    "stops": int,
    "duration_min": int,
    "depart_time": str (HH:MM),
    "arrive_time": str (HH:MM),
    "url": str,
  }
"""

import re
import json
import time
import random
from datetime import datetime
from typing import Optional, Callable

from playwright.sync_api import sync_playwright, Page

from config import SOURCES


# ─── Constants ────────────────────────────────────────────
REAL_CHROME_PATH = r"C:\Users\chenc\AppData\Local\Google\Chrome\User Data\Default"


# ─── Helper Functions ─────────────────────────────────────
def _parse_price(text: str) -> Optional[float]:
    if not text:
        return None
    cleaned = re.sub(r'[^0-9.]', '', text.replace(',', ''))
    try:
        return float(cleaned)
    except ValueError:
        return None


def _parse_duration(text: str) -> Optional[int]:
    if not text:
        return None
    text = text.lower().strip()
    hours = 0
    minutes = 0
    h_match = re.search(r'(\d+)\s*(h|hr|hrs|hour|hours)', text)
    m_match = re.search(r'(\d+)\s*(m|min|mins|minute|minutes)', text)
    if h_match:
        hours = int(h_match.group(1))
    if m_match:
        minutes = int(m_match.group(1))
    return hours * 60 + minutes if (hours or minutes) else None


def _extract_stops(text: str) -> int:
    text = text.lower()
    if any(kw in text for kw in ["non-stop", "nonstop", "direct", "straight"]):
        return 0
    m = re.search(r'(\d+)\s*(stop|transfer)', text)
    if m:
        return int(m.group(1))
    return 0


def _random_delay(min_s: float = 1.0, max_s: float = 3.0):
    time.sleep(random.uniform(min_s, max_s))


# ═══════════════════════════════════════════════════════════
# BROWSER MANAGEMENT — real Chrome profile (non-headless)
# ═══════════════════════════════════════════════════════════
def create_browser():
    """Launch real Chrome with your profile. A window appears but works silently."""
    p = sync_playwright().start()
    context = p.chromium.launch_persistent_context(
        user_data_dir=REAL_CHROME_PATH,
        headless=False,
        locale="en-NZ",
        timezone_id="Pacific/Auckland",
        args=["--no-sandbox"],
    )
    page = context.pages[0] if context.pages else context.new_page()
    return p, context, page


def create_page(context):
    return context.pages[0] if context.pages else context.new_page()


def close_browser(p, context):
    try:
        context.close()
    except Exception:
        pass
    try:
        p.stop()
    except Exception:
        pass


# ═══════════════════════════════════════════════════════════
# SOURCE 1: Trip.com — direct URL search
# ═══════════════════════════════════════════════════════════
def search_tripcom(page: Page, origin: str, dest: str, date: str) -> list[dict]:
    """
    Scrape Trip.com using direct search URL.
    Uses real Chrome profile to bypass bot detection.
    URL format: https://www.trip.com/flights/{origin}-to-{dest}/?depart={date}
    """
    url = f"https://www.trip.com/flights/{origin.lower()}-to-{dest.lower()}/?depart={date}"
    print(f"  [Trip.com] Searching {origin}->{dest} on {date} ...")
    flights: list[dict] = []

    try:
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(5000)

        # Wait for dynamic content to load (check multiple times)
        for attempt in range(3):
            body = page.inner_text("body")
            has_content = len(body) > 500 and ("flight" in body.lower() or "price" in body.lower() or "$" in body)
            if has_content:
                break
            page.wait_for_timeout(5000)

        body = page.inner_text("body")

        # Try to find flight cards
        cards = []
        for sel in [
            "[class*='flight-card']", "[class*='FlightItem']",
            "[class*='flight-item']", "[class*='searchResult']",
            "[class*='list-item']", "[data-testid*='flight']",
        ]:
            cards = page.query_selector_all(sel)
            if cards and len(cards) > 1:
                break

        # Fallback: regex price extraction from page text
        if not cards or len(cards) <= 1:
            prices = re.findall(r'(?:NZ\$|HK\$|\$|¥)\s*[0-9,]+\.?\d*', body)
            if prices:
                print(f"     Found {len(prices)} prices via regex")
                for p_text in prices[:25]:
                    val = _parse_price(p_text)
                    if val and 50 < val < 10000:
                        flights.append({
                            "source": "tripcom",
                            "origin": origin, "dest": dest, "depart_date": date,
                            "airline": "Unknown", "flight_number": "",
                            "price_nzd": val, "stops": 0, "duration_min": 0,
                            "depart_time": "", "arrive_time": "",
                            "url": page.url,
                        })
            else:
                # Try intercepting API responses
                print(f"     No visible prices — attempting API interception...")
                api_data = _intercept_tripcom_api(page, origin, dest, date)
                flights.extend(api_data)
                if not api_data:
                    print(f"     No flight data could be extracted")
            return flights

        # Parse flight cards
        for card in cards:
            try:
                text = card.inner_text()
                price = None
                for pattern in [r'(?:NZ\$|HK\$|\$|¥)\s*[0-9,]+\.?\d*', r'\b[1-9][0-9]{2,4}\b']:
                    m = re.search(pattern, text)
                    if m:
                        price = _parse_price(m.group())
                        if price and 50 < price < 10000:
                            break
                        price = None
                if not price:
                    continue

                airline = "Unknown"
                for sel in ["[class*='airline' i]", "[class*='company' i]", "[class*='name' i]"]:
                    el = card.query_selector(sel)
                    if el:
                        airline = el.inner_text().strip()
                        break

                stops = _extract_stops(text)
                times = re.findall(r'\d{1,2}:\d{2}', text)
                dep_t = times[0] if len(times) > 0 else ""
                arr_t = times[1] if len(times) > 1 else ""
                duration = _parse_duration(text)

                link_el = card.query_selector("a[href]")
                card_url = page.url
                if link_el:
                    href = link_el.get_attribute("href") or ""
                    card_url = f"https://www.trip.com{href}" if href.startswith("/") else href

                flights.append({
                    "source": "tripcom",
                    "origin": origin, "dest": dest, "depart_date": date,
                    "airline": airline, "flight_number": "",
                    "price_nzd": price, "stops": stops,
                    "duration_min": duration or 0,
                    "depart_time": dep_t, "arrive_time": arr_t,
                    "url": card_url,
                })
            except Exception:
                continue

    except Exception as e:
        print(f"  [Trip.com] Error: {e}")

    print(f"  [Trip.com] Found {len(flights)} flights")
    return flights


def _intercept_tripcom_api(page: Page, origin: str, dest: str, date: str) -> list[dict]:
    """Try to intercept Trip.com's flight search API calls."""
    import json as _json
    flights = []

    # Check for JSON data embedded in the page
    patterns = [
        r'window\.__INITIAL_STATE__\s*=\s*({.*?});',
        r'<script id="__NEXT_DATA__"[^>]*>({.*?})</script>',
        r'window\.__PRELOADED_STATE__\s*=\s*({.*?});',
    ]

    html = page.content()
    for pat in patterns:
        match = re.search(pat, html, re.DOTALL)
        if match:
            try:
                data = _json.loads(match.group(1))
                # Search for prices recursively
                def find_prices(obj, depth=0):
                    results = []
                    if depth > 8:
                        return results
                    if isinstance(obj, dict):
                        for k, v in obj.items():
                            if isinstance(v, (int, float)) and 50 < v < 10000:
                                results.append(v)
                            results.extend(find_prices(v, depth + 1))
                    elif isinstance(obj, list) and depth < 4:
                        for item in obj[:50]:
                            results.extend(find_prices(item, depth + 1))
                    return results

                prices_found = find_prices(data)
                seen = set()
                for p in prices_found:
                    p_int = int(p)
                    if p_int not in seen and 50 < p_int < 10000:
                        seen.add(p_int)
                        flights.append({
                            "source": "tripcom",
                            "origin": origin, "dest": dest, "depart_date": date,
                            "airline": "Unknown", "flight_number": "",
                            "price_nzd": float(p_int), "stops": 0, "duration_min": 0,
                            "depart_time": "", "arrive_time": "",
                            "url": page.url,
                        })
                if flights:
                    print(f"     Found {len(flights)} prices via JSON data")
            except Exception:
                continue

    return flights


# ═══════════════════════════════════════════════════════════
# SOURCE 2-4: Placeholders
# ═══════════════════════════════════════════════════════════
def search_airnz(page, origin, dest, date):
    print(f"  [Air NZ] Not yet implemented")
    return []


def search_cathay(page, origin, dest, date):
    print(f"  [Cathay] Not yet implemented")
    return []


def search_ctrip(page, origin, dest, date):
    print(f"  [Ctrip] Not yet implemented")
    return []


# ═══════════════════════════════════════════════════════════
# SOURCE DISPATCHER
# ═══════════════════════════════════════════════════════════
SOURCE_REGISTRY: dict[str, Callable] = {
    "tripcom": search_tripcom,
    "airnz": search_airnz,
    "cathay": search_cathay,
    "ctrip": search_ctrip,
}


def search_all_sources_for_route(page: Page, origin: str, dest: str, date: str) -> list[dict]:
    results: list[dict] = []
    for name, enabled in SOURCES.items():
        if not enabled:
            continue
        fn = SOURCE_REGISTRY.get(name)
        if fn:
            try:
                results.extend(fn(page, origin, dest, date))
            except Exception as e:
                print(f"  [ERROR] {name}: {e}")
    return results
