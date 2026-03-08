LANTERN & LOOT V0 - Implementation Documentation
================================================

## Overview
Lantern & Loot V0 is a roguelite dungeon crawler mini-game integrated into the Uncle Earnie financial education platform. It's designed to subtly teach decision-making under uncertainty, resource management, and risk assessment through engaging gameplay.

## Architecture

### File Structure
```
js/lanternLootV0/
├── rng.js              (60 lines) - Seeded RNG using mulberry32
├── constants.js        (200 lines) - Game configuration and balancing
├── dungeonGen.js       (100 lines) - Procedural dungeon layout generation
├── simulation.js       (444 lines) - Core game engine and encounter resolution
├── telemetry.js        (210 lines) - Event logging and behavioral metrics
├── csv.js              (120 lines) - CSV export for room-by-room analysis
└── ui.js               (600 lines) - Game UI rendering and controller

css/
└── lanternLootV0.css   (530 lines) - Complete game styling

Root:
├── lantern-loot.html   - Standalone HTML wrapper for iframe loading
├── js/data.js          - GAMES_LIBRARY entry added
└── js/app.js           - Game launch handler in playGame()
```

### Mounting & Initialization
- **Container**: Game mounts into `#lantern-loot-root` in standalone HTML
- **Init**: `initGame()` called on DOM ready in ui.js
- **State**: Single `gameState` object holds all game data in memory
- **RNG**: All randomness seeded at session start for reproducibility

## Game Mechanics Summary

### Resources (0-100 bars)
- **Health**: Decreases from encounters, restored by fountains/rest
- **Stamina**: Decreases from actions, restored by rest/jerky
- **Light**: Decreases from room entry and actions, restored by oil flask
- **Loot**: Increases from treasure/enemies/actions, spent at merchant
- **Backtrack Tokens**: 3 per run, limited by room index > 1

### Actions
1. **Explore** (default) - Light -2, balanced risk/reward
2. **Sneak** (safer) - Stamina -12, Light -1, lower encounter chance
3. **Loot** (greedy) - Light -6, Stamina -4, higher rewards but danger
4. **Rest** (recovery) - Light -10, then +6 health, +18 stamina
5. **Scan** (two-step) - Stamina -10, Light -1, reveals full info, then choose final action
6. **Backtrack** (limited) - Stamina -10, Light -10, return to previous room

### Room Types
- **Empty**: Minimal threat, loot only if "Loot" action
- **Treasure**: Hoard with chance of mimic in dark
- **Trap**: Trigger chance based on action, light band, stamina
- **Enemy**: Encounter result depends on light, action, stamina
- **Fountain**: Healing based on action, loot if "Loot"
- **Merchant**: Safe trading post (Floors 2, 4 Room 6)

### Light Bands (Visibility/Fog of War)
- **Bright** (70+): Reveals room type AND danger rating
- **Dim** (40-69): Reveals either type OR danger rating, plus hint
- **Dark** (<40): Only atmospheric flavor text, mimic chance in treasure

### Encounter Resolution
All encounters are deterministic and seeded:

**Traps**:
- Trigger = base(65%) + difficulty(5%) + modifiers
- Damage = base(6) + difficulty×4 + light/stamina/sneak modifiers
- Can be reduced by Trap Kit upgrade (10%)

**Enemies**:
- Encounter chance varies by action (Explore 85%, Sneak 55%, Loot 95%, Rest 100%)
- Result weighted: Advantage (30%), Even (50%), Ambush (20%)
- Weights shift based on light band, action, stamina
- Damage/loot determined by result type and difficulty

### Upgrades (Choose 1 per floor)
1. **Bigger Lantern** - Baseline light drain -1 per room (min 4)
2. **Better Boots** - Sneak cost -3, Loot cost -2
3. **Bandages** - Immediate +15 health (forced if health < 40)
4. **Map Fragment** - Next 2 rooms fully revealed
5. **Lucky Charm** - Loot gains ×1.10
6. **Trap Kit** - Trap damage -10%

### Merchant Items
- **Oil Flask** (18 loot) - Light +25
- **Jerky** (14 loot) - Stamina +25
- **Med Kit** (22 loot) - Health +20
- **Chalk Map** (12 loot) - Next room fully revealed (one-time)

