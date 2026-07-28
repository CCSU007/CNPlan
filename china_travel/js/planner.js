/**
 * Day-by-Day Planner — Expandable itinerary with personal notes
 * Each city card expands to show activities, notes, and a local-storage notes editor.
 */
function initPlanner() {
  const container = document.getElementById('planner-container');
  if (!container) return;

  container.innerHTML = TRIP.cities.map((city, i) => {
    const savedNotes = localStorage.getItem(`planner_notes_${city.id}`) || '';

    return `
      <div class="planner-card" data-city="${city.id}">
        <div class="planner-header" onclick="togglePlanner('${city.id}')">
          <div class="left">
            <span class="emoji">${city.emoji}</span>
            <div>
              <h3>${city.name} · ${city.nights} nights</h3>
              <div class="sub">${city.startDate} – ${city.endDate}  ·  ${city.weather.season} ${city.weather.icon}</div>
            </div>
          </div>
          <span class="chevron">▼</span>
        </div>
        <div class="planner-body" id="planner-body-${city.id}">
          <div class="planner-inner">
            <p>${city.notes}</p>
            ${city.transport.duration ? `<p><strong>🚗 From ${city.transport.from}:</strong> ${city.transport.mode} ${city.transport.duration}</p>` : ''}
            <ul class="planner-activities">
              ${city.activities.map(a => `<li>${a}</li>`).join('')}
            </ul>
            <div class="planner-notes">
              <label style="font-size:.82rem;font-weight:600;color:#64748b">📝 Personal Notes</label>
              <textarea
                placeholder="Add your own notes for ${city.name}..."
                oninput="savePlannerNote('${city.id}', this.value)"
              >${savedNotes}</textarea>
            </div>
            <div style="margin-top:.6rem">
              <button class="btn btn-ghost btn-sm" onclick="flyToCity('${city.id}')">📍 Show on Map</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Open first city by default
  if (TRIP.cities.length > 0) {
    togglePlanner(TRIP.cities[0].id);
  }
}

function togglePlanner(cityId) {
  const body = document.getElementById(`planner-body-${cityId}`);
  const header = body?.previousElementSibling;
  if (!body || !header) return;

  const isOpen = body.classList.contains('open');
  body.classList.toggle('open');
  header.classList.toggle('open');
}

function savePlannerNote(cityId, value) {
  localStorage.setItem(`planner_notes_${cityId}`, value);
}
