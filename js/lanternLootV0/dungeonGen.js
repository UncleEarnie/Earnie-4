/**
 * Dungeon Generation - Creates deterministic dungeon layout
 * Uses seeded RNG to ensure reproducible runs
 */

function generateDungeonLayout(rng) {
  const layout = [];
  
  for (let floor = 1; floor <= GAME_CONFIG.FLOORS; floor++) {
    const floorRooms = generateFloorRooms(rng, floor);
    layout.push(floorRooms);
  }
  
  return layout;
}

function generateFloorRooms(rng, floor) {
  const rooms = [];
  
  // Determine room types for this floor (excluding special merchant slots)
  const typePool = buildTypePool(rng);
  const difficulties = generateDifficulties(rng, 6);
  
  for (let roomIndex = 1; roomIndex <= GAME_CONFIG.ROOMS_PER_FLOOR; roomIndex++) {
    let roomType = GAME_CONFIG.ROOM_TYPES.EMPTY;
    
    // Check for merchant overrides
    if ((floor === 2 || floor === 4) && roomIndex === 6) {
      roomType = GAME_CONFIG.ROOM_TYPES.MERCHANT;
    } else {
      // Pop from typePool
      roomType = typePool[roomIndex - 1] || GAME_CONFIG.ROOM_TYPES.EMPTY;
    }
    
    const difficulty = difficulties[roomIndex - 1];
    const seedVariant = randomInt(rng, 0, 999);
    
    rooms.push({
      floor,
      roomIndex,
      type: roomType,
      difficulty,
      seedVariant
    });
  }
  
  return rooms;
}

function buildTypePool(rng) {
  // Apply composition rules: 2 Enemy, 1 Trap, 1 Treasure, 1 Empty, 1 Fountain/Treasure
  const types = [];
  
  // Add fixed types
  types.push(GAME_CONFIG.ROOM_TYPES.ENEMY);
  types.push(GAME_CONFIG.ROOM_TYPES.ENEMY);
  types.push(GAME_CONFIG.ROOM_TYPES.TRAP);
  types.push(GAME_CONFIG.ROOM_TYPES.TREASURE);
  types.push(GAME_CONFIG.ROOM_TYPES.EMPTY);
  
  // Last room: Fountain or Treasure (60% fountain, 40% treasure)
  const lastType = rollChance(rng, GAME_CONFIG.FLOOR_COMPOSITION.FOUNTAIN_OR_TREASURE.fountain)
    ? GAME_CONFIG.ROOM_TYPES.FOUNTAIN
    : GAME_CONFIG.ROOM_TYPES.TREASURE;
  types.push(lastType);
  
  // Shuffle the types
  return shuffleArray(rng, types);
}

function generateDifficulties(rng, count) {
  const difficulties = [];
  const { min, max } = GAME_CONFIG.DIFFICULTY_RANGE;
  
  for (let i = 0; i < count; i++) {
    difficulties.push(randomInt(rng, min, max));
  }
  
  return difficulties;
}

function getRoomInfo(layout, floor, roomIndex) {
  if (!layout[floor - 1] || !layout[floor - 1][roomIndex - 1]) {
    return null;
  }
  return layout[floor - 1][roomIndex - 1];
}

function getDungeonSummary(layout) {
  // Used for telemetry: record type and difficulty per floor/room
  const summary = {};
  
  layout.forEach((floorRooms, floorIdx) => {
    const floor = floorIdx + 1;
    summary[`floor_${floor}`] = floorRooms.map(room => ({
      roomIndex: room.roomIndex,
      type: room.type,
      difficulty: room.difficulty
    }));
  });
  
  return summary;
}
