/**
 * Market Garden V0 - Telemetry and Data Export
 */

function initTelemetry(gameState) {
  logTelemetryEvent(gameState, 'session_start', {
    sessionId: gameState.sessionId,
    seed: gameState.seed,
    initialBeds: gameState.beds.map((bed) => bed.plantType),
  });
}

function finalizeTelemetry(gameState) {
  const metrics = computeDerivedMetrics(gameState);

  logTelemetryEvent(gameState, 'session_end', {
    sessionId: gameState.sessionId,
    totals: {
      tokens: gameState.tokens,
      reputation: gameState.reputation,
      compostLevel: gameState.compostLevel,
      totalReplants: gameState.telemetryEvents.filter((e) => e.type === 'action_selected' && e.data.actionType === 'Replant').length,
      totalMarketDays: gameState.telemetryEvents.filter((e) => e.type === 'action_selected' && e.data.actionType === 'MarketDay').length,
      totalActionsUsed: gameState.telemetryEvents.filter((e) => e.type === 'action_selected').length,
    },
    metrics,
  });

  saveSessionToLocalStorage(gameState);
}

function saveSessionToLocalStorage(gameState) {
  const sessionData = {
    gameState: JSON.parse(JSON.stringify(gameState)),
    exportedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem('marketGardenV0:lastRun', JSON.stringify(sessionData));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

function computeDerivedMetrics(gameState) {
  const thrashIndex = gameState.telemetryEvents.filter(
    (e) => e.type === 'action_selected' && e.data.actionType === 'Replant'
  ).length;

  const stabilityActions = gameState.telemetryEvents.filter(
    (e) => e.type === 'action_selected' && ['Water', 'PestControl', 'Compost'].includes(e.data.actionType)
  ).length;

  const growthActions = gameState.telemetryEvents.filter(
    (e) => e.type === 'action_selected' && ['Fertilise', 'MarketDay'].includes(e.data.actionType)
  ).length;

  const stabilityBias = stabilityActions / Math.max(1, growthActions);
  const strategyShiftIndex = computeStrategyShiftIndex(gameState);
  const stressReactionIndex = computeStressReactionIndex(gameState);

  return {
    thrashIndex,
    stabilityBias: stabilityBias.toFixed(2),
    strategyShiftIndex: strategyShiftIndex.toFixed(2),
    stressReactionIndex: stressReactionIndex.toFixed(2),
  };
}

function computeStrategyShiftIndex(gameState) {
  const weeklyActionVectors = gameState.weekHistory.map((week) => {
    const summary = week.actionSummary;
    return [summary.Water, summary.Fertilise, summary.PestControl, summary.Replant, summary.Compost, summary.MarketDay];
  });

  let totalShift = 0;

  for (let i = 1; i < weeklyActionVectors.length; i++) {
    const prev = weeklyActionVectors[i - 1];
    const curr = weeklyActionVectors[i];

    let l1Distance = 0;
    for (let j = 0; j < prev.length; j++) {
      l1Distance += Math.abs(curr[j] - prev[j]);
    }

    totalShift += l1Distance;
  }

  return totalShift;
}

function computeStressReactionIndex(gameState) {
  const shifts = [];

  for (let i = 1; i < gameState.weekHistory.length; i++) {
    const prevWeek = gameState.weekHistory[i - 1];
    const currWeek = gameState.weekHistory[i];

    const isNegativeWeek =
      prevWeek.weatherResult === 'Storm' ||
      (prevWeek.eventTriggered && ['Aphids', 'FungalSpots'].includes(prevWeek.eventTriggered));

    if (isNegativeWeek) {
      const prevVec = [
        prevWeek.actionSummary.Water,
        prevWeek.actionSummary.Fertilise,
        prevWeek.actionSummary.PestControl,
        prevWeek.actionSummary.Replant,
        prevWeek.actionSummary.Compost,
        prevWeek.actionSummary.MarketDay,
      ];

      const currVec = [
        currWeek.actionSummary.Water,
        currWeek.actionSummary.Fertilise,
        currWeek.actionSummary.PestControl,
        currWeek.actionSummary.Replant,
        currWeek.actionSummary.Compost,
        currWeek.actionSummary.MarketDay,
      ];

      let l1Distance = 0;
      for (let j = 0; j < prevVec.length; j++) {
        l1Distance += Math.abs(currVec[j] - prevVec[j]);
      }

      shifts.push(l1Distance);
    }
  }

  return shifts.length > 0 ? shifts.reduce((a, b) => a + b, 0) / shifts.length : 0;
}

function exportTelemetryJSON(gameState) {
  const json = {
    sessionId: gameState.sessionId,
    seed: gameState.seed,
    exportedAt: new Date().toISOString(),
    finalStats: {
      tokens: gameState.tokens,
      reputation: gameState.reputation,
      tier: determineTier(gameState.tokens, gameState.reputation),
    },
    events: gameState.telemetryEvents,
  };

  return JSON.stringify(json, null, 2);
}

function exportWeeklyCSV(gameState) {
  const lines = [];

  const header = [
    'sessionId',
    'weekNumber',
    'weatherOutlook',
    'weatherResult',
    'eventTriggered',
    'actionsUsedCount',
    'countWater',
    'countFertilise',
    'countPestControl',
    'countReplant',
    'countCompost',
    'countMarketDay',
    'harvestTokensGained',
    'reputationDelta',
    'bedsHealthyCount',
    'bedsPoorCount',
    'averageHealth',
    'averagePests',
    'averageMoisture',
    'averageGrowth',
  ];

  lines.push(header.join(','));

  gameState.weekHistory.forEach((week) => {
    const row = [
      gameState.sessionId,
      week.weekNumber,
      week.weatherOutlook,
      week.weatherResult,
      week.eventTriggered || 'None',
      Object.values(week.actionSummary).reduce((a, b) => a + b, 0),
      week.actionSummary.Water,
      week.actionSummary.Fertilise,
      week.actionSummary.PestControl,
      week.actionSummary.Replant,
      week.actionSummary.Compost,
      week.actionSummary.MarketDay,
      week.harvestTokensGained,
      week.reputationDelta,
      week.bedHealthyCount,
      week.bedPoorCount,
      week.averageHealth.toFixed(1),
      week.averagePests.toFixed(1),
      week.averageMoisture.toFixed(1),
      week.averageGrowth.toFixed(1),
    ];

    lines.push(row.map((cell) => `"${cell}"`).join(','));
  });

  return lines.join('\n');
}

function downloadJSON(filename, content) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function downloadCSV(filename, content) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
