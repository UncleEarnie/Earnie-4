/**
 * Earnie's Journey V2 - Enhanced UI with Detailed Pop-ups
 * Narrative-focused with action descriptions and world context
 */

let currentGameStateV2 = null;
let currentWeekendEventV2 = null;
let giraffeElementV2 = null;

function initializeUIV2(rootElement) {
  rootElement.innerHTML = `
    <div id="ej2-container">
      <div id="ej2-path-selection" class="ej2-screen"></div>
      <div id="ej2-game-screen" class="ej2-screen" style="display: none;"></div>
      <div id="ej2-action-detail-modal" class="ej2-modal" style="display: none;"></div>
      <div id="ej2-event-modal" class="ej2-modal" style="display: none;"></div>
      <div id="ej2-outcome-modal" class="ej2-modal" style="display: none;"></div>
    </div>
  `;
  
  renderPathSelectionV2();
}

function renderPathSelectionV2() {
  const container = document.getElementById('ej2-path-selection');
  
  container.innerHTML = `
    <div class="ej2-path-select-container">
      <h1>🦒 Earnie's Journey: The Detailed Adventure</h1>
      <p class="ej2-subtitle">Rich narratives, meaningful choices, full control</p>
      
      <div class="ej2-path-cards">
        ${Object.keys(PATHS_V2).map(pathKey => {
          const path = PATHS_V2[pathKey];
          return `
            <div class="ej2-path-card" data-path="${pathKey.toLowerCase()}">
              <h3>${path.icon} ${path.name}</h3>
              <p class="ej2-path-description">${path.description}</p>
              <p class="ej2-path-narrative"><em>"${path.narrative}"</em></p>
              <div class="ej2-path-goal">
                <strong>Goal:</strong> ${path.goalDescription}
              </div>
              <button class="ej2-btn ej2-btn-primary ej2-select-path-btn">Choose ${path.name}</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  document.querySelectorAll('.ej2-select-path-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.ej2-path-card');
      const pathKey = card.dataset.path.toUpperCase();
      startNewGameV2(pathKey);
    });
  });
}

function startNewGameV2(pathKey) {
  const seed = Date.now();
  currentGameStateV2 = createGameStateV2(seed, pathKey);
  
  logSessionStartV2(currentGameStateV2);
  
  document.getElementById('ej2-path-selection').style.display = 'none';
  document.getElementById('ej2-game-screen').style.display = 'block';
  
  startWeekV2(currentGameStateV2);
  renderGameScreenV2();
}

function renderGameScreenV2() {
  const container = document.getElementById('ej2-game-screen');
  const path = PATHS_V2[currentGameStateV2.selectedPath.toUpperCase()];
  
  container.innerHTML = `
    <div class="ej2-header">
      <div class="ej2-header-left">
        <h2>📖 Week ${currentGameStateV2.weekNumber}/${GAME_CONFIG_V2.TOTAL_WEEKS}</h2>
        <p class="ej2-path-name">${path.icon} ${path.name}</p>
      </div>
      <div class="ej2-header-right">
        <div class="ej2-time-display">
          ⏱️ Time: ${currentGameStateV2.timeBudgetRemaining}/${GAME_CONFIG_V2.TIME_BUDGET_PER_WEEK}
        </div>
      </div>
    </div>
    
    <div class="ej2-meters-section">
      <h3>Your Metrics</h3>
      ${renderMetersV2()}
    </div>
    
    ${currentGameStateV2.ongoingEffects.length > 0 ? renderOngoingEffectsV2() : ''}
    
    <div class="ej2-world-map">
      <h3>🗺️ The City</h3>
      <div class="ej2-locations-grid">
        ${renderLocationsV2()}
      </div>
    </div>
    
    <div class="ej2-controls">
      <button class="ej2-btn ej2-btn-primary" id="ej2-end-week-btn" 
        ${currentGameStateV2.currentWeekActions.length === 0 ? 'disabled' : ''}>
        ➡️ End Week
      </button>
    </div>
  `;
  
  document.getElementById('ej2-end-week-btn').addEventListener('click', handleEndWeekV2);
  
  document.querySelectorAll('.ej2-action-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const actionId = e.currentTarget.dataset.actionId;
      const action = ACTIONS_V2.find(a => a.id === actionId);
      showActionDetailV2(action);
    });
  });
}

function renderMetersV2() {
  const m = currentGameStateV2.meters;
  return `
    <div class="ej2-meters">
      <div class="ej2-meter">
        <label>🚀 Momentum</label>
        <div class="ej2-meter-bar"><div class="ej2-meter-fill" style="width: ${m.momentum}%; background: #e74c3c;"></div></div>
        <span>${m.momentum}</span>
      </div>
      <div class="ej2-meter">
        <label>⚓ Stability</label>
        <div class="ej2-meter-bar"><div class="ej2-meter-fill" style="width: ${m.stability}%; background: #2ecc71;"></div></div>
        <span>${m.stability}</span>
      </div>
      <div class="ej2-meter">
        <label>🎲 Options</label>
        <div class="ej2-meter-bar"><div class="ej2-meter-fill" style="width: ${m.options}%; background: #f39c12;"></div></div>
        <span>${m.options}</span>
      </div>
      <div class="ej2-meter">
        <label>😊 Joy</label>
        <div class="ej2-meter-bar"><div class="ej2-meter-fill" style="width: ${m.joy}%; background: #9b59b6;"></div></div>
        <span>${m.joy}</span>
      </div>
    </div>
  `;
}

