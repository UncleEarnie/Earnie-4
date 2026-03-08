/**
 * Earnie's Journey V2 - Engine
 * Enhanced with narrative and detailed feedback
 */

function createGameStateV2(seed, selectedPath) {
  const rng = createRng(seed);
  
  return {
    sessionId: `ej2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    seed: seed,
    rng: rng,
    selectedPath: selectedPath,
    weekNumber: 1,
    meters: { ...GAME_CONFIG_V2.STARTING_METERS },
    timeBudgetRemaining: GAME_CONFIG_V2.TIME_BUDGET_PER_WEEK,
    forecastShieldActive: false,
    plannerBuffActive: false,
    costCheckActive: false,
    scenarioSimActive: false,
    plannerBuffUsed: false,
    ongoingEffects: [],
    delayedEffects: [],
    weeklyLog: [],
    currentWeekActions: [],
    currentWeekStartMeters: { ...GAME_CONFIG_V2.STARTING_METERS },
    telemetryEvents: [],
    outcome: null,
    isComplete: false
  };
}

function clampMetersV2(meters) {
  return {
    momentum: Math.max(0, Math.min(100, meters.momentum)),
    stability: Math.max(0, Math.min(100, meters.stability)),
    options: Math.max(0, Math.min(100, meters.options)),
    joy: Math.max(0, Math.min(100, meters.joy))
  };
}

function applyMeterDeltasV2(meters, deltas) {
  return clampMetersV2({
    momentum: meters.momentum + (deltas.momentum || 0),
    stability: meters.stability + (deltas.stability || 0),
    options: meters.options + (deltas.options || 0),
    joy: meters.joy + (deltas.joy || 0)
  });
}

function startWeekV2(gameState) {
  const metersBefore = { ...gameState.meters };
  
  gameState.ongoingEffects.forEach(effect => {
    gameState.meters = applyMeterDeltasV2(gameState.meters, effect.perWeek);
  });
  
  gameState.delayedEffects.forEach(effect => {
    gameState.meters = applyMeterDeltasV2(gameState.meters, effect);
  });
  gameState.delayedEffects = [];
  
  gameState.ongoingEffects = gameState.ongoingEffects
    .map(effect => ({
      ...effect,
      remainingWeeks: effect.remainingWeeks - 1
    }))
    .filter(effect => effect.remainingWeeks > 0);
  
  gameState.timeBudgetRemaining = GAME_CONFIG_V2.TIME_BUDGET_PER_WEEK;
  gameState.currentWeekActions = [];
  gameState.currentWeekStartMeters = { ...metersBefore };
  
  gameState.costCheckActive = false;
  gameState.scenarioSimActive = false;
  gameState.plannerBuffUsed = false;
}

function applyActionV2(gameState, action) {
  if (action.timeCost > gameState.timeBudgetRemaining) {
    return { success: false, error: 'Not enough time' };
  }
  
  const metersBefore = { ...gameState.meters };
  let effects = { ...action.effects };
  
  if (gameState.plannerBuffActive && !gameState.plannerBuffUsed) {
    effects = {
      momentum: Math.round(effects.momentum * GAME_CONFIG_V2.PLANNER_BUFF_MULTIPLIER),
      stability: Math.round(effects.stability * GAME_CONFIG_V2.PLANNER_BUFF_MULTIPLIER),
      options: Math.round(effects.options * GAME_CONFIG_V2.PLANNER_BUFF_MULTIPLIER),
      joy: Math.round(effects.joy * GAME_CONFIG_V2.PLANNER_BUFF_MULTIPLIER)
    };
    gameState.plannerBuffUsed = true;
  }
  
  gameState.meters = applyMeterDeltasV2(gameState.meters, effects);
  gameState.timeBudgetRemaining -= action.timeCost;
  
  if (action.clarityTool) {
    switch (action.clarityTool) {
      case 'forecastShield':
        gameState.forecastShieldActive = true;
        break;
      case 'plannerBuff':
        gameState.plannerBuffActive = true;
        break;
      case 'costCheck':
        gameState.costCheckActive = true;
        break;
      case 'scenarioSim':
        gameState.scenarioSimActive = true;
        break;
    }
  }
  
  if (action.ongoingEffect) {
    gameState.ongoingEffects.push({ ...action.ongoingEffect });
  }
  
  if (action.delayedEffect) {
    gameState.delayedEffects.push({ ...action.delayedEffect });
  }
  
  if (action.removesOngoingEffect && gameState.ongoingEffects.length > 0) {
    const sorted = [...gameState.ongoingEffects].sort((a, b) => b.remainingWeeks - a.remainingWeeks);
    const toRemove = sorted[0];
    gameState.ongoingEffects = gameState.ongoingEffects.filter(e => e !== toRemove);
  }
  
  gameState.currentWeekActions.push({
    actionId: action.id,
    actionTitle: action.title,
    location: action.location,
    timeCost: action.timeCost,
    tags: action.tags,
    metersBefore: metersBefore,
    metersAfter: { ...gameState.meters }
  });
  
  return { success: true };
}

function selectWeekendEventV2(gameState) {
  const rng = gameState.rng;
  
  if (!rollChance(rng, GAME_CONFIG_V2.EVENT_CHANCE)) {
    return null;
  }
  
  let availableEvents = [...EVENTS_V2];
  
  if (gameState.costCheckActive) {
    availableEvents = availableEvents.filter(e => !e.preventedByCostCheck);
  }
  
  const weights = availableEvents.map(event => {
    let weight = 1.0;
    
    if (gameState.forecastShieldActive) {
      if (event.isNegative) {
        weight *= 0.4;
      } else {
        weight *= 1.6;
      }
    }
    
    if (event.id === 'event_burnout' && gameState.meters.joy < 25) {
      weight *= 2.0;
    }
    
    return weight;
  });
  
  return randomChoiceWeighted(rng, availableEvents, weights);
}

function applyEventOptionV2(gameState, event, optionId) {
  const option = event.options.find(o => o.id === optionId);
  if (!option) return;
  
  let effects = { ...option.effects };
  
  if (gameState.scenarioSimActive) {
    if (effects.momentum < 0) effects.momentum = Math.round(effects.momentum * (1 - GAME_CONFIG_V2.SCENARIO_SIM_DOWNSIDE_REDUCTION));
    if (effects.stability < 0) effects.stability = Math.round(effects.stability * (1 - GAME_CONFIG_V2.SCENARIO_SIM_DOWNSIDE_REDUCTION));
    if (effects.options < 0) effects.options = Math.round(effects.options * (1 - GAME_CONFIG_V2.SCENARIO_SIM_DOWNSIDE_REDUCTION));
    if (effects.joy < 0) effects.joy = Math.round(effects.joy * (1 - GAME_CONFIG_V2.SCENARIO_SIM_DOWNSIDE_REDUCTION));
  }
  
  gameState.meters = applyMeterDeltasV2(gameState.meters, effects);
  gameState.forecastShieldActive = false;
}

function endWeekV2(gameState) {
  const weekData = {
    weekNumber: gameState.weekNumber,
    metersStart: { ...gameState.currentWeekStartMeters },
    metersEnd: { ...gameState.meters },
    timeUsed: GAME_CONFIG_V2.TIME_BUDGET_PER_WEEK - gameState.timeBudgetRemaining,
    unusedTime: gameState.timeBudgetRemaining,
    actions: [...gameState.currentWeekActions]
  };
  
  gameState.weeklyLog.push(weekData);
  gameState.weekNumber += 1;
  
  if (gameState.weekNumber > GAME_CONFIG_V2.TOTAL_WEEKS) {
    completeGameV2(gameState);
  }
}

function completeGameV2(gameState) {
  gameState.isComplete = true;
  
  const path = PATHS_V2[gameState.selectedPath.toUpperCase()];
  const won = path.winCondition(gameState.meters);
  
  gameState.outcome = won ? 'win' : 'lose';
}
