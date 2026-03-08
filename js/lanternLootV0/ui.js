/**
 * MOUNTING: Mounts into #lantern-loot-root container in standalone game HTML
 * 
 * SCAN FLOW: Two-step action:
 *   1. Player clicks "Scan" → costs applied, reveals full room info
 *   2. Modal appears with Explore/Sneak/Loot/Rest buttons + Cancel
 *   3. Player selects final action → resolution proceeds
 *   4. Cancel returns to action selection without second cost
 * 
 * TELEMETRY: Stored in telemetry object, saved to localStorage as "lanternLootV0:lastRun" on session_end
 * 
 * EXPORTS: Two buttons on end-of-run screen:
 *   - Download Telemetry JSON (full event log)
 *   - Download Room CSV (room-by-room breakdown)
 * 
 * CONSTANTS TUNING: Edit GAME_CONFIG in constants.js
 *   - BASE_TRIGGER, BASE_DAMAGE, LOOT values
 *   - ACTION_COSTS for difficulty balance
 *   - ENCOUNTER_CHANCE weighting
 * 
 * CHARACTER ANIMATIONS: CSS-driven animations in lanternLootV0.css
 *   - characterEnter: smooth fade-in of characters
 *   - damageFlash: red flash on damage taken
 *   - healGlow: green glow on healing
 *   - shake: damage shake effect
 *   - enemyAttack: attack animation
 */

function getEnemyType(floor, difficulty) {
  // Determine enemy type based on floor and difficulty
  const baseType = floor === 1 ? 'goblin' : floor === 2 ? 'skeleton' : floor === 3 ? 'spider' : 'ogre';
  if (difficulty >= 4) return 'ogre';
  if (floor >= 3 && difficulty >= 3) return 'spider';
  if (floor >= 2 && difficulty >= 3) return 'skeleton';
  return baseType;
}


let gameState = null;
let telemetry = null;
let currentRoomStartTime = 0;
let scanPending = false;
let scanCancelledThisRoom = false;

function initGame() {
  const seed = Math.floor(Math.random() * 4294967296);
  const rng = createRng(seed);
  
  const dungeon = generateDungeonLayout(rng);
  gameState = createGameState(rng, dungeon);
  gameState.seed = seed;
  gameState.rng = rng;
  
  telemetry = initTelemetry(gameState.sessionId, seed);
  
  logSessionStart(telemetry, gameState, getDungeonSummary(dungeon));
  
  render();
}

function render() {
  const root = document.getElementById('lantern-loot-root');
  if (!root) return;
  
  root.innerHTML = '';
  
  if (!gameState.isAlive) {
    renderEndOfRun(root);
  } else if (gameState.floor > GAME_CONFIG.FLOORS) {
    // Won!
    gameState.outcome = 'win';
    renderEndOfRun(root);
  } else if (gameState.roomIndex === 0) {
    // Start of floor
    renderFloorStart(root);
  } else if (gameState.currentRoomResolved && gameState.roomIndex < GAME_CONFIG.ROOMS_PER_FLOOR) {
    // Show resolution feedback
    renderResolutionFeedback(root);
  } else if (gameState.roomIndex < GAME_CONFIG.ROOMS_PER_FLOOR) {
    // In-room gameplay
    renderRoom(root);
  } else if (gameState.roomIndex === GAME_CONFIG.ROOMS_PER_FLOOR) {
    // End of floor
    renderFloorEnd(root);
  }
}

