/**
 * Earnie's Journey V0 - Game Engine
 * Core game logic: action application, event resolution, ongoing effects, metrics
 */

function createGameState(seed, selectedPath) {
  const rng = createRng(seed);
  
  return {
    sessionId: `ej-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    seed: seed,
    rng: rng,
    selectedPath: selectedPath,
    weekNumber: 1,
    
    // Meters
    meters: { ...GAME_CONFIG.STARTING_METERS },
    
    // Time budget
    timeBudgetRemaining: GAME_CONFIG.TIME_BUDGET_PER_WEEK,
    
    // Flags
    forecastShieldActive: false,
    plannerBuffActive: false,
    costCheckActive: false,
    scenarioSimActive: false,
    plannerBuffUsed: false, // Track if buff was consumed this week
    
    // Ongoing effects
    ongoingEffects: [],
    
    // Delayed effects (one-time bonuses for next week)
    delayedEffects: [],
    
    // Per-week tracking for CSV
    weeklyLog: [],
    currentWeekActions: [],
    currentWeekStartMeters: { ...GAME_CONFIG.STARTING_METERS },
    
    // Telemetry
    telemetryEvents: [],
    
    // Outcome
    outcome: null,
    isComplete: false
  };
}

function clampMeters(meters) {
  return {
    momentum: Math.max(0, Math.min(100, meters.momentum)),
    stability: Math.max(0, Math.min(100, meters.stability)),
    options: Math.max(0, Math.min(100, meters.options)),
    joy: Math.max(0, Math.min(100, meters.joy))
  };
}

function applyMeterDeltas(meters, deltas) {
  return clampMeters({
    momentum: meters.momentum + (deltas.momentum || 0),
    stability: meters.stability + (deltas.stability || 0),
    options: meters.options + (deltas.options || 0),
    joy: meters.joy + (deltas.joy || 0)
  });
}

function startWeek(gameState) {
  // Apply ongoing effects at week start
  const metersBefore = { ...gameState.meters };
  
  gameState.ongoingEffects.forEach(effect => {
    gameState.meters = applyMeterDeltas(gameState.meters, effect.perWeek);
  });
  
  // Apply delayed effects (one-time bonuses from previous week actions)
  gameState.delayedEffects.forEach(effect => {
    gameState.meters = applyMeterDeltas(gameState.meters, effect);
  });
  gameState.delayedEffects = []; // Clear after applying
  
  // Decrement and expire ongoing effects
  gameState.ongoingEffects = gameState.ongoingEffects
    .map(effect => ({
      ...effect,
      remainingWeeks: effect.remainingWeeks - 1
    }))
    .filter(effect => effect.remainingWeeks > 0);
  
  // Reset week state
  gameState.timeBudgetRemaining = GAME_CONFIG.TIME_BUDGET_PER_WEEK;
  gameState.currentWeekActions = [];
  gameState.currentWeekStartMeters = { ...metersBefore };
  
  // Reset planner flags (they last one week)
  gameState.costCheckActive = false;
  gameState.scenarioSimActive = false;
  gameState.plannerBuffUsed = false;
  // forecastShieldActive persists until event resolution
}

function applyAction(gameState, action) {
  // Check if affordable
  if (action.timeCost > gameState.timeBudgetRemaining) {
    return { success: false, error: 'Not enough time' };
  }
  
  const metersBefore = { ...gameState.meters };
  
  // Calculate effects
  let effects = { ...action.effects };
  
  // Apply planner buff to first action if active
  if (gameState.plannerBuffActive && !gameState.plannerBuffUsed) {
    effects = {
      momentum: Math.round(effects.momentum * GAME_CONFIG.PLANNER_BUFF_MULTIPLIER),
      stability: Math.round(effects.stability * GAME_CONFIG.PLANNER_BUFF_MULTIPLIER),
      options: Math.round(effects.options * GAME_CONFIG.PLANNER_BUFF_MULTIPLIER),
      joy: Math.round(effects.joy * GAME_CONFIG.PLANNER_BUFF_MULTIPLIER)
    };
    gameState.plannerBuffUsed = true;
  }
  
  // Apply effects
  gameState.meters = applyMeterDeltas(gameState.meters, effects);
  
  // Apply time cost
  gameState.timeBudgetRemaining -= action.timeCost;
  
  // Handle clarity tool flags
  if (action.clarityTool) {
    switch (action.clarityTool) {
      case 'forecastShield':
        gameState.forecastShieldActive = true;
        break;
      case 'plannerBuff':
        gameState.plannerBuffActive = true; // Active next week
        break;
      case 'costCheck':
        gameState.costCheckActive = true;
        break;
      case 'scenarioSim':
        gameState.scenarioSimActive = true;
        break;
    }
  }
  
  // Handle ongoing effects
  if (action.ongoingEffect) {
    gameState.ongoingEffects.push({ ...action.ongoingEffect });
  }
  
  // Handle delayed effects
  if (action.delayedEffect) {
    gameState.delayedEffects.push({ ...action.delayedEffect });
  }
  
  // Remove one ongoing effect if action has that power
  if (action.removesOngoingEffect && gameState.ongoingEffects.length > 0) {
    // Remove the one with highest remaining weeks (most impactful)
    const sorted = [...gameState.ongoingEffects].sort((a, b) => b.remainingWeeks - a.remainingWeeks);
    const toRemove = sorted[0];
    gameState.ongoingEffects = gameState.ongoingEffects.filter(e => e !== toRemove);
  }
  
  // Track action
  gameState.currentWeekActions.push({
    actionId: action.id,
    location: action.location,
    timeCost: action.timeCost,
    tags: action.tags,
    metersBefore: metersBefore,
    metersAfter: { ...gameState.meters }
  });
  
  return { success: true };
}

function selectWeekendEvent(gameState) {
  const rng = gameState.rng;
  
  // 70% chance of event
  if (!rollChance(rng, GAME_CONFIG.EVENT_CHANCE)) {
    return null; // Quiet weekend
  }
  
  // Filter available events
  let availableEvents = [...EVENTS];
  
  // Remove Hidden Fee if Cost Check was used
  if (gameState.costCheckActive) {
    availableEvents = availableEvents.filter(e => !e.preventedByCostCheck);
  }
  
  // Weight events based on forecast shield and current state
  const weights = availableEvents.map(event => {
    let weight = 1.0;
    
    // Forecast shield reduces negative events, increases positive
    if (gameState.forecastShieldActive) {
      if (event.isNegative) {
        weight *= 0.4; // Reduce negative event chance
      } else {
        weight *= 1.6; // Increase positive event chance
      }
    }
    
    // Low joy increases burnout chance
    if (event.id === 'event_burnout' && gameState.meters.joy < 25) {
      weight *= 2.0;
    }
    
    return weight;
  });
  
  return randomChoiceWeighted(rng, availableEvents, weights);
}

function applyEventOption(gameState, event, optionId) {
  const option = event.options.find(o => o.id === optionId);
  if (!option) return;
  
  let effects = { ...option.effects };
  
  // Scenario sim reduces downside by 10% for negative deltas
  if (gameState.scenarioSimActive) {
    if (effects.momentum < 0) effects.momentum = Math.round(effects.momentum * (1 - GAME_CONFIG.SCENARIO_SIM_DOWNSIDE_REDUCTION));
    if (effects.stability < 0) effects.stability = Math.round(effects.stability * (1 - GAME_CONFIG.SCENARIO_SIM_DOWNSIDE_REDUCTION));
    if (effects.options < 0) effects.options = Math.round(effects.options * (1 - GAME_CONFIG.SCENARIO_SIM_DOWNSIDE_REDUCTION));
    if (effects.joy < 0) effects.joy = Math.round(effects.joy * (1 - GAME_CONFIG.SCENARIO_SIM_DOWNSIDE_REDUCTION));
  }
  
  gameState.meters = applyMeterDeltas(gameState.meters, effects);
  
  // Clear forecast shield after use
  gameState.forecastShieldActive = false;
}

function endWeek(gameState) {
  // Calculate week summary data
  const weekData = {
    weekNumber: gameState.weekNumber,
    metersStart: { ...gameState.currentWeekStartMeters },
    metersEnd: { ...gameState.meters },
    timeUsed: GAME_CONFIG.TIME_BUDGET_PER_WEEK - gameState.timeBudgetRemaining,
    unusedTime: gameState.timeBudgetRemaining,
    actions: [...gameState.currentWeekActions],
    ongoingEffectsCountStart: gameState.ongoingEffects.length + gameState.currentWeekActions.filter(a => ACTIONS.find(act => act.id === a.actionId)?.ongoingEffect).length,
    ongoingEffectsCountEnd: gameState.ongoingEffects.length
  };
  
  gameState.weeklyLog.push(weekData);
  
  // Advance week
  gameState.weekNumber += 1;
  
  // Check if game is complete
  if (gameState.weekNumber > GAME_CONFIG.TOTAL_WEEKS) {
    completeGame(gameState);
  }
}

function completeGame(gameState) {
  gameState.isComplete = true;
  
  // Evaluate path goal
  const path = PATHS[gameState.selectedPath.toUpperCase()];
  const won = path.winCondition(gameState.meters);
  
  gameState.outcome = won ? 'win' : 'lose';
}

function computeDerivedMetrics(gameState) {
  const totalActions = gameState.weeklyLog.reduce((sum, week) => sum + week.actions.length, 0);
  
  // Count action types across all weeks
  let clarityToolCount = 0;
  let safeCount = 0;
  let neutralCount = 0;
  let greedyCount = 0;
  let locationCounts = {
    [LOCATIONS.GIG]: 0,
    [LOCATIONS.WORKSHOP]: 0,
    [LOCATIONS.PLANNER]: 0,
    [LOCATIONS.MARKET]: 0,
    [LOCATIONS.VAULT]: 0,
    [LOCATIONS.LOUNGE]: 0
  };
  
  gameState.weeklyLog.forEach(week => {
    week.actions.forEach(action => {
      if (action.tags.includes('clarityTool')) clarityToolCount++;
      if (action.tags.includes('safe')) safeCount++;
      if (action.tags.includes('neutral')) neutralCount++;
      if (action.tags.includes('greedy')) greedyCount++;
      
      locationCounts[action.location]++;
    });
  });
  
  // Clarity seeking rate
  const claritySeekingRate = totalActions > 0 ? clarityToolCount / totalActions : 0;
  
  // Strategy shift index (location vector changes week to week)
  let strategyShiftIndex = 0;
  for (let i = 1; i < gameState.weeklyLog.length; i++) {
    const prevWeek = gameState.weeklyLog[i - 1];
    const currWeek = gameState.weeklyLog[i];
    
    const prevVec = {};
    const currVec = {};
    Object.keys(locationCounts).forEach(loc => {
      prevVec[loc] = prevWeek.actions.filter(a => a.location === loc).length;
      currVec[loc] = currWeek.actions.filter(a => a.location === loc).length;
    });
    
    const shift = Object.keys(locationCounts).reduce((sum, loc) => {
      return sum + Math.abs(currVec[loc] - prevVec[loc]);
    }, 0);
    
    strategyShiftIndex += shift;
  }
  
  // Determine tier based on dominant behavior
  let tier = 'The Adventurer';
  const maxLocation = Object.keys(locationCounts).reduce((max, loc) => 
    locationCounts[loc] > locationCounts[max] ? loc : max
  , LOCATIONS.GIG);
  
  if (clarityToolCount / totalActions > 0.2) {
    tier = 'The Planner';
  } else if (maxLocation === LOCATIONS.GIG && gameState.meters.momentum > 70) {
    tier = 'The Sprinter';
  } else if (maxLocation === LOCATIONS.VAULT && gameState.meters.stability > 70) {
    tier = 'The Stabiliser';
  } else if (maxLocation === LOCATIONS.WORKSHOP && gameState.meters.options > 70) {
    tier = 'The Explorer';
  }
  
  return {
    totalActions,
    clarityToolCount,
    safeCount,
    neutralCount,
    greedyCount,
    locationCounts,
    claritySeekingRate,
    strategyShiftIndex,
    tier
  };
}