function renderOngoingEffectsV2() {
  return `
    <div class="ej2-ongoing-section">
      <h3>⏳ Ongoing Effects</h3>
      <div class="ej2-effects-list">
        ${currentGameStateV2.ongoingEffects.map(e => `
          <div class="ej2-effect-item">${e.name} (${e.remainingWeeks} weeks left)</div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderLocationsV2() {
  const locationIcons = {
    [LOCATIONS_V2.GIG]: '💼',
    [LOCATIONS_V2.WORKSHOP]: '🔧',
    [LOCATIONS_V2.PLANNER]: '📋',
    [LOCATIONS_V2.MARKET]: '🛒',
    [LOCATIONS_V2.VAULT]: '🏦',
    [LOCATIONS_V2.LOUNGE]: '☕'
  };
  
  return LOCATIONS_LIST.map(location => {
    const actions = ACTIONS_V2.filter(a => a.location === location);
    const icon = location === LOCATIONS_V2.GIG ? '💼' : 
                 location === LOCATIONS_V2.WORKSHOP ? '🔧' :
                 location === LOCATIONS_V2.PLANNER ? '📋' :
                 location === LOCATIONS_V2.MARKET ? '🛒' :
                 location === LOCATIONS_V2.VAULT ? '🏦' : '☕';
    
    return `
      <div class="ej2-location">
        <h4>${icon} ${location}</h4>
        <div class="ej2-actions">
          ${actions.map(action => `
            <button class="ej2-action-button" data-action-id="${action.id}"
              ${action.timeCost > currentGameStateV2.timeBudgetRemaining ? 'disabled' : ''}>
              <div class="ej2-action-title">${action.title}</div>
              <div class="ej2-action-time">⏱️ ${action.timeCost}</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function showActionDetailV2(action) {
  const modal = document.getElementById('ej2-action-detail-modal');
  const path = PATHS_V2[currentGameStateV2.selectedPath.toUpperCase()];
  
  const metersBefore = { ...currentGameStateV2.meters };
  const metersAfter = applyMeterDeltasV2(metersBefore, action.effects);
  
  modal.innerHTML = `
    <div class="ej2-modal-content ej2-action-detail">
      <div class="ej2-detail-header">
        <h2>${action.title}</h2>
        <p class="ej2-location-tag">${getLocationEmoji(action.location)} ${action.location}</p>
      </div>
      
      <div class="ej2-detail-body">
        <div class="ej2-section">
          <h3>📖 What Happens</h3>
          <p class="ej2-narrative">${action.detailedDescription}</p>
        </div>
        
        <div class="ej2-section">
          <h3>🌍 World Context</h3>
          <p class="ej2-narrative">${action.worldContext}</p>
        </div>
        
        <div class="ej2-section">
          <h3>💭 Consequences</h3>
          <p class="ej2-narrative">${action.consequences}</p>
        </div>
        
        <div class="ej2-section">
          <h3>📊 Impact on Meters</h3>
          <div class="ej2-meter-comparison">
            ${['momentum', 'stability', 'options', 'joy'].map(meter => {
              const delta = action.effects[meter] || 0;
              const sign = delta > 0 ? '+' : '';
              const color = delta > 0 ? '#2ecc71' : delta < 0 ? '#e74c3c' : '#95a5a6';
              return `
                <div class="ej2-meter-delta">
                  <span>${meter}</span>
                  <span style="color: ${color}; font-weight: bold;">${sign}${delta}</span>
                  <span class="ej2-before-after">${Math.round(metersBefore[meter])} → ${Math.round(metersAfter[meter])}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        ${action.ongoingEffect ? `
          <div class="ej2-section ej2-ongoing-warning">
            <h3>⏳ Ongoing Effect</h3>
            <p>${action.ongoingEffect.name} for ${action.ongoingEffect.remainingWeeks} weeks</p>
          </div>
        ` : ''}
        
        <div class="ej2-time-cost">
          <strong>⏱️ Time Cost:</strong> ${action.timeCost} / ${currentGameStateV2.timeBudgetRemaining} remaining
        </div>
      </div>
      
      <div class="ej2-detail-footer">
        <button class="ej2-btn ej2-btn-secondary" id="ej2-cancel-btn">← Back</button>
        <button class="ej2-btn ej2-btn-primary" id="ej2-confirm-btn" 
          ${action.timeCost > currentGameStateV2.timeBudgetRemaining ? 'disabled' : ''}>
          ✓ Take This Action
        </button>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  document.getElementById('ej2-cancel-btn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('ej2-confirm-btn').addEventListener('click', () => {
    handleActionConfirmV2(action);
  });
}

function handleActionConfirmV2(action) {
  const result = applyActionV2(currentGameStateV2, action);
  
  if (!result.success) {
    alert(result.error);
    return;
  }
  
  logActionSelectedV2(currentGameStateV2, action);
  
  document.getElementById('ej2-action-detail-modal').style.display = 'none';
  setTimeout(() => renderGameScreenV2(), 300);
}

function handleEndWeekV2() {
  if (currentGameStateV2.currentWeekActions.length === 0) return;
  
  currentWeekendEventV2 = selectWeekendEventV2(currentGameStateV2);
  
  if (currentWeekendEventV2) {
    showEventDetailV2(currentWeekendEventV2);
  } else {
    completeWeekV2();
  }
}

function showEventDetailV2(event) {
  const modal = document.getElementById('ej2-event-modal');
  const eventEmoji = event.isNegative ? '⚠️' : '✨';
  
  modal.innerHTML = `
    <div class="ej2-modal-content ej2-event-detail">
      <div class="ej2-event-header ${event.isNegative ? 'negative' : 'positive'}">
        <h2>${eventEmoji} ${event.name}</h2>
      </div>
      
      <div class="ej2-event-body">
        <p class="ej2-event-description">${event.description}</p>
        <p class="ej2-event-narrative"><em>${event.narrative}</em></p>
        
        <div class="ej2-event-options">
          <h3>How do you respond?</h3>
          ${event.options.map((option, idx) => {
            const optionEmoji = idx === 0 ? '🅰️' : '🅱️';
            const meterChanges = Object.entries(option.effects)
              .filter(([_, v]) => v !== 0)
              .map(([meter, value]) => {
                const sign = value > 0 ? '+' : '';
                const color = value > 0 ? '#2ecc71' : '#e74c3c';
                return `<span style="color: ${color};">${meter}: ${sign}${value}</span>`;
              })
              .join(', ');
            
            return `
              <button class="ej2-event-option-btn" data-option-id="${option.id}">
                <div class="ej2-option-header">${optionEmoji} ${option.label}</div>
                <div class="ej2-option-narrative">${option.narrative}</div>
                <div class="ej2-option-effects">${meterChanges}</div>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  document.querySelectorAll('[data-option-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const optionId = e.currentTarget.dataset.optionId;
      handleEventOptionV2(optionId);
    });
  });
}

