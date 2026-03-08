/**
 * Earnie's Journey V2 - Telemetry
 */

function logEventV2(gameState, eventType, eventData = {}) {
  const event = {
    timestamp: Date.now(),
    weekNumber: gameState.weekNumber,
    eventType: eventType,
    ...eventData
  };
  
  gameState.telemetryEvents.push(event);
}

function logSessionStartV2(gameState) {
  logEventV2(gameState, 'session_start', {
    sessionId: gameState.sessionId,
    seed: gameState.seed,
    selectedPath: gameState.selectedPath
  });
}

function logActionSelectedV2(gameState, action) {
  logEventV2(gameState, 'action_selected', {
    actionId: action.id,
    actionTitle: action.title,
    location: action.location,
    timeCost: action.timeCost
  });
}

function logWeekendEventV2(gameState, event, optionId) {
  if (!event) return;
  logEventV2(gameState, 'weekend_event', {
    eventId: event.id,
    eventName: event.name,
    optionSelected: optionId
  });
}

function logSessionEndV2(gameState) {
  logEventV2(gameState, 'session_end', {
    outcome: gameState.outcome,
    finalMeters: { ...gameState.meters },
    totalWeeks: gameState.weekNumber - 1
  });
  
  try {
    localStorage.setItem('earniesJourneyV2:lastRun', JSON.stringify({
      sessionId: gameState.sessionId,
      timestamp: Date.now(),
      outcome: gameState.outcome,
      selectedPath: gameState.selectedPath,
      finalMeters: gameState.meters
    }));
  } catch (e) {
    console.warn('Failed to save session:', e);
  }
}
