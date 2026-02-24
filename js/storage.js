// storage.js - LocalStorage utilities

const STORAGE_KEYS = {
  VISIBILITY_POINTS: 'visibilityPoints',
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
  if (safeGet(STORAGE_KEYS.VISIBILITY_POINTS) === null) {
    safeSet(STORAGE_KEYS.VISIBILITY_POINTS, 150);
  }
  
  if (safeGet(STORAGE_KEYS.VISIBILITY_ACTIVITY) === null) {
    safeSet(STORAGE_KEYS.VISIBILITY_ACTIVITY, []);
  }
}

// Get current visibility points
function getVisibilityPoints() {
  return safeGet(STORAGE_KEYS.VISIBILITY_POINTS, 150);
}

// Set visibility points
function setVisibilityPoints(points) {
  return safeSet(STORAGE_KEYS.VISIBILITY_POINTS, points);
}

// Add activity log entry
function addActivity(type, label, delta) {
  const activity = safeGet(STORAGE_KEYS.VISIBILITY_ACTIVITY, []);
  activity.unshift({
    ts: Date.now(),
    type,
    label,
    delta
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
  const current = getVisibilityPoints();
  if (current >= amount) {
    setVisibilityPoints(current - amount);
    addActivity('spend', label, -amount);
    return true;
  }
  return false;
}

// Reset points to default
function resetPoints() {
  const current = getVisibilityPoints();
  const delta = 150 - current;
  setVisibilityPoints(150);
  if (delta !== 0) {
    addActivity('reset', 'Points reset to 150', delta);
  }
}
