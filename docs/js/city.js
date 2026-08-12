/**
 * City detail page renderer.
 * Reads the global CITY_ID (set on each city sub-page) and renders the
 * hero, facts, and placeholder guide from the TRIP data source.
 */
(function () {
  'use strict';

  function render() {
    if (typeof CITY_ID === 'undefined' || typeof TRIP === 'undefined') return;
    const city = TRIP.cities.find(c => c.id === CITY_ID);
    if (!city) return;

    const eyebrow = document.getElementById('city-eyebrow');
    const title = document.getElementById('city-title');
    const sub = document.getElementById('city-sub');
    const detail = document.getElementById('city-detail');

    if (eyebrow) eyebrow.textContent = `${city.emoji} ${city.startDate} – ${city.endDate} · ${city.nights} nights`;
    if (title) title.textContent = city.name;
    if (sub) sub.textContent = `${city.weather.icon} ${city.weather.temp} · ${city.weather.season}`;
    if (!detail) return;

    const shortName = city.name.split('·')[0].trim();

    const tagsHtml = city.tags.map(t => {
      const label = typeof t === 'string' ? t : t.label;
      const cls = typeof t === 'string' ? '' : t.cls || '';
      return `<span class="tag ${cls}">${label}</span>`;
    }).join('');

    const activitiesHtml = city.activities.map(a => `<li>${a}</li>`).join('');

    detail.innerHTML = `
      <div class="city-placeholder">
        <div class="ph-emoji">🚧</div>
        <h3>Full guide coming soon</h3>
        <p>The detailed ${shortName} guide — local food, must-see spots, and a day-by-day plan — will be built here next.</p>
      </div>

      <div class="city-facts">
        <div class="city-fact-card">
          <span class="cf-icon">🗓️</span>
          <div class="cf-label">Dates</div>
          <div class="cf-value">${city.startDate} – ${city.endDate}</div>
        </div>
        <div class="city-fact-card">
          <span class="cf-icon">🌙</span>
          <div class="cf-label">Nights</div>
          <div class="cf-value">${city.nights}</div>
        </div>
        <div class="city-fact-card">
          <span class="cf-icon">${city.weather.icon}</span>
          <div class="cf-label">Weather</div>
          <div class="cf-value">${city.weather.temp} · ${city.weather.season}</div>
        </div>
        <div class="city-fact-card">
          <span class="cf-icon">🚄</span>
          <div class="cf-label">Getting here</div>
          <div class="cf-value">${city.transport.mode} ${city.transport.duration || ''} from ${city.transport.from}</div>
        </div>
      </div>

      <div class="city-notes">
        <h3>At a glance · ${shortName}</h3>
        <div class="tags">${tagsHtml}</div>
        <p>${city.notes}</p>
        <h4>Top things to do</h4>
        <ul>${activitiesHtml}</ul>
      </div>
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
