# Market Garden V0 - Implementation Complete

## Overview
Market Garden V0 is a complete, cosy garden management mini-game embedded directly into your Uncle Earnie website. It's a 12-week seasonal simulation where players manage 6 garden beds, make strategic decisions with limited actions, and navigate weather uncertainty and random events.

## What's Been Built

### 1. **Core Game Modules** (`js/marketGardenV0/`)

#### `rng.js` - Deterministic Random Number Generator
- Implements **mulberry32** seeded RNG for reproducible randomness
- All game randomness (weather, events, bed selection) uses this RNG
- Ensures sessions can be replayed with the same seed

#### `constants.js` - Game Configuration
- All tunable parameters in one place:
  - Plant stats (growth rate, health decay, weather sensitivity, pest sensitivity, harvest values)
  - Weather probabilities
  - Event distributions
  - Action effects
  - Reputation scoring rules
  - Thresholds for indicators
- Easy to balance and adjust gameplay

#### `simulation.js` - Turn Resolution Engine
- **Strictly deterministic** game state management
- Implements the exact weekly simulation order:
  1. Apply immediate action effects
  2. Resolve weather and apply moisture drift
  3. Resolve events and apply effects
  4. Compute per-bed growth gain
  5. Compute per-bed health change
  6. Update pests drift
  7. Clamp all values
  8. Perform harvest if Market Day chosen
- Handles all game mechanics:
  - 6-bed garden management
  - 5 plant types with unique stats
  - 6 action types (Water, Fertilise, Pest Control, Replant, Compost, Market Day)
  - Weather system (Clear, Windy, Storm Risk → Light Rain/Storm)
  - Event system (Aphids, Fungal Spots, Helpful Neighbour, Compost Delivery)
  - Herbs adjacency synergy
  - Reputation scoring
  - Harvest mechanics

#### `telemetry.js` - Data Logging & Export
- Event-based telemetry captured throughout the season:
  - session_start: seed, initial garden state
  - week_start: weather, market preference
  - action_selected: all player actions with timing
  - week_locked: decision time, action counts
  - resolution: weather result, event, per-bed changes
  - session_end: final stats and derived metrics
- Derived behavioral metrics:
  - thrashIndex: total replants
  - stabilityBias: ratio of defensive vs growth actions
  - strategyShiftIndex: consistency of strategy week-to-week
  - stressReactionIndex: how much strategy changes after negative events
- Browser-based downloads:
  - `telemetry.json`: Full event log with all raw data
  - `weekly.csv`: Summarized weekly data for analysis
- localStorage persistence: `marketGardenV0:lastRun`

#### `ui.js` - Game Interface & Controller
- Complete UI for all game states:
  - **Week Start Screen**: Header with stats, garden grid, weather card, market preference, action panel
  - **Plant Picker Modal**: For replanting actions
  - **Week Summary Modal**: Shows resolution results
  - **End of Season Screen**: Final stats, tier label, download buttons
- Event handling:
  - Action selection and targeting
  - Bed selection for targeted actions
  - Lock week button with validation
  - Download triggers
  - New Season reset
- Auto-initializes when DOM is ready
- Responsive design (desktop-first)

### 2. **Styling** (`css/marketGardenV0.css`)
- Matches existing site design tokens:
  - Colors: Uses `--accent-primary`, `--glass-*`, `--text-*` variables
  - Spacing: Uses `--space-*` scale
  - Typography: Uses font sizes and weights from site
  - Shadows and radius: Consistent with existing components
- Fully responsive layout
- Modal, card, button, and indicator styles
- Grid layout for 6-bed garden (2x3)

### 3. **Integration** (`index.html`)
- Added game container: `<div id="market-garden-root">`
- Placed right after Games Library section
- Linked CSS: `css/marketGardenV0.css`
- Added 5 script tags in correct order:
  1. rng.js
  2. constants.js
  3. simulation.js
  4. telemetry.js
  5. ui.js

## Game Features

### Garden Layout
- **6 beds in 2×3 grid**
- Each bed shows:
  - Plant name and emoji icon
  - Plant category (Hardy, High Yield, Temperamental, Supportive, Moonshot)
  - Health bar (0-100, color-coded: red <40, yellow <70, green ≥70)
  - Growth stage (Seedling, Growing, Mature)
  - Pest state indicator (None, Mild, Heavy)
  - Moisture state indicator (Dry, OK, Soaked)