function handleEventOptionV2(optionId) {
  applyEventOptionV2(currentGameStateV2, currentWeekendEventV2, optionId);
  logWeekendEventV2(currentGameStateV2, currentWeekendEventV2, optionId);
  
  document.getElementById('ej2-event-modal').style.display = 'none';
  completeWeekV2();
}

function completeWeekV2() {
  endWeekV2(currentGameStateV2);
  
  if (currentGameStateV2.isComplete) {
    logSessionEndV2(currentGameStateV2);
    showOutcomeV2();
  } else {
    startWeekV2(currentGameStateV2);
    setTimeout(() => renderGameScreenV2(), 500);
  }
}

function showOutcomeV2() {
  const modal = document.getElementById('ej2-outcome-modal');
  const path = PATHS_V2[currentGameStateV2.selectedPath.toUpperCase()];
  const won = currentGameStateV2.outcome === 'win';
  
  modal.innerHTML = `
    <div class="ej2-modal-content ej2-outcome">
      <h2>${won ? '🦒 Victory!' : '🦒 Journey Complete'}</h2>
      
      <p class="ej2-outcome-message">
        ${won 
          ? `You achieved the <strong>${path.name}</strong> path! ${path.icon}<br>The giraffe has reached new heights!`
          : `Your journey as the ${path.name} taught you valuable lessons. ${path.icon}`
        }
      </p>
      
      <div class="ej2-final-metrics">
        ${renderMetersV2()}
      </div>
      
      <button class="ej2-btn ej2-btn-primary" id="ej2-new-game-btn">
        🦒 Start New Journey
      </button>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  document.getElementById('ej2-new-game-btn').addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('ej2-game-screen').style.display = 'none';
    document.getElementById('ej2-path-selection').style.display = 'block';
    currentGameStateV2 = null;
    currentWeekendEventV2 = null;
    renderPathSelectionV2();
  });
}

function getLocationEmoji(location) {
  const emojis = {
    [LOCATIONS_V2.GIG]: '💼',
    [LOCATIONS_V2.WORKSHOP]: '🔧',
    [LOCATIONS_V2.PLANNER]: '📋',
    [LOCATIONS_V2.MARKET]: '🛒',
    [LOCATIONS_V2.VAULT]: '🏦',
    [LOCATIONS_V2.LOUNGE]: '☕'
  };
  return emojis[location] || '📍';
}

