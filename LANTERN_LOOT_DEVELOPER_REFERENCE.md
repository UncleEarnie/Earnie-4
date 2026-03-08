# Lantern & Loot Character System - Developer Quick Reference

## Character Functions

### Player Character
```javascript
// Get player (lanternbearer) SVG sprite
getPlayerCharacterSVG()
// Returns: SVG string (100x120 viewBox)
// Used in: Floor start, floor end, end of run, combat screens
```

### Enemy Characters
```javascript
// Get enemy SVG sprite with type variation
getEnemyCharacterSVG(difficulty, type)
// difficulty: 1-4 (determines appearance scale/quality)
// type: 'goblin' | 'skeleton' | 'spider' | 'ogre'
// Returns: SVG string (100x100 viewBox)
```

### Environmental Objects
```javascript
getTreasureVisualSVG()    // Golden chest with coins
getTrapVisualSVG()        // Red spikes with chains
getFountainVisualSVG()    // Stone fountain with water
getEmptyRoomVisualSVG()   // Dungeon chamber
// All return: SVG string (100x100 viewBox)
```

## Enemy Type Selection Helper

```javascript
// Determines enemy type based on floor and difficulty
getEnemyType(floor, difficulty)
// Returns: 'goblin' | 'skeleton' | 'spider' | 'ogre'

// Progression:
// Floor 1: goblin → ogre (difficulty 4)
// Floor 2: skeleton → ogre (difficulty 4)
// Floor 3: spider → ogre (difficulty 4)
// Floor 4+: ogre (always)
```

## Animation Classes

### Trigger Classes (apply to .ll-character-sprite)
```css
.ll-character-sprite.damage      /* Triggers: shake + damageFlash (0.4s) */
.ll-character-sprite.healed      /* Triggers: healGlow (0.6s) */
.ll-character-sprite.attacking   /* Triggers: enemyAttack (0.6s) */
.ll-treasure-visual              /* Triggers: treasureSparkle (0.6s) */
.ll-trap-trigger                 /* Triggers: shake (0.5s) */
```

### State Classes (apply to .ll-character container)
```css
.ll-character-victorious    /* Victory pose: scale, glow, pulse */
.ll-character-defeated      /* Defeat pose: grayed, rotated */
```

## Animation Keyframes

| Animation | Duration | Timing | Effect |
|-----------|----------|--------|--------|
| `characterEnter` | 0.5s | ease-out | Fade-in entrance |
| `bounce` | 2s | ease-in-out | Bouncing motion (infinite) |
| `shake` | 0.4s | ease-in-out | Left-right tremor |
| `damageFlash` | 0.4s | ease-in-out | Red color flash |
| `healGlow` | 0.6s | ease-out | Green glow effect |
| `pulse` | 2s | ease-in-out | Oscillating glow (infinite) |
| `floatUp` | 1s | ease-out | Float upward with fade |
| `enemyAttack` | 0.6s | ease-in-out | Spring forward |
| `treasureSparkle` | 0.6s | ease-in-out | Color-shifting effect |
| `slideInUp` | 0.4s | ease-out | Slide up animation |

## CSS Classes Quick Reference

```css
/* Character Container */
.ll-character              /* Base character div */
.ll-character-sprite       /* SVG wrapper (100x120 or 100x100) */
.ll-character-name         /* Enemy name label */
.ll-character-victorious   /* Victory state styling */
.ll-character-defeated     /* Defeat state styling */

/* Screen Containers */
.ll-floor-start           /* Floor start screen */
.ll-floor-end             /* Floor end screen */
.ll-end-of-run            /* End of run screen */
.ll-encounter-stage       /* Combat room display */

/* Indicators */
.ll-damage-indicator      /* Red damage box */
.ll-heal-indicator        /* Green heal box */
.ll-loot-indicator        /* Gold loot box */
.ll-vs-label              /* Combat/encounter label */

/* Special Elements */
.ll-lantern               /* Glowing lantern (40x40, pulsing) */
```

## Commonly Modified Sections

### Adding a Character to a Screen
```javascript
// 1. Create character container
const charDiv = document.createElement('div');
charDiv.className = 'll-character';

// 2. Create sprite wrapper
const charSprite = document.createElement('div');
charSprite.className = 'll-character-sprite';

// 3. Add SVG
charSprite.innerHTML = getPlayerCharacterSVG();

// 4. Add to container
charDiv.appendChild(charSprite);
container.appendChild(charDiv);
```

### Applying Animation on Event
```javascript
// Damage animation
charSprite.classList.add('damage');
// Animation plays automatically (0.4s shake + damageFlash)

// Remove class after animation if needed
setTimeout(() => charSprite.classList.remove('damage'), 400);
```

### Creating Victory/Defeat State
```javascript
// Victory
charDiv.classList.add('ll-character-victorious');
// Result: Scaled (1.1x), gold glow, pulsing animation

// Defeat
charDiv.classList.add('ll-character-defeated');
// Result: Grayed (50%), rotated (-5deg), low opacity
```

## Rendering Pattern (Current Implementation)

