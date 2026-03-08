/**
 * CSV Export Module - Room-by-room session export
 * Generates downloadable CSV with all room data
 */

function generateRoomCSV(sessionId, telemetry, state) {
  // Header row
  const headers = [
    'SessionId',
    'Floor',
    'RoomIndex',
    'RoomType',
    'Difficulty',
    'LightBefore',
    'StaminaBefore',
    'HealthBefore',
    'LootBefore',
    'LightBand',
    'HintShownType',
    'ActionChosen',
    'UsedScan',
    'TimeToDecisionMs',
    'OutcomeLabel',
    'HealthDelta',
    'StaminaDelta',
    'LightDelta',
    'LootDelta',
    'HealthAfter',
    'StaminaAfter',
    'LightAfter',
    'LootAfter',
    'BacktrackedThisRoom'
  ];
  
  const rows = [headers.join(',')];
  
  // Build room rows from telemetry
  const roomDataMap = {};
  
  telemetry.events.forEach(event => {
    if (event.type === 'room_start') {
      const key = `${event.floor}-${event.roomIndex}`;
      roomDataMap[key] = {
        floor: event.floor,
        roomIndex: event.roomIndex,
        lightBefore: event.statsBefore.light,
        staminaBefore: event.statsBefore.stamina,
        healthBefore: event.statsBefore.health,
        lootBefore: event.statsBefore.loot,
        lightBand: event.lightBand,
        hintShownType: event.hintShownType,
        startTime: event.timestamp
      };
    }
    
    if (event.type === 'action_selected') {
      const key = `${event.floor}-${event.roomIndex}`;
      if (roomDataMap[key]) {
        roomDataMap[key].actionChosen = event.actionType;
        roomDataMap[key].usedScan = event.scanStep ? 1 : 0;
        roomDataMap[key].timeToDecision = event.timeSinceRoomStartMs;
        roomDataMap[key].actionTime = event.timestamp;
      }
    }
    
    if (event.type === 'room_resolved') {
      const key = `${event.floor}-${event.roomIndex}`;
      if (roomDataMap[key]) {
        roomDataMap[key].roomType = event.roomType;
        roomDataMap[key].difficulty = event.difficulty;
        roomDataMap[key].outcomeLabel = event.outcomeLabel;
        roomDataMap[key].healthDelta = event.deltas.health;
        roomDataMap[key].staminaDelta = event.deltas.stamina;
        roomDataMap[key].lightDelta = event.deltas.light;
        roomDataMap[key].lootDelta = event.deltas.loot;
        roomDataMap[key].healthAfter = event.statsAfter.health;
        roomDataMap[key].staminaAfter = event.statsAfter.stamina;
        roomDataMap[key].lightAfter = event.statsAfter.light;
        roomDataMap[key].lootAfter = event.statsAfter.loot;
      }
    }
  });
  
  // Convert map to array and sort
  const roomArray = Object.values(roomDataMap).sort((a, b) => {
    if (a.floor !== b.floor) return a.floor - b.floor;
    return a.roomIndex - b.roomIndex;
  });
  
  // Create CSV rows
  roomArray.forEach(room => {
    const row = [
      sessionId,
      room.floor || '',
      room.roomIndex || '',
      room.roomType || '',
      room.difficulty || '',
      room.lightBefore ?? '',
      room.staminaBefore ?? '',
      room.healthBefore ?? '',
      room.lootBefore ?? '',
      room.lightBand || '',
      room.hintShownType || '',
      room.actionChosen || '',
      room.usedScan ?? '',
      room.timeToDecision ?? '',
      (room.outcomeLabel || '').replace(/,/g, ';'), // Escape commas in outcome
      room.healthDelta ?? '',
      room.staminaDelta ?? '',
      room.lightDelta ?? '',
      room.lootDelta ?? '',
      room.healthAfter ?? '',
      room.staminaAfter ?? '',
      room.lightAfter ?? '',
      room.lootAfter ?? '',
      0 // Backtrack tracking not yet implemented in telemetry
    ];
    rows.push(row.join(','));
  });
  
  return rows.join('\n');
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
