/**
 * Earnie's Journey V0 - UI Module
 * DOM rendering and interaction handling
 */

let currentGameState = null;
let currentWeekendEvent = null;
let giraffeElement = null;
let currentLocation = null;

function initializeUI(rootElement) {
  rootElement.innerHTML = `
    <div id="ej-container">
      <div id="ej-path-selection" class="ej-screen"></div>
      <div id="ej-game-screen" class="ej-screen" style="display: none;"></div>
      <div id="ej-event-modal" class="ej-modal" style="display: none;"></div>
      <div id="ej-summary-modal" class="ej-modal" style="display: none;"></div>
      <div id="ej-outcome-modal" class="ej-modal" style="display: none;"></div>
    </div>
  `;
  
  renderPathSelection();
}

function renderPathSelection() {
  const container = document.getElementById('ej-path-selection');
  
  container.innerHTML = `
    <div class="ej-path-select-container">
      <h1>🦒 Earnie's Journey V0</h1>
      <p class="ej-subtitle">Guide the giraffe through 12 weeks of life-building decisions</p>
      
      <div class="ej-path-cards">
        ${Object.keys(PATHS).map(pathKey => {
          const path = PATHS[pathKey];
          const pathEmojis = {
            'BUILDER': '🏗️',
            'EXPLORER': '🗺️',
            'CLOSER': '🎯'
          };
          return `
            <div class="ej-path-card" data-path="${pathKey.toLowerCase()}">
              <h3>${pathEmojis[pathKey]} ${path.name}</h3>
              <p class="ej-path-description">${path.description}</p>
              <div class="ej-path-goal">
                <strong>Win condition:</strong><br>
                ${path.goalDescription}
              </div>
              <button class="ej-btn ej-btn-primary ej-select-path-btn">Choose ${path.name} 🦒</button>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  // Attach event listeners
  document.querySelectorAll('.ej-select-path-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.ej-path-card');
      const pathKey = card.dataset.path;
      startNewGame(pathKey);
    });
  });
}

function startNewGame(pathKey) {
  const seed = Date.now();
  currentGameState = createGameState(seed, pathKey);
  
  logSessionStart(currentGameState);
  
  document.getElementById('ej-path-selection').style.display = 'none';
  document.getElementById('ej-game-screen').style.display = 'block';
  
  startWeek(currentGameState);
  logWeekStart(currentGameState);
  renderGameScreen();
}

function renderGameScreen() {
  const container = document.getElementById('ej-game-screen');
  
  const path = PATHS[currentGameState.selectedPath.toUpperCase()];
  
  container.innerHTML = `
    <div class="ej-game-header">
      <h2>Week ${currentGameState.weekNumber} / ${GAME_CONFIG.TOTAL_WEEKS}</h2>
      <div class="ej-path-badge">🦒 ${path.name}</div>
    </div>
    
    <div class="ej-meters-panel">
      ${renderMeters()}
    </div>
    
    <div class="ej-time-budget">
      <strong>⏱️ Time Budget:</strong> ${currentGameState.timeBudgetRemaining} / ${GAME_CONFIG.TIME_BUDGET_PER_WEEK}
    </div>
    
    ${currentGameState.ongoingEffects.length > 0 ? renderOngoingEffects() : ''}
    
    ${renderClarityTools()}
    
    <div class="ej-city-map" style="position: relative;">
      ${renderCityMap()}
    </div>
    
    <div class="ej-game-actions">
      <button class="ej-btn ej-btn-secondary" id="ej-end-week-btn" 
        ${currentGameState.currentWeekActions.length === 0 ? 'disabled' : ''}>
        🏁 End Week
      </button>
    </div>
  `;
  
  // Create or update giraffe character
  createGiraffeCharacter();
  
  // Attach event listeners
  document.getElementById('ej-end-week-btn').addEventListener('click', handleEndWeek);
  
  document.querySelectorAll('.ej-action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const actionId = e.currentTarget.dataset.actionId;
      const action = ACTIONS.find(a => a.id === actionId);
      handleActionClick(action);
    });
  });
}

