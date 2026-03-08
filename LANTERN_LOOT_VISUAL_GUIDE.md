# Lantern & Loot Character & Animation Visual Summary

## Screen-by-Screen Visual Enhancements

### 🎮 Game Start Screen
```
┌─────────────────────────────────────┐
│                                     │
│   FLOOR 1/4                         │
│   Descend deeper into the dungeon   │
│                                     │
│         ┌──────────┐                │
│         │ Lantern  │   ✨ Bouncing  │
│         │ Bearer   │   (pulse)      │
│         └──────────┘                │
│                                     │
│    Health  ████░░░░  75/100         │
│    Stamina ██████░░░  60/100        │
│    Light   ████░░░░░  40/100        │
│    Loot    25                       │
│                                     │
│   [Enter Floor 1]                   │
│                                     │
└─────────────────────────────────────┘
```

### ⚔️ Combat Room Screen
```
┌─────────────────────────────────────┐
│                                     │
│       FLOOR 2, ROOM 3 OF 8          │
│       High Danger                   │
│                                     │
│   ┌──────────┐     ┌──────────┐    │
│   │ Lantern  │  vs │ Skeleton │    │
│   │ Bearer   │     │          │    │
│   └──────────┘     └──────────┘    │
│                                     │
│   [Explore] [Sneak] [Loot] [Rest]  │
│                                     │
│   Your Light: 30% - Shadows loom    │
│                                     │
└─────────────────────────────────────┘
```

**Combat Animations:**
- Player character: `characterEnter` (fade in)
- Skeleton character: `characterEnter` (fade in)
- Lantern: `pulse 2s` (continuous glow)
- On action selection:
  - Enemy applies `attacking` class → `enemyAttack` animation (0.6s)

### 💥 Combat Resolution Screen
```
┌─────────────────────────────────────┐
│                                     │
│        YOU TOOK DAMAGE!             │
│                                     │
│   ┌──────────┐                      │
│   │ Lantern  │ 💥 ──→               │
│   │ Bearer   │    ╭─────╮           │
│   │ (shake)  │    │ -15 │ (floats)  │
│   └──────────┘    ╰─────╯           │
│                                     │
│   Health: 85 → 70                   │
│   Stamina: 60 → 45                  │
│                                     │
│          [Next Room]                │
│                                     │
└─────────────────────────────────────┘
```

**Resolution Animations:**
- Player character: `.damage` class applied
  - `shake 0.4s` ← left-right tremor
  - `damageFlash 0.4s` ← red flash overlay
- Deltas: Float upward with `floatUp 1s` animation
  - Damage indicator: ╭─────╮ (red)
  - Heal indicator: ╭─────╮ (green)
  - Loot indicator: ╭─────╮ (gold)

### 💰 Treasure Discovery Screen
```
┌─────────────────────────────────────┐
│                                     │
│        TREASURE FOUND!              │
│                                     │
│   ┌──────────┐     ┌──────────┐    │
│   │ Lantern  │ →   │ Treasure │    │
│   │ Bearer   │     │ Chest    │ ✨ │
│   └──────────┘     └──────────┘    │
│                      sparkle anim   │
│                                     │
│   [Explore] [Sneak] [Loot] [Rest]  │
│                                     │
│   You see glints of gold            │
│                                     │
└─────────────────────────────────────┘
```

**Treasure Animations:**
- Chest visual: `treasureSparkle 0.6s` (color shifts)
- Player character: `characterEnter` (normal)
- Deltas on resolution: Gold-colored floats for loot

### 🎭 Trap Encounter Screen
```
┌─────────────────────────────────────┐
│                                     │
│        DANGER AHEAD!                │
│                                     │
│   ┌──────────┐     ┌──────────┐    │
│   │ Lantern  │ ⚠️  │ Spikes & │    │
│   │ Bearer   │     │ Chains   │    │
│   └──────────┘     └──────────┘    │
│                                     │
│   [Explore] [Sneak] [Loot] [Rest]  │
│                                     │
│   Sharp blades glint menacingly     │
│                                     │
└─────────────────────────────────────┘
```

**Trap Animations:**
- Trap visual: Spikes displayed
- On damage: Trap visual applies `.trap-trigger` → `shake 0.5s`
- Player takes damage: `damageFlash` + `shake` animations

### 🏛️ Healing Fountain Screen
```
┌─────────────────────────────────────┐
│                                     │
│        HEALING FOUNTAIN!            │
│                                     │
│   ┌──────────┐     ┌──────────┐    │
│   │ Lantern  │ →   │ Fountain │    │
│   │ Bearer   │     │ Waters   │    │
│   └──────────┘     └──────────┘    │
│                                     │
│   [Explore] [Sneak] [Loot] [Rest]  │
│                                     │
│   Crystalline waters shimmer        │
│                                     │
└─────────────────────────────────────┘
```

**Fountain Animations:**
- Fountain visual: Static stone structure
- On use: Player character `.healed` class → `healGlow 0.6s`
- Green healing indicators float up

### 🎒 Empty Room Screen
```
┌─────────────────────────────────────┐
│                                     │
│        EMPTY CHAMBER                │
│                                     │
│   ┌──────────┐     ┌──────────┐    │
│   │ Lantern  │ →   │ Dusty    │    │
│   │ Bearer   │     │ Chamber  │    │
│   └──────────┘     └──────────┘    │
│                                     │
│   [Explore] [Sneak] [Loot] [Rest]  │
│                                     │
│   Only dust particles catch light   │
│                                     │
└─────────────────────────────────────┘
```