### renderFloorStart()
```
Container: .ll-screen.ll-floor-start
├── .ll-header (title)
├── .ll-character (player, 150x150, bouncing)
│   └── .ll-character-sprite (SVG player)
│   └── .ll-lantern (glowing orb)
├── .ll-stats-banner (health/stamina/light/loot)
└── Button: Enter Floor
```

### renderRoom() (Combat)
```
Container: .ll-screen.ll-room
├── Room info (title, flavor)
├── .ll-encounter-stage (flexbox, horizontal)
│   ├── .ll-character (player)
│   │   └── .ll-character-sprite (player SVG)
│   ├── .ll-vs-label (vs / → / ⚠️ / ...)
│   └── .ll-character (enemy/object)
│       └── .ll-character-sprite (enemy/object SVG)
├── Action buttons (Explore, Sneak, Loot, Rest)
└── Light quality indicator
```

### renderResolutionFeedback()
```
Container: .ll-screen.ll-resolution
├── Result title (You Won / You Lost / etc)
├── .ll-character (player, possibly .damage / .healed)
│   └── .ll-character-sprite (player SVG)
├── .ll-action-feedback (deltas)
│   ├── .ll-damage-indicator (red floats)
│   ├── .ll-heal-indicator (green floats)
│   └── .ll-loot-indicator (gold floats)
└── Button: Next Room / Continue
```

### renderFloorEnd()
```
Container: .ll-screen.ll-floor-end
├── .ll-header (Floor Complete!)
├── .ll-character.ll-character-victorious (player, triumphant)
│   └── .ll-character-sprite (player SVG)
├── Floor summary text
├── .ll-upgrade-grid (upgrade cards)
└── Upgrade selection buttons
```

### renderEndOfRun()
```
Container: .ll-screen.ll-end-of-run
├── .ll-end-header (Victory! / Defeat)
├── .ll-character (.ll-character-victorious or .ll-character-defeated)
│   └── .ll-character-sprite (player SVG)
├── .ll-end-stats (statistics display)
└── .ll-button-group (New Run, Download buttons)
```

## Color Scheme Reference

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Damage | Red | #ef4444 | Damage indicator, health bar |
| Healing | Green | #22c55e | Heal indicator |
| Loot | Gold | #fbbf24 | Loot indicator, lantern |
| Stamina | Blue | #3b82f6 | Stamina bar |
| Light | Yellow | #fcd34d | Light bar |
| Victory Glow | Gold | rgba(251, 191, 36, 0.6) | Victory character glow |

## SVG Dimensions

| Character | ViewBox | Display Size | Notes |
|-----------|---------|--------------|-------|
| Player | 100x120 | 100x120px | Standard display, 150x150 on floor start |
| Enemies | 100x100 | 100x100px | Goblin, Skeleton, Spider, Ogre |
| Treasure | 100x100 | 100x100px | Golden chest |
| Trap | 100x100 | 100x100px | Red spikes |
| Fountain | 100x100 | 100x100px | Stone fountain |
| Empty | 100x100 | 100x100px | Dungeon chamber |

## Performance Tips

1. **SVG Generation**: All SVGs generated on-demand (no pre-loading needed)
2. **CSS Animations**: GPU-accelerated, use transform & opacity only
3. **Animation Cleanup**: Remove animation classes after playback if not needed
4. **Mobile Optimization**: Animations work at 320px+ viewports
5. **Accessibility**: Animations don't interfere with keyboard navigation

## Debugging Tips

### Character Not Appearing?
1. Check if `getPlayerCharacterSVG()` or `getEnemyCharacterSVG()` is defined
2. Verify `characters.js` is loaded before `ui.js`
3. Inspect element to see if SVG markup is present
4. Check browser console for errors

### Animation Not Playing?
1. Verify CSS keyframe is defined in `lanternLootV0.css`
2. Check if animation class is being applied (inspect element)
3. Verify animation name matches keyframe definition
4. Check if animation duration is sufficient

### Character Sizing Issues?
1. Check `.ll-character-sprite` width/height in CSS
2. Verify SVG viewBox is correct (100x100 or 100x120)
3. Check for CSS media queries affecting size
4. Use inspector to measure actual rendered size

## File Locations

```
├── js/lanternLootV0/
│   ├── characters.js           (SVG functions)
│   ├── ui.js                   (Screen rendering)
│   ├── constants.js            (Game config)
│   └── [other modules]
├── css/
│   └── lanternLootV0.css       (Animations & styles)
└── lantern-loot.html           (Game wrapper)
```

## Module Export Verification

```javascript
// Check if characters.js exports available:
console.log(typeof getPlayerCharacterSVG);      // 'function'
console.log(typeof getEnemyCharacterSVG);       // 'function'
console.log(typeof getTreasureVisualSVG);       // 'function'

// Check if ui.js renders correctly:
console.log(document.querySelector('.ll-character')); // Should find element
```

## Testing Checklist

- [ ] SVG characters render without errors
- [ ] Animations play smoothly (60fps)
- [ ] Enemy type progression correct (floor 1→goblin, etc.)
- [ ] Damage animations apply on hit
- [ ] Heal animations apply on heal
- [ ] Victory character shows gold glow
- [ ] Defeat character shows grayscale
- [ ] Mobile viewport (320px) animations work
- [ ] No console errors in browser
- [ ] Game mechanics unchanged
- [ ] Telemetry still logging