function renderMeters() {
  const meters = currentGameState.meters;
  const meterIcons = {
    momentum: '🚀',
    stability: '⚓',
    options: '🎲',
    joy: '😊'
  };
  
  return `
    <div class="ej-meters">
      ${['momentum', 'stability', 'options', 'joy'].map(meter => `
        <div class="ej-meter">
          <div class="ej-meter-label">${meterIcons[meter]} ${meter.charAt(0).toUpperCase() + meter.slice(1)}</div>
          <div class="ej-meter-bar">
            <div class="ej-meter-fill ej-meter-${meter}" style="width: ${meters[meter]}%"></div>
          </div>
          <div class="ej-meter-value">${meters[meter]}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderOngoingEffects() {
  return `
    <div class="ej-ongoing-effects">
      <strong>Ongoing Effects:</strong>
      <div class="ej-effects-list">
        ${currentGameState.ongoingEffects.map(effect => `
          <div class="ej-effect-badge">
            ${effect.name} (${effect.remainingWeeks} weeks)
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderClarityTools() {
  const tools = [];
  
  if (currentGameState.forecastShieldActive) {
    tools.push('<span class="ej-clarity-badge">🛡️ Forecast Shield Active</span>');
  }
  if (currentGameState.plannerBuffActive && !currentGameState.plannerBuffUsed) {
    tools.push('<span class="ej-clarity-badge">⚡ Planner Buff Ready</span>');
  }
  if (currentGameState.costCheckActive) {
    tools.push('<span class="ej-clarity-badge">💰 Cost Check Active</span>');
  }
  if (currentGameState.scenarioSimActive) {
    tools.push('<span class="ej-clarity-badge">🎲 Scenario Sim Active</span>');
  }
  
  if (tools.length === 0) return '';
  
  return `
    <div class="ej-clarity-tools">
      ${tools.join('')}
    </div>
  `;
}

function renderCityMap() {
  const locationOrder = [
    LOCATIONS.GIG,
    LOCATIONS.WORKSHOP,
    LOCATIONS.PLANNER,
    LOCATIONS.MARKET,
    LOCATIONS.VAULT,
    LOCATIONS.LOUNGE
  ];
  
  const locationIcons = {
    [LOCATIONS.GIG]: '💼',
    [LOCATIONS.WORKSHOP]: '🔧',
    [LOCATIONS.PLANNER]: '📋',
    [LOCATIONS.MARKET]: '🛒',
    [LOCATIONS.VAULT]: '🏦',
    [LOCATIONS.LOUNGE]: '☕'
  };
  
  return locationOrder.map(location => {
    const actions = ACTIONS.filter(a => a.location === location);
    
    return `
      <div class="ej-location-panel" data-location="${location}">
        <h3 class="ej-location-title">${locationIcons[location]} ${location}</h3>
        <div class="ej-action-cards">
          ${actions.map(action => renderActionCard(action)).join('')}
        </div>
      </div>
    `;
  }).join('');
}

function renderActionCard(action) {
  const canAfford = action.timeCost <= currentGameState.timeBudgetRemaining;
  const disabled = !canAfford ? 'ej-card-disabled' : '';
  
  const effectsHTML = Object.entries(action.effects)
    .filter(([_, value]) => value !== 0)
    .map(([meter, value]) => {
      const sign = value > 0 ? '+' : '';
      const className = value > 0 ? 'ej-effect-positive' : 'ej-effect-negative';
      return `<span class="${className}">${sign}${value} ${meter}</span>`;
    })
    .join(' ');
  
  const riskBadge = action.riskBand !== 'neutral' 
    ? `<span class="ej-risk-badge ej-risk-${action.riskBand}">${action.riskBand}</span>` 
    : '';
  
  return `
    <div class="ej-action-card ${disabled}" data-action-id="${action.id}">
      <div class="ej-card-header">
        <div class="ej-card-title">${action.title}</div>
        <div class="ej-card-time">${action.timeCost}⏱️</div>
      </div>
      <div class="ej-card-effects">${effectsHTML}</div>
      ${riskBadge}
    </div>
  `;
}

function handleActionClick(action) {
  const result = applyAction(currentGameState, action);
  
  if (!result.success) {
    // Show error toast
    console.warn(result.error);
    return;
  }
  
  logActionSelected(currentGameState, action);
  
  // Animate giraffe moving to this location
  moveGiraffeToLocation(action.location);
  
  // Add sparkle effect to the action card
  const actionCard = document.querySelector(`[data-action-id="${action.id}"]`);
  if (actionCard) {
    actionCard.classList.add('sparkle-effect');
    setTimeout(() => actionCard.classList.remove('sparkle-effect'), 600);
  }
  
  // Re-render
  setTimeout(() => renderGameScreen(), 300);
}

function createGiraffeCharacter() {
  const cityMap = document.querySelector('.ej-city-map');
  if (!cityMap) return;
  
  // Remove old giraffe if exists
  if (giraffeElement) {
    giraffeElement.remove();
  }
  
  // Create new giraffe game piece
  giraffeElement = document.createElement('div');
  giraffeElement.className = 'ej-giraffe-character';
  giraffeElement.innerHTML = '🦒';
  giraffeElement.style.position = 'absolute';
  
  // Start at center of the map
  giraffeElement.style.top = '50%';
  giraffeElement.style.left = '50%';
  giraffeElement.style.transform = 'translate(-50%, -50%)';
  giraffeElement.style.pointerEvents = 'none';
  
  cityMap.appendChild(giraffeElement);
}

function moveGiraffeToLocation(location) {
  if (!giraffeElement) return;
  
  // Find the location panel for this location
  const locationPanels = document.querySelectorAll('.ej-location-panel');
  let targetPanel = null;
  
  locationPanels.forEach(panel => {
    const title = panel.querySelector('.ej-location-title');
    if (title && title.textContent.includes(location)) {
      targetPanel = panel;
    }
  });
  
  if (!targetPanel) return;
  
  // Remove active class from all panels
  locationPanels.forEach(p => p.classList.remove('active'));
  
  // Add active class to target building
  targetPanel.classList.add('active');
  currentLocation = location;
  
  // Calculate position - move to center of target building
  const cityMap = document.querySelector('.ej-city-map');
  const cityMapRect = cityMap.getBoundingClientRect();
  const panelRect = targetPanel.getBoundingClientRect();
  
  // Position at center of the building
  const offsetX = panelRect.left - cityMapRect.left + (panelRect.width / 2);
  const offsetY = panelRect.top - cityMapRect.top + (panelRect.height / 2);
  
  // Add walking/hopping animation
  giraffeElement.classList.add('walking');
  
  // Move giraffe piece to building
  giraffeElement.style.left = `${offsetX}px`;
  giraffeElement.style.top = `${offsetY}px`;
  
  // Play sound effect
  playMoveSound();
  
  // Remove walking class after animation completes
  setTimeout(() => {
    giraffeElement.classList.remove('walking');
  }, 800);
}

function playMoveSound() {
  // Create a simple beep sound using Web Audio API
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Silently fail if audio not supported
  }
}

function handleEndWeek() {
  if (currentGameState.currentWeekActions.length === 0) {
    return; // Should be disabled, but double-check
  }
  
  if (currentGameState.timeBudgetRemaining > 0) {
    logWeekEndedEarly(currentGameState);
  }
  
  // Select weekend event
  currentWeekendEvent = selectWeekendEvent(currentGameState);
  
  logWeekendEventShown(currentGameState, currentWeekendEvent);
  
  if (currentWeekendEvent) {
    showEventModal();
  } else {
    // Quiet weekend
    finalizeWeek();
  }
}

function showEventModal() {
  const modal = document.getElementById('ej-event-modal');
  const event = currentWeekendEvent;
  
  const eventEmoji = event.isNegative ? '⚠️' : '✨';
  
  modal.innerHTML = `
    <div class="ej-modal-content">
      <h2>${eventEmoji} Weekend Event</h2>
      <div class="ej-event-card ${event.isNegative ? 'ej-event-negative' : 'ej-event-positive'}">
        <h3>${event.name}</h3>
        <p>${event.description}</p>
        <div style="text-align: center; font-size: 48px; margin: 10px 0;">🦒</div>
      </div>
      
      <div class="ej-event-options">
        ${event.options.map((option, idx) => {
          const optionEmoji = idx === 0 ? '🅰️' : '🅱️';
          const effectsHTML = Object.entries(option.effects)
            .filter(([_, value]) => value !== 0)
            .map(([meter, value]) => {
              const sign = value > 0 ? '+' : '';
              const className = value > 0 ? 'ej-effect-positive' : 'ej-effect-negative';
              return `<span class="${className}">${sign}${value} ${meter}</span>`;
            })
            .join(' ');
          
          return `
            <button class="ej-btn ej-btn-event-option" data-option-id="${option.id}">
              <strong>${optionEmoji} ${option.label}</strong>
              <div class="ej-option-effects">${effectsHTML}</div>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  document.querySelectorAll('[data-option-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const optionId = e.currentTarget.dataset.optionId;
      handleEventOption(optionId);
    });
  });
}

