/**
 * Price Panel — driven by flight_ticket/refresh_prices.py (flights + high-speed rail, RMB).
 * Serve with:  python serve_prices.py
 *   • Load  → GET /api/prices
 *   • Refresh → GET /api/refresh (reruns the Python generator, then returns fresh prices)
 * source: "tripcom" = ✈️ flight, "chinarail" = 🚄 high-speed train
 */

let pricesSource = null;   // the exact URL that last served price data

async function fetchData(url, timeout = 25000) {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    if (!resp.ok) return null;
    const d = await resp.json();
    return (d && d.length) ? d : null;
  } catch (_) { return null; }
}

// Inline snapshot from js/prices_data.js (script-loaded → works on file:// too)
function inlinePrices() {
  return (typeof PRICES_DATA !== 'undefined' && PRICES_DATA && PRICES_DATA.length) ? PRICES_DATA : null;
}

/**
 * Load prices from, in order:
 *   1. same-origin API   (site served by serve_prices.py — localhost or ngrok)
 *   2. a local server on 8765–8769  (file:// while start.bat is running)
 *   3. the bundled static prices.json  (any static host — GitHub Pages etc.)
 * Remembers the working source so Refresh is fast and never re-scans all ports.
 * Returns { data, live } — live=true when a Python API answered.
 */
async function loadPrices() {
  let d = await fetchData('/api/prices');
  if (d) { pricesSource = '/api/prices'; return { data: d, live: true }; }

  // Probe local servers in parallel with a short timeout (localhost answers in ms).
  const ports = [8765, 8766, 8767, 8768, 8769];
  const hits = await Promise.all(ports.map(p =>
    fetchData(`http://localhost:${p}/api/prices`, 4000).then(d => ({ p, d }))
  ));
  for (const { p, d } of hits) {
    if (d && d.length) {
      const u = `http://localhost:${p}/api/prices`;
      pricesSource = u;
      return { data: d, live: true };
    }
  }

  // Inline script data (js/prices_data.js) — always available, works even when
  // fetch() on file:// is blocked by the browser.
  const inline = inlinePrices();
  if (inline) { pricesSource = null; return { data: inline, live: false }; }

  return { data: null, live: false };
}

/** The /api/refresh URL for the source that answered (null when on a static host). */
function refreshUrlFor() {
  if (pricesSource === '/api/prices') return '/api/refresh';
  if (pricesSource) return pricesSource.replace('/api/prices', '/api/refresh');
  return null;
}

/** Refresh: rerun the Python generator (when a backend exists), else re-read the bundled snapshot. */
async function refreshPrices() {
  const container = document.getElementById('prices-container');
  if (!container) return;
  const btn = document.getElementById('prices-refresh-btn');
  if (btn) { btn.textContent = '⏳ Updating…'; btn.disabled = true; }

  let data = null, live = false;
  const url = refreshUrlFor();
  if (url) {
    data = await fetchData(url, 15000);   // live backend: /api/refresh reruns the generator
    if (data && data.length) {
      live = true;
    } else {
      // Live backend unreachable right now — fall back to the inline snapshot
      // instead of showing an error, so the page never loses its prices.
      data = inlinePrices();
    }
  } else {
    data = inlinePrices();  // static host / file://: re-read the inline snapshot
  }

  if (data && data.length) renderPrices(data, container, live);
  else renderNoData(container);

  if (btn) { btn.textContent = '🔄 Refresh'; btn.disabled = false; }
}

function initPrices() {
  const container = document.getElementById('prices-container');
  if (!container) return;

  container.innerHTML = '<div class="price-loading"><div class="spinner"></div>Loading prices…</div>';

  // Show the latest available prices (live API if present, else bundled snapshot).
  // NO auto-refresh — the table stays until someone clicks Refresh.
  loadPrices().then(({ data, live }) => {
    if (data && data.length) renderPrices(data, container, live);
    else renderNoData(container);
  });
}

function renderPrices(data, container, live) {
  if (!data || !data.length) {
    renderNoData(container);
    return;
  }

  // Group by route
  const routes = {};
  data.forEach(f => {
    const key = `${f.origin}→${f.dest}`;
    if (!routes[key]) routes[key] = [];
    routes[key].push(f);
  });

  const modeNote = live === false
    ? ' · <span style="color:#94a3b8">static snapshot</span>'
    : '';
  let html = `
    <div class="prices-refresh">
      <button id="prices-refresh-btn" class="btn btn-ghost btn-sm" onclick="refreshPrices()">🔄 Refresh</button>
      <span style="font-size:.8rem;color:#64748b">Last updated: ${data[0]?.timestamp || 'unknown'} · 机票 + 高铁 · RMB${modeNote}</span>
    </div>
  `;

  Object.entries(routes).forEach(([route, flights]) => {
    // Sort by price ascending (RMB)
    flights.sort((a, b) => parseFloat(a.price_cny || a.price_nzd || 999999) - parseFloat(b.price_cny || b.price_nzd || 999999));
    const best = flights[0];

    html += `
      <div style="margin-bottom:1.5rem">
        <h4 style="font-size:.95rem;margin-bottom:.5rem">${route}</h4>
        <table class="price-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Airline</th>
              <th>Price (RMB)</th>
              <th>Duration</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${flights.slice(0, 5).map(f => {
              const isBest = f === best;
              const typeIcon = f.source === 'chinarail' ? '🚄' : '✈️';
              const dur = f.duration_min ? `${Math.floor(f.duration_min/60)}h${f.duration_min%60 ? f.duration_min%60+'m' : ''}` : '?';
              const raw = parseFloat(f.price_cny || f.price_nzd || 0);
              return `
                <tr class="price-row">
                  <td style="font-size:.9rem">${typeIcon}</td>
                  <td>${isBest ? '⭐ ' : ''}${f.airline || '?'}</td>
                  <td class="${isBest ? 'price-best' : ''}">¥${raw.toFixed(0)}</td>
                  <td style="font-size:.8rem;color:#94a3b8">${dur}</td>
                  <td>${f.depart_date || '?'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderNoData(container) {
  container.innerHTML = `
    <div class="alert-info">
      <strong>📡 Price server not running.</strong><br/>
      Prices (机票 ✈️ + 高铁 🚄, in RMB) are generated by <code>python flight_ticket/refresh_prices.py</code> and served by <code>python serve_prices.py</code>.
    </div>
    <div class="prices-refresh" style="margin-top:.5rem">
      <button id="prices-refresh-btn" class="btn btn-ghost btn-sm" onclick="refreshPrices()">🔄 Refresh</button>
    </div>
  `;
}