## Telemetry & Data Capture

### Event Types Logged
1. **session_start** - Seed, initial stats, dungeon summary
2. **room_start** - Floor/room, stats before, light band, hint shown
3. **action_selected** - Action type, scan step, time to decision
4. **action_cancelled** - Scan cancellation with time
5. **room_resolved** - Outcome, deltas, final stats, flags
6. **floor_upgrade_shown** - 3 options offered
7. **floor_upgrade_selected** - Choice made, time spent
8. **merchant_shown** - Items available, loot available
9. **merchant_purchase** - Item bought, cost, final stats
10. **session_end** - Win/lose, totals, derived metrics

### Derived Behavioral Metrics (computed at session_end)
- **claritySeekingRate** = scans / roomsCleared
- **rushBias** = lootActions / totalMeaningfulActions
- **backtrackRate** = backtracksUsed / roomsCleared
- **percentRoomsInDark** = darkRoomsCleared / roomsCleared
- **volatilityInChoices** = strategy switches (safe↔neutral↔greedy)
- **stressReactionIndex** = % of shock rooms followed by greedy action

### Tier Label (End of Run)
- **Cautious Lanternbearer**: High clarity seeking (>35%), low rush (<30%)
- **Balanced Delver**: Moderate both (clarity 20-50%, rush 30-70%)
- **Greedy Runner**: Low clarity (<20%), high rush (>70%)

### Exports
Two download buttons on end-of-run screen:
1. **telemetry.json** - Full event log with all telemetry events
2. **rooms.csv** - One row per room with 25 columns of data

### LocalStorage
- **Key**: `lanternLootV0:lastRun`
- **Value**: JSON with {gameState, telemetry}
- **Persists**: Final state and events after session_end

## Scan Flow (UI State Machine)

1. **Player clicks Scan**
   - Costs applied immediately (Stamina -10, Light -1)
   - logActionSelected(scanStep=true)
   - Modal shows full room details

2. **Modal displays**
   - Room type, danger rating, flavour
   - 4 action buttons: Explore, Sneak, Loot, Rest
   - 1 cancel button

3. **Player selects action** OR **cancels**
   - If action: Modal closes, handleFinalAction(action) proceeds
   - If cancel: logActionCancelled(), costs are kept (no reversal), screen re-renders

4. **Resolution**
   - Chosen action's costs applied (additive to Scan costs)
   - Room resolved normally
   - Feedback screen shows all deltas

## Constants Tuning

All numeric values are in `js/lanternLootV0/constants.js`:

### Key Thresholds
- `STARTING_*` - Initial resource values
- `BASELINE_LIGHT_DRAIN` - Per-room light cost (8, reduced by Bigger Lantern)
- `TRAP.BASE_TRIGGER` - Base trap trigger % (0.65 = 65%)
- `ENEMY.ENCOUNTER_CHANCE` - Encounter probability by action
- `LIGHT_BANDS.DIM.min/max` - Visibility threshold (40-69)

### Balancing Targets (V0)
- Most runs reach Floor 3 on average
- Good play (balanced actions) reaches Floor 5 often
- Greedy play has high variance (big wins or early crashes)
- Scan feels valuable but optional
- Sneak provides meaningful advantage

### Rebalancing Guide
- **Too easy**: Increase BASE_TRIGGER, DAMAGE multipliers
- **Too hard**: Decrease trap damage, increase fountain heal
- **Scan overpowered**: Increase Scan cost (stamina/light)
- **Greedy too safe**: Increase LOOT action costs, encounter chance

## Code Quality Practices

### No Globals
- All state scoped to gameState or local variables
- Telemetry scoped to telemetry object
- RNG seeded and passed through call chain

### Deterministic
- All randomness uses seeded RNG (mulberry32)
- Same seed + same actions = identical outcomes
- Useful for testing, replay, analytics

### Double-Resolution Guards
- `state.currentRoomResolved` flag prevents resolving same room twice
- Reset on floor/room transitions

