/**
 * Telemetry Module - Event logging and behavioral analytics
 * Tracks all player actions and game events for analysis
 */

function initTelemetry(sessionId, seed) {
  return {
    sessionId,
    seed,
    events: [],
    roomLog: []
  };
}

function logEvent(telemetry, eventType, data) {
  telemetry.events.push({
    type: eventType,
    timestamp: Date.now(),
    ...data
  });
}

function logSessionStart(telemetry, state, dungeonSummary) {
  logEvent(telemetry, 'session_start', {
    initialStats: {
      health: state.health,
      stamina: state.stamina,
      light: state.light,
      loot: state.loot,
      backtrackTokens: state.backtrackTokens
    },
    dungeonSummary
  });
}

function logRoomStart(telemetry, state, roomInfo, visibleInfo) {
  logEvent(telemetry, 'room_start', {
    floor: state.floor,
    roomIndex: state.roomIndex,
    statsBefore: {
      health: state.health,
      stamina: state.stamina,
      light: state.light,
      loot: state.loot
    },
    lightBand: visibleInfo.lightBand,
    hintShownType: visibleInfo.hintType,
    hintContent: visibleInfo.visibleInfo.flavour
  });
}

function logActionSelected(telemetry, state, actionType, timeMs, isScan) {
  logEvent(telemetry, 'action_selected', {
    floor: state.floor,
    roomIndex: state.roomIndex,
    actionType,
    timeSinceRoomStartMs: timeMs,
    scanStep: isScan
  });
}

function logActionCancelled(telemetry, state, timeMs) {
  logEvent(telemetry, 'action_cancelled', {
    floor: state.floor,
    roomIndex: state.roomIndex,
    timeSinceRoomStartMs: timeMs
  });
}

function logRoomResolved(telemetry, state, outcome) {
  logEvent(telemetry, 'room_resolved', {
    floor: state.floor,
    roomIndex: state.roomIndex,
    roomType: outcome.roomType,
    difficulty: outcome.difficulty,
    actionFinal: outcome.action,
    outcomeLabel: outcome.outcomeLabel,
    deltas: {
      health: outcome.healthDelta,
      stamina: outcome.staminaDelta,
      light: outcome.lightDelta,
      loot: outcome.lootDelta
    },
    statsAfter: outcome.statsAfter,
    flags: outcome.flags
  });
  
  // Also log to roomLog for CSV export
  telemetry.roomLog.push({
    floor: state.floor,
    roomIndex: state.roomIndex,
    roomType: outcome.roomType,
    difficulty: outcome.difficulty,
    action: outcome.action,
    outcome: outcome.outcomeLabel,
    deltas: outcome.deltas,
    statsAfter: outcome.statsAfter,
    flags: outcome.flags
  });
}

function logFloorUpgradeShown(telemetry, state, options) {
  logEvent(telemetry, 'floor_upgrade_shown', {
    floor: state.floor,
    optionIds: options.map(o => o.id)
  });
}

function logFloorUpgradeSelected(telemetry, state, upgradeId, timeMs) {
  logEvent(telemetry, 'floor_upgrade_selected', {
    floor: state.floor,
    selectedUpgrade: upgradeId,
    timeToChooseMs: timeMs
  });
}

function logMerchantShown(telemetry, state, items) {
  logEvent(telemetry, 'merchant_shown', {
    floor: state.floor,
    itemsOffered: items.map(i => i.id),
    lootAvailable: state.loot
  });
}

function logMerchantPurchase(telemetry, state, itemId, itemCost) {
  logEvent(telemetry, 'merchant_purchase', {
    floor: state.floor,
    itemId,
    cost: itemCost,
    statsAfter: {
      health: state.health,
      stamina: state.stamina,
      light: state.light,
      loot: state.loot
    }
  });
}

function logSessionEnd(telemetry, state) {
  const derivedMetrics = computeDerivedMetrics(telemetry, state);
  
  logEvent(telemetry, 'session_end', {
    outcome: state.outcome,
    totals: {
      loot: state.loot,
      floorsCleared: state.floor,
      roomsCleared: state.roomsCleared,
      backtracksUsed: state.backtracksUsed
    },
    derivedMetrics
  });
}

function computeDerivedMetrics(telemetry, state) {
  const scansUsed = telemetry.events.filter(e => e.type === 'action_selected' && e.scanStep).length;
  const backtracksUsed = state.backtracksUsed;
  const roomsCleared = state.roomsCleared;
  
  // Count action types
  let lootActionsCount = 0;
  let scans = 0;
  let darkRoomsCount = 0;
  let lightTotal = 0;
  let actionSequence = []; // Track safe/neutral/greedy pattern
  let timeToDecisions = [];
  let shockRooms = [];
  let postShockGreedyCount = 0;
  let preShockTimes = [];
  let postShockTimes = [];
  
  telemetry.events.forEach((event, idx) => {
    if (event.type === 'action_selected') {
      scans += event.scanStep ? 1 : 0;
      
      const action = event.actionType.toLowerCase();
      if (action === 'loot') lootActionsCount++;
      timeToDecisions.push(event.timeSinceRoomStartMs);
      
      // Classify action
      let category = 'neutral';
      if (['rest', 'sneak', 'scan'].includes(action)) category = 'safe';
      if (action === 'loot') category = 'greedy';
      actionSequence.push(category);
    }
    
    if (event.type === 'room_start') {
      darkRoomsCount += event.lightBand === 'Dark' ? 1 : 0;
    }
    
    if (event.type === 'room_resolved') {
      const isSuspicious = event.flags.trapTriggered || event.flags.enemyEncountered === false || (event.flags.enemyResult === 'Ambush') || event.deltas.health <= -15;
      if (isSuspicious) {
        shockRooms.push(idx);
      }
    }
  });
  
  // Calculate volatility (category switches)
  let volatility = 0;
  for (let i = 1; i < actionSequence.length; i++) {
    if (actionSequence[i] !== actionSequence[i - 1]) {
      volatility++;
    }
  }
  
  // Calculate stress reaction index
  let stressReactionIndex = 0;
  shockRooms.forEach(shockIdx => {
    // Check if next action is greedy
    const nextActionIdx = telemetry.events.findIndex((e, i) => i > shockIdx && e.type === 'action_selected');
    if (nextActionIdx !== -1 && telemetry.events[nextActionIdx].actionType.toLowerCase() === 'loot') {
      postShockGreedyCount++;
    }
  });
  
  if (shockRooms.length > 0) {
    stressReactionIndex = (postShockGreedyCount / shockRooms.length) * 100;
  }
  
  const totalActions = scans + (lootActionsCount || 1);
  
  return {
    claritySeekingRate: scansUsed / Math.max(1, roomsCleared),
    backtrackRate: backtracksUsed / Math.max(1, roomsCleared),
    rushBias: lootActionsCount / Math.max(1, totalActions),
    percentRoomsInDark: darkRoomsCount / Math.max(1, roomsCleared),
    volatilityInChoices: volatility,
    stressReactionIndex: Math.round(stressReactionIndex)
  };
}

function getTierLabel(metrics) {
  // Classify run into Cautious, Balanced, or Greedy based on metrics
  const clarity = metrics.claritySeekingRate;
  const rush = metrics.rushBias;
  
  if (clarity >= 0.35 && rush <= 0.30) {
    return 'Cautious Lanternbearer';
  } else if (clarity >= 0.20 && clarity <= 0.50 && rush >= 0.30 && rush <= 0.70) {
    return 'Balanced Delver';
  } else {
    return 'Greedy Runner';
  }
}
