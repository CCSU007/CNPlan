/**
 * Packing Checklist — Categorized items with checkboxes, progress bar, localStorage.
 */
function initPacking() {
  const container = document.getElementById('packing-container');
  if (!container) return;

  const cats = TRIP.packing.categories;
  const totalItems = cats.reduce((sum, c) => sum + c.items.length, 0);
  const checkedCount = cats.reduce((sum, c) => {
    return sum + c.items.filter((_, i) => {
      const key = `packing_${c.name}_${i}`;
      return localStorage.getItem(key) === 'true';
    }).length;
  }, 0);
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  container.innerHTML = `
    <div class="packing-stats" id="packing-stats">${checkedCount} / ${totalItems} packed (${progressPct}%)</div>
    <div class="packing-progress">
      <div class="packing-progress-bar" id="packing-progress-bar" style="width:${progressPct}%"></div>
    </div>
    ${cats.map(cat => `
      <div class="packing-category">
        <h3>${cat.name} <span class="count">(${cat.items.length})</span></h3>
        <ul class="packing-items">
          ${cat.items.map((item, i) => {
            const key = `packing_${cat.name}_${i}`;
            const checked = localStorage.getItem(key) === 'true';
            return `
              <li class="packing-item ${checked ? 'checked' : ''}">
                <input type="checkbox" id="${key}" ${checked ? 'checked' : ''}
                  onchange="togglePacking('${key}')" />
                <label for="${key}">${item}</label>
              </li>
            `;
          }).join('')}
        </ul>
      </div>
    `).join('')}
  `;
}

function togglePacking(key) {
  const cb = document.getElementById(key);
  if (!cb) return;

  localStorage.setItem(key, cb.checked ? 'true' : 'false');
  const li = cb.closest('.packing-item');
  if (li) li.classList.toggle('checked', cb.checked);

  // Update stats
  const allItems = document.querySelectorAll('.packing-item');
  const checked = document.querySelectorAll('.packing-item.checked');
  const total = allItems.length;
  const done = checked.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const stats = document.getElementById('packing-stats');
  if (stats) stats.textContent = `${done} / ${total} packed (${pct}%)`;

  const bar = document.getElementById('packing-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
}
