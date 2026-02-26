// storage.js - LocalStorage utilities

const STORAGE_KEYS = {
  VISIBILITY_POINTS: 'visibilityPoints',
  WALLET_POINTS: 'walletPoints',
  SQUAD_POINTS: 'squadPoints',
  DONATED_POINTS: 'donatedPoints',
  VISIBILITY_ACTIVITY: 'visibilityActivity',
  USER_PROFILE: 'userProfile',
  BUDGET_DATA: 'budgetData',
  GOALS: 'goals',
  KIWISAVER_SELECTION: 'kiwiSaverSelection'
};

// Safe get from localStorage with fallback
function safeGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return fallback;
    return JSON.parse(value);
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return fallback;
  }
}

// Safe set to localStorage
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Error writing to localStorage:', e);
    return false;
  }
}

// Initialize defaults if not present
function initDefaults() {
  if (safeGet(STORAGE_KEYS.WALLET_POINTS) === null) {
    safeSet(STORAGE_KEYS.WALLET_POINTS, 150);
  }
  if (safeGet(STORAGE_KEYS.SQUAD_POINTS) === null) {
    safeSet(STORAGE_KEYS.SQUAD_POINTS, 0);
  }
  if (safeGet(STORAGE_KEYS.DONATED_POINTS) === null) {
    safeSet(STORAGE_KEYS.DONATED_POINTS, 0);
  }
  
  if (safeGet(STORAGE_KEYS.VISIBILITY_ACTIVITY) === null) {
    safeSet(STORAGE_KEYS.VISIBILITY_ACTIVITY, []);
  }
}

// Get wallet points
function getWalletPoints() {
  return safeGet(STORAGE_KEYS.WALLET_POINTS, 150);
}

// Set wallet points
function setWalletPoints(points) {
  return safeSet(STORAGE_KEYS.WALLET_POINTS, points);
}

// Get squad points
function getSquadPoints() {
  return safeGet(STORAGE_KEYS.SQUAD_POINTS, 0);
}

// Set squad points
function setSquadPoints(points) {
  return safeSet(STORAGE_KEYS.SQUAD_POINTS, points);
}

// Get donated points
function getDonatedPoints() {
  return safeGet(STORAGE_KEYS.DONATED_POINTS, 0);
}

// Set donated points
function setDonatedPoints(points) {
  return safeSet(STORAGE_KEYS.DONATED_POINTS, points);
}

// Get current visibility points (total of all categories)
function getVisibilityPoints() {
  return getWalletPoints() + getSquadPoints() + getDonatedPoints();
}

// Set visibility points (legacy - maps to wallet)
function setVisibilityPoints(points) {
  return setWalletPoints(points);
}

// Add points to a specific category
function addPointsToCategory(amount, category, label) {
  if (category === 'wallet') {
    const current = getWalletPoints();
    setWalletPoints(current + amount);
    addActivity('earn', label, amount, 'wallet');
    return true;
  } else if (category === 'squad') {
    const current = getSquadPoints();
    setSquadPoints(current + amount);
    addActivity('earn', label, amount, 'squad');
    return true;
  } else if (category === 'donated') {
    const current = getDonatedPoints();
    setDonatedPoints(current + amount);
    addActivity('earn', label, amount, 'donated');
    return true;
  }
  return false;
}

// Add activity log entry
function addActivity(type, label, delta, category = 'wallet') {
  const activity = safeGet(STORAGE_KEYS.VISIBILITY_ACTIVITY, []);
  activity.unshift({
    ts: Date.now(),
    type,
    label,
    delta,
    category
  });
  // Keep only last 50 entries
  if (activity.length > 50) {
    activity.length = 50;
  }
  safeSet(STORAGE_KEYS.VISIBILITY_ACTIVITY, activity);
}

// Get activity log
function getActivity() {
  return safeGet(STORAGE_KEYS.VISIBILITY_ACTIVITY, []);
}

// Deduct points and log activity
function deductPoints(amount, label) {
  const current = getWalletPoints();
  if (current >= amount) {
    setWalletPoints(current - amount);
    addActivity('spend', label, -amount, 'wallet');
    return true;
  }
  return false;
}

// Reset points to default
function resetPoints() {
  const currentWallet = getWalletPoints();
  const currentSquad = getSquadPoints();
  const currentDonated = getDonatedPoints();
  
  setWalletPoints(150);
  setSquadPoints(0);
  setDonatedPoints(0);
  
  const delta = (150 - currentWallet) + (0 - currentSquad) + (0 - currentDonated);
  if (delta !== 0) {
    addActivity('reset', 'Points reset to defaults', delta, 'wallet');
  }
}
