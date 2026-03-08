/**
 * Market Garden V0 - Main Game UI and Controller
 * 
 * MOUNTING: Mounts into #market-garden-root container inside the main page
 * STARTING NEW SEASON: Click "New Season" button in end-of-season screen or click "Start Season" on launch
 * TELEMETRY: Stored in memory during play, saved to localStorage:marketGardenV0:lastRun on session end
 * EXPORTS: Click download buttons in end-of-season screen to get JSON/CSV
 * TUNING: Edit GAME_CONFIG in constants.js to adjust plant stats, weather probabilities, etc
 */

let gameState = null;
let rng = null;
let lockStart = null;

function getGrowthStage(growth) {
  if (growth < 35) return 'Seedling';
  if (growth < 80) return 'Growing';
  return 'Mature';
}

function getMoistureState(moisture) {
  if (moisture < 30) return 'Dry';
  if (moisture > 70) return 'Soaked';
  return 'OK';
}

function getPestState(pests) {
  if (pests < 25) return 'None';
  if (pests > 60) return 'Heavy';
  return 'Mild';
}

function renderHeader() {
  return `
    <div class="mg-header">
      <div class="mg-header-left">
        <h2 class="mg-title">Market Garden</h2>
        <div class="mg-week">Week ${gameState.weekNumber} / ${GAME_CONFIG.TOTAL_WEEKS}</div>
      </div>
      <div class="mg-header-right">
        <div class="mg-stat">
          <span class="mg-stat-label">🌾 Harvest</span>
          <span class="mg-stat-value">${gameState.tokens}</span>
        </div>
        <div class="mg-stat">
          <span class="mg-stat-label">⭐ Reputation</span>
          <span class="mg-stat-value">${gameState.reputation}</span>
        </div>
        <div class="mg-stat">
          <span class="mg-stat-label">🌱 Compost</span>
          <span class="mg-stat-value">${gameState.compostLevel}</span>
        </div>
      </div>
    </div>
  `;
}

function getWeatherText(outlook) {
  if (outlook === 'Clear') return '☀️ Sunny skies';
  if (outlook === 'Windy') return '💨 Dry winds';
  return '⛅ Dark clouds building';
}

function renderWeatherCard(outlook) {
  const weatherText = getWeatherText(outlook);
  const marketPref = randomChoice(rng, GAME_CONFIG.MARKET_PREFERENCES);
  
  return `
    <div class="mg-info-panel">
      <div class="mg-card glass-medium">
        <div class="mg-card-title">This Week's Outlook</div>
        <div class="mg-weather-text">${weatherText}</div>
        ${outlook === 'StormRisk' ? '<div class="mg-uncertainty">⚠️ Storm uncertain</div>' : ''}
      </div>
      <div class="mg-card glass-medium">
        <div class="mg-card-title">Market Loving</div>
        <div class="mg-market-pref">${GAME_CONFIG.PLANTS[marketPref[0]].emoji} ${marketPref[0]}</div>
        <div class="mg-market-pref">${GAME_CONFIG.PLANTS[marketPref[1]].emoji} ${marketPref[1]}</div>
      </div>
    </div>
  `;
}

function renderBedCard(bed) {
  const plant = GAME_CONFIG.PLANTS[bed.plantType];
  const growthStage = getGrowthStage(bed.growth);
  const moistureState = getMoistureState(bed.moisture);
  const pestState = getPestState(bed.pests);

  const healthPercent = Math.round(bed.health);
  const growthPercent = Math.round(bed.growth);

  let healthColor = '#86efac';
  if (bed.health < 40) healthColor = '#fca5a5';
  else if (bed.health < 70) healthColor = '#fbbf24';

  const moistureEmoji = moistureState === 'Dry' ? '🏜️' : moistureState === 'Soaked' ? '💧' : '💨';
  const pestEmoji = pestState === 'Heavy' ? '🐛🐛' : pestState === 'Mild' ? '🐛' : '✓';

  return `
    <div class="mg-bed-card" data-bed-index="${bed.bedIndex}">
      <div class="mg-bed-header">
        <div class="mg-plant-name">
          <span class="mg-plant-emoji">${plant.emoji}</span>
          <span>${bed.plantType}</span>
        </div>
        <div class="mg-plant-label">${plant.label}</div>
      </div>
      
      <div class="mg-bed-bars">
        <div class="mg-bar-group">
          <div class="mg-bar-label">Health</div>
          <div class="mg-bar-bg">
            <div class="mg-bar-fill" style="width: ${healthPercent}%; background-color: ${healthColor};"></div>
          </div>
          <div class="mg-bar-text">${healthPercent}</div>
        </div>
        
        <div class="mg-bar-group">
          <div class="mg-bar-label">Growth</div>
          <div class="mg-bar-bg">
            <div class="mg-bar-fill" style="width: ${growthPercent}%; background-color: #86efac;"></div>
          </div>
          <div class="mg-bar-text">${growthStage}</div>
        </div>
      </div>

      <div class="mg-bed-indicators">
        <span title="Pests">${pestEmoji}</span>
        <span title="Moisture">${moistureEmoji}</span>
      </div>
    </div>
  `;
}