function renderFloorStart(root) {
  const container = document.createElement('div');
  container.className = 'll-screen ll-floor-start';
  
  const header = document.createElement('div');
  header.className = 'll-header';
  header.innerHTML = `
    <h1>Floor ${gameState.floor}/${GAME_CONFIG.FLOORS}</h1>
    <p>Descend deeper into the dungeon...</p>
  `;
  container.appendChild(header);
  
  // Character visual
  const charDiv = document.createElement('div');
  charDiv.className = 'll-character';
  const charSprite = document.createElement('div');
  charSprite.className = 'll-character-sprite';
  charSprite.innerHTML = getPlayerCharacterSVG();
  charDiv.appendChild(charSprite);
  
  const lantern = document.createElement('div');
  lantern.className = 'll-lantern';
  lantern.innerHTML = `<div style="width: 100%; height: 100%; background: radial-gradient(circle, #ffff00, #ffa500); border-radius: 50%; box-shadow: 0 0 15px #ffd700;"></div>`;
  charDiv.appendChild(lantern);
  
  container.appendChild(charDiv);
  
  // Stats
  const statsBanner = document.createElement('div');
  statsBanner.className = 'll-stats-banner';
  statsBanner.innerHTML = `
    <div class="ll-stat">
      <span class="ll-stat-label">Health</span>
      <div class="ll-bar">
        <div class="ll-bar-fill ll-health" style="width: ${gameState.health}%"></div>
      </div>
      <span class="ll-stat-value">${gameState.health}/100</span>
    </div>
    <div class="ll-stat">
      <span class="ll-stat-label">Stamina</span>
      <div class="ll-bar">
        <div class="ll-bar-fill ll-stamina" style="width: ${gameState.stamina}%"></div>
      </div>
      <span class="ll-stat-value">${gameState.stamina}/100</span>
    </div>
    <div class="ll-stat">
      <span class="ll-stat-label">Light</span>
      <div class="ll-bar">
        <div class="ll-bar-fill ll-light" style="width: ${gameState.light}%"></div>
      </div>
      <span class="ll-stat-value">${gameState.light}/100</span>
    </div>
    <div class="ll-stat">
      <span class="ll-stat-label">Loot</span>
      <span class="ll-stat-value ll-loot-value">${gameState.loot}</span>
    </div>
  `;
  container.appendChild(statsBanner);
  
  const btn = document.createElement('button');
  btn.className = 'll-btn ll-btn-primary';
  btn.textContent = `Enter Floor ${gameState.floor}`;
  btn.addEventListener('click', startFloor);
  container.appendChild(btn);
  
  root.appendChild(container);
}

