/**
 * Trip To-Do — a lightweight, local todo list.
 * Concept borrowed from TREK's todo list (categories, P1–P3 priority,
 * due dates, filters, progress). Stored in localStorage. Colors use the
 * site's own palette.
 */

const TODO_CATS = [
  { id: 'prep',    label: '🛂 Prep',     color: '#6366f1' },
  { id: 'booking', label: '🎫 Bookings', color: '#a78bfa' },
  { id: 'money',   label: '💰 Money',    color: '#10b981' },
  { id: 'tech',    label: '📱 Tech',     color: '#06b6d4' },
  { id: 'pack',    label: '🧳 Packing',  color: '#f59e0b' },
  { id: 'china',   label: '🏙️ In China', color: '#ec4899' },
];

const TODO_PRIO = [
  { id: 1, label: 'P1', color: '#ef4444' },
  { id: 2, label: 'P2', color: '#f59e0b' },
  { id: 3, label: 'P3', color: '#3b82f6' },
];

const SEED = [
  { text: 'Check NZ passport 15-day visa-free entry rules for China', cat: 'prep', prio: 1, due: '2026-11-01' },
  { text: 'Install & test VPN (Google/WhatsApp are blocked in China)', cat: 'tech', prio: 1, due: '2026-11-15' },
  { text: 'Buy eSIM / local SIM for China data', cat: 'tech', prio: 1, due: '2026-11-20' },
  { text: 'Set up Alipay + WeChat Pay with a card', cat: 'money', prio: 1, due: '2026-11-20' },
  { text: 'Book Auckland → Shanghai / Hong Kong flight', cat: 'booking', prio: 1, due: '2026-09-30' },
  { text: 'Book Shanghai → Auckland return flight', cat: 'booking', prio: 1, due: '2026-09-30' },
  { text: 'Book Shenzhen → Wangxian Valley flight', cat: 'booking', prio: 1, due: '2026-11-15' },
  { text: 'Book Chongqing → Chengdu G train', cat: 'booking', prio: 2, due: '2026-11-20' },
  { text: 'Book 宫宴 palace banquet in Shanghai (Klook)', cat: 'booking', prio: 2, due: '2026-11-30' },
  { text: 'Confirm all hotel bookings', cat: 'booking', prio: 2, due: '2026-11-20' },
  { text: 'Pack winter layers for Beijing (-8°C)', cat: 'pack', prio: 2, due: '2026-12-01' },
  { text: 'Download apps: Metro 大都会 / 高德 / DiDi / 12306', cat: 'tech', prio: 2, due: '2026-11-25' },
];

const STORE_KEY = 'trip_todos';
let currentFilter = 'all';
let currentCat = 'all';
let currentPrio = 0;

function loadTodos() {
  const raw = localStorage.getItem(STORE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (_) {}
  }
  // Seed defaults on first visit
  const seeded = SEED.map((s, i) => ({ id: 't' + Date.now() + '_' + i, done: false, ...s }));
  saveTodos(seeded);
  return seeded;
}
function saveTodos(items) { localStorage.setItem(STORE_KEY, JSON.stringify(items)); }

function catInfo(id) { return TODO_CATS.find(c => c.id === id) || TODO_CATS[0]; }
function prioInfo(id) { return TODO_PRIO.find(p => p.id === id) || TODO_PRIO[1]; }

function initTodo() {
  const app = document.getElementById('todo-app');
  if (!app) return;
  app.innerHTML = `
    <div class="todo-panel">
      <div class="todo-add">
        <input id="todo-text" class="todo-input" placeholder="Add a to-do… e.g. 订 宫宴" />
        <select id="todo-cat" class="todo-select">${TODO_CATS.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}</select>
        <select id="todo-prio" class="todo-select">${TODO_PRIO.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}</select>
        <input id="todo-due" type="date" class="todo-select" />
        <button class="btn btn-primary btn-sm" onclick="addTodo()">+ Add</button>
      </div>
      <div class="todo-progress"><div class="todo-progress-bar" id="todo-progress-bar"></div></div>
      <div class="todo-filters">
        ${[['all','All'],['todo','To-do'],['done','Done'],['overdue','Overdue']].map(([k,l]) =>
          `<button class="todo-filter ${k === currentFilter ? 'active' : ''}" data-f="${k}" onclick="setTodoFilter('${k}', this)">${l}</button>`).join('')}
      </div>
      <div class="todo-slicers">
        <span class="todo-slicer-label">Category</span>
        <button class="todo-slicer ${currentCat === 'all' ? 'active' : ''}" data-c="all" onclick="setCatFilter('all', this)">All</button>
        ${TODO_CATS.map(c => `<button class="todo-slicer ${currentCat === c.id ? 'active' : ''}" data-c="${c.id}" style="--c:${c.color};background:${c.color}1a;color:${c.color}" onclick="setCatFilter('${c.id}', this)">${c.label}</button>`).join('')}
      </div>
      <div class="todo-slicers">
        <span class="todo-slicer-label">Priority</span>
        <button class="todo-slicer ${currentPrio === 0 ? 'active' : ''}" data-p="0" onclick="setPrioFilter(0, this)">All</button>
        ${TODO_PRIO.map(p => `<button class="todo-slicer ${currentPrio === p.id ? 'active' : ''}" data-p="${p.id}" style="--c:${p.color};background:${p.color}1a;color:${p.color}" onclick="setPrioFilter(${p.id}, this)">${p.label}</button>`).join('')}
      </div>
      <ul id="todo-list" class="todo-list"></ul>
    </div>
  `;
  renderTodos();
}

function setTodoFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.todo-filter').forEach(b => b.classList.toggle('active', b.dataset.f === f));
  renderTodos();
}

function setCatFilter(c, btn) {
  currentCat = c;
  document.querySelectorAll('.todo-slicer[data-c]').forEach(b => b.classList.toggle('active', b.dataset.c === c));
  renderTodos();
}

function setPrioFilter(p, btn) {
  currentPrio = parseInt(p, 10) || 0;
  document.querySelectorAll('.todo-slicer[data-p]').forEach(b => b.classList.toggle('active', b.dataset.p === String(currentPrio)));
  renderTodos();
}

function addTodo() {
  const text = document.getElementById('todo-text').value.trim();
  if (!text) return;
  const items = loadTodos();
  items.unshift({
    id: 't' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    text,
    cat: document.getElementById('todo-cat').value,
    prio: parseInt(document.getElementById('todo-prio').value, 10) || 2,
    due: document.getElementById('todo-due').value || '',
    done: false,
  });
  saveTodos(items);
  document.getElementById('todo-text').value = '';
  renderTodos();
}

function toggleTodo(id) {
  const items = loadTodos().map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTodos(items);
  renderTodos();
}
function deleteTodo(id) {
  saveTodos(loadTodos().filter(t => t.id !== id));
  renderTodos();
}
function clearDone() {
  saveTodos(loadTodos().filter(t => !t.done));
  renderTodos();
}

function renderTodos() {
  const list = document.getElementById('todo-list');
  const bar = document.getElementById('todo-progress-bar');
  const today = new Date().toISOString().slice(0, 10);
  const items = loadTodos();

  let filtered = items;
  if (currentFilter === 'todo') filtered = filtered.filter(t => !t.done);
  else if (currentFilter === 'done') filtered = filtered.filter(t => t.done);
  else if (currentFilter === 'overdue') filtered = filtered.filter(t => !t.done && t.due && t.due < today);
  if (currentCat !== 'all') filtered = filtered.filter(t => t.cat === currentCat);
  if (currentPrio) filtered = filtered.filter(t => (t.prio || 0) === currentPrio);

  // Sort: not-done first, then priority, then due date
  filtered = [...filtered].sort((a, b) =>
    (a.done - b.done) || (prioInfo(a.prio).id - prioInfo(b.prio).id) || ((a.due || '9999').localeCompare(b.due || '9999')));

  const doneCount = items.filter(t => t.done).length;
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
  if (bar) { bar.style.width = pct + '%'; bar.textContent = pct + '%'; }

  if (!filtered.length) {
    list.innerHTML = `<li class="todo-empty">Nothing here — nice! 🎉</li>`;
    return;
  }

  list.innerHTML = filtered.map(t => {
    const cat = catInfo(t.cat);
    const prio = prioInfo(t.prio);
    const overdue = !t.done && t.due && t.due < today;
    return `
      <li class="todo-row ${t.done ? 'done' : ''} ${overdue ? 'overdue' : ''}">
        <input type="checkbox" class="todo-check" ${t.done ? 'checked' : ''} onclick="toggleTodo('${t.id}')" />
        <span class="todo-text">${t.text}</span>
        <span class="todo-cat" style="background:${cat.color}1a;color:${cat.color}">${cat.label}</span>
        <span class="todo-prio" style="background:${prio.color}1a;color:${prio.color}">${prio.label}</span>
        ${t.due ? `<span class="todo-due ${overdue ? 'overdue' : ''}">📅 ${t.due}${overdue ? ' ⚠️' : ''}</span>` : ''}
        <button class="todo-del" title="Delete" onclick="deleteTodo('${t.id}')">✕</button>
      </li>`;
  }).join('');
}

// expose for inline onclick
window.addTodo = addTodo;
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo;
window.setTodoFilter = setTodoFilter;
window.setCatFilter = setCatFilter;
window.setPrioFilter = setPrioFilter;