### Responsive UI
- Mobile-first CSS (320px+ responsive)
- 2-column layout on 640px+
- Touch-friendly button sizes
- Fixed position doesn't break on iframe

## Testing Checklist

- [ ] Game initializes on page load
- [ ] Floor/room counters display correctly
- [ ] All 6 room types can appear
- [ ] Actions have correct costs and effects
- [ ] Scan two-step flow works (reveal + action)
- [ ] Cancel scan prevents double-cost resolution
- [ ] Backtrack limited to 3 tokens and room > 1
- [ ] Light bands shift revelation correctly
- [ ] Upgrades apply modifiers correctly
- [ ] Merchant purchases deduct loot
- [ ] Telemetry logs all events
- [ ] End-of-run summary displays
- [ ] CSV exports with all rooms
- [ ] JSON export contains all telemetry
- [ ] localStorage persists last run
- [ ] New Run clears state completely
- [ ] Health <= 0 ends game immediately
- [ ] Floor 5 Room 6 allows win

## Performance Notes

- Single RNG instance per session (reused, not recreated)
- DOM rendered entirely on each state change (inefficient but simple)
- Telemetry arrays kept in memory, not persisted until session_end
- No canvas/WebGL, CSS/HTML only
- Loads in iframe with sandbox="allow-scripts allow-same-origin allow-forms allow-popups"

## Known Limitations

- **CSV Export**: Limited to room-by-room view, session-level metrics only in JSON
- **Merchant**: No inventory system, single transaction per floor
- **Upgrades**: No re-selecting, must choose each floor
- **Light Mechanic**: Pure visibility; doesn't affect movement speed
- **Stamina**: Affects action costs but not movement per se
- **Persistence**: Only last run saved; no run history

## Future Enhancements (Not V0)

- Run history with filtering/sorting
- Difficulty modifiers (hard/permadeath mode)
- Leaderboard / best runs
- Equipment system with persistence
- Companion characters with abilities
- Voice lines for NPCs
- Achievements/badges
- Run comparison tool
- Animated transitions between rooms
- Sound effects (with mute option)

## Developer Notes

### How to Modify Game Balance
1. Edit `GAME_CONFIG` values in constants.js
2. Test in iframe at http://localhost:3000/lantern-loot.html
3. Watch telemetry in browser console (logged to localStorage)
4. Adjust ACTION_COSTS, thresholds, multipliers

### How to Add New Room Type
1. Add to GAME_CONFIG.ROOM_TYPES in constants.js
2. Add composition rule in FLOOR_COMPOSITION
3. Add resolve function (resolveNewType) in simulation.js
4. Call it from switch in resolveRoom()
5. Add flavour hints to FLAVOUR_HINTS in constants.js
6. Test room generation and encounters

### How to Add New Upgrade
1. Add to GAME_CONFIG.UPGRADES in constants.js
2. Add case in applyUpgrade() in simulation.js
3. Update getFloorUpgradeOptions() if special pity rules needed
4. Test via Floor End screen

### Debug Telemetry
```javascript
// In browser console:
console.log(JSON.parse(localStorage.getItem('lanternLootV0:lastRun')).telemetry.events);
```

## Integration with Uncle Earnie Platform

- **Games Library**: Entry in data.js with learnings, tags, featured flag
- **Launch**: Via app.js playGame() → openGameIframeModal('lantern-loot.html')
- **Styling**: Uses existing design tokens (--glass-*, --text-*, --accent-primary, etc.)
- **Fonts/Colors**: Inherited from styles.css, no new design system
- **Navigation**: None; game is self-contained in iframe
- **Authentication**: None required; plays anonymously

## File Sizes (Unminified)

- rng.js: 1.2 KB
- constants.js: 8.5 KB
- dungeonGen.js: 3.2 KB
- simulation.js: 15 KB
- telemetry.js: 7 KB
- csv.js: 4 KB
- ui.js: 22 KB
- lanternLootV0.css: 14 KB
- **Total**: ~75 KB (uncompressed)

## Support & Questions

Refer to the constants.js top comment and function headers in each module for implementation details.
All randomness is deterministic and seeded—if you need to replay a run, use the seed from session_start telemetry event.
