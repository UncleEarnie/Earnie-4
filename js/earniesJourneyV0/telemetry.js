/**
 * Earnie's Journey V0 - Telemetry System
 * Event logging and derived metrics for behavioral analytics
 */

function logEvent(gameState, eventType, eventData = {}) {
  const event = {
    timestamp: Date.now(),
    weekNumber: gameState.weekNumber,
    eventType: eventType,
    ...eventData
  };
  
  gameState.telemetryEvents.push(event);
}

function logSessionStart(gameState) {
  logEvent(gameState, 'session_start', {
    sessionId: gameState.sessionId,
    seed: gameState.seed,
    selectedPath: gameState.selectedPath
  });
}

function logWeekStart(gameState) {
  logEvent(gameState, 'week_start', {
    meters: { ...gameState.meters },
    timeBudget: gameState.timeBudgetRemaining,
    ongoingEffectsCount: gameState.ongoingEffects.length,
    clarityToolsActive: {
      forecastShield: gameState.forecastShieldActive,
      plannerBuff: gameState.plannerBuffActive,
      costCheck: gameState.costCheckActive,
      scenarioSim: gameState.scenarioSimActive
    }
  });
}

function logActionSelected(gameState, action) {
  logEvent(gameState, 'action_selected', {
    actionId: action.id,
    actionTitle: action.title,
    location: action.location,
    timeCost: action.timeCost,
    tags: action.tags,
    riskBand: action.riskBand,
    metersBefore: { ...gameState.currentWeekActions[gameState.currentWeekActions.length - 1]?.metersBefore || gameState.meters },
    metersAfter: { ...gameState.meters },
    timeRemainingAfter: gameState.timeBudgetRemaining,
    plannerBuffApplied: gameState.plannerBuffUsed && gameState.currentWeekActions.length === 1
  });
}

function logWeekEndedEarly(gameState) {
  logEvent(gameState, 'week_ended_early', {
    timeRemaining: gameState.timeBudgetRemaining,
    actionsThisWeek: gameState.currentWeekActions.length
  });
}

function logWeekendEventShown(gameState, event) {
  logEvent(gameState, 'weekend_event_shown', {
    eventId: event ? event.id : null,
    eventName: event ? event.name : 'Quiet Weekend',
    isNegative: event ? event.isNegative : false,
    forecastShieldWasActive: gameState.forecastShieldActive
  });
}

function logWeekendEventSelected(gameState, event, optionId) {
  if (!event) return; // Quiet weekend, no selection
  
  const option = event.options.find(o => o.id === optionId);
  
  logEvent(gameState, 'weekend_event_selected', {
    eventId: event.id,
    optionId: optionId,
    optionLabel: option.label,
    effects: option.effects,
    scenarioSimWasActive: gameState.scenarioSimActive
  });
}

function logWeekSummary(gameState) {
  const weekData = gameState.weeklyLog[gameState.weeklyLog.length - 1];
  
  logEvent(gameState, 'week_summary', {
    metersStart: weekData.metersStart,
    metersEnd: weekData.metersEnd,
    timeUsed: weekData.timeUsed,
    actionsCount: weekData.actions.length,
    meterDeltas: {
      momentum: weekData.metersEnd.momentum - weekData.metersStart.momentum,
      stability: weekData.metersEnd.stability - weekData.metersStart.stability,
      options: weekData.metersEnd.options - weekData.metersStart.options,
      joy: weekData.metersEnd.joy - weekData.metersStart.joy
    }
  });
}

function logSessionEnd(gameState) {
  const metrics = computeDerivedMetrics(gameState);
  
  logEvent(gameState, 'session_end', {
    outcome: gameState.outcome,
    finalMeters: { ...gameState.meters },
    totalWeeks: gameState.weekNumber - 1,
    ...metrics
  });
  
  // Store in localStorage
  try {
    localStorage.setItem('earniesJourneyV0:lastRun', JSON.stringify({
      sessionId: gameState.sessionId,
      timestamp: Date.now(),
      outcome: gameState.outcome,
      selectedPath: gameState.selectedPath,
      finalMeters: gameState.meters,
      metrics: metrics
    }));
  } catch (e) {
    console.warn('Failed to save session to localStorage:', e);
  }
}
