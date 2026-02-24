// finances.js - Finances page demo rendering

const currencyFormatter = new Intl.NumberFormat('en-NZ', {
  style: 'currency',
  currency: 'NZD',
  maximumFractionDigits: 0
});

function formatCurrency(value) {
  return currencyFormatter.format(value);
}

function formatSignedCurrency(value) {
  const abs = Math.abs(value);
  const formatted = formatCurrency(abs);
  return value < 0 ? `-${formatted}` : formatted;
}

function loadAccountsFromStorage() {
  const stored = localStorage.getItem('financesAccounts');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      return null;
    }
  }
  return null;
}

function saveAccountsToStorage(accounts) {
  localStorage.setItem('financesAccounts', JSON.stringify(accounts));
}

function renderSummary() {
  const data = window.financesDemoData;
  const summary = data.netWorthSummary;
  const accounts = loadAccountsFromStorage() || data.accounts;

  document.getElementById('net-worth-total').textContent = formatCurrency(summary.total).replace('$', '');
  document.getElementById('net-worth-change').textContent = `+${formatCurrency(summary.change)} ${summary.changePeriod}`;
  document.getElementById('net-worth-updated').textContent = summary.updated;
  document.getElementById('net-worth-coverage').textContent = `Accounts connected: ${accounts.length}`;

  const breakdownRow = document.getElementById('net-worth-breakdown');
  breakdownRow.innerHTML = summary.breakdown.map(item => {
    const isNegative = item.value < 0;
    return `
      <div class="chip ${isNegative ? 'chip-negative' : ''}">
        <span>${item.label}</span>
        <strong>${formatSignedCurrency(item.value)}</strong>
      </div>
    `;
  }).join('');
}

function renderSnapshots() {
  const container = document.getElementById('snapshot-grid');
  const data = window.financesDemoData.snapshots;

  container.innerHTML = data.map(item => {
    const valueText = item.valueText || formatCurrency(item.value);
    return `
      <a href="#${item.id}-section" class="card glass-medium snapshot-card">
        <div class="snapshot-title">${item.title}</div>
        <div class="snapshot-value">${valueText}</div>
        <div class="snapshot-note text-secondary">${item.note}</div>
      </a>
    `;
  }).join('');
}

function renderAccounts() {
  const container = document.getElementById('accounts-list');
  let accounts = loadAccountsFromStorage();

  if (!accounts) {
    accounts = window.financesDemoData.accounts;
    saveAccountsToStorage(accounts);
  }

  container.innerHTML = accounts.map(account => {
    const initials = account.provider.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase();
    const balanceClass = account.balance < 0 ? 'amount-negative' : 'amount-positive';
    return `
      <div class="account-row">
        <div class="account-avatar">${initials}</div>
        <div class="account-details">
          <div class="account-name">${account.provider} · ${account.accountName}</div>
          <div class="account-meta">•••• ${account.last4} · Last synced: ${account.syncedAt}</div>
        </div>
        <div class="account-balance ${balanceClass}">${formatSignedCurrency(account.balance)}</div>
      </div>
    `;
  }).join('');
}

function renderActivity(filter = 'all') {
  const container = document.getElementById('activity-list');
  const data = window.financesDemoData.transactions.filter(item => filter === 'all' || item.type === filter);

  container.innerHTML = data.map(item => {
    const amountClass = item.amount < 0 ? 'amount-negative' : 'amount-positive';
    return `
      <div class="activity-row">
        <div class="activity-icon">${item.icon}</div>
        <div class="activity-details">
          <div class="activity-title">${item.description}</div>
          <div class="activity-meta">${item.date}</div>
        </div>
        <div class="activity-amount ${amountClass}">${formatSignedCurrency(item.amount)}</div>
      </div>
    `;
  }).join('');
}

function bindActivityFilters() {
  const buttons = document.querySelectorAll('[data-activity-filter]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      renderActivity(button.dataset.activityFilter);
    });
  });
}

let netWorthChart = null;
let compositionChart = null;
let cashflowChart = null;
let spendingChart = null;

