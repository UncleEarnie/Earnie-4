/**
 * Simulation Engine - Core game mechanics and room resolution
 * Deterministic encounter and damage calculations
 */

function createGameState(rng, dungeonLayout) {
  return {
    // Session info
    sessionId: `ll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    seed: 0, // Will be set by caller
    startTime: Date.now(),
    
    // Current position
    floor: 1,
    roomIndex: 0,
    
    // Resources
    health: GAME_CONFIG.STARTING_HEALTH,
    stamina: GAME_CONFIG.STARTING_STAMINA,
    light: GAME_CONFIG.STARTING_LIGHT,
    loot: GAME_CONFIG.STARTING_LOOT,
    backtrackTokens: GAME_CONFIG.STARTING_BACKTRACK_TOKENS,
    
    // Modifiers from upgrades
    baselineLightDrain: GAME_CONFIG.BASELINE_LIGHT_DRAIN,
    bootsSneakDiscount: 0, // Subtracted from Sneak cost
    bootsLootDiscount: 0,  // Subtracted from Loot cost
    trapDamageReduction: 0, // % reduction
    lootMultiplier: 1.0,
    revealOverrideRooms: 0, // Counter for Map Fragment
    
    // Reveals
    nextRoomRevealOverride: false, // For Chalk Map
    
    // State tracking
    dungeon: dungeonLayout,
    outcome: null, // 'win' or 'lose'
    isAlive: true,
    roomsCleared: 0,
    backtracksUsed: 0,
    
    // Room-specific
    currentRoomResolved: false
  };
}

function getLightBand(light) {
  if (light >= GAME_CONFIG.LIGHT_BANDS.BRIGHT.min) {
    return 'Bright';
  } else if (light >= GAME_CONFIG.LIGHT_BANDS.DIM.min) {
    return 'Dim';
  } else {
    return 'Dark';
  }
}

function getVisibleRoomInfo(state, floor, roomIndex) {
  const roomInfo = getRoomInfo(state.dungeon, floor, roomIndex);
  if (!roomInfo) return null;
  
  const lightBand = getLightBand(state.light);
  const reveal = {};
  let hintType = 'none';
  
  // Check for overrides (Chalk Map or Map Fragment)
  if (state.nextRoomRevealOverride || state.revealOverrideRooms > 0) {
    reveal.type = roomInfo.type;
    reveal.difficulty = roomInfo.difficulty;
    hintType = 'full';
  } else if (lightBand === 'Bright') {
    reveal.type = roomInfo.type;
    reveal.difficulty = roomInfo.difficulty;
    hintType = 'both';
  } else if (lightBand === 'Dim') {
    // Reveal either type or danger deterministically
    const rng = createRng(roomInfo.seedVariant + state.floor * 1000 + roomIndex * 100);
    if (rollChance(rng, 0.5)) {
      reveal.type = roomInfo.type;
      hintType = 'type';
    } else {
      reveal.difficulty = roomInfo.difficulty;
      hintType = 'danger';
    }
  } else { // Dark
    hintType = 'none';
  }
  
  // Add flavour hint
  const flavourKey = roomInfo.type;
  const flavourHints = FLAVOUR_HINTS[flavourKey] || FLAVOUR_HINTS.Empty;
  reveal.flavour = flavourHints[lightBand] || flavourHints.Dark;
  
  return {
    ...roomInfo,
    visibleInfo: reveal,
    hintType,
    lightBand
  };
}

function resolveRoom(state, rng, action) {
  // Prevent double resolution
  if (state.currentRoomResolved) {
    return null;
  }
  
  const roomInfo = getRoomInfo(state.dungeon, state.floor, state.roomIndex);
  if (!roomInfo) return null;
  
  state.currentRoomResolved = true;
  
  // Apply baseline drains
  state.light = Math.max(0, state.light - state.baselineLightDrain);
  state.stamina = Math.max(0, state.stamina - GAME_CONFIG.BASELINE_STAMINA_DRAIN);
  
  // Apply action costs
  applyActionCosts(state, action);
  
  // Resolve encounter based on room type
  const outcome = {
    roomType: roomInfo.type,
    difficulty: roomInfo.difficulty,
    action: action,
    healthDelta: 0,
    staminaDelta: 0,
    lightDelta: 0,
    lootDelta: 0,
    flags: {}
  };
  
  switch (roomInfo.type) {
    case GAME_CONFIG.ROOM_TYPES.EMPTY:
      resolveEmpty(state, action, outcome, rng);
      break;
    case GAME_CONFIG.ROOM_TYPES.TREASURE:
      resolveTreasure(state, action, outcome, rng);
      break;
    case GAME_CONFIG.ROOM_TYPES.TRAP:
      resolveTrap(state, action, outcome, rng);
      break;
    case GAME_CONFIG.ROOM_TYPES.ENEMY:
      resolveEnemy(state, action, outcome, rng);
      break;
    case GAME_CONFIG.ROOM_TYPES.FOUNTAIN:
      resolveFountain(state, action, outcome, rng);
      break;
    case GAME_CONFIG.ROOM_TYPES.MERCHANT:
      // Merchant is handled separately in UI
      break;
  }
  
  // Apply Rest recovery if applicable
  if (action === 'Rest') {
    state.health = Math.min(100, state.health + GAME_CONFIG.REST_RECOVERY.health);
    outcome.healthDelta += GAME_CONFIG.REST_RECOVERY.health;
  }
  
  // Clamp resources
  state.health = Math.max(0, Math.min(100, state.health));
  state.stamina = Math.max(0, Math.min(100, state.stamina));
  state.light = Math.max(0, Math.min(100, state.light));
  
  // Check for death
  if (state.health <= 0) {
    state.isAlive = false;
    state.outcome = 'lose';
  }
  
  outcome.statsAfter = { health: state.health, stamina: state.stamina, light: state.light, loot: state.loot };
  
  return outcome;
}

function applyActionCosts(state, action) {
  const costs = GAME_CONFIG.ACTION_COSTS[action.toUpperCase()] || { light: 0, stamina: 0 };
  
  let lightCost = costs.light;
  let staminaCost = costs.stamina;
  
  // Apply upgrades
  if (action === 'Sneak') {
    staminaCost -= state.bootsSneakDiscount;
  }
  if (action === 'Loot') {
    staminaCost -= state.bootsLootDiscount;
  }
  
  state.light = Math.max(0, state.light + lightCost);
  state.stamina = Math.max(0, state.stamina + staminaCost);
}

function resolveEmpty(state, action, outcome, rng) {
  if (action === 'Loot') {
    const loot = randomInt(rng, GAME_CONFIG.EMPTY.LOOT_RANGE.min, GAME_CONFIG.EMPTY.LOOT_RANGE.max);
    const finalLoot = Math.floor(loot * state.lootMultiplier);
    state.loot += finalLoot;
    outcome.lootDelta = finalLoot;
  }
  outcome.outcomeLabel = 'An empty chamber.';
}

function resolveTreasure(state, action, outcome, rng) {
  const baseLoot = GAME_CONFIG.TREASURE.BASE_LOOT + (GAME_CONFIG.TREASURE.DIFFICULTY_MULTIPLIER * outcome.difficulty);
  const actionMod = GAME_CONFIG.TREASURE.ACTION_MODIFIERS[action.toUpperCase()] || 1.0;
  const modifiedLoot = Math.floor(baseLoot * actionMod * state.lootMultiplier);
  
  // Check for mimic in Dark
  const lightBand = getLightBand(state.light);
  if (lightBand === 'Dark' && rollChance(rng, GAME_CONFIG.TREASURE.MIMIC_DARK_CHANCE)) {
    outcome.flags.mimicTriggered = true;
    // Treat as enemy ambush with difficulty+1
    const mimicDifficulty = outcome.difficulty + GAME_CONFIG.TREASURE.MIMIC_DIFFICULTY_BOOST;
    const damage = GAME_CONFIG.ENEMY.DAMAGE_BY_RESULT.AMBUSH.base + (GAME_CONFIG.ENEMY.DAMAGE_BY_RESULT.AMBUSH.multiplier * mimicDifficulty);
    state.health -= damage;
    outcome.healthDelta -= damage;
    outcome.lootDelta = 0;
    outcome.outcomeLabel = 'MIMIC! It attacks!';
  } else {
    state.loot += modifiedLoot;
    outcome.lootDelta = modifiedLoot;
    outcome.outcomeLabel = `Found ${modifiedLoot} loot!`;
  }
}

function resolveTrap(state, action, outcome, rng) {
  const difficulty = outcome.difficulty;
  
  // Calculate trigger probability
  let triggerChance = GAME_CONFIG.TRAP.BASE_TRIGGER + (difficulty * GAME_CONFIG.TRAP.DIFFICULTY_MULTIPLIER);
  const lightBand = getLightBand(state.light);
  
  if (action === 'Sneak') triggerChance += GAME_CONFIG.TRAP.SNEAK_MODIFIER;
  if (lightBand === 'Bright') triggerChance += GAME_CONFIG.TRAP.BRIGHT_MODIFIER;
  if (lightBand === 'Dark') triggerChance += GAME_CONFIG.TRAP.DARK_MODIFIER;
  if (state.stamina < GAME_CONFIG.TRAP.LOW_STAMINA_THRESHOLD) triggerChance += GAME_CONFIG.TRAP.LOW_STAMINA_MODIFIER;
  
  triggerChance = Math.max(GAME_CONFIG.TRAP.TRIGGER_CLAMP_MIN, Math.min(GAME_CONFIG.TRAP.TRIGGER_CLAMP_MAX, triggerChance));
  
  const trapped = rollChance(rng, triggerChance);
  outcome.flags.trapTriggered = trapped;
  
  let lootBonus = 0;
  if (action === 'Loot') {
    if (trapped) {
      lootBonus = randomInt(rng, GAME_CONFIG.TRAP_LOOT.TRIGGERED.min, GAME_CONFIG.TRAP_LOOT.TRIGGERED.max);
    } else {
      lootBonus = randomInt(rng, GAME_CONFIG.TRAP_LOOT.NO_TRIGGER.min, GAME_CONFIG.TRAP_LOOT.NO_TRIGGER.max);
    }
  }
  
  if (trapped) {
    let baseDamage = GAME_CONFIG.TRAP.BASE_DAMAGE + (difficulty * GAME_CONFIG.TRAP.DAMAGE_DIFFICULTY_MULTIPLIER);
    
    // Apply modifiers
    if (lightBand === 'Bright') baseDamage *= (1 - GAME_CONFIG.TRAP.BRIGHT_DAMAGE_REDUCTION);
    if (lightBand === 'Dark') baseDamage *= (1 + GAME_CONFIG.TRAP.DARK_DAMAGE_INCREASE);
    if (action === 'Sneak') baseDamage *= (1 - GAME_CONFIG.TRAP.SNEAK_DAMAGE_REDUCTION);
    if (state.stamina < GAME_CONFIG.TRAP.LOW_STAMINA_THRESHOLD) baseDamage *= (1 + GAME_CONFIG.TRAP.LOW_STAMINA_DAMAGE_INCREASE);
    
    baseDamage *= (1 - (state.trapDamageReduction / 100));
    
    const damage = Math.ceil(baseDamage);
    state.health -= damage;
    outcome.healthDelta -= damage;
    outcome.outcomeLabel = `Trap! Took ${damage} damage.`;
  } else {
    outcome.outcomeLabel = 'Avoided the trap!';
  }
  
  state.loot += lootBonus;
  outcome.lootDelta += lootBonus;
}

function resolveEnemy(state, action, outcome, rng) {
  const difficulty = outcome.difficulty;
  const lightBand = getLightBand(state.light);
  
  // Determine if encounter happens
  const encounterChance = GAME_CONFIG.ENEMY.ENCOUNTER_CHANCE[action.toUpperCase()] || 0.5;
  const encountered = rollChance(rng, encounterChance);
  outcome.flags.enemyEncountered = encountered;
  
  if (!encountered) {
    // No encounter
    if (action === 'Sneak') {
      const lootBonus = randomInt(rng, GAME_CONFIG.SNEAK_BONUS.min, GAME_CONFIG.SNEAK_BONUS.max);
      state.loot += lootBonus;
      outcome.lootDelta = lootBonus;
    }
    outcome.outcomeLabel = 'You slip by unnoticed!';
    return;
  }
  
  // Determine encounter result (Advantage/Even/Ambush)
  const weights = { ...GAME_CONFIG.ENEMY.BASE_WEIGHTS };
  
  // Apply modifiers
  if (lightBand === 'Bright') {
    weights.AMBUSH -= GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.BRIGHT.AMBUSH;
    weights.ADVANTAGE += GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.BRIGHT.ADVANTAGE;
  }
  if (lightBand === 'Dark') {
    weights.ADVANTAGE -= GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.DARK.ADVANTAGE;
    weights.AMBUSH += GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.DARK.AMBUSH;
  }
  if (action === 'Sneak') {
    weights.AMBUSH -= GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.SNEAK.AMBUSH;
    weights.EVEN += GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.SNEAK.EVEN;
  }
  if (action === 'Loot') {
    weights.EVEN -= GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.LOOT.EVEN;
    weights.AMBUSH += GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.LOOT.AMBUSH;
  }
  if (state.stamina < GAME_CONFIG.TRAP.LOW_STAMINA_THRESHOLD) {
    weights.ADVANTAGE -= GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.LOW_STAMINA.ADVANTAGE;
    weights.AMBUSH += GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.LOW_STAMINA.AMBUSH;
  }
  if (action === 'Rest') {
    weights.AMBUSH += GAME_CONFIG.ENEMY.WEIGHT_MODIFIERS.REST.AMBUSH;
  }
  
  // Renormalize weights
  const totalWeight = weights.ADVANTAGE + weights.EVEN + weights.AMBUSH;
  weights.ADVANTAGE /= totalWeight;
  weights.EVEN /= totalWeight;
  weights.AMBUSH /= totalWeight;
  
  // Roll for result
  const roll = rng();
  let result = 'EVEN';
  if (roll < weights.ADVANTAGE) {
    result = 'Advantage';
  } else if (roll < weights.ADVANTAGE + weights.EVEN) {
    result = 'Even';
  } else {
    result = 'Ambush';
  }
  
  outcome.flags.enemyResult = result;
  
  // Apply damage and loot
  const damageTable = GAME_CONFIG.ENEMY.DAMAGE_BY_RESULT[result];
  const lootTable = GAME_CONFIG.ENEMY.LOOT_BY_RESULT[result];
  
  const damage = damageTable.base + (damageTable.multiplier * difficulty);
  const loot = lootTable.base + (lootTable.multiplier * difficulty);
  
  state.health -= damage;
  outcome.healthDelta -= damage;
  
  const finalLoot = Math.floor(loot * state.lootMultiplier);
  state.loot += finalLoot;
  outcome.lootDelta = finalLoot;
  
  outcome.outcomeLabel = `Enemy! ${result}: took ${damage} dmg, found ${finalLoot} loot.`;
}

function resolveFountain(state, action, outcome, rng) {
  const baseheal = GAME_CONFIG.FOUNTAIN.BASE_HEAL + (outcome.difficulty * GAME_CONFIG.FOUNTAIN.DIFFICULTY_MULTIPLIER);
  const actionMod = GAME_CONFIG.FOUNTAIN.ACTION_MODIFIERS[action.toUpperCase()] || 1.0;
  const modifiedHeal = Math.floor(baseheal * actionMod);
  
  let lootBonus = 0;
  if (action === 'Loot') {
    lootBonus = randomInt(rng, GAME_CONFIG.FOUNTAIN.LOOT_BONUS_RANGE.min, GAME_CONFIG.FOUNTAIN.LOOT_BONUS_RANGE.max);
  }
  
  state.health = Math.min(100, state.health + modifiedHeal);
  outcome.healthDelta = modifiedHeal;
  
  state.loot += lootBonus;
  outcome.lootDelta = lootBonus;
  
  outcome.outcomeLabel = `Fountain! Restored ${modifiedHeal} health.`;
}

function getMerchantItems() {
  // Return available merchant items for purchase
  const items = [];
  items.push({ ...GAME_CONFIG.MERCHANT_ITEMS.OIL_FLASK });
  items.push({ ...GAME_CONFIG.MERCHANT_ITEMS.JERKY });
  items.push({ ...GAME_CONFIG.MERCHANT_ITEMS.MED_KIT });
  items.push({ ...GAME_CONFIG.MERCHANT_ITEMS.CHALK_MAP });
  return items;
}

function applyMerchantPurchase(state, itemId) {
  const items = getMerchantItems();
  const item = items.find(i => i.id === itemId);
  
  if (!item || state.loot < item.cost) {
    return false;
  }
  
  state.loot -= item.cost;
  
  if (item.effect.light) state.light = Math.min(100, state.light + item.effect.light);
  if (item.effect.stamina) state.stamina = Math.min(100, state.stamina + item.effect.stamina);
  if (item.effect.health) state.health = Math.min(100, state.health + item.effect.health);
  if (item.effect.revealNext) state.nextRoomRevealOverride = true;
  
  return true;
}

function getFloorUpgradeOptions(rng, state) {
  const allUpgrades = Object.values(GAME_CONFIG.UPGRADES);
  
  // Pity rule: if health < 40, ensure Bandages appears
  let options;
  if (state.health < GAME_CONFIG.HEALTH_PITY_THRESHOLD) {
    const bandages = GAME_CONFIG.UPGRADES.BANDAGES;
    const others = randomChoiceUnique(rng, allUpgrades.filter(u => u.id !== bandages.id), 2);
    options = [bandages, ...others];
  } else {
    options = randomChoiceUnique(rng, allUpgrades, 3);
  }
  
  return options;
}

function applyUpgrade(state, upgradeId) {
  switch (upgradeId) {
    case 'bigger-lantern':
      state.baselineLightDrain = Math.max(4, state.baselineLightDrain - 1);
      break;
    case 'better-boots':
      state.bootsSneakDiscount += 3;
      state.bootsLootDiscount += 2;
      break;
    case 'bandages':
      state.health = Math.min(100, state.health + 15);
      break;
    case 'map-fragment':
      state.revealOverrideRooms = 2;
      break;
    case 'lucky-charm':
      state.lootMultiplier *= 1.10;
      break;
    case 'trap-kit':
      state.trapDamageReduction += 10;
      break;
  }
}