function handleEventOption(optionId) {
  applyEventOption(currentGameState, currentWeekendEvent, optionId);
  logWeekendEventSelected(currentGameState, currentWeekendEvent, optionId);
  
  document.getElementById('ej-event-modal').style.display = 'none';
  
  finalizeWeek();
}

function finalizeWeek() {
  endWeek(currentGameState);
  logWeekSummary(currentGameState);
  
  if (currentGameState.isComplete) {
    logSessionEnd(currentGameState);
    showOutcomeModal();
  } else {
    // Start next week
    startWeek(currentGameState);
    logWeekStart(currentGameState);
    renderGameScreen();
  }
}

function showOutcomeModal() {
  const modal = document.getElementById('ej-outcome-modal');
  const path = PATHS[currentGameState.selectedPath.toUpperCase()];
  const metrics = computeDerivedMetrics(currentGameState);
  
  const won = currentGameState.outcome === 'win';
  
  modal.innerHTML = `
    <div class="ej-modal-content ej-outcome-content ${won ? 'win' : ''}">
      <h2>${won ? '🦒 Success! 🎉' : '🦒 Journey Complete 📊'}</h2>
      
      <div class="ej-outcome-message">
        ${won 
          ? `You achieved the <strong>${path.name}</strong> path goal!<br>The giraffe reaches new heights! 🦒✨` 
          : `You didn't quite reach the <strong>${path.name}</strong> path goal, but the giraffe learned valuable lessons along the way! 🦒📚`
        }
      </div>
      
      <div class="ej-final-meters">
        <h3>Final Metrics</h3>
        ${renderMeters()}
      </div>
      
      <div class="ej-tier-badge">
        <strong>Your Style:</strong> ${metrics.tier} 🦒
      </div>
      
      <div class="ej-stats-summary">
        <div>📊 Total Actions: ${metrics.totalActions}</div>
        <div>🔍 Clarity Tools Used: ${metrics.clarityToolCount}</div>
        <div>🎯 Strategy Shift Index: ${metrics.strategyShiftIndex.toFixed(1)}</div>
      </div>
      
      <div class="ej-download-buttons">
        <button class="ej-btn ej-btn-secondary" id="ej-download-csv-btn">📥 Download CSV</button>
        <button class="ej-btn ej-btn-secondary" id="ej-download-json-btn">📥 Download JSON</button>
      </div>
      
      <button class="ej-btn ej-btn-primary" id="ej-new-journey-btn">🦒 Start New Journey</button>
    </div>
  `;
  
  modal.style.display = 'flex';
  
  // Add confetti if won
  if (won) {
    createConfetti(modal);
  }
  
  document.getElementById('ej-download-csv-btn').addEventListener('click', () => {
    downloadCSV(currentGameState);
  });
  
  document.getElementById('ej-download-json-btn').addEventListener('click', () => {
    downloadJSON(currentGameState);
  });
  
  document.getElementById('ej-new-journey-btn').addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('ej-game-screen').style.display = 'none';
    document.getElementById('ej-path-selection').style.display = 'block';
    currentGameState = null;
    currentWeekendEvent = null;
    renderPathSelection();
  });
}

function createConfetti(container) {
  const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f38181', '#95e1d3'];
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      
      container.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 3500);
    }, i * 50);
  }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('earnies-journey-root');
  if (root) {
    initializeUI(root);
  }
});
