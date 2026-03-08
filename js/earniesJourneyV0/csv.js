/**
 * Earnie's Journey V0 - CSV Export
 * Generate and download weekly CSV and JSON telemetry
 */

function generateWeeklyCSV(gameState) {
  const headers = [
    'sessionId',
    'weekNumber',
    'momentumStart',
    'stabilityStart',
    'optionsStart',
    'joyStart',
    'momentumEnd',
    'stabilityEnd',
    'optionsEnd',
    'joyEnd',
    'momentumDelta',
    'stabilityDelta',
    'optionsDelta',
    'joyDelta',
    'timeUsed',
    'timeUnused',
    'actionsCount',
    'gigActionsCount',
    'workshopActionsCount',
    'plannerActionsCount',
    'marketActionsCount',
    'vaultActionsCount',
    'loungeActionsCount',
    'clarityToolCount',
    'safeActionsCount',
    'neutralActionsCount',
    'greedyActionsCount',
    'ongoingEffectsStart',
    'ongoingEffectsEnd'
  ];
  
  const rows = [headers.join(',')];
  
  gameState.weeklyLog.forEach(week => {
    // Count actions by location
    const locationCounts = {
      [LOCATIONS.GIG]: 0,
      [LOCATIONS.WORKSHOP]: 0,
      [LOCATIONS.PLANNER]: 0,
      [LOCATIONS.MARKET]: 0,
      [LOCATIONS.VAULT]: 0,
      [LOCATIONS.LOUNGE]: 0
    };
    
    let clarityToolCount = 0;
    let safeCount = 0;
    let neutralCount = 0;
    let greedyCount = 0;
    
    week.actions.forEach(action => {
      locationCounts[action.location]++;
      
      if (action.tags.includes('clarityTool')) clarityToolCount++;
      if (action.tags.includes('safe')) safeCount++;
      if (action.tags.includes('neutral')) neutralCount++;
      if (action.tags.includes('greedy')) greedyCount++;
    });
    
    const row = [
      gameState.sessionId,
      week.weekNumber,
      week.metersStart.momentum,
      week.metersStart.stability,
      week.metersStart.options,
      week.metersStart.joy,
      week.metersEnd.momentum,
      week.metersEnd.stability,
      week.metersEnd.options,
      week.metersEnd.joy,
      week.metersEnd.momentum - week.metersStart.momentum,
      week.metersEnd.stability - week.metersStart.stability,
      week.metersEnd.options - week.metersStart.options,
      week.metersEnd.joy - week.metersStart.joy,
      week.timeUsed,
      week.unusedTime,
      week.actions.length,
      locationCounts[LOCATIONS.GIG],
      locationCounts[LOCATIONS.WORKSHOP],
      locationCounts[LOCATIONS.PLANNER],
      locationCounts[LOCATIONS.MARKET],
      locationCounts[LOCATIONS.VAULT],
      locationCounts[LOCATIONS.LOUNGE],
      clarityToolCount,
      safeCount,
      neutralCount,
      greedyCount,
      week.ongoingEffectsCountStart || 0,
      week.ongoingEffectsCountEnd || 0
    ];
    
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

function generateTelemetryJSON(gameState) {
  return JSON.stringify({
    sessionId: gameState.sessionId,
    seed: gameState.seed,
    selectedPath: gameState.selectedPath,
    outcome: gameState.outcome,
    finalMeters: gameState.meters,
    weeklyLog: gameState.weeklyLog,
    telemetryEvents: gameState.telemetryEvents,
    derivedMetrics: computeDerivedMetrics(gameState)
  }, null, 2);
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

function downloadCSV(gameState) {
  const csv = generateWeeklyCSV(gameState);
  const filename = `earnies-journey-${gameState.sessionId}-weeks.csv`;
  downloadFile(csv, filename, 'text/csv');
}

function downloadJSON(gameState) {
  const json = generateTelemetryJSON(gameState);
  const filename = `earnies-journey-${gameState.sessionId}-telemetry.json`;
  downloadFile(json, filename, 'application/json');
}
