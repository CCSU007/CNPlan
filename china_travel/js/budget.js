/**
 * Budget Tracker — Interactive budget with Chart.js charts
 * Shows estimated vs actual costs, editable fields, pie + bar charts.
 */
let budgetChart = null;

function initBudget() {
  const container = document.getElementById('budget-container');
  if (!container) return;

  const cats = TRIP.budget.categories;

  container.innerHTML = `
    <div class="budget-grid">
      ${cats.map((cat, i) => {
        const saved = localStorage.getItem(`budget_actual_${i}`);
        const actualVal = saved !== null ? saved : '';
        return `
          <div class="budget-card">
            <h3>${cat.name}</h3>
            <div class="amt">
              <input
                type="number"
                class="amt-input"
                value="${actualVal}"
                placeholder="${cat.estimatedMin}–${cat.estimatedMax}"
                oninput="updateBudget(${i})"
                id="budget-input-${i}"
                min="0"
              />
              <span> ${cat.unit}</span>
            </div>
            <p>${cat.note}</p>
            <div style="font-size:.78rem;color:#94a3b8;margin-top:.2rem">
              Estimated: $${cat.estimatedMin}–$${cat.estimatedMax} ${cat.unit}
            </div>
          </div>
        `;
      }).join('')}
      <div class="budget-card budget-total">
        <h3 style="color:#f59e0b">💰 Estimated Total</h3>
        <div class="amt" style="color:#fff" id="budget-estimated-total">$${TRIP.budget.totalMin.toLocaleString()} – $${TRIP.budget.totalMax.toLocaleString()}</div>
        <p>${TRIP.budget.totalNote}</p>
      </div>
      <div class="chart-wrap">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:1rem">
          <h4 style="font-size:.9rem;margin-bottom:.5rem;color:#475569">📊 Estimated by Category</h4>
          <canvas id="budget-pie-chart" height="250"></canvas>
        </div>
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:1rem">
          <h4 style="font-size:.9rem;margin-bottom:.5rem;color:#475569">📈 Estimated vs Actual</h4>
          <canvas id="budget-bar-chart" height="250"></canvas>
        </div>
      </div>
    </div>
  `;

  renderBudgetCharts();
}

function updateBudget(index) {
  const input = document.getElementById(`budget-input-${index}`);
  if (input) {
    localStorage.setItem(`budget_actual_${index}`, input.value);
  }
  renderBudgetCharts();
}

function getActualValues() {
  return TRIP.budget.categories.map((_, i) => {
    const saved = localStorage.getItem(`budget_actual_${i}`);
    return saved !== null ? parseFloat(saved) || 0 : 0;
  });
}

function renderBudgetCharts() {
  const cats = TRIP.budget.categories;
  const labels = cats.map(c => c.name.replace(/^[^\s]+\s/, ''));
  const estimated = cats.map(c => (c.estimatedMin + c.estimatedMax) / 2);
  const actual = getActualValues();

  // Total actual
  const totalActual = actual.reduce((a, b) => a + b, 0);
  const totalEl = document.getElementById('budget-estimated-total');
  if (totalEl && totalActual > 0) {
    totalEl.textContent = `$${totalActual.toLocaleString()} (actual)`;
  }

  // Colors
  const colors = ['#6366f1', '#818cf8', '#a78bfa', '#c4b5fd', '#ddd6fe', '#e4e4e7'];

  // Pie chart
  const pieCtx = document.getElementById('budget-pie-chart');
  if (pieCtx) {
    if (budgetChart?.pie) budgetChart.pie.destroy();
    if (!budgetChart) budgetChart = {};
    budgetChart.pie = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: estimated,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
        },
      },
    });
  }

  // Bar chart
  const barCtx = document.getElementById('budget-bar-chart');
  if (barCtx) {
    if (budgetChart?.bar) budgetChart.bar.destroy();
    if (!budgetChart) budgetChart = {};
    budgetChart.bar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Estimated',
            data: estimated,
            backgroundColor: 'rgba(245,158,11,.6)',
            borderColor: '#f59e0b',
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: 'Actual',
            data: actual,
            backgroundColor: 'rgba(59,130,246,.6)',
            borderColor: '#3b82f6',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,.05)' } },
          x: { grid: { display: false } },
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } },
        },
      },
    });
  }
}
