# Earnie's Journey V0 - Implementation Complete

## Overview
A 12-week life simulation game where players balance four meters (Momentum, Stability, Options, Joy) by choosing actions across 6 city locations. Players select one of 3 paths (Builder, Explorer, Closer) with unique win conditions, manage time budgets, and navigate weekend events that curveball their plans.

## Files Created

### Core Game Modules
- **js/earniesJourneyV0/rng.js** - Seeded random number generation (Mulberry32 algorithm)
- **js/earniesJourneyV0/constants.js** - Game configuration, 24 action cards, 10 events, 3 paths
- **js/earniesJourneyV0/engine.js** - Game state management and logic
- **js/earniesJourneyV0/telemetry.js** - Event logging and behavioral analytics
- **js/earniesJourneyV0/csv.js** - Weekly CSV and JSON export functionality
- **js/earniesJourneyV0/ui.js** - DOM rendering and interaction handling

### Styling & HTML
- **css/earniesJourneyV0.css** - Complete game styling with responsive design
- **earnies-journey.html** - Standalone game page with module loading

### Integration
- **js/data.js** - Added game entry to GAMES_LIBRARY
- **js/app.js** - Added game launch handler

## Game Features

### Path Selection (3 Choices)
- **Builder**: Win condition - Stability ≥75 AND Momentum ≥60
- **Explorer**: Win condition - Options ≥80 AND Joy ≥60
- **Closer**: Win condition - Momentum ≥85 AND Stability ≥55

### City Map (6 Locations)
1. **The Gig Hub** - Work and income actions (4 actions)
2. **The Workshop** - Learning and skill-building (4 actions)
3. **The Planner** - Clarity tools that modify outcomes (4 actions)
4. **The Market** - Spending with ongoing effects (4 actions)
5. **The Vault** - Stability and safety actions (4 actions)
6. **The Lounge** - Joy and recovery (4 actions)

### Action System
- 24 action cards total across 6 locations
- Each action has:
  - Time cost (5-30 units)
  - Meter effects (momentum, stability, options, joy)
  - Risk band: safe, neutral, or greedy
  - Optional properties: clarity tools, ongoing effects, delayed effects

### Clarity Tools (Planner Location)
1. **Forecast Shield** - Reduces negative event chance by 60%, increases positive by 60%
2. **Planner Buff** - Next action gets 1.2x meter effects
3. **Cost Check** - Prevents "Hidden Fee" event this week
4. **Scenario Sim** - Reduces event downside by 10%

### Weekend Events
- 70% chance to trigger each week
- 10 different events (mix of positive and negative)
- Binary choice (Option A or Option B)
- Affected by active clarity tools

### Ongoing Effects
- Multi-week consequences from certain actions
- Examples: "Car Payment" (-5 stability/week for 3 weeks)
- Can be removed with specific actions

### Telemetry & Analytics
- Tracks all player actions and decisions
- Computes derived metrics:
  - Clarity seeking rate
  - Strategy shift index
  - Dominant location usage
  - Player style tier
- Stores last run in localStorage
- Exports:
  - Weekly CSV (30+ columns per week)
  - Full telemetry JSON

## How to Play

1. **Start the Server**: Run `start-server.bat` (Windows) or `start-server.sh` (Mac/Linux)
2. **Navigate**: Go to http://localhost:3000 in your browser
3. **Launch Game**: 
   - Go to the Games section
   - Find "Earnie's Journey V0"
   - Click "Play"
4. **Choose Path**: Select Builder, Explorer, or Closer
5. **Play Weeks**:
   - Each week you have 100 time units
   - Click action cards to spend time and affect meters
   - End week when ready (or when time runs out)
   - Respond to weekend events (if any occur)
6. **Complete Run**: After 12 weeks, see your outcome and download data

## Technical Architecture

### Module Loading Order
```html
<script src="js/earniesJourneyV0/rng.js"></script>
<script src="js/earniesJourneyV0/constants.js"></script>
<script src="js/earniesJourneyV0/engine.js"></script>
<script src="js/earniesJourneyV0/telemetry.js"></script>
<script src="js/earniesJourneyV0/csv.js"></script>
<script src="js/earniesJourneyV0/ui.js"></script>
```