### Plant Roster (V0)
1. **Kale** (Hardy) - Stable, hardy, low yield
2. **Tomatoes** (High Yield) - Good output, medium risk
3. **Strawberries** (Temperamental) - High risk/reward
4. **Herbs** (Supportive) - Provides adjacency bonuses to neighbors
5. **Sunflowers** (Moonshot) - Huge payoff in ideal weather, fragile

### Actions (3 per week)
1. **Water** - +25 moisture, +3 health
2. **Fertilise** - +6 growth, +6 pests
3. **Pest Control** - -30 pests, +4 health
4. **Replant** - Reset a bed with new plant (growth=0, health=80, pests=10, moisture=55)
5. **Compost** - Global upgrade: +1 growth/week per level (max 3)
6. **Market Day** - Harvest ready beds for tokens

### Scoring
- **Harvest Tokens** (visible): Earned only via Market Day action. Each ready bed yields plant.harvestValue.
- **Reputation** (visible): Starts at 10. Gains/losses:
  - +1 per healthy bed (health ≥ 70)
  - -2 if 3+ beds have health < 40
  - +2 if Market Day harvests 3+ beds
  - -1 if replanting > 2 beds in one week
  - +3 from Helpful Neighbour event (option A)

### Weather System
- **Outlook** chosen at week start (deterministic):
  - Clear: 45%
  - Windy: 30%
  - Storm Risk: 25%
- **Resolution** (Storm Risk only):
  - Light Rain: 60%
  - Storm: 40%
- **Effects**:
  - Moisture drift: Clear -8, Windy -12, Light Rain +8, Storm +15
  - Growth modifier: Clear +2, Windy 0, Light Rain +1, Storm -2
  - Pest drift: Clear +1, Windy 0, Light Rain +2, Storm +4
  - Health damage (storm): -8 × plant.weatherSensitivity

### Event System
- 25% chance per week (after week 2)
- Early game protection: Weeks 1-2 suppress negative events
- **Aphids** (35%): +25 pests to 2 random beds
- **Fungal Spots** (25%): -12 health to wettest bed
- **Helpful Neighbour** (25%): +3 reputation OR -10 pests to all beds
- **Compost Delivery** (15%): Compost action gives +2 levels instead of +1 this week only

## How to Use

### Start a Game
1. Open index.html in your browser
2. Scroll to the Market Garden section
3. Game auto-initializes
4. Click action buttons to plan your week
5. Click "🔒 Lock Week" to resolve

### Select Actions
1. Click an action button (Water, Fertilise, etc.)
2. For bed-targeted actions: Click a bed to apply
3. For Replant: Choose plant, then click a bed
4. For Compost/Market Day: Click button (no targeting needed)
5. Remove actions with the ✕ button before locking

### Download Data (End of Season)
1. Click "📋 Download Telemetry JSON" for full event log
2. Click "📊 Download Weekly CSV" for summarized weekly data
3. Both files contain session ID and seed for traceability

### New Season
- Click "🌱 New Season" button on end-of-season screen
- Game fully resets with new seed
- Previous run saved to `localStorage:marketGardenV0:lastRun`

## Tuning & Customization

### Edit Plant Stats
File: `js/marketGardenV0/constants.js`

```javascript
PLANTS: {
  Kale: {
    label: 'Hardy',
    growthRateBase: 10,      // Base growth per week
    healthDecayBase: 1,      // Base health loss per week
    weatherSensitivity: 0.5, // Multiplier for weather damage
    pestSensitivity: 0.5,    // Multiplier for pest damage
    harvestValue: 2,         // Tokens per harvest
    harvestThreshold: 80,    // Growth needed to harvest
    emoji: '🥬',
  },
  // ... other plants
}
```

### Adjust Probabilities
```javascript
WEATHER_PROBABILITIES: {
  Clear: 0.45,
  Windy: 0.30,
  StormRisk: 0.25,
}

EVENT_DISTRIBUTION: {
  Aphids: 0.35,
  FungalSpots: 0.25,
  HelpfulNeighbour: 0.25,
  CompostDelivery: 0.15,
}
```

### Change Action Effects
```javascript
ACTIONS: {
  Water: { moistureGain: 25, healthGain: 3 },
  Fertilise: { growthBonus: 6, pestDrift: 6 },
  // ... etc
}
```

### Modify Scoring Rules
```javascript
REPUTATION: {
  healthyBedBonus: 1,           // Per healthy bed
  poorBedsPenalty: 2,           // If 3+ poor beds
  replantsOveragePenalty: 1,    // If 3+ replants
  harvestBonus: 2,              // Bonus for 3+ beds harvest
  helpfulNeighbourBonus: 3,     // Event bonus
}
```