**Empty Room Animations:**
- Chamber visual: Dungeon with torch
- Player character: `characterEnter` (normal)
- No special effects

### 🏁 Floor Complete Screen
```
┌─────────────────────────────────────┐
│                                     │
│   FLOOR 2 COMPLETE!                 │
│                                     │
│      ┌────────────┐                 │
│      │ Lantern   │  ✨ Golden       │
│      │ Bearer    │     Glow         │
│      │ (victorious)  & Pulsing      │
│      └────────────┘                 │
│                                     │
│   Choose an upgrade to continue:    │
│   ╔═══════════╗ ╔═══════════╗       │
│   ║ Health+20 ║ ║ Light+30  ║       │
│   ╚═══════════╝ ╚═══════════╝       │
│   ╔═══════════╗ ╔═══════════╗       │
│   ║ Stamina+15║ ║ Backtrack ║       │
│   ╚═══════════╝ ╚═══════════╝       │
│                                     │
└─────────────────────────────────────┘
```

**Floor Complete Animations:**
- Player character: `ll-character-victorious` class
  - Scaled 1.1x larger
  - `characterEnter 0.6s` fade-in
  - `pulse 1.5s` infinite starting at 0.6s
  - Drop-shadow: `0 0 20px rgba(251, 191, 36, 0.6)` (gold glow)
- Upgrade cards: Static (await user selection)

### 🎉 Victory Screen
```
┌─────────────────────────────────────┐
│                                     │
│   🎉 VICTORY!                       │
│   LEGENDARY CHAMPION                │
│                                     │
│       ┌────────────┐                │
│       │ Lantern   │                 │
│       │ Bearer    │  ⭐ Celebrating  │
│       │ (enlarged)│                 │
│       └────────────┘                │
│                                     │
│   Final Loot:        450            │
│   Floors Cleared:    4/4            │
│   Rooms Cleared:     32/32          │
│   Clarity Seeking:   78%            │
│                                     │
│   [New Run] [CSV] [JSON]            │
│                                     │
└─────────────────────────────────────┘
```

**Victory Animations:**
- Character: `ll-character-victorious` class
  - Scaled larger
  - Golden glow effect
  - Continuous pulse animation
  - Celebratory visual appearance

### 💀 Defeat Screen
```
┌─────────────────────────────────────┐
│                                     │
│   💀 DEFEAT                         │
│   BRAVE ADVENTURER                  │
│                                     │
│        ┌────────────┐               │
│        │ Lantern   │               │
│        │ Bearer    │  ⚰️ Defeated   │
│        │ (rotated) │     (grayed)   │
│        └────────────┘               │
│                                     │
│   Final Loot:        120            │
│   Floors Cleared:    2/4            │
│   Rooms Cleared:     14/32          │
│   Clarity Seeking:   45%            │
│                                     │
│   [New Run] [CSV] [JSON]            │
│                                     │
└─────────────────────────────────────┘
```

**Defeat Animations:**
- Character: `ll-character-defeated` class
  - Reduced opacity (0.7)
  - Grayscale filter (50%)
  - Horizontal flip: `scaleX(-1)`
  - Rotation: `rotate(-5deg)`
  - Dark shadow effect
  - Defeated posture visual

## Animation Timeline Examples

### Combat Resolution Sequence
```
Time:    0ms    100ms   200ms   300ms   400ms   500ms   600ms
         │      │       │       │       │       │       │
Player:  ▓▓────[════════════════]───────────────────────
         Enter  Shake + Flash
         
Enemy:   ▓▓────────────────────[════════════════]───────
         Enter            Attack Animation
         
Deltas:  ─────────────────────[═════════════════════════]
                          Float Up (float away)
```

### Floor Completion Sequence
```
Time:    0ms    100ms   200ms   300ms   400ms   500ms   600ms
         │      │       │       │       │       │       │
Player:  ▓▓────[════════════════════]────[═══════════════════
         Enter  Character Enter      Pulse (continuous)
         
Glow:    ─────────────────────────────[═════════════════════
                                  Gold Shadow + Pulse
         
Upgrades: ────────────────────────────────────[Ready to click]
```

## Character Visual Specifications

### Size & Scale
- **Standard**: 100x100 or 100x120 pixels
- **Floor Start**: 150x150 pixels (larger, more prominent)
- **Floor Complete/End**: Scaled 1.1x (slightly enlarged for emphasis)

### Colors
- **Lanternbearer**: Warm tones, golden lantern
- **Goblin**: Green skin, red eyes (early game)
- **Skeleton**: White/gray (mid-game)
- **Spider**: Dark body (late-game)
- **Ogre**: Purple/brown (boss-level)

### Filters & Effects
- Drop-shadow: `0 4px 8px rgba(0, 0, 0, 0.6)` (standard)
- Golden glow: `0 0 20px rgba(251, 191, 36, 0.6)` (victory)
- Defeat: `grayscale(0.5)` + dark shadow

## Browser Compatibility
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ All animations GPU-accelerated

## Performance Notes
- SVG characters: ~0.5-1KB each (minimal file size)
- CSS animations: GPU-accelerated, no JS animation loops
- Smooth 60fps on modern devices
- Mobile-optimized: Animations work at 320px+ viewports
