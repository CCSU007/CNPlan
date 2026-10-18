/**
 * City detail page renderer.
 * Reads the global CITY_ID (set on each city sub-page), then renders the
 * hero, facts, the planned days for that destination, and top activities.
 */
(function () {
  'use strict';

  function render() {
    if (typeof CITY_ID === 'undefined' || typeof TRIP === 'undefined') return;
    const city = (TRIP.destinations || []).find(d => d.id === CITY_ID);
    if (!city) return;

    const legs = legsForDestination(city.id);
    const days = daysForDestination(city.id);
    const nights = legs.reduce((n, l) => n + (l.nights || 0), 0) || city.nights || 0;

    const eyebrow = document.getElementById('city-eyebrow');
    const title = document.getElementById('city-title');
    const sub = document.getElementById('city-sub');
    const detail = document.getElementById('city-detail');

    const ranges = legs.length ? legs.map(l => planDateRange(l.startDate, l.endDate)).join(' · ') : (city.stay || '');

    if (eyebrow) eyebrow.textContent = `📍 ${ranges} · ${nights} night${nights === 1 ? '' : 's'}`;
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

    const legsHtml = legs.filter(l => l.nights > 0).map(l => `
      <div class="city-leg">
        <span class="city-leg-dates">${planDateRange(l.startDate, l.endDate)}</span>
        <span class="city-leg-hotel">🏨 ${l.hotel}</span>
      </div>
    `).join('');

    const planHtml = days.length ? `
      <div class="city-plan">
        <h3>Planned days · ${shortName}</h3>
        ${days.map(day => `
          <div class="city-plan-day">
            <div class="plan-day-head">
              <span class="plan-date">${planShortDate(day.date)}</span>
              ${day.tag ? `<span class="plan-tag plan-tag-${day.tag.toLowerCase().replace(/\s+/g, '-')}">${day.tag}</span>` : ''}
              <span class="plan-hotel">🏨 ${day.hotel}</span>
            </div>
            ${day.note ? `<p class="plan-note-line">${day.note}</p>` : ''}
            ${planSlot('Morning', '☀️', day.morning)}
            ${planSlot('Afternoon', '🌤️', day.afternoon)}
            ${planSlot('Evening', '🌙', day.evening)}
          </div>
        `).join('')}
      </div>
    ` : '';

    detail.innerHTML = `
      <div class="city-facts">
        <div class="city-fact-card">
          <span class="cf-icon">🗓️</span>
          <div class="cf-label">Dates</div>
          <div class="cf-value">${ranges}</div>
        </div>
        <div class="city-fact-card">
          <span class="cf-icon">🌙</span>
          <div class="cf-label">Nights</div>
          <div class="cf-value">${nights}</div>
        </div>
        <div class="city-fact-card">
          <span class="cf-icon">${city.weather.icon}</span>
          <div class="cf-label">Weather</div>
          <div class="cf-value">${city.weather.temp} · ${city.weather.season}</div>
        </div>
        <div class="city-fact-card">
          <span class="cf-icon">🚄</span>
          <div class="cf-label">Getting here</div>
          <div class="cf-value">${legs.length ? `${legs[0].transport.mode} ${legs[0].transport.duration || ''} from ${legs[0].transport.from}` : (city.stay ? 'Christmas split — see Planner' : '—')}</div>
        </div>
      </div>

      <div class="city-notes">
        <h3>At a glance · ${shortName}</h3>
        <div class="tags">${tagsHtml}</div>
        <p>${city.notes}</p>
        ${legsHtml ? `<div class="city-legs">${legsHtml}</div>` : ''}
      </div>

      <div class="city-notes">
        <h3>Top things to do</h3>
        <ul class="city-activity-list">${activitiesHtml}</ul>
      </div>

      ${planHtml}
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
