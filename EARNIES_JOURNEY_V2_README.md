# Earnie's Journey V2 - Implementation Complete ✅

## Overview
**Earnie's Journey V2** is a narrative-focused challenger version of V0, sitting alongside it without modifying the original game. V2 emphasizes rich storytelling, detailed action descriptions, and meaningful consequences.

## Key Differences from V0

### Same Core Mechanics
- 12-week gameplay structure
- 4 meters: Momentum, Stability, Options, Joy (0-100)
- 100 time budget per week
- 24 action cards, 10 events, 3 paths
- Event system with shocks and opportunities

### Enhanced Narrative Features
✨ **Detailed Action Pop-ups** - Before choosing an action, see:
- **What Happens**: Detailed narrative of the action
- **World Context**: Atmospheric description of the location
- **Consequences**: Emotional and practical impacts
- **Meter Impact**: Before/after values showing exact deltas
- **Ongoing Effects**: Warning for multi-week consequences

✨ **Rich Path Narratives** - Choose from three character archetypes:
- **Builder**: "steady, deliberate, unstoppable" (Stability ≥75 AND Momentum ≥60)
- **Explorer**: "open-minded, curious, alive with possibility" (Options ≥80 AND Joy ≥60)
- **Closer**: "ambitious, focused, determined to win" (Momentum ≥85 AND Stability ≥55)

✨ **Narrative Event System** - Weekend events with:
- Story framing and emotional context
- 2 meaningful decision options
- Each option with descriptive narrative (not just mechanical effects)
- Consequence descriptions showing how choice impacts character

✨ **World Building** - 6 locations with narrative depth:
- **The Gig Hub** 💼 - Bustling opportunity center
- **The Workshop** 🔧 - Creative and hands-on space
- **Planner's Office** 📋 - Strategic thinking hub
- **Market District** 🛒 - Commerce and exchange
- **The Vault** 🏦 - Security and resources
- **The Lounge** ☕ - Rest and reflection

## File Structure

```
├── js/earniesJourneyV2/
│   ├── rng.js           # Seeded random number generation (Mulberry32)
│   ├── constants.js     # Game config, paths, locations, actions, events
│   ├── engine.js        # Game logic: state, meters, event handling
│   ├── telemetry.js     # Event logging and session tracking
│   └── ui.js            # Narrative UI with detailed pop-ups
├── css/earniesJourneyV2.css    # Narrative-focused styling
├── earnies-journey-v2.html     # Standalone game page
├── js/data.js           # GAMES_LIBRARY entry added
└── js/app.js            # Launch handler added
```

## How to Play

1. **Select Your Path** - Choose Builder, Explorer, or Closer based on your character
2. **Plan Your Week** - See 6 location cards, each with available actions
3. **Explore Actions** - Click any action to see detailed pop-up explaining:
   - What will happen to you
   - How the location feels
   - What emotional/practical effects this creates
   - Exact impact on your meters
4. **Make Choices** - Confirm action or cancel and choose differently
5. **Face Weekend Events** - Handle unexpected situations with narrative options
6. **Reach Your Destination** - Complete 12 weeks and discover your path outcome

## Technical Implementation

### Game Logic
- **Session ID**: Prefixed with "ej2-" for telemetry tracking
- **Meter Clamping**: Values always 0-100 (soft caps prevent overflow)
- **Ongoing Effects**: Tracked per-week, applied automatically until completion
- **Event Selection**: Weighted randomization with seeded RNG for reproducibility
- **CSV Export**: Simplified logging vs V0 (removed CSV export for streamlined experience)

### UI Architecture
- **Modal-Based Interface**: Separate modals for path selection, game screen, action detail, event detail, outcome
- **Responsive Design**: Grid-based layout adapts to mobile/tablet/desktop
- **Narrative Typography**: Serif fonts for story feel, clear visual hierarchy
- **Accessibility**: Clear labels, readable font sizes, good color contrast

### Styling Philosophy
- **Text-Centric**: Emphasis on readable narrative content
- **Generous Spacing**: Room to breathe and absorb information
- **Color Psychology**: Gradient headers, color-coded meters for quick scanning
- **Modal Design**: Large, readable modals with clear section breaks

## Constants Highlights