## Technical Details

### Determinism
- Uses seeded RNG for all randomness
- Seed logged in telemetry
- Same seed + same actions = identical outcomes
- Great for debugging and testing

### Performance
- All logic runs in-memory
- No server calls
- Exports happen client-side
- Typical game takes 10-15 minutes
- localStorage used for last run persistence

### Browser Compatibility
- Modern browsers with:
  - ES6 support
  - localStorage
  - File download API (for exports)
  - Basic CSS Grid/Flexbox

### No External Dependencies
- Pure JavaScript
- No libraries required
- Reuses existing design system
- ~2000 lines of code total

## Telemetry Data Model

### session_start
```json
{
  "sessionId": "mg-1709753126581-abc123",
  "seed": 1234567890,
  "initialBeds": ["Kale", "Tomatoes", "Herbs", "Strawberries", "Kale", "Sunflowers"]
}
```

### week_locked
```json
{
  "weekNumber": 1,
  "actionsUsedCount": 3,
  "timeToLockMs": 45000,
  "unusedActions": 0,
  "actionsSummary": {
    "Water": 1,
    "Fertilise": 1,
    "PestControl": 0,
    "Replant": 1,
    "Compost": 0,
    "MarketDay": 0
  }
}
```

### resolution
- Contains perBedBefore and perBedAfter snapshots
- weatherResult, eventTriggered
- harvestTokensGained, reputationDelta

### session_end
- Final totals: tokens, reputation, compostLevel
- Derived metrics: thrashIndex, stabilityBias, strategyShiftIndex, stressReactionIndex

## CSV Columns
- sessionId, weekNumber, weatherOutlook, weatherResult, eventTriggered
- timeToLockMs, actionsUsedCount
- countWater, countFertilise, countPestControl, countReplant, countCompost, countMarketDay
- harvestTokensGained, reputationDelta
- bedsHealthyCount, bedsPoorCount, averageHealth, averagePests, averageMoisture, averageGrowth

## Architecture Notes

### Separation of Concerns
- **rng.js**: Only randomness
- **constants.js**: Only configuration
- **simulation.js**: Only game logic (pure functions)
- **telemetry.js**: Only data logging/export
- **ui.js**: Only UI and user interaction
- **styles.css**: Only presentation

### State Management
- Single gameState object per session
- Immutable snapshots for telemetry
- No global variables except gameState and rng
- Clean initialization and reset

### Rendering
- Full page re-render on state change
- No virtual DOM, but fast enough for 12 weeks
- Responsive design works on mobile

## Future Expansion (V1, V2)

### V1 Additions
- Forecast action: Partially reveals weather outcome
- Confidence micro-prompt: "How do you feel about this week?"
- More events and plants
- Unlocks powered by Harvest Tokens

### V2 Additions
- Difficulty modes (Cosy, Operator, Hard Winter)
- Seasonal modifiers
- Cosmetic garden skins
- Sponsored tools/stalls

## Support & Debugging

### Common Issues

**Game not appearing?**
- Check browser console for script errors
- Ensure all 5 script tags loaded (Network tab)
- Verify CSS file loaded
- Check localStorage isn't disabled

**Actions not working?**
- Ensure action slot isn't full (max 3 per week)
- For targeted actions, click an actual bed
- For Replant, select a plant first

**Exports not downloading?**
- Check if browser blocked popups
- Try a different browser
- Check localStorage for data

### Console Access
- Game logs telemetry to memory (no console logs)
- gameState available in browser console as `gameState`
- Seed in `gameState.seed`
- Events in `gameState.telemetryEvents`

### Testing New Configs
1. Edit constants.js
2. Refresh browser
3. Start new season (clears cache)
4. Run a few weeks to test
5. Check CSV/JSON exports

## Files Summary

```
index.html                          - Container + script tags
css/marketGardenV0.css              - All game styles (~500 lines)
js/marketGardenV0/
  ├── rng.js                        - Seeded RNG (~50 lines)
  ├── constants.js                  - Game config (~200 lines)
  ├── simulation.js                 - Game engine (~350 lines)
  ├── telemetry.js                  - Data logging/export (~200 lines)
  └── ui.js                         - UI & controller (~500 lines)
```

**Total: ~1800 lines of code**

## That's It!

Your Market Garden V0 game is now live on your website. Players can enjoy a complete 12-week seasonal experience while quietly generating high-signal behavioral data for your Visibility Index.

Have fun! 🌱🌾
