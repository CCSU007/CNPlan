"""
Flight Monitor — Price Classifier
Labels flights as "💰 Cheapest" or "⭐ 性价比最高" (best value).
"""

from datetime import datetime
from typing import Optional
from config import AVOID_AIRLINES, MAX_STOPS, PREFER_NIGHT_DEPARTURE


def _is_budget_airline(airline: str) -> bool:
    """Check if an airline name matches the budget/avoid list."""
    airline_lower = airline.lower()
    for bad in AVOID_AIRLINES:
        if bad in airline_lower:
            return True
    return False


def _is_night_flight(depart_time: str) -> bool:
    """Check if departure time is after 18:00."""
    try:
        hour = int(depart_time.split(":")[0])
        return hour >= 18
    except (ValueError, IndexError):
        return False


def _calculate_value_score(flight: dict) -> float:
    """
    Calculate a value-for-money score.
    Higher = better value. Factors:
    - Price (lower is better)
    - Stops (fewer is better)
    - Budget airline penalty
    - Night departure bonus
    """
    price = float(flight.get("price_nzd", 999999))
    stops = int(flight.get("stops", 99))
    airline = flight.get("airline", "")
    depart_time = flight.get("depart_time", "")
    duration = int(flight.get("duration_min", 0))

    if price <= 0:
        return 0

    # Base score: inverse of price (normalized)
    base_score = 10000.0 / price

    # Stop penalty
    if stops == 0:
        stop_factor = 1.4  # Direct flight bonus
    elif stops == 1:
        stop_factor = 1.0
    elif stops >= 3:
        stop_factor = 0.5  # Too many stops
    else:
        stop_factor = 0.7

    # Budget airline penalty
    airline_factor = 0.7 if _is_budget_airline(airline) else 1.0

    # Night departure bonus
    night_bonus = 1.15 if (PREFER_NIGHT_DEPARTURE and _is_night_flight(depart_time)) else 1.0

    # Duration factor (shorter is better, relative)
    if duration > 0:
        # Penalize very long flights (> 24h)
        duration_factor = 1.0 if duration < 1440 else 0.85
    else:
        duration_factor = 1.0

    return base_score * stop_factor * airline_factor * night_bonus * duration_factor


def classify_flights(flights: list[dict]) -> list[dict]:
    """
    Classify and sort flights by value.
    Returns flights sorted by value score (best first), with labels added.
    """
    if not flights:
        return []

    # Calculate value scores
    for flight in flights:
        flight["value_score"] = _calculate_value_score(flight)
        flight["label"] = "Standard"

    # Sort by value score descending
    flights.sort(key=lambda f: f.get("value_score", 0), reverse=True)

    # Label top 3 as "💰 Cheapest" (by price)
    by_price = sorted(flights, key=lambda f: float(f.get("price_nzd", 999999)))
    cheapest_keys = set()
    for f in by_price[:3]:
        key = (f.get("source", ""), f.get("origin", ""), f.get("dest", ""),
               f.get("depart_date", ""), f.get("airline", ""))
        cheapest_keys.add(key)

    # Label top 3 as "⭐ 性价比最高" (by value score)
    value_count = 0
    for flight in flights:
        key = (flight.get("source", ""), flight.get("origin", ""),
               flight.get("dest", ""), flight.get("depart_date", ""),
               flight.get("airline", ""))

        if key in cheapest_keys:
            flight["label"] = "💰 Cheapest"
        elif value_count < 3:
            flight["label"] = "⭐ 性价比最高"
            value_count += 1

    # Clean up internal scoring field
    for flight in flights:
        flight.pop("value_score", None)

    return flights
