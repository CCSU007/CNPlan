/**
 * Flight Price Panel — Loads prices from serve_prices.py (if running)
 * or falls back to embedded static data — no separate server needed!
 */

// ── Embedded price data (no server required) ──
// source: "tripcom" = ✈️ flight, "chinarail" = 🚄 high-speed train
const FALLBACK_PRICES = [
  // ✈️ Flights
  {source:"tripcom",origin:"Shenzhen",dest:"Wangxian Valley",depart_date:"2026-12-13",airline:"Shenzhen Airlines",flight_number:"ZH1234",price_nzd:"185",stops:"0",duration_min:"120",depart_time:"08:30",arrive_time:"10:30",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Wangxian Valley",dest:"Chongqing",depart_date:"2026-12-15",airline:"Sichuan Airlines",flight_number:"3U5678",price_nzd:"95",stops:"0",duration_min:"180",depart_time:"09:00",arrive_time:"12:00",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Chongqing",dest:"Chengdu",depart_date:"2026-12-19",airline:"China Railway",flight_number:"G1234",price_nzd:"45",stops:"0",duration_min:"180",depart_time:"14:00",arrive_time:"17:00",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Chengdu",dest:"Dalian",depart_date:"2026-12-24",airline:"Air China",flight_number:"CA8901",price_nzd:"320",stops:"1",duration_min:"300",depart_time:"07:00",arrive_time:"12:00",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Chengdu",dest:"Bangkok",depart_date:"2026-12-24",airline:"Sichuan Airlines",flight_number:"3U3937",price_nzd:"240",stops:"0",duration_min:"240",depart_time:"08:30",arrive_time:"12:30",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Dalian",dest:"Beijing",depart_date:"2026-12-30",airline:"Air China",flight_number:"CA1608",price_nzd:"180",stops:"0",duration_min:"90",depart_time:"10:00",arrive_time:"11:30",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Bangkok",dest:"Beijing",depart_date:"2026-12-30",airline:"Thai Airways",flight_number:"TG674",price_nzd:"350",stops:"0",duration_min:"300",depart_time:"09:00",arrive_time:"14:00",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Beijing",dest:"Nanjing",depart_date:"2027-01-04",airline:"China Railway",flight_number:"G123",price_nzd:"55",stops:"0",duration_min:"210",depart_time:"08:00",arrive_time:"11:30",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Nanjing",dest:"Shanghai",depart_date:"2027-01-08",airline:"China Railway",flight_number:"G456",price_nzd:"35",stops:"0",duration_min:"60",depart_time:"09:00",arrive_time:"10:00",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  {source:"tripcom",origin:"Shenzhen",dest:"Chongqing",depart_date:"2026-12-15",airline:"Shenzhen Airlines",flight_number:"ZH5678",price_nzd:"210",stops:"0",duration_min:"150",depart_time:"07:00",arrive_time:"09:30",url:"https://www.trip.com",timestamp:"2026-07-28T22:30:00"},
  // 🚄 High-speed trains
  {source:"chinarail",origin:"Shenzhen",dest:"Wangxian Valley",depart_date:"2026-12-13",airline:"China Railway · G",flight_number:"G1604",price_nzd:"65",stops:"0",duration_min:"300",depart_time:"07:30",arrive_time:"12:30",url:"https://www.12306.cn",timestamp:"2026-07-28T22:30:00"},
  {source:"chinarail",origin:"Chongqing",dest:"Chengdu",depart_date:"2026-12-19",airline:"China Railway · G",flight_number:"G8504",price_nzd:"25",stops:"0",duration_min:"90",depart_time:"08:00",arrive_time:"09:30",url:"https://www.12306.cn",timestamp:"2026-07-28T22:30:00"},
  {source:"chinarail",origin:"Dalian",dest:"Beijing",depart_date:"2026-12-30",airline:"China Railway · G",flight_number:"G3528",price_nzd:"55",stops:"0",duration_min:"300",depart_time:"07:00",arrive_time:"12:00",url:"https://www.12306.cn",timestamp:"2026-07-28T22:30:00"},
  {source:"chinarail",origin:"Beijing",dest:"Nanjing",depart_date:"2027-01-04",airline:"China Railway · G",flight_number:"G139",price_nzd:"40",stops:"0",duration_min:"210",depart_time:"09:00",arrive_time:"12:30",url:"https://www.12306.cn",timestamp:"2026-07-28T22:30:00"},
  {source:"chinarail",origin:"Nanjing",dest:"Shanghai",depart_date:"2027-01-08",airline:"China Railway · G",flight_number:"G7011",price_nzd:"18",stops:"0",duration_min:"60",depart_time:"10:00",arrive_time:"11:00",url:"https://www.12306.cn",timestamp:"2026-07-28T22:30:00"},
  {source:"chinarail",origin:"Shenzhen",dest:"Chongqing",depart_date:"2026-12-15",airline:"China Railway · G",flight_number:"G2938",price_nzd:"85",stops:"0",duration_min:"420",depart_time:"06:30",arrive_time:"13:30",url:"https://www.12306.cn",timestamp:"2026-07-28T22:30:00"},
];

function initPrices() {
  const container = document.getElementById('prices-container');
  if (!container) return;

  // Show embedded data immediately (no server needed)
  renderPrices(FALLBACK_PRICES, container);

  // Silently try live server in background — updates if found
  fetchPrices()
    .then(data => { if (data?.length) renderPrices(data, container); })
    .catch(() => {});
}

async function fetchPrices() {
  // Try server on port 8765 or 8767
  for (const port of [8765, 8767]) {
    try {
      const resp = await fetch(`http://localhost:${port}/api/prices`, {
        signal: AbortSignal.timeout(2000),
      });
      if (resp.ok) return resp.json();
    } catch (_) {}
  }
  throw new Error('No server');
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
              <th>Type</th>
              <th>Airline</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${flights.slice(0, 5).map(f => {
              const isBest = f === best;
              const typeIcon = f.source === 'chinarail' ? '🚄' : '✈️';
              const dur = f.duration_min ? `${Math.floor(f.duration_min/60)}h${f.duration_min%60 ? f.duration_min%60+'m' : ''}` : '?';
              const raw = parseFloat(f.price_nzd || f.price_cny || 0);
              // Convert CNY→NZD if needed (~4.7 CNY per NZD)
              const priceNZD = f.currency === 'CNY' ? Math.round(raw / 4.7) : raw;
              return `
                <tr class="price-row">
                  <td style="font-size:.9rem">${typeIcon}</td>
                  <td>${isBest ? '⭐ ' : ''}${f.airline || '?'}</td>
                  <td class="${isBest ? 'price-best' : ''}">NZ$${priceNZD.toFixed(0)}</td>
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
      <strong>📡 Flight price server not running.</strong><br/>
      Start the price server with <code>python serve_prices.py</code> in the flight_ticket directory to see live prices here.
    </div>
    <div class="prices-refresh" style="margin-top:.5rem">
      <button class="btn btn-ghost btn-sm" onclick="initPrices()">🔄 Retry</button>
    </div>
  `;
}
