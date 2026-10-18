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
        <span class="plan-hotel">🏨 ${day.hotel}</span>
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

    return `
      <div class="planner-card" data-city="${leg.id}">
        <div class="planner-header${i === 0 ? ' open' : ''}" onclick="togglePlanner('${leg.id}')">
          <div class="left">
            <span class="emoji">${leg.emoji}</span>
            <div>
              <h3>${leg.name} · ${leg.nights ? leg.nights + ' night' + (leg.nights === 1 ? '' : 's') : 'fly home'}</h3>
              <div class="sub">${planDateRange(leg.startDate, leg.endDate)} · 🏨 ${leg.hotel}</div>
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
            <p>${leg.notes}</p>
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
