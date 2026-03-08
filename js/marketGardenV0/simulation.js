/**
 * Market Garden V0 - Simulation Engine
 * 
 * Weekly simulation order (MUST be exact):
 * 1) Apply immediate action effects
 * 2) Resolve weather and apply moisture drift
 * 3) Resolve event and apply effects
 * 4) Compute per-bed growth gain
 * 5) Compute per-bed health change
 * 6) Update pests drift
 * 7) Clamp all values
 * 8) Perform harvest if Market Day chosen
 */

function generateSessionId() {
  return 'mg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function createGameState(seed) {
  return {
    sessionId: generateSessionId(),
    seed,
    weekNumber: 1,
    tokens: GAME_CONFIG.STARTING_TOKENS,
    reputation: GAME_CONFIG.STARTING_REPUTATION,
    compostLevel: GAME_CONFIG.STARTING_COMPOST,
    beds: GAME_CONFIG.DEFAULT_BEDS.map((plantType, idx) => ({
      bedIndex: idx,
      plantType,
      health: GAME_CONFIG.BED_INITIAL.health,
      growth: GAME_CONFIG.BED_INITIAL.growth,
      moisture: GAME_CONFIG.BED_INITIAL.moisture,
      pests: GAME_CONFIG.BED_INITIAL.pests,
    })),
    plannedActions: [],
    telemetryEvents: [],
    weekHistory: [],
    isSessionActive: true,
  };
}

function snapshotBeds(beds) {
  return beds.map(bed => ({ ...bed }));
}

function logTelemetryEvent(gameState, eventType, data) {
  gameState.telemetryEvents.push({
    type: eventType,
    timestampIso: new Date().toISOString(),
    data,
  });
}

function rollWeatherOutlook(rng, weekNumber) {
  if (weekNumber <= 2) return 'Clear';
  const rand = rng();
  const clear = GAME_CONFIG.WEATHER_PROBABILITIES.Clear;
  const windy = clear + GAME_CONFIG.WEATHER_PROBABILITIES.Windy;
  if (rand < clear) return 'Clear';
  if (rand < windy) return 'Windy';
  return 'StormRisk';
}

function resolveWeatherOutcome(rng, outlook) {
  if (outlook === 'StormRisk') {
    return rng() < 0.60 ? 'LightRain' : 'Storm';
  }
  return outlook;
}

function rollEvent(rng, weekNumber) {
  if (weekNumber <= 2) {
    const hasEvent = rng() < GAME_CONFIG.EVENT_TRIGGER_CHANCE;
    if (!hasEvent) return null;
    return 'HelpfulNeighbour';
  }

  const hasEvent = rng() < GAME_CONFIG.EVENT_TRIGGER_CHANCE;
  if (!hasEvent) return null;

  const rand = rng();
  let cumulative = 0;
  const dist = GAME_CONFIG.EVENT_DISTRIBUTION;

  if (rand < (cumulative += dist.Aphids)) return 'Aphids';
  if (rand < (cumulative += dist.FungalSpots)) return 'FungalSpots';
  if (rand < (cumulative += dist.HelpfulNeighbour)) return 'HelpfulNeighbour';
  return 'CompostDelivery';
}

function getAdjacentBeds(bedIndex) {
  const row = Math.floor(bedIndex / 3);
  const col = bedIndex % 3;
  const adjacent = [];
  if (row > 0) adjacent.push((row - 1) * 3 + col);
  if (row < 1) adjacent.push((row + 1) * 3 + col);
  if (col > 0) adjacent.push(row * 3 + (col - 1));
  if (col < 2) adjacent.push(row * 3 + (col + 1));
  return adjacent;
}

function applyHerbsAdjacency(beds) {
  const herbsBeds = beds
    .map((bed, idx) => (bed.plantType === 'Herbs' ? idx : -1))
    .filter(idx => idx >= 0);

  herbsBeds.forEach(herbIdx => {
    getAdjacentBeds(herbIdx).forEach(adjIdx => {
      beds[adjIdx].health += GAME_CONFIG.HERBS_ADJACENCY_BONUS.health;
      beds[adjIdx].pests -= GAME_CONFIG.HERBS_ADJACENCY_BONUS.pestReduction;
    });
  });
}