function renderRoom(root) {
  const roomInfo = getVisibleRoomInfo(gameState, gameState.floor, gameState.roomIndex);
  
  // Safety check - should not happen, but prevents crashes
  if (!roomInfo) {
    gameState.currentRoomResolved = false;
    gameState.roomIndex += 1;
    render();
    return;
  }
  
  const container = document.createElement('div');
  container.className = 'll-screen ll-room';
  
  // Header with floor/room and stats
  const header = document.createElement('div');
  header.className = 'll-header';
  header.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
      <div>
        <h1>Floor ${gameState.floor} • Room ${gameState.roomIndex}</h1>
      </div>
      <div class="ll-backtrack-indicator">
        <span>🔙 ${gameState.backtrackTokens}</span>
      </div>
    </div>
  `;
  container.appendChild(header);
  
  // Stats banner
  const statsBanner = document.createElement('div');
  statsBanner.className = 'll-stats-banner';
  statsBanner.innerHTML = `
    <div class="ll-stat">
      <span class="ll-stat-label">Health</span>
      <div class="ll-bar">
        <div class="ll-bar-fill ll-health" style="width: ${gameState.health}%"></div>
      </div>
      <span class="ll-stat-value">${gameState.health}/100</span>
    </div>
    <div class="ll-stat">
      <span class="ll-stat-label">Stamina</span>
      <div class="ll-bar">
        <div class="ll-bar-fill ll-stamina" style="width: ${gameState.stamina}%"></div>
      </div>
      <span class="ll-stat-value">${gameState.stamina}/100</span>
    </div>
    <div class="ll-stat">
      <span class="ll-stat-label">Light</span>
      <div class="ll-bar">
        <div class="ll-bar-fill ll-light" style="width: ${gameState.light}%"></div>
      </div>
      <span class="ll-stat-value">${gameState.light}/100</span>
    </div>
    <div class="ll-stat">
      <span class="ll-stat-label">Loot</span>
      <span class="ll-stat-value ll-loot-value">${gameState.loot}</span>
    </div>
  `;
  container.appendChild(statsBanner);
  
  // Room card
  const card = document.createElement('div');
  card.className = 'll-room-card';
  
  const flavourEl = document.createElement('p');
  flavourEl.className = 'll-flavour';
  flavourEl.textContent = roomInfo.visibleInfo.flavour;
  card.appendChild(flavourEl);
  
  if (roomInfo.visibleInfo.difficulty) {
    const diffEl = document.createElement('div');
    diffEl.className = 'll-difficulty';
    diffEl.innerHTML = '💀'.repeat(roomInfo.visibleInfo.difficulty);
    card.appendChild(diffEl);
  }
  
  if (roomInfo.visibleInfo.type) {
    const typeEl = document.createElement('p');
    typeEl.className = 'll-room-type';
    typeEl.textContent = `Type: ${roomInfo.visibleInfo.type}`;
    card.appendChild(typeEl);
  }
  
  // Character/encounter stage
  const stage = document.createElement('div');
  stage.className = 'll-encounter-stage';
  
  // Player character (always visible)
  const playerDiv = document.createElement('div');
  playerDiv.className = 'll-character ll-player-container';
  const playerSprite = document.createElement('div');
  playerSprite.className = 'll-character-sprite';
  playerSprite.innerHTML = getPlayerCharacterSVG();
  playerDiv.appendChild(playerSprite);
  
  const lantern = document.createElement('div');
  lantern.className = 'll-lantern';
  lantern.innerHTML = `<div style="width: 100%; height: 100%; background: radial-gradient(circle, #ffff00, #ffa500); border-radius: 50%; box-shadow: 0 0 15px #ffd700;"></div>`;
  playerDiv.appendChild(lantern);
  
  const playerLabel = document.createElement('div');
  playerLabel.className = 'll-character-name';
  playerLabel.textContent = 'You';
  playerDiv.appendChild(playerLabel);
  
  stage.appendChild(playerDiv);
  
  // Enemy/challenge based on room type
  if (roomInfo.type === GAME_CONFIG.ROOM_TYPES.ENEMY || 
      roomInfo.type === GAME_CONFIG.ROOM_TYPES.TRAP ||
      (roomInfo.type === GAME_CONFIG.ROOM_TYPES.TREASURE && Math.random() < 0.1)) {
    
    const vsLabel = document.createElement('div');
    vsLabel.className = 'll-vs-label';
    vsLabel.textContent = 'vs';
    stage.appendChild(vsLabel);
    
    const enemyDiv = document.createElement('div');
    enemyDiv.className = 'll-character ll-enemy-container';
    const enemySprite = document.createElement('div');
    enemySprite.className = 'll-character-sprite';
    
    const enemyType = getEnemyType(gameState.floor, roomInfo.difficulty);
    enemySprite.innerHTML = getEnemyCharacterSVG(roomInfo.difficulty, enemyType);
    enemyDiv.appendChild(enemySprite);
    
    const enemyLabel = document.createElement('div');
    enemyLabel.className = 'll-character-name';
    enemyLabel.textContent = enemyType === 'goblin' ? 'Goblin' : enemyType === 'skeleton' ? 'Skeleton' : enemyType === 'spider' ? 'Giant Spider' : 'Ogre';
    enemyDiv.appendChild(enemyLabel);
    
    stage.appendChild(enemyDiv);
  } else if (roomInfo.type === GAME_CONFIG.ROOM_TYPES.TREASURE) {
    const vsLabel = document.createElement('div');
    vsLabel.className = 'll-vs-label';
    vsLabel.textContent = '→';
    stage.appendChild(vsLabel);
    
    const treasureDiv = document.createElement('div');
    treasureDiv.className = 'll-character ll-treasure-visual';
    const treasureSprite = document.createElement('div');
    treasureSprite.className = 'll-character-sprite';
    treasureSprite.innerHTML = getTreasureVisualSVG();
    treasureDiv.appendChild(treasureSprite);
    
    const treasureLabel = document.createElement('div');
    treasureLabel.className = 'll-character-name';
    treasureLabel.textContent = 'Treasure';
    treasureDiv.appendChild(treasureLabel);
    
    stage.appendChild(treasureDiv);
  } else if (roomInfo.type === GAME_CONFIG.ROOM_TYPES.FOUNTAIN) {
    const vsLabel = document.createElement('div');
    vsLabel.className = 'll-vs-label';
    vsLabel.textContent = '→';
    stage.appendChild(vsLabel);
    
    const fountainDiv = document.createElement('div');
    fountainDiv.className = 'll-character';
    const fountainSprite = document.createElement('div');
    fountainSprite.className = 'll-character-sprite';
    fountainSprite.innerHTML = getFountainVisualSVG();
    fountainDiv.appendChild(fountainSprite);
    
    const fountainLabel = document.createElement('div');
    fountainLabel.className = 'll-character-name';
    fountainLabel.textContent = 'Fountain';
    fountainDiv.appendChild(fountainLabel);
    
    stage.appendChild(fountainDiv);
  } else if (roomInfo.type === GAME_CONFIG.ROOM_TYPES.TRAP) {
    const vsLabel = document.createElement('div');
    vsLabel.className = 'll-vs-label';
    vsLabel.textContent = '⚠️';
    stage.appendChild(vsLabel);
    
    const trapDiv = document.createElement('div');
    trapDiv.className = 'll-character';
    const trapSprite = document.createElement('div');
    trapSprite.className = 'll-character-sprite';
    trapSprite.innerHTML = getTrapVisualSVG();
    trapDiv.appendChild(trapSprite);
    
    const trapLabel = document.createElement('div');
    trapLabel.className = 'll-character-name';
    trapLabel.textContent = 'Trap';
    trapDiv.appendChild(trapLabel);
    
    stage.appendChild(trapDiv);
  } else {
    const vsLabel = document.createElement('div');
    vsLabel.className = 'll-vs-label';
    vsLabel.textContent = '...';
    stage.appendChild(vsLabel);
    
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'll-character';
    const emptySprite = document.createElement('div');
    emptySprite.className = 'll-character-sprite';
    emptySprite.innerHTML = getEmptyRoomVisualSVG();
    emptyDiv.appendChild(emptySprite);
    
    const emptyLabel = document.createElement('div');
    emptyLabel.className = 'll-character-name';
    emptyLabel.textContent = 'Empty';
    emptyDiv.appendChild(emptyLabel);
    
    stage.appendChild(emptyDiv);
  }
  
  card.appendChild(stage);
  container.appendChild(card);
  
  // Action buttons
  const actionPanel = document.createElement('div');
  actionPanel.className = 'll-action-panel';
  
  const actions = ['Explore', 'Sneak', 'Loot', 'Rest', 'Scan', 'Backtrack'];
  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'll-btn ll-btn-action';
    btn.textContent = action;
    
    if (action === 'Backtrack' && (gameState.roomIndex <= 1 || gameState.backtrackTokens === 0)) {
      btn.disabled = true;
    }
    
    btn.addEventListener('click', () => selectAction(action));
    actionPanel.appendChild(btn);
  });
  
  container.appendChild(actionPanel);
  root.appendChild(container);
  
  currentRoomStartTime = Date.now();
  scanPending = false;
  scanCancelledThisRoom = false;
  
  logRoomStart(telemetry, gameState, roomInfo, roomInfo);
}

function selectAction(action) {
  if (action === 'Scan') {
    handleScan();
  } else if (action === 'Backtrack') {
    handleBacktrack();
  } else {
    handleFinalAction(action);
  }
}

function handleScan() {
  // Step 1: Apply Scan costs
  const scanCosts = GAME_CONFIG.ACTION_COSTS.SCAN;
  gameState.light = Math.max(0, gameState.light + scanCosts.light);
  gameState.stamina = Math.max(0, gameState.stamina + scanCosts.stamina);
  
  logActionSelected(telemetry, gameState, 'Scan', Date.now() - currentRoomStartTime, true);
  
  // Step 2: Show reveal modal with final action options
  showScanModal();
}

function showScanModal() {
  const roomInfo = getRoomInfo(gameState.dungeon, gameState.floor, gameState.roomIndex);
  
  // Safety check - should not happen, but prevents crashes
  if (!roomInfo) {
    render();
    return;
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'll-modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'll-scan-modal';
  
  const title = document.createElement('h2');
  title.textContent = 'Room Details Revealed';
  modal.appendChild(title);
  
  const info = document.createElement('div');
  info.className = 'll-reveal-info';
  info.innerHTML = `
    <p><strong>Type:</strong> ${roomInfo.type}</p>
    <p><strong>Danger:</strong> ${'💀'.repeat(roomInfo.difficulty)}</p>
    <p>${FLAVOUR_HINTS[roomInfo.type][getLightBand(gameState.light)] || FLAVOUR_HINTS[roomInfo.type].Dark}</p>
  `;
  modal.appendChild(info);
  
  const prompt = document.createElement('p');
  prompt.className = 'll-modal-prompt';
  prompt.textContent = 'Now choose your final action:';
  modal.appendChild(prompt);
  
  const actions = ['Explore', 'Sneak', 'Loot', 'Rest'];
  const btnGroup = document.createElement('div');
  btnGroup.className = 'll-modal-actions';
  
  actions.forEach(action => {
    const btn = document.createElement('button');
    btn.className = 'll-btn ll-btn-action';
    btn.textContent = action;
    btn.addEventListener('click', () => {
      overlay.remove();
      handleFinalAction(action);
    });
    btnGroup.appendChild(btn);
  });
  
  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'll-btn ll-btn-secondary';
  cancelBtn.textContent = 'Cancel Scan';
  cancelBtn.addEventListener('click', () => {
    overlay.remove();
    logActionCancelled(telemetry, gameState, Date.now() - currentRoomStartTime);
    scanCancelledThisRoom = true;
    // Scan costs already applied; can't reverse
    render();
  });
  btnGroup.appendChild(cancelBtn);
  
  modal.appendChild(btnGroup);
  overlay.appendChild(modal);
  document.getElementById('lantern-loot-root').appendChild(overlay);
}

function handleBacktrack() {
  if (gameState.roomIndex <= 1 || gameState.backtrackTokens <= 0) {
    return;
  }
  
  const backtrackCosts = GAME_CONFIG.ACTION_COSTS.BACKTRACK;
  gameState.light = Math.max(0, gameState.light + backtrackCosts.light);
  gameState.stamina = Math.max(0, gameState.stamina + backtrackCosts.stamina);
  gameState.backtrackTokens -= 1;
  gameState.backtracksUsed += 1;
  
  logActionSelected(telemetry, gameState, 'Backtrack', Date.now() - currentRoomStartTime, false);
  
  // Return to previous room (reset resolution)
  gameState.roomIndex -= 1;
  gameState.currentRoomResolved = false;
  
  render();
}

function handleFinalAction(action) {
  logActionSelected(telemetry, gameState, action, Date.now() - currentRoomStartTime, false);
  
  const rng = gameState.rng;
  const outcome = resolveRoom(gameState, rng, action);
  
  if (outcome) {
    logRoomResolved(telemetry, gameState, outcome);
    gameState.roomsCleared += 1;
    
    // Clear reveals
    if (gameState.nextRoomRevealOverride) {
      gameState.nextRoomRevealOverride = false;
    }
    if (gameState.revealOverrideRooms > 0) {
      gameState.revealOverrideRooms -= 1;
    }
    
    render();
  }
}

function renderResolutionFeedback(root) {
  const lastResolution = telemetry.events.find(e => e.type === 'room_resolved' && e.floor === gameState.floor && e.roomIndex === gameState.roomIndex);
  
  const container = document.createElement('div');
  container.className = 'll-screen ll-resolution';
  
  // Character stage with animation
  const stage = document.createElement('div');
  stage.className = 'll-encounter-stage';
  
  // Player character with animation based on outcome
  const playerDiv = document.createElement('div');
  playerDiv.className = 'll-character ll-player-container';
  const playerSprite = document.createElement('div');
  playerSprite.className = 'll-character-sprite';
  
  // Apply damage/heal animation if applicable
  if (lastResolution?.deltas.health < 0) {
    playerSprite.classList.add('damage');
  } else if (lastResolution?.deltas.health > 0) {
    playerSprite.classList.add('healed');
  }
  
  playerSprite.innerHTML = getPlayerCharacterSVG();
  playerDiv.appendChild(playerSprite);
  
  const lantern = document.createElement('div');
  lantern.className = 'll-lantern';
  lantern.innerHTML = `<div style="width: 100%; height: 100%; background: radial-gradient(circle, #ffff00, #ffa500); border-radius: 50%; box-shadow: 0 0 15px #ffd700;"></div>`;
  playerDiv.appendChild(lantern);
  
  stage.appendChild(playerDiv);
  
  // Outcome label
  const outcomeLabel = document.createElement('div');
  outcomeLabel.className = 'll-vs-label';
  outcomeLabel.textContent = lastResolution?.deltas.health < 0 ? '💥' : '✨';
  stage.appendChild(outcomeLabel);
  
  container.appendChild(stage);
  
  const card = document.createElement('div');
  card.className = 'll-resolution-card';
  
  const outcomeEl = document.createElement('h2');
  outcomeEl.textContent = lastResolution?.outcomeLabel || 'Room complete';
  card.appendChild(outcomeEl);
  
  const deltasEl = document.createElement('div');
  deltasEl.className = 'll-action-feedback';
  
  if (lastResolution?.deltas.health !== 0) {
    const hDelta = document.createElement('div');
    if (lastResolution.deltas.health > 0) {
      hDelta.className = 'll-heal-indicator';
      hDelta.innerHTML = `❤️ +${lastResolution.deltas.health}`;
    } else {
      hDelta.className = 'll-damage-indicator';
      hDelta.innerHTML = `💔 ${lastResolution.deltas.health}`;
    }
    deltasEl.appendChild(hDelta);
  }
  
  if (lastResolution?.deltas.stamina !== 0) {
    const sDelta = document.createElement('div');
    if (lastResolution.deltas.stamina > 0) {
      sDelta.className = 'll-heal-indicator';
      sDelta.innerHTML = `⚡ +${lastResolution.deltas.stamina}`;
    } else {
      sDelta.className = 'll-damage-indicator';
      sDelta.innerHTML = `⚡ ${lastResolution.deltas.stamina}`;
    }
    deltasEl.appendChild(sDelta);
  }
  
  if (lastResolution?.deltas.light !== 0) {
    const lDelta = document.createElement('div');
    if (lastResolution.deltas.light > 0) {
      lDelta.className = 'll-heal-indicator';
      lDelta.innerHTML = `💡 +${lastResolution.deltas.light}`;
    } else {
      lDelta.className = 'll-damage-indicator';
      lDelta.innerHTML = `💡 ${lastResolution.deltas.light}`;
    }
    deltasEl.appendChild(lDelta);
  }
  
  if (lastResolution?.deltas.loot !== 0) {
    const lootDelta = document.createElement('div');
    if (lastResolution.deltas.loot > 0) {
      lootDelta.className = 'll-loot-indicator';
      lootDelta.innerHTML = `💰 +${lastResolution.deltas.loot}`;
    } else {
      lootDelta.className = 'll-damage-indicator';
      lootDelta.innerHTML = `💰 ${lastResolution.deltas.loot}`;
    }
    deltasEl.appendChild(lootDelta);
  }
  
  card.appendChild(deltasEl);
  
  const continueBtn = document.createElement('button');
  continueBtn.className = 'll-btn ll-btn-primary';
  continueBtn.textContent = 'Continue';
  continueBtn.addEventListener('click', () => {
    gameState.roomIndex += 1;
    gameState.currentRoomResolved = false;
    render();
  });
  card.appendChild(continueBtn);
  
  container.appendChild(card);
  root.appendChild(container);
}

function renderFloorEnd(root) {
  const container = document.createElement('div');
  container.className = 'll-screen ll-floor-end';
  
  const header = document.createElement('div');
  header.className = 'll-header';
  header.innerHTML = `<h1>Floor ${gameState.floor} Complete!</h1>`;
  container.appendChild(header);
  
  // Character visual - triumphant pose
  const charDiv = document.createElement('div');
  charDiv.className = 'll-character ll-character-victorious';
  const charSprite = document.createElement('div');
  charSprite.className = 'll-character-sprite';
  charSprite.innerHTML = getPlayerCharacterSVG();
  charDiv.appendChild(charSprite);
  container.appendChild(charDiv);
  
  const summary = document.createElement('p');
  summary.className = 'll-floor-summary';
  summary.textContent = 'You\'ve cleared Floor ' + gameState.floor + '. Choose an upgrade to help you descend further.';
  container.appendChild(summary);
  
  // Get upgrade options
  const upgradeOptions = getFloorUpgradeOptions(gameState.rng, gameState);
  
  const upgradeGrid = document.createElement('div');
  upgradeGrid.className = 'll-upgrade-grid';
  
  upgradeOptions.forEach(upgrade => {
    const card = document.createElement('div');
    card.className = 'll-upgrade-card';
    card.innerHTML = `
      <h3>${upgrade.name}</h3>
      <p>${upgrade.description}</p>
    `;
    card.addEventListener('click', () => {
      applyUpgrade(gameState, upgrade.id);
      logFloorUpgradeSelected(telemetry, gameState, upgrade.id, 0);
      
      gameState.floor += 1;
      gameState.roomIndex = 0;
      gameState.currentRoomResolved = false;
      render();
    });
    upgradeGrid.appendChild(card);
  });
  
  container.appendChild(upgradeGrid);
  root.appendChild(container);
}

function renderEndOfRun(root) {
  logSessionEnd(telemetry, gameState);
  
  // Save to localStorage
  localStorage.setItem('lanternLootV0:lastRun', JSON.stringify({
    gameState,
    telemetry
  }));
  
  // Get final metrics
  const sessionEndEvent = telemetry.events.find(e => e.type === 'session_end');
  const metrics = sessionEndEvent?.derivedMetrics || {};
  const tier = getTierLabel(metrics);
  
  const container = document.createElement('div');
  container.className = 'll-screen ll-end-of-run';
  
  const outcome = gameState.outcome === 'win' ? '🎉 Victory!' : '💀 Defeat';
  
  const endHeader = document.createElement('div');
  endHeader.className = 'll-end-header';
  endHeader.innerHTML = `
    <h1>${outcome}</h1>
    <h2>${tier}</h2>
  `;
  container.appendChild(endHeader);
  
  // Character visual - celebration or defeat
  const charDiv = document.createElement('div');
  charDiv.className = 'll-character';
  if (gameState.outcome === 'win') {
    charDiv.classList.add('ll-character-victorious');
  } else {
    charDiv.classList.add('ll-character-defeated');
  }
  const charSprite = document.createElement('div');
  charSprite.className = 'll-character-sprite';
  charSprite.innerHTML = getPlayerCharacterSVG();
  charDiv.appendChild(charSprite);
  container.appendChild(charDiv);
  
  const endStats = document.createElement('div');
  endStats.className = 'll-end-stats';
  endStats.innerHTML = `
    <div class="ll-stat-pair">
      <span>Final Loot:</span>
      <strong>${gameState.loot}</strong>
    </div>
    <div class="ll-stat-pair">
      <span>Floors Cleared:</span>
      <strong>${gameState.floor}/${GAME_CONFIG.FLOORS}</strong>
    </div>
    <div class="ll-stat-pair">
      <span>Rooms Cleared:</span>
      <strong>${gameState.roomsCleared}/${GAME_CONFIG.TOTAL_ROOMS}</strong>
    </div>
    <div class="ll-stat-pair">
      <span>Backtracks Used:</span>
      <strong>${gameState.backtracksUsed}/3</strong>
    </div>
    <div class="ll-stat-pair">
      <span>Clarity Seeking:</span>
      <strong>${(metrics.claritySeekingRate * 100).toFixed(0)}%</strong>
    </div>
    <div class="ll-stat-pair">
      <span>Rooms in Darkness:</span>
      <strong>${(metrics.percentRoomsInDark * 100).toFixed(0)}%</strong>
    </div>
  `;
  container.appendChild(endStats);
  
  const buttonGroup = document.createElement('div');
  buttonGroup.className = 'll-button-group';
  
  const newRunBtn = document.createElement('button');
  newRunBtn.className = 'll-btn ll-btn-primary';
  newRunBtn.textContent = 'New Run';
  newRunBtn.addEventListener('click', () => {
    gameState = null;
    telemetry = null;
    initGame();
  });
  buttonGroup.appendChild(newRunBtn);
  
  const csvBtn = document.createElement('button');
  csvBtn.className = 'll-btn ll-btn-secondary';
  csvBtn.textContent = 'Download Room CSV';
  csvBtn.addEventListener('click', () => {
    const csv = generateRoomCSV(gameState.sessionId, telemetry, gameState);
    downloadCSV(csv, `lantern-loot-${gameState.sessionId}.csv`);
  });
  buttonGroup.appendChild(csvBtn);
  
  const jsonBtn = document.createElement('button');
  jsonBtn.className = 'll-btn ll-btn-secondary';
  jsonBtn.textContent = 'Download Telemetry JSON';
  jsonBtn.addEventListener('click', () => {
    downloadJSON(telemetry, `lantern-loot-${gameState.sessionId}.json`);
  });
  buttonGroup.appendChild(jsonBtn);
  
  container.appendChild(buttonGroup);
  root.appendChild(container);
}

function startFloor() {
  gameState.roomIndex = 1;
  gameState.currentRoomResolved = false;
  render();
}

// Initialize game on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
