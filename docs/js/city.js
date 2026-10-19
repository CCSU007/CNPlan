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

    const legsHtml = legs.filter(l => l.nights > 0).map(l => {
      const hs = hotelsForLeg(l.id);
      const hotelText = hs.length
        ? hs.map(h => h.short).join(' → ')
        : hotelLabelForDate(l.startDate);
      return `
        <div class="city-leg">
          <span class="city-leg-dates">${planDateRange(l.startDate, l.endDate)}</span>
          <span class="city-leg-hotel">🏨 ${hotelText}</span>
        </div>
      `;
    }).join('');

    const hotels = legs.flatMap(l => hotelsForLeg(l.id));
    const hotelsHtml = hotels.length ? `
      <div class="city-notes">
        <h3>Where you stay</h3>
        <div class="leg-hotels">
          ${hotels.map(h => `
            <div class="leg-hotel">
              <div class="leg-hotel-name">🏨 ${h.name}</div>
              <div class="leg-hotel-meta">${h.area} · ${h.metro} · ${planDateRange(h.checkIn, h.checkOut)} · ${h.nights} 晚</div>
              <div class="leg-hotel-paid">${h.paid}</div>
              ${h.note ? `<p class="leg-hotel-note">${h.note}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : (legs.length ? `
      <div class="city-notes">
        <h3>Where you stay</h3>
        <div class="leg-hotels">
          <div class="leg-hotel">
            <div class="leg-hotel-name">🏨 未预订</div>
            <div class="leg-hotel-meta">${hotelLabelForDate(legs[0].startDate)} — 还没订到酒店</div>
          </div>
        </div>
      </div>
    ` : '');

    const conn = legs.map(l => connectionForLeg(l.id)).find(Boolean);

    const planHtml = days.length ? `
      <div class="city-plan">
        <h3>Planned days · ${shortName}</h3>
        ${days.map(day => `
          <div class="city-plan-day">
            <div class="plan-day-head">
              <span class="plan-date">${planShortDate(day.date)}</span>
              ${day.tag ? `<span class="plan-tag plan-tag-${day.tag.toLowerCase().replace(/\s+/g, '-')}">${day.tag}</span>` : ''}
              <span class="plan-hotel">🏨 ${hotelLabelForDate(day.date)}</span>
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
          <div class="cf-value">${conn ? conn.best : (legs.length ? `${legs[0].transport.mode} ${legs[0].transport.duration || ''} from ${legs[0].transport.from}` : 'Christmas split — see Planner')}</div>
        </div>
      </div>

      ${conn ? `
        <div class="connection-card">
          <div class="connection-head">🚏 Best way · ${conn.from} → ${conn.to}</div>
          <div class="connection-best">${conn.best}</div>
          <div class="connection-alt"><span>Also possible:</span> ${conn.alt}</div>
          <div class="connection-why">${conn.why}</div>
        </div>
      ` : ''}

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

      ${hotelsHtml}

      ${planHtml}
    `;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
