/**
 * Journey Journal — Post-trip diary with mood, weather, photos, and notes.
 * Inspired by TREK's Journey addon. Data persisted in localStorage.
 */
const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥹', label: 'Touched' },
  { emoji: '😎', label: 'Cool' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤯', label: 'Amazed' },
  { emoji: '😤', label: 'Frustrated' },
];

function initJournal() {
  const container = document.getElementById('journal-container');
  if (!container) return;

  renderJournalEntries(container);
}

function getJournalEntries() {
  try {
    return JSON.parse(localStorage.getItem('journal_entries') || '[]');
  } catch {
    return [];
  }
}

function saveJournalEntries(entries) {
  localStorage.setItem('journal_entries', JSON.stringify(entries));
}

function renderJournalEntries(container) {
  const entries = getJournalEntries();

  let html = '<div class="journal-entries">';

  if (entries.length === 0) {
    html += `
      <div class="alert-info" style="margin-bottom:1rem">
        No journal entries yet. Start documenting your trip below!
      </div>
    `;
  }

  entries.forEach((entry, idx) => {
    html += `
      <div class="journal-entry" data-idx="${idx}">
        <div class="date">📅 ${entry.date}</div>
        <div class="mood-row">
          ${MOODS.map(m => `
            <button class="mood-btn ${entry.mood === m.label ? 'active' : ''}"
              onclick="setJournalMood(${idx}, '${m.label}')">${m.emoji}</button>
          `).join('')}
        </div>
        <div style="font-size:.82rem;color:#64748b;margin-bottom:.3rem">
          Weather: ${entry.weather || '—'} &middot; Place: ${entry.place || '—'}
        </div>
        <textarea
          placeholder="How was your day? Write your story..."
          oninput="updateJournalText(${idx}, this.value)"
        >${entry.text || ''}</textarea>
        ${entry.photo ? `<div class="photo-area"><img src="${entry.photo}" alt="Journal photo" /></div>` : `
          <div class="photo-area">
            <input type="file" accept="image/*" onchange="addJournalPhoto(${idx}, this)" />
            📸 Click to add a photo
          </div>
        `}
        <div class="entry-actions">
          <button class="btn btn-ghost btn-sm" onclick="deleteJournalEntry(${idx})">🗑️ Delete</button>
        </div>
      </div>
    `;
  });

  html += `
    <button class="journal-add-btn" onclick="addJournalEntry()">
      + Add Journal Entry
    </button>
  `;

  html += '</div>';
  container.innerHTML = html;
}

function addJournalEntry() {
  const entries = getJournalEntries();
  const today = new Date().toISOString().split('T')[0];
  entries.unshift({
    date: today,
    mood: '',
    weather: '',
    place: '',
    text: '',
    photo: null,
  });
  saveJournalEntries(entries);
  renderJournalEntries(document.getElementById('journal-container'));
}

function deleteJournalEntry(idx) {
  const entries = getJournalEntries();
  entries.splice(idx, 1);
  saveJournalEntries(entries);
  renderJournalEntries(document.getElementById('journal-container'));
}

function updateJournalText(idx, value) {
  const entries = getJournalEntries();
  if (entries[idx]) {
    entries[idx].text = value;
    saveJournalEntries(entries);
  }
}

function setJournalMood(idx, mood) {
  const entries = getJournalEntries();
  if (entries[idx]) {
    entries[idx].mood = entries[idx].mood === mood ? '' : mood;
    saveJournalEntries(entries);
    renderJournalEntries(document.getElementById('journal-container'));
  }
}

function addJournalPhoto(idx, input) {
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const entries = getJournalEntries();
    if (entries[idx]) {
      entries[idx].photo = e.target.result;
      saveJournalEntries(entries);
      renderJournalEntries(document.getElementById('journal-container'));
    }
  };
  reader.readAsDataURL(file);
}
