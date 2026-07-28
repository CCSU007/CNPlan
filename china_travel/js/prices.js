/**
 * Flight Price Panel — Fetches latest prices from serve_prices.py or falls back gracefully.
 */
function initPrices() {
  const container = document.getElementById('prices-container');
  if (!container) return;

  container.innerHTML = `
    <div class="price-loading">
      <div class="spinner"></div>
      Loading latest flight prices...
    </div>
  `;

  fetchPrices()
    .then(data => renderPrices(data, container))
    .catch(() => renderNoData(container));
}

async function fetchPrices() {
  const resp = await fetch('http://localhost:8765/api/prices', {
    signal: AbortSignal.timeout(3000),
  });
  if (!resp.ok) throw new Error('Not OK');
  return resp.json();
}

function renderPrices(data, container) {
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

  let html = `
    <div class="prices-refresh">
      <button class="btn btn-ghost btn-sm" onclick="initPrices()">🔄 Refresh</button>
      <span style="font-size:.8rem;color:#64748b">Last updated: ${data[0]?.timestamp || 'unknown'}</span>
    </div>
  `;

  Object.entries(routes).forEach(([route, flights]) => {
    // Sort by price ascending
    flights.sort((a, b) => parseFloat(a.price_nzd || 999999) - parseFloat(b.price_nzd || 999999));
    const best = flights[0];

    html += `
      <div style="margin-bottom:1.5rem">
        <h4 style="font-size:.95rem;margin-bottom:.5rem">${route}</h4>
        <table class="price-table">
          <thead>
            <tr>
              <th>Airline</th>
              <th>Price (NZD)</th>
              <th>Stops</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${flights.slice(0, 5).map(f => {
              const isBest = f === best;
              return `
                <tr class="price-row">
                  <td>${isBest ? '⭐ ' : ''}${f.airline || '?'}</td>
                  <td class="${isBest ? 'price-best' : ''}">$${parseFloat(f.price_nzd || 0).toFixed(0)}</td>
                  <td>${f.stops != null ? f.stops : '?'}</td>
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
      <strong>📡 Flight price server not running.</strong><br/>
      Start the price server with <code>python serve_prices.py</code> in the flight_ticket directory to see live prices here.
    </div>
    <div class="prices-refresh" style="margin-top:.5rem">
      <button class="btn btn-ghost btn-sm" onclick="initPrices()">🔄 Retry</button>
    </div>
  `;
}