### Game State Structure
```javascript
{
  sessionId: string,
  seed: number,
  rng: function,
  selectedPath: string,
  weekNumber: number,
  meters: { momentum, stability, options, joy },
  timeBudgetRemaining: number,
  forecastShieldActive: boolean,
  plannerBuffActive: boolean,
  costCheckActive: boolean,
  scenarioSimActive: boolean,
  ongoingEffects: [],
  delayedEffects: [],
  weeklyLog: [],
  telemetryEvents: [],
  outcome: 'win' | 'lose',
  isComplete: boolean
}
```

### Key Functions

**Engine (engine.js)**
- `createGameState(seed, selectedPath)` - Initialize new game
- `startWeek(gameState)` - Begin week cycle
- `applyAction(gameState, action)` - Execute player action
- `selectWeekendEvent(gameState)` - Choose random event
- `applyEventOption(gameState, event, optionId)` - Apply event choice
- `endWeek(gameState)` - Finalize week and check completion
- `computeDerivedMetrics(gameState)` - Calculate behavioral analytics

**Telemetry (telemetry.js)**
- `logSessionStart(gameState)` - Track game start
- `logActionSelected(gameState, action)` - Log each action
- `logWeekendEventShown/Selected(...)` - Track event interactions
- `logSessionEnd(gameState)` - Store final metrics

**CSV Export (csv.js)**
- `generateWeeklyCSV(gameState)` - Create 30+ column CSV
- `downloadCSV(gameState)` - Trigger browser download
- `downloadJSON(gameState)` - Export full telemetry

**UI (ui.js)**
- `initializeUI(rootElement)` - Mount game to DOM
- `renderPathSelection()` - Show path choice screen
- `renderGameScreen()` - Render week interface
- `showEventModal()` - Display weekend event
- `showOutcomeModal()` - Show final results

## Design Rationale

### Deterministic RNG
Uses seeded Mulberry32 algorithm so each seed produces the same sequence of events. This enables:
- Reproducible gameplay for research
- Fair comparison between players
- Debugging and testing

### Meter Balance
Four competing meters force trade-offs:
- Momentum vs Stability (speed vs safety)
- Options vs Joy (future flexibility vs present enjoyment)

### Time Budget Constraint
100 units per week creates scarcity. Players must prioritize, can't do everything.

### Clarity Tools
Represent planning vs doing tension. Time spent at Planner improves outcomes but doesn't directly move meters.

### Weekend Events
Introduce uncertainty. Even perfect planning can't prevent all shocks. Tests stress response.

### Ongoing Effects
Some actions have multi-week consequences, teaching players to think beyond immediate gains.

### Telemetry & CSV
Enables research on:
- Clarity-seeking behavior under stress
- Strategy shift patterns
- Planning vs reactive decision-making
- Behavioral "tilt" after negative events

## Testing Checklist

- [x] All modules load without errors
- [x] Path selection screen renders
- [x] Game screen shows meters, time budget, and city map
- [ ] Actions apply correctly (reduce time, change meters)
- [ ] Ongoing effects persist across weeks
- [ ] Weekend events trigger at ~70% rate
- [ ] Clarity tools modify outcomes as expected
- [ ] Win conditions evaluate correctly
- [ ] CSV export generates proper format
- [ ] JSON telemetry captures all events
- [ ] New Journey button resets properly

## Known Limitations

1. **No Save/Load**: Game state is lost on page refresh
2. **No Pause**: Must complete run in one session
3. **Mobile UX**: Optimized for desktop, mobile could be improved
4. **No Tutorial**: Players dive in without guided intro
5. **No Action Tooltips**: Could add hover details for action mechanics

## Future Enhancements

1. **Tutorial Mode**: Guided first run with hints
2. **Replays**: Load previous run from sessionId
3. **Leaderboards**: Compare outcomes across players
4. **More Events**: Expand from 10 to 20+ events
5. **More Actions**: Add 12 more cards for variety
6. **Visual Polish**: Animations for meter changes, action selection
7. **Sound Effects**: Audio feedback for actions and events
8. **Achievements**: Unlock badges for specific accomplishments
9. **Path Modifiers**: Each path could modify certain action effects

## Credits

Game design based on "Earnie's Journey V0" specification.
Implemented as part of the Earnie financial education platform.

---

**Status**: ✅ Implementation complete and ready to test
**Last Updated**: 2024