function renderGardenGrid() {
  const beds = gameState.beds.map((bed) => renderBedCard(bed)).join('');
  return `<div class="mg-garden-grid">${beds}</div>`;
}

function renderActionPanel() {
  const actions = gameState.plannedActions;
  const slotHTML = [];

  for (let i = 0; i < GAME_CONFIG.ACTIONS_PER_WEEK; i++) {
    const action = actions[i];
    if (action) {
      let label = action.type;
      if (action.type === 'Replant') label = `Replant → ${action.plantChosen}`;
      if (action.type === 'Water' || action.type === 'Fertilise' || action.type === 'PestControl') {
        label = `${action.type} (Bed ${action.targetBedIndex})`;
      }
      slotHTML.push(`<div class="mg-action-slot filled">${label}<button class="mg-btn-remove-action" data-slot="${i}" aria-label="Remove action">✕</button></div>`);
    } else {
      slotHTML.push(`<div class="mg-action-slot empty">${i + 1}</div>`);
    }
  }

  return `
    <div class="mg-action-panel">
      <div class="mg-action-title">Actions (${actions.length}/${GAME_CONFIG.ACTIONS_PER_WEEK})</div>
      <div class="mg-action-slots">
        ${slotHTML.join('')}
      </div>
      
      <div class="mg-action-buttons">
        <button class="mg-action-btn" data-action="Water" title="Increase moisture, +3 health">💧 Water</button>
        <button class="mg-action-btn" data-action="Fertilise" title="Growth +6, Pests +6">🍖 Fertilise</button>
        <button class="mg-action-btn" data-action="PestControl" title="Pests -30, +4 health">🦟 Pest Control</button>
        <button class="mg-action-btn" data-action="Replant" title="Reset bed">🔄 Replant</button>
        <button class="mg-action-btn" data-action="Compost" title="Global: +1 growth/week">♻️ Compost</button>
        <button class="mg-action-btn" data-action="MarketDay" title="Harvest ready beds">🛒 Market Day</button>
      </div>

      <button class="mg-btn-lock-week ${gameState.plannedActions.length === 0 ? 'disabled' : ''}">
        🔒 Lock Week
      </button>
    </div>
  `;
}

function renderWeekStart() {
  return `
    <div class="mg-container">
      ${renderHeader()}
      
      <div class="mg-week-layout">
        <div class="mg-main-content">
          ${renderGardenGrid()}
        </div>
        
        <div class="mg-side-panel">
          ${renderWeatherCard(gameState.plannedActions.weatherOutlook || rollWeatherOutlook(rng, gameState.weekNumber))}
        </div>
      </div>
      
      ${renderActionPanel()}
    </div>
  `;
}