function initCharts() {
  const data = window.financesDemoData;
  const netWorthCtx = document.getElementById('net-worth-chart');
  const compositionCtx = document.getElementById('composition-chart');
  const cashflowCtx = document.getElementById('cashflow-chart');
  const spendingCtx = document.getElementById('spending-chart');

  const defaultRange = '6M';
  const rangeData = data.netWorthHistory[defaultRange];

  netWorthChart = new Chart(netWorthCtx, {
    type: 'line',
    data: {
      labels: rangeData.labels,
      datasets: [
        {
          label: 'Net worth',
          data: rangeData.values,
          borderColor: '#86efac',
          backgroundColor: 'rgba(134, 239, 172, 0.15)',
          tension: 0.35,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: '#86efac'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => formatCurrency(context.parsed.y)
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value)
          },
          grid: { color: 'rgba(255, 255, 255, 0.08)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });

  compositionChart = new Chart(compositionCtx, {
    type: 'doughnut',
    data: {
      labels: data.composition.labels,
      datasets: [
        {
          data: data.composition.values,
          backgroundColor: ['#86efac', '#60a5fa', '#fbbf24', '#34d399', '#ef4444'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#d1d5db', boxWidth: 12 } }
      }
    }
  });

  const netCashflow = data.cashflow.labels.map((_, index) => data.cashflow.income[index] - data.cashflow.spending[index]);

  cashflowChart = new Chart(cashflowCtx, {
    type: 'bar',
    data: {
      labels: data.cashflow.labels,
      datasets: [
        {
          label: 'Income',
          data: data.cashflow.income,
          backgroundColor: 'rgba(134, 239, 172, 0.7)',
          borderRadius: 6
        },
        {
          label: 'Spending',
          data: data.cashflow.spending,
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
          borderRadius: 6
        },
        {
          label: 'Net',
          data: netCashflow,
          type: 'line',
          borderColor: '#fbbf24',
          backgroundColor: 'rgba(251, 191, 36, 0.3)',
          tension: 0.35,
          fill: false,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#d1d5db' } }
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => formatCurrency(value)
          },
          grid: { color: 'rgba(255, 255, 255, 0.08)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  });

  spendingChart = new Chart(spendingCtx, {
    type: 'doughnut',
    data: {
      labels: data.spendingBreakdown.labels,
      datasets: [
        {
          data: data.spendingBreakdown.values,
          backgroundColor: ['#fbbf24', '#60a5fa', '#86efac', '#f97316', '#a78bfa', '#94a3b8'],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#d1d5db', boxWidth: 10 } }
      }
    }
  });
}

function bindTimeframeButtons() {
  const buttons = document.querySelectorAll('[data-range]');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      buttons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const range = button.dataset.range;
      const rangeData = window.financesDemoData.netWorthHistory[range];
      if (!rangeData) return;

      netWorthChart.data.labels = rangeData.labels;
      netWorthChart.data.datasets[0].data = rangeData.values;
      netWorthChart.update();
    });
  });
}

function bindConnectModal() {
  const openButton = document.getElementById('connect-more-btn');
  const modal = document.getElementById('connect-modal');
  const closeButton = document.getElementById('connect-modal-close');
  const cancelButton = document.getElementById('connect-modal-cancel');

  if (!openButton || !modal) return;

  function openModal() {
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  openButton.addEventListener('click', openModal);
  closeButton.addEventListener('click', closeModal);
  cancelButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  const connectButtons = document.querySelectorAll('[data-connect-provider]');
  connectButtons.forEach(button => {
    button.addEventListener('click', () => {
      const provider = button.dataset.connectProvider;
      const accountName = button.dataset.connectAccount;

      const newAccount = {
        provider,
        accountName,
        last4: String(Math.floor(1000 + Math.random() * 9000)),
        balance: Math.round(500 + Math.random() * 8500),
        syncedAt: 'Today 9:05am'
      };

      const accounts = loadAccountsFromStorage() || window.financesDemoData.accounts.slice();
      accounts.push(newAccount);
      saveAccountsToStorage(accounts);
      renderAccounts();
      renderSummary();
      showSuccess('Connected (demo)');
      closeModal();
    });
  });
}

function renderInvestmentsOverview() {
  const container = document.getElementById('holdings-list');
  const holdings = window.financesDemoData.holdings;

  container.innerHTML = holdings.map(item => `
    <div class="holding-row">
      <div>
        <div class="holding-name">${item.name}</div>
        <div class="holding-meta">Allocation: ${item.allocation}%</div>
      </div>
      <div class="holding-value">${formatCurrency(item.value)}</div>
    </div>
  `).join('');
}

function renderMortgageOverview() {
  const data = window.financesDemoData.mortgage;
  document.getElementById('mortgage-balance').textContent = formatCurrency(data.balance);
  document.getElementById('mortgage-rate').textContent = data.rate;
  document.getElementById('mortgage-payment').textContent = `${formatCurrency(data.paymentAmount)} due ${data.nextPaymentDate}`;
  document.getElementById('mortgage-term').textContent = `${data.remainingTermYears} years remaining`;
  document.getElementById('mortgage-payoff').textContent = data.projectedPayoff;
}

function bindReset() {
  const resetLink = document.getElementById('reset-demo-data');
  if (!resetLink) return;

  resetLink.addEventListener('click', (event) => {
    event.preventDefault();
    localStorage.removeItem('financesAccounts');
    showSuccess('Demo data reset');
    setTimeout(() => window.location.reload(), 400);
  });
}

function initFinancesPage() {
  if (!window.financesDemoData) return;
  renderSummary();
  renderSnapshots();
  renderAccounts();
  renderActivity('all');
  renderInvestmentsOverview();
  renderMortgageOverview();
  bindActivityFilters();
  bindTimeframeButtons();
  bindConnectModal();
  bindReset();
  initCharts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFinancesPage);
} else {
  initFinancesPage();
}