function resolveWeek(gameState, rng, plannedActions) {
  const weekNumber = gameState.weekNumber;
  const weatherOutlook = rollWeatherOutlook(rng, weekNumber);
  const marketPreference = randomChoice(rng, GAME_CONFIG.MARKET_PREFERENCES);

  logTelemetryEvent(gameState, 'week_start', {
    weekNumber,
    weatherOutlook,
    marketPreference,
  });

  const bedsBefore = snapshotBeds(gameState.beds);
  const actionSummary = {
    Water: 0,
    Fertilise: 0,
    PestControl: 0,
    Replant: 0,
    Compost: 0,
    MarketDay: 0,
  };

  let hasMarketDay = false;

  // STEP 1: Apply immediate action effects
  plannedActions.forEach((action) => {
    const { type, targetBedIndex, plantChosen } = action;
    actionSummary[type]++;

    if (type === 'Water' && targetBedIndex !== null) {
      gameState.beds[targetBedIndex].moisture += GAME_CONFIG.ACTIONS.Water.moistureGain;
    } else if (type === 'Fertilise' && targetBedIndex !== null) {
      gameState.beds[targetBedIndex].growth += GAME_CONFIG.ACTIONS.Fertilise.growthBonus;
    } else if (type === 'PestControl' && targetBedIndex !== null) {
      gameState.beds[targetBedIndex].pests -= GAME_CONFIG.ACTIONS.PestControl.pestReduction;
    } else if (type === 'Replant' && targetBedIndex !== null && plantChosen) {
      const cfg = GAME_CONFIG.ACTIONS.Replant;
      gameState.beds[targetBedIndex].plantType = plantChosen;
      gameState.beds[targetBedIndex].health = cfg.initialHealth;
      gameState.beds[targetBedIndex].growth = cfg.initialGrowth;
      gameState.beds[targetBedIndex].pests = cfg.initialPests;
      gameState.beds[targetBedIndex].moisture = cfg.initialMoisture;
    } else if (type === 'Compost') {
      gameState.compostLevel = Math.min(
        gameState.compostLevel + GAME_CONFIG.ACTIONS.Compost.levelGain,
        GAME_CONFIG.ACTIONS.Compost.maxLevel
      );
    } else if (type === 'MarketDay') {
      hasMarketDay = true;
    }
  });

  // STEP 2: Resolve weather and apply moisture drift
  const weatherResult = resolveWeatherOutcome(rng, weatherOutlook);
  const moistureDrift =
    weatherResult === 'Clear' ? GAME_CONFIG.MOISTURE_CLEAR
    : weatherResult === 'Windy' ? GAME_CONFIG.MOISTURE_WINDY
    : weatherResult === 'LightRain' ? GAME_CONFIG.MOISTURE_LIGHT_RAIN
    : weatherResult === 'Storm' ? GAME_CONFIG.MOISTURE_STORM
    : 0;

  gameState.beds.forEach((bed) => {
    bed.moisture += moistureDrift;
  });

  // STEP 3: Resolve event
  let eventTriggered = null;
  let eventData = {};

  const eventType = rollEvent(rng, weekNumber);
  if (eventType) {
    eventTriggered = eventType;

    if (eventType === 'Aphids') {
      const affectedBeds = randomChoiceUnique(rng, Array.from({ length: 6 }, (_, i) => i), 2);
      affectedBeds.forEach((idx) => {
        gameState.beds[idx].pests += 25;
      });
      eventData.affectedBeds = affectedBeds;
    } else if (eventType === 'FungalSpots') {
      const wettest = gameState.beds.reduce((prev, curr, idx, arr) => {
        return curr.moisture > arr[prev].moisture ? idx : prev;
      }, 0);
      gameState.beds[wettest].health -= 12;
      eventData.affectedBed = wettest;
    } else if (eventType === 'HelpfulNeighbour') {
      const choice = rollChance(rng, 0.5);
      if (choice) {
        gameState.reputation += GAME_CONFIG.REPUTATION.helpfulNeighbourBonus;
        eventData.choice = 'reputation';
      } else {
        gameState.beds.forEach((bed) => {
          bed.pests -= 10;
        });
        eventData.choice = 'pestReduction';
      }
    } else if (eventType === 'CompostDelivery') {
      eventData.compostBonusActive = true;
    }
  }

  // STEP 4: Compute per-bed growth gain
  gameState.beds.forEach((bed) => {
    const plant = GAME_CONFIG.PLANTS[bed.plantType];
    let growthGain = plant.growthRateBase;

    growthGain += gameState.compostLevel * GAME_CONFIG.ACTIONS.Compost.growthBonusPerLevel;

    const growthMod = GAME_CONFIG.GROWTH_MODIFIERS[weatherResult] || 0;
    growthGain += growthMod;

    const wasFertilised = plannedActions.some((a) => a.type === 'Fertilise' && a.targetBedIndex === bed.bedIndex);
    if (wasFertilised) {
      growthGain += GAME_CONFIG.ACTIONS.Fertilise.growthBonus;
    }

    if (bed.pests > GAME_CONFIG.PEST_THRESHOLD_HEAVY) {
      growthGain -= GAME_CONFIG.GROWTH_HEAVY_PESTS_PENALTY;
    }

    bed.growth += growthGain;
  });

  // STEP 5: Compute per-bed health change
  gameState.beds.forEach((bed) => {
    const plant = GAME_CONFIG.PLANTS[bed.plantType];
    let healthChange = -plant.healthDecayBase;

    if (bed.moisture < GAME_CONFIG.MOISTURE_THRESHOLD_DRY) {
      healthChange -= GAME_CONFIG.HEALTH_DRY_PENALTY;
    }
    if (bed.moisture > GAME_CONFIG.MOISTURE_THRESHOLD_SOAKED) {
      healthChange -= GAME_CONFIG.HEALTH_SOAKED_PENALTY;
    }

    if (bed.pests > GAME_CONFIG.PEST_THRESHOLD_HEAVY) {
      healthChange -= GAME_CONFIG.HEALTH_HEAVY_PESTS_PENALTY * plant.pestSensitivity;
    }

    if (weatherResult === 'Storm') {
      healthChange -= GAME_CONFIG.HEALTH_STORM_PENALTY * plant.weatherSensitivity;
    }

    const wasWatered = plannedActions.some((a) => a.type === 'Water' && a.targetBedIndex === bed.bedIndex);
    if (wasWatered) {
      healthChange += GAME_CONFIG.ACTIONS.Water.healthGain;
    }

    const hadPestControl = plannedActions.some((a) => a.type === 'PestControl' && a.targetBedIndex === bed.bedIndex);
    if (hadPestControl) {
      healthChange += GAME_CONFIG.ACTIONS.PestControl.healthGain;
    }

    bed.health += healthChange;
  });

  // Apply Herbs adjacency bonus (after base health changes)
  applyHerbsAdjacency(gameState.beds);

  // STEP 6: Update pests drift
  gameState.beds.forEach((bed) => {
    let pestDrift = GAME_CONFIG.PESTS_BASE_DRIFT;

    if (weatherResult === 'Clear') pestDrift += GAME_CONFIG.PESTS_CLEAR;
    else if (weatherResult === 'Windy') pestDrift += GAME_CONFIG.PESTS_WINDY;
    else if (weatherResult === 'LightRain') pestDrift += GAME_CONFIG.PESTS_LIGHT_RAIN;
    else if (weatherResult === 'Storm') pestDrift += GAME_CONFIG.PESTS_STORM;

    const wasFertilised = plannedActions.some((a) => a.type === 'Fertilise' && a.targetBedIndex === bed.bedIndex);
    if (wasFertilised) {
      pestDrift += GAME_CONFIG.ACTIONS.Fertilise.pestDrift;
    }

    const hadPestControl = plannedActions.some((a) => a.type === 'PestControl' && a.targetBedIndex === bed.bedIndex);
    if (hadPestControl) {
      pestDrift -= GAME_CONFIG.ACTIONS.PestControl.pestReduction;
    }

    bed.pests += pestDrift;
  });

  // STEP 7: Clamp all values
  gameState.beds.forEach((bed) => {
    bed.health = Math.max(0, Math.min(100, bed.health));
    bed.growth = Math.max(0, Math.min(100, bed.growth));
    bed.pests = Math.max(0, Math.min(100, bed.pests));
    bed.moisture = Math.max(0, Math.min(100, bed.moisture));
  });

  // STEP 8: Perform harvest if Market Day chosen
  let harvestTokensGained = 0;
  let harvestedBedCount = 0;

  if (hasMarketDay) {
    gameState.beds.forEach((bed) => {
      const plant = GAME_CONFIG.PLANTS[bed.plantType];
      const isReady = bed.growth >= plant.harvestThreshold && bed.health >= GAME_CONFIG.HEALTH_THRESHOLD_HARVEST;

      if (isReady) {
        harvestTokensGained += plant.harvestValue;
        harvestedBedCount++;
        bed.growth = GAME_CONFIG.HARVEST_REGROWTH;
      }
    });

    gameState.tokens += harvestTokensGained;
  }

  // Reputation update
  let reputationDelta = 0;

  const healthyBeds = gameState.beds.filter((bed) => bed.health >= GAME_CONFIG.HEALTH_THRESHOLD_GOOD).length;
  reputationDelta += healthyBeds * GAME_CONFIG.REPUTATION.healthyBedBonus;

  const poorBeds = gameState.beds.filter((bed) => bed.health < GAME_CONFIG.HEALTH_THRESHOLD_POOR).length;
  if (poorBeds >= 3) {
    reputationDelta -= GAME_CONFIG.REPUTATION.poorBedsPenalty;
  }

  const replantsThisWeek = plannedActions.filter((a) => a.type === 'Replant').length;
  if (replantsThisWeek > 2) {
    reputationDelta -= GAME_CONFIG.REPUTATION.replantsOveragePenalty;
  }

  if (hasMarketDay && harvestedBedCount >= 3) {
    reputationDelta += GAME_CONFIG.REPUTATION.harvestBonus;
  }

  gameState.reputation = Math.max(0, gameState.reputation + reputationDelta);

  const bedsAfter = snapshotBeds(gameState.beds);

  logTelemetryEvent(gameState, 'resolution', {
    weekNumber,
    weatherResult,
    eventTriggered,
    eventData,
    perBedBefore: bedsBefore,
    perBedAfter: bedsAfter,
    harvestTokensGained,
    reputationDelta,
  });

  gameState.weekHistory.push({
    weekNumber,
    weatherOutlook,
    weatherResult,
    eventTriggered,
    actionSummary,
    harvestTokensGained,
    reputationDelta,
    bedHealthyCount: healthyBeds,
    bedPoorCount: poorBeds,
    averageHealth: gameState.beds.reduce((sum, b) => sum + b.health, 0) / 6,
    averagePests: gameState.beds.reduce((sum, b) => sum + b.pests, 0) / 6,
    averageMoisture: gameState.beds.reduce((sum, b) => sum + b.moisture, 0) / 6,
    averageGrowth: gameState.beds.reduce((sum, b) => sum + b.growth, 0) / 6,
  });

  return {
    weatherOutlook,
    weatherResult,
    eventTriggered,
    eventData,
    harvestTokensGained,
    reputationDelta,
  };
}

function determineTier(tokens, reputation) {
  if (tokens >= 25 && reputation >= 30) {
    return TIER_LABELS.RooftopLegend.label;
  }
  if (tokens >= 10 && reputation >= 20) {
    return TIER_LABELS.MarketRegular.label;
  }
  return TIER_LABELS.CozyGardener.label;
}