function renderSummaryModal(resolution) {
  const weatherEmoji = {
    Clear: '☀️',
    Windy: '💨',
    LightRain: '🌧️',
    Storm: '⛈️',
  };

  const eventText = {
    Aphids: '🐛 Aphid outbreak',
    FungalSpots: '🍄 Fungal spots',
    HelpfulNeighbour: '👥 Helpful neighbour',
    CompostDelivery: '📦 Compost delivery',
  };

  let eventLine = '';
  if (resolution.eventTriggered) {
    eventLine = `<div class="mg-event-line">${eventText[resolution.eventTriggered] || resolution.eventTriggered}</div>`;
  }

  let tokenLine = '';
  if (resolution.harvestTokensGained > 0) {
    tokenLine = `<div class="mg-harvest-line">🌾 +${resolution.harvestTokensGained} Harvest Tokens</div>`;
  }

  const repEmoji = resolution.reputationDelta >= 0 ? '📈' : '📉';
  const repLine = `<div class="mg-rep-line">${repEmoji} Reputation ${resolution.reputationDelta >= 0 ? '+' : ''}${resolution.reputationDelta}</div>`;

  return `
    <div class="mg-modal-overlay">
      <div class="mg-modal glass-heavy">
        <h3 class="mg-modal-title">Week ${gameState.weekNumber - 1} Summary</h3>
        
        <div class="mg-summary-content">
          <div class="mg-weather-result">${weatherEmoji[resolution.weatherResult]} ${resolution.weatherResult}</div>
          ${eventLine}
          ${tokenLine}
          ${repLine}
        </div>

        <button class="mg-btn-continue">Continue →</button>
      </div>
    </div>
  `;
}

function renderEndOfSeason() {
  const tier = determineTier(gameState.tokens, gameState.reputation);

  return `
    <div class="mg-container">
      <div class="mg-end-of-season">
        <h2 class="mg-end-title">Season Complete!</h2>
        
        <div class="mg-end-stats">
          <div class="mg-end-stat">
            <div class="mg-end-stat-label">Harvest Tokens</div>
            <div class="mg-end-stat-value">${gameState.tokens}</div>
          </div>
          <div class="mg-end-stat">
            <div class="mg-end-stat-label">Reputation</div>
            <div class="mg-end-stat-value">${gameState.reputation}</div>
          </div>
        </div>

        <div class="mg-tier-box">
          <div class="mg-tier-label">Garden Tier</div>
          <div class="mg-tier-name">${tier}</div>
        </div>

        <div class="mg-end-actions">
          <button class="mg-btn-primary" id="btn-new-season">🌱 New Season</button>
          <button class="mg-btn-secondary" id="btn-download-json">📋 Download Telemetry JSON</button>
          <button class="mg-btn-secondary" id="btn-download-csv">📊 Download Weekly CSV</button>
        </div>
      </div>
    </div>
  `;
}

function attachEventListeners() {
  const root = document.getElementById('market-garden-root');

  // Action buttons
  root.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const actionType = e.target.getAttribute('data-action');

      if (actionType === 'Compost' || actionType === 'MarketDay') {
        // Global actions
        if (gameState.plannedActions.length < GAME_CONFIG.ACTIONS_PER_WEEK) {
          gameState.plannedActions.push({ type: actionType });
          logTelemetryEvent(gameState, 'action_selected', {
            weekNumber: gameState.weekNumber,
            actionType,
            targetBedIndex: null,
            plantChosen: null,
          });
          render();
        }
      } else if (actionType === 'Replant') {
        // Show plant picker
        showPlantPicker();
      } else {
        // Bed-targeted actions: Water, Fertilise, PestControl
        if (gameState.plannedActions.length < GAME_CONFIG.ACTIONS_PER_WEEK) {
          // Set a flag to wait for bed selection
          window.awaitingBedSelection = { actionType };
          root.querySelectorAll('.mg-bed-card').forEach((card) => {
            card.classList.add('selectable');
          });
        }
      }
    });
  });

  // Bed selection for targeted actions
  root.querySelectorAll('.mg-bed-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (!window.awaitingBedSelection) return;

      const bedIndex = parseInt(card.getAttribute('data-bed-index'), 10);
      const { actionType, plantChosen } = window.awaitingBedSelection;

      gameState.plannedActions.push({
        type: actionType,
        targetBedIndex: bedIndex,
        plantChosen: plantChosen || null,
      });

      logTelemetryEvent(gameState, 'action_selected', {
        weekNumber: gameState.weekNumber,
        actionType,
        targetBedIndex: bedIndex,
        plantChosen: plantChosen || null,
      });

      window.awaitingBedSelection = null;
      render();
    });
  });

  // Remove action buttons
  root.querySelectorAll('[data-slot]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const slot = parseInt(btn.getAttribute('data-slot'), 10);
      logTelemetryEvent(gameState, 'action_removed', {
        weekNumber: gameState.weekNumber,
        slotIndex: slot,
      });
      gameState.plannedActions.splice(slot, 1);
      render();
    });
  });

  // Lock week button
  const lockBtn = root.querySelector('.mg-btn-lock-week');
  if (lockBtn && !lockBtn.classList.contains('disabled')) {
    lockBtn.addEventListener('click', resolveWeekClick);
  }

  // End of season buttons
  const newSeasonBtn = root.querySelector('#btn-new-season');
  if (newSeasonBtn) {
    newSeasonBtn.addEventListener('click', startNewSeason);
  }

  const downloadJsonBtn = root.querySelector('#btn-download-json');
  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener('click', () => {
      const json = exportTelemetryJSON(gameState);
      downloadJSON(`garden-telemetry-${gameState.sessionId}.json`, json);
    });
  }

  const downloadCsvBtn = root.querySelector('#btn-download-csv');
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', () => {
      const csv = exportWeeklyCSV(gameState);
      downloadCSV(`garden-weekly-${gameState.sessionId}.csv`, csv);
    });
  }

  // Continue button in summary modal
  const continueBtn = root.querySelector('.mg-btn-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', continueToNextWeek);
  }
}

