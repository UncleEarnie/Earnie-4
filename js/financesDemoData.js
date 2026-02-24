// financesDemoData.js - Demo data for Finances page (static only)

window.financesDemoData = {
  netWorthSummary: {
    total: 184650,
    change: 1240,
    changePeriod: 'this month',
    updated: 'Updated today, 9:12am',
    accountsConnected: 6,
    breakdown: [
      { label: 'Cash', value: 12450 },
      { label: 'Investments', value: 28600 },
      { label: 'KiwiSaver', value: 31850 },
      { label: 'Property', value: 192000 },
      { label: 'Mortgages and loans', value: -79400 },
      { label: 'Other', value: 7100 }
    ]
  },
  snapshots: [
    { id: 'cash', title: 'Cash', value: 12450, note: '+ $320 last 7 days' },
    { id: 'spending', title: 'Spending (30 days)', value: 2960, note: 'Down 6% vs last month' },
    { id: 'investments', title: 'Investments', value: 28600, note: '+ $410 today' },
    { id: 'kiwisaver', title: 'KiwiSaver', value: 31850, note: '+ $160 contributions this month' },
    { id: 'mortgage', title: 'Mortgage', value: 74200, note: 'Next payment: 28 Feb' },
    { id: 'savings', title: 'Savings rate', valueText: '18%', note: 'This month (simulated)' }
  ],
  netWorthHistory: {
    '1M': {
      labels: ['1 Feb', '8 Feb', '15 Feb', '22 Feb', '25 Feb'],
      values: [181900, 182600, 183100, 184200, 184650]
    },
    '6M': {
      labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      values: [172400, 174100, 176800, 179200, 182900, 184650]
    },
    '1Y': {
      labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
      values: [160800, 162100, 165300, 167900, 169400, 171600, 172400, 174100, 176800, 179200, 182900, 184650]
    },
    'All': {
      labels: ['2022', '2023', '2024', '2025', '2026'],
      values: [132400, 145200, 158900, 171600, 184650]
    }
  },
  composition: {
    labels: ['Cash', 'Investments', 'KiwiSaver', 'Property', 'Debt'],
    values: [12450, 28600, 31850, 192000, 79400]
  },
  cashflow: {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    income: [8400, 8200, 8600, 9100, 8450, 8700],
    spending: [6200, 6400, 6800, 7200, 6300, 6550]
  },
  spendingBreakdown: {
    labels: ['Groceries', 'Housing', 'Transport', 'Bills', 'Dining', 'Other'],
    values: [620, 980, 420, 360, 310, 270]
  },
  accounts: [
    { provider: 'ANZ', accountName: 'Everyday', last4: '1042', balance: 3250, syncedAt: 'Today 8:50am' },
    { provider: 'ANZ', accountName: 'Savings', last4: '8841', balance: 9200, syncedAt: 'Today 8:50am' },
    { provider: 'BNZ', accountName: 'Visa Credit', last4: '5521', balance: -820, syncedAt: 'Today 8:46am' },
    { provider: 'Simplicity', accountName: 'KiwiSaver', last4: '7724', balance: 31850, syncedAt: 'Today 8:30am' },
    { provider: 'Sharesies', accountName: 'Broker Account', last4: '0619', balance: 28600, syncedAt: 'Today 8:12am' },
    { provider: 'ANZ', accountName: 'Home Loan', last4: '9033', balance: -74200, syncedAt: 'Today 8:50am' }
  ],
  availableProviders: [
    { provider: 'ASB', accountName: 'Everyday', type: 'Bank' },
    { provider: 'Westpac', accountName: 'Savings', type: 'Bank' },
    { provider: 'Co-op Bank', accountName: 'Visa Credit', type: 'Bank' },
    { provider: 'Simplicity', accountName: 'KiwiSaver', type: 'KiwiSaver' },
    { provider: 'Kernel', accountName: 'Managed Fund', type: 'Investments' },
    { provider: 'InvestNow', accountName: 'Portfolio', type: 'Investments' }
  ],
  transactions: [
    { type: 'income', icon: '💼', description: 'Salary received', amount: 4200, date: '24 Feb' },
    { type: 'spending', icon: '🏠', description: 'Mortgage payment', amount: -2100, date: '23 Feb' },
    { type: 'investing', icon: '🌱', description: 'KiwiSaver contribution', amount: 160, date: '22 Feb' },
    { type: 'spending', icon: '🛒', description: 'Groceries', amount: -190, date: '21 Feb' },
    { type: 'transfers', icon: '💸', description: 'Transfer to savings', amount: -450, date: '20 Feb' },
    { type: 'spending', icon: '⚡', description: 'Power bill', amount: -145, date: '18 Feb' },
    { type: 'investing', icon: '📈', description: 'Portfolio value change', amount: 410, date: '17 Feb' },
    { type: 'spending', icon: '⛽', description: 'Fuel', amount: -85, date: '16 Feb' },
    { type: 'income', icon: '🧾', description: 'Tax refund', amount: 380, date: '14 Feb' },
    { type: 'spending', icon: '🍽️', description: 'Dining out', amount: -120, date: '12 Feb' },
    { type: 'investing', icon: '🏦', description: 'Dividend received', amount: 96, date: '11 Feb' },
    { type: 'spending', icon: '🚌', description: 'Transport', amount: -64, date: '9 Feb' },
    { type: 'transfers', icon: '🔁', description: 'Transfer from savings', amount: 200, date: '8 Feb' }
  ],
  holdings: [
    { name: 'NZX 50 Index Fund', allocation: 38, value: 10800 },
    { name: 'Global ESG Fund', allocation: 26, value: 7400 },
    { name: 'Term Deposit', allocation: 20, value: 5700 },
    { name: 'Tech Growth Fund', allocation: 16, value: 4700 }
  ],
  mortgage: {
    balance: 74200,
    rate: '5.89% fixed',
    nextPaymentDate: '28 Feb',
    paymentAmount: 2100,
    remainingTermYears: 8,
    projectedPayoff: 'Jun 2033'
  }
};