### ACTIONS_V2 (24 cards)
Each action now includes:
```javascript
{
  id: 'freelance-project',
  title: 'Freelance Project',
  location: 'The Gig Hub',
  timeCost: 25,
  effects: { momentum: 15, stability: -5, options: 5 },
  detailedDescription: "Take on a challenging freelance gig. Quick money but demanding work that leaves you exhausted.",
  worldContext: "The Gig Hub is buzzing with opportunity, but the energy is frenetic.",
  consequences: "You're earning good money, but work is relentless. You feel the burn.",
  tags: ['income', 'action'],
  riskBand: 'medium'
}
```

### EVENTS_V2 (10 events)
Each event includes narrative framing:
```javascript
{
  name: 'Lucky Opportunity',
  emoji: '✨',
  description: "Unexpected chance arrives...",
  narrative: "Life has a way of surprising you with possibilities.",
  options: [
    {
      label: 'Pursue It Aggressively',
      narrative: "You dive in headfirst, seizing the moment",
      effects: { momentum: 20, options: -10 }
    },
    {
      label: 'Explore Carefully',
      narrative: "You investigate first, then decide",
      effects: { momentum: 10, options: 5 }
    }
  ]
}
```

## Integration Points

### GAMES_LIBRARY (data.js)
```javascript
{
  slug: 'earnies-journey-v2',
  title: "Earnie's Journey V2",
  subtitle: 'The Detailed Adventure - Rich narratives and choices',
  // ... full entry with learnings
}
```

### Launch Handler (app.js)
```javascript
else if (gameSlug === 'earnies-journey-v2') {
  openGameIframeModal('earnies-journey-v2.html', gameTitle);
}
```

## Telemetry

V2 tracks:
- Session starts (with path chosen)
- Actions selected (what, when, effects)
- Weekend events (event type, option chosen)
- Session ends (outcome, final meters)

Stored in localStorage: `earniesJourneyV2:lastRun`

## Comparison: V0 vs V2

| Feature | V0 | V2 |
|---------|----|----|
| Core gameplay | ✅ | ✅ Same |
| 12 weeks | ✅ | ✅ Same |
| 4 meters | ✅ | ✅ Same |
| 24 actions | ✅ | ✅ Same |
| 10 events | ✅ | ✅ Same |
| 3 paths | ✅ | ✅ Same |
| Board game aesthetic | ✅ | ❌ |
| Giraffe character | ✅ | ❌ |
| Animated pieces | ✅ | ❌ |
| **Detailed action pop-ups** | ❌ | ✅ |
| **Narrative descriptions** | ❌ | ✅ |
| **World context** | ❌ | ✅ |
| **Consequence explanations** | ❌ | ✅ |
| **Rich path narratives** | ❌ | ✅ |
| **Event option narratives** | ❌ | ✅ |
| Quick play speed | ✅ Fast | ❌ Thoughtful |

## Playing V2

- **Access**: Available in Games Library as "Earnie's Journey V2"
- **Play Time**: ~25 minutes for thoughtful playthrough
- **Best For**: Players who want to understand consequences and character development
- **Replay Value**: Different paths, different event outcomes, different meter combinations

## Future Enhancements

Potential additions for V2:
- Character profile that builds as you play
- Relationship meter (how NPCs view Earnie)
- Memory system (callbacks to earlier choices)
- Multiple ending variants based on path + meter combinations
- Persistent state across sessions
- Sharing story outcomes

## Code Quality

✅ **No Syntax Errors** - All files validated
✅ **Modular Architecture** - Reusable RNG, engine, telemetry
✅ **Narrative First** - Story content deeply integrated
✅ **Mobile Responsive** - Works on all screen sizes
✅ **Accessibility** - Clear labels, readable fonts, good contrast
✅ **Performance** - Lightweight, instant interactions

## Testing Checklist

- [x] Path selection works
- [x] Game screen renders all locations
- [x] Actions show detailed pop-ups with all sections
- [x] Meter calculations and deltas display correctly
- [x] Event pop-ups show narrative options
- [x] Ongoing effects tracked and applied
- [x] Week advancement logic works
- [x] Outcome screen displays results
- [x] Integration with GAMES_LIBRARY works
- [x] Launch handler opens V2 correctly

---

**Status**: ✅ Complete and Ready to Play
**Original V0**: Unchanged and fully functional
**V2 Location**: Separate directory, separate files, separate entry in games library
