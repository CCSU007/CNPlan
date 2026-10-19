/**
 * Day-by-Day Planner — built from the spreadsheet (China Trip 2026.xlsx).
 * Legs expand into individual days with morning / afternoon / evening slots,
 * the hotel for that night, and a per-day note saved in localStorage.
 */

function planDayHtml(day) {
  const saved = localStorage.getItem(`plan_day_${day.date}`) || '';
  const tag = day.tag ? `<span class="plan-tag plan-tag-${day.tag.toLowerCase().replace(/\s+/g, '-')}">${day.tag}</span>` : '';
  const slots = [
    planSlot('Morning', '☀️', day.morning),
    planSlot('Afternoon', '🌤️', day.afternoon),
    planSlot('Evening', '🌙', day.evening),
  ].join('');

  return `
    <div class="plan-day">
      <div class="plan-day-head">
        <span class="plan-date">${planShortDate(day.date)}</span>
        ${tag}
        <span class="plan-hotel">🏨 ${hotelLabelForDate(day.date)}</span>
      </div>
      ${day.note ? `<p class="plan-note-line">${day.note}</p>` : ''}
      ${slots || `<p class="plan-free">Free day — nothing locked in.</p>`}
      <textarea class="plan-day-note" rows="1"
        placeholder="Notes for ${planShortDate(day.date)}…"
        oninput="saveDayNote('${day.date}', this.value)">${saved}</textarea>
    </div>
  `;
}

function initPlanner() {
  const container = document.getElementById('planner-container');
  if (!container) return;

  container.innerHTML = TRIP.cities.map((leg, i) => {
    const days = daysForLeg(leg.id);
    const mapBtn = leg.destId
      ? `<button class="btn btn-ghost btn-sm" onclick="location.href='map.html?city=${leg.destId}'">📍 Show on Map</button>`
      : '';
    const hotels = hotelsForLeg(leg.id);
    const conn = connectionForLeg(leg.id);

    const hotelSummary = hotels.length
      ? hotels.map(h => h.short).join(' → ')
      : (days.length ? hotelLabelForDate(days[0].date) : '未预订');

    const hotelsHtml = hotels.length ? `
      <div class="leg-hotels">
        ${hotels.map(h => `
          <div class="leg-hotel${h.placeholder ? ' is-placeholder' : ''}">
            <div class="leg-hotel-name">🏨 ${h.name}</div>
            <div class="leg-hotel-meta">${h.area} · ${h.metro} · ${planDateRange(h.checkIn, h.checkOut)} · ${h.nights} 晚</div>
            ${h.paid && h.paid !== '—' ? `<div class="leg-hotel-paid">${h.paid}</div>` : ''}
            ${h.note ? `<p class="leg-hotel-note">${h.note}</p>` : ''}
          </div>
        `).join('')}
      </div>
    ` : '';

    const connHtml = conn ? `
      <div class="connection-card">
        <div class="connection-head">🚏 Best way · ${conn.from} → ${conn.to}</div>
        <div class="connection-best">${conn.best}</div>
        <div class="connection-alt"><span>Also possible:</span> ${conn.alt}</div>
        <div class="connection-why">${conn.why}</div>
      </div>
    ` : '';

    return `
      <div class="planner-card" data-city="${leg.id}">
        <div class="planner-header${i === 0 ? ' open' : ''}" onclick="togglePlanner('${leg.id}')">
          <div class="left">
            <span class="emoji">${leg.emoji}</span>
            <div>
              <h3>${leg.name} · ${leg.nights ? leg.nights + ' night' + (leg.nights === 1 ? '' : 's') : 'fly home'}</h3>
              <div class="sub">${planDateRange(leg.startDate, leg.endDate)} · 🏨 ${hotelSummary}</div>
            </div>
          </div>
          <span class="chevron">▼</span>
        </div>
        <div class="planner-body${i === 0 ? ' open' : ''}" id="planner-body-${leg.id}">
          <div class="planner-inner">
            <div class="plan-leg-meta">
              <span>${leg.transport.mode} from ${leg.transport.from}${leg.transport.duration ? ' · ' + leg.transport.duration : ''}</span>
              <span>${days.length} day${days.length === 1 ? '' : 's'}</span>
            </div>
            ${connHtml}
            <p>${leg.notes}</p>
            ${hotelsHtml}
            ${days.map(planDayHtml).join('')}
            <div class="plan-actions">${mapBtn}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function togglePlanner(legId) {
  const body = document.getElementById(`planner-body-${legId}`);
  const header = body?.previousElementSibling;
  if (!body || !header) return;
  body.classList.toggle('open');
  header.classList.toggle('open');
}

function saveDayNote(dateStr, value) {
  localStorage.setItem(`plan_day_${dateStr}`, value);
}
