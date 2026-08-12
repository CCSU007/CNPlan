/**
 * weather.js — Live weather via Open-Meteo (no API key).
 * TREK-inspired enhancement: replaces static weather cards with a real
 * 4-day forecast for every city, using the city coordinates from data.js.
 * Falls back to the original static text if the network is unavailable.
 */

// WMO weather-code → emoji + label (https://open-meteo.com/en/docs)
const WMO = {
  0: ['☀️', 'Clear'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'],
  3: ['☁️', 'Overcast'], 45: ['🌫️', 'Fog'], 48: ['🌫️', 'Rime fog'],
  51: ['🌦️', 'Light drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌧️', 'Dense drizzle'],
  56: ['🌧️', 'Freezing drizzle'], 57: ['🌧️', 'Freezing drizzle'],
  61: ['🌧️', 'Light rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'],
  66: ['🌧️', 'Freezing rain'], 67: ['🌧️', 'Freezing rain'],
  71: ['🌨️', 'Light snow'], 73: ['🌨️', 'Snow'], 75: ['🌨️', 'Heavy snow'],
  77: ['🌨️', 'Snow grains'],
  80: ['🌦️', 'Light showers'], 81: ['🌧️', 'Showers'], 82: ['🌧️', 'Heavy showers'],
  85: ['🌨️', 'Snow showers'], 86: ['🌨️', 'Snow showers'],
  95: ['⛈️', 'Thunderstorm'], 96: ['⛈️', 'Storm + hail'], 99: ['⛈️', 'Storm + hail'],
};

function wmoInfo(code) {
  const hit = WMO[code] || WMO[code >= 95 ? 95 : 3];
  return { emoji: hit[0], label: hit[1] };
}

function wmoDayShort(code) {
  return (WMO[code] || ['❔', '?'])[0];
}

async function fetchForecast(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
    '&longitude=' + lon +
    '&daily=temperature_2m_max,temperature_2m_min,weather_code,uv_index_max,precipitation_sum' +
    '&timezone=auto&forecast_days=4';
  const resp = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!resp.ok) throw new Error('weather fetch failed');
  return resp.json();
}

function cityLookup() {
  const map = {};
  const cities = (typeof TRIP !== 'undefined' && TRIP.cities) || [];
  cities.forEach(c => {
    const nm = c.name.split('·')[0].trim();
    map[nm] = c.coords;
  });
  return map;
}

// ── Unit (°C / °F) + cache — borrowed from TREK's weather widget ──
function weatherUnit() {
  return localStorage.getItem('weather_unit') === 'f' ? 'f' : 'c';
}
function fmtT(c) {
  const t = weatherUnit() === 'f' ? Math.round(c * 9 / 5 + 32) : Math.round(c);
  return t + '°' + (weatherUnit() === 'f' ? 'F' : 'C');
}
function fmtTShort(c) {
  const t = weatherUnit() === 'f' ? Math.round(c * 9 / 5 + 32) : Math.round(c);
  return t + '°';
}
function setWeatherUnit(u) {
  localStorage.setItem('weather_unit', u === 'f' ? 'f' : 'c');
  // update toggle buttons
  document.querySelectorAll('.weather-unit-btn').forEach(b => b.classList.toggle('active', b.dataset.u === weatherUnit()));
  enhanceWeather();
}
window.setWeatherUnit = setWeatherUnit;

function cacheGet(lat, lon) {
  try {
    const raw = sessionStorage.getItem('weather_' + lat + '_' + lon);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}
function cacheSet(lat, lon, data) {
  try { sessionStorage.setItem('weather_' + lat + '_' + lon, JSON.stringify(data)); } catch (_) {}
}

async function enhanceWeather() {
  const cards = document.querySelectorAll('.weather-card');
  if (!cards.length) return;
  const coordsByCity = cityLookup();

  // keep unit buttons in sync
  document.querySelectorAll('.weather-unit-btn').forEach(b => b.classList.toggle('active', b.dataset.u === weatherUnit()));

  await Promise.all([...cards].map(async (card) => {
    const cityEl = card.querySelector('.city');
    if (!cityEl) return;
    const cityName = cityEl.textContent.replace(/^\S+\s/, '').trim();
    const coords = coordsByCity[cityName];
    if (!coords) return;
    const lat = coords[0], lon = coords[1];

    const render = (d) => {
      const daily = d.daily;
      const dates = daily.time || [];
      const maxT = daily.temperature_2m_max || [];
      const minT = daily.temperature_2m_min || [];
      const codes = daily.weather_code || [];
      const uv = daily.uv_index_max || [];
      const precip = daily.precipitation_sum || [];

      const today = wmoInfo(codes[0]);
      const todayHtml =
        `<div class="weather-live" style="font-size:.62rem;font-weight:700;letter-spacing:.08em;color:#10b981;margin-bottom:.15rem">● LIVE</div>
         <div class="temp">${today.emoji} ${fmtT(minT[0])}–${fmtT(maxT[0])}</div>
         <div class="note">${today.label}</div>
         <div style="font-size:.66rem;color:#94a3b8">💧${(precip[0] || 0).toFixed(1)}mm · UV ${uv[0] != null ? Math.round(uv[0]) : '–'}</div>`;

      const strip = dates.slice(1).map((date, i) => {
        const wd = new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'short' });
        return `<span style="display:inline-flex;flex-direction:column;align-items:center;gap:.1rem;font-size:.66rem;color:#94a3b8">
                  <span>${wd}</span>
                  <span style="font-size:.9rem">${wmoDayShort(codes[i + 1])}</span>
                  <span>${fmtTShort(minT[i + 1])}–${fmtTShort(maxT[i + 1])}</span>
                </span>`;
      }).join('');

      card.innerHTML =
        `<div class="city">${cityEl.textContent}</div>` +
        todayHtml +
        `<div style="display:flex;justify-content:space-between;gap:.3rem;margin-top:.4rem;padding-top:.4rem;border-top:1px dashed #e2e8f0">${strip}</div>`;
    };

    try {
      const cached = cacheGet(lat, lon);
      if (cached) render(cached); // show instantly, refresh below
      const d = await fetchForecast(lat, lon);
      cacheSet(lat, lon, d);
      render(d);
    } catch (_) {
      /* keep static content if nothing worked */
    }
  }));
}

// Auto-run when the weather grid exists (info page etc.).
// Run a tick after DOMContentLoaded so any inline script that builds the
// weather cards has already populated them.
function autoEnhance() {
  setTimeout(enhanceWeather, 50);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoEnhance);
} else {
  autoEnhance();
}