function showPlantPicker() {
  const plantOptions = Object.entries(GAME_CONFIG.PLANTS)
    .map(
      ([name, config]) =>
        `<button class="mg-plant-option" data-plant="${name}">${config.emoji} ${name}</button>`
    )
    .join('');

  const root = document.getElementById('market-garden-root');
  const picker = document.createElement('div');
  picker.className = 'mg-modal-overlay';
  picker.innerHTML = `
    <div class="mg-modal glass-heavy">
      <h4 class="mg-modal-title">Choose a plant to replant</h4>
      <div class="mg-plant-picker">
        ${plantOptions}
      </div>
    </div>
  `;

  root.appendChild(picker);

  picker.querySelectorAll('[data-plant]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const plant = e.target.getAttribute('data-plant');
      if (gameState.plannedActions.length < GAME_CONFIG.ACTIONS_PER_WEEK) {
        window.awaitingBedSelection = { actionType: 'Replant', plantChosen: plant };
        root.querySelectorAll('.mg-bed-card').forEach((card) => {
          card.classList.add('selectable');
        });

        picker.remove();
      }
    });
  });
}

function resolveWeekClick() {
  lockStart = Date.now();

  const plannedActions = gameState.plannedActions;
  logTelemetryEvent(gameState, 'week_locked', {
    weekNumber: gameState.weekNumber,
    actionsUsedCount: plannedActions.length,
    timeToLockMs: 0,
    unusedActions: GAME_CONFIG.ACTIONS_PER_WEEK - plannedActions.length,
    actionsSummary: {
      Water: plannedActions.filter((a) => a.type === 'Water').length,
      Fertilise: plannedActions.filter((a) => a.type === 'Fertilise').length,
      PestControl: plannedActions.filter((a) => a.type === 'PestControl').length,
      Replant: plannedActions.filter((a) => a.type === 'Replant').length,
      Compost: plannedActions.filter((a) => a.type === 'Compost').length,
      MarketDay: plannedActions.filter((a) => a.type === 'MarketDay').length,
    },
  });

  const resolution = resolveWeek(gameState, rng, plannedActions);
  gameState.plannedActions = [];

  // Show summary modal
  const root = document.getElementById('market-garden-root');
  root.innerHTML = renderSummaryModal(resolution);

  attachEventListeners();
}

function continueToNextWeek() {
  gameState.weekNumber++;

  if (gameState.weekNumber > GAME_CONFIG.TOTAL_WEEKS) {
    finalizeTelemetry(gameState);
    render();
  } else {
    gameState.plannedActions = [];
    render();
  }
}

function startNewSeason() {
  const seed = Math.floor(Math.random() * 4294967296);
  gameState = createGameState(seed);
  rng = createRng(seed);
  initTelemetry(gameState);
  render();
}

function render() {
  const root = document.getElementById('market-garden-root');

  if (gameState.weekNumber > GAME_CONFIG.TOTAL_WEEKS) {
    root.innerHTML = renderEndOfSeason();
  } else {
    root.innerHTML = renderWeekStart();
  }

  attachEventListeners();
}

function initGame() {
  const root = document.getElementById('market-garden-root');
  if (!root) return;

  const seed = Math.floor(Math.random() * 4294967296);
  gameState = createGameState(seed);
  rng = createRng(seed);
  initTelemetry(gameState);

  render();
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
