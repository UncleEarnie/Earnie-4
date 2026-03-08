# Lantern & Loot V0: Character Design & Animations

## Overview
The Lantern & Loot dungeon crawler mini-game now features visual character sprites and smooth CSS animations throughout all gameplay screens.

## Character System

### Player Character (Lanternbearer)
- **Sprite**: SVG-based lanternbearer with:
  - Head with simple face
  - Body/torso
  - Animated lantern (glowing orb with pulse animation)
  - Boots
- **Size**: 100x120 pixels (responsive on floor start: 150x150)
- **Base Animation**: `characterEnter` (0.5s ease-out fade-in)
- **Lantern Visual**: Yellow-orange gradient with glow effect and continuous pulse animation

### Enemy Characters (Difficulty & Floor Progression)

#### Enemy Type System
Enemy types are determined by floor and difficulty using the `getEnemyType(floor, difficulty)` function:

| Floor | Base Type | Upgraded Type |
|-------|-----------|---------------|
| Floor 1 | Goblin | Ogre (if difficulty ≥ 4) |
| Floor 2 | Skeleton | Skeleton/Ogre |
| Floor 3 | Spider | Spider/Ogre |
| Floor 4+ | Ogre | Ogre |

#### Goblin
- **Appearance**: Green skin, pointy ears, red eyes, hunched posture
- **Details**: Clawed hands, small stature
- **Visual Cue**: Low threat indicator
- **Size**: 100x100 pixels

#### Skeleton
- **Appearance**: White skull with eye sockets, ribcage, spine
- **Details**: Bony arms and legs, hollow expression
- **Visual Cue**: Medium-high threat indicator
- **Size**: 100x100 pixels

#### Giant Spider
- **Appearance**: 8-legged body with dark coloring
- **Details**: Multiple eyes, fanged mouth
- **Visual Cue**: High threat, distinct from humanoid enemies
- **Size**: 100x100 pixels

#### Ogre
- **Appearance**: Large purple body with tusks
- **Details**: Club weapon, angry expression, thick muscular limbs
- **Visual Cue**: Boss-level threat, highest difficulty
- **Size**: 100x100 pixels

### Environmental Objects

#### Treasure Chest
- **Appearance**: Brown wooden chest with gold coins spilling out
- **Animation**: `treasureSparkle` (0.6s with color shifts)
- **Visual Cue**: Wealth and reward

#### Trap
- **Appearance**: Red spikes with chain pattern
- **Animation**: Triggers `shake` effect when activated
- **Visual Cue**: Danger indicator

#### Healing Fountain
- **Appearance**: Stone fountain with water streams
- **Animation**: None (static)
- **Visual Cue**: Recovery and hope

#### Empty Room
- **Appearance**: Dungeon chamber with torch and dust motes
- **Animation**: None (static)
- **Visual Cue**: Safety and exploration

## Animations System

### Animation Keyframes

#### `characterEnter` (0.5s)
- Smooth fade-in and slide up entrance
- Applied to all character sprites when rendered
- Creates sense of appearance and presence

#### `bounce` (2s infinite)
- Used on floor start screen character
- Bouncing motion with ease-in-out timing
- Applied to 150x150 character sprite
- Conveys readiness and anticipation

#### `shake` (0.4s)
- Rapid left-right oscillation
- Applied when damage is taken
- Creates impact feedback

#### `damageFlash` (0.4s)
- Red color flash overlay
- Synchronized with shake
- Indicates health loss event

#### `healGlow` (0.6s)
- Green radiant glow effect
- Applied after healing
- Positive feedback indicator

#### `pulse` (2s infinite)
- Lantern glow oscillation
- Continuous effect during gameplay
- Applied to `.ll-lantern` element
- Also used on character during victory

#### `floatUp` (1s)
- Delta indicators (damage, heal, loot) float upward with fade-out
- Creates visual feedback hierarchy

#### `enemyAttack` (0.6s)
- Enemy character springs forward slightly
- Used during combat resolution

#### `treasureSparkle` (0.6s)
- Color-shifting sparkle effect
- Applied to treasure chest visual
- Creates excitement for loot discovery

### Animation Application Events

#### Room Encounter Screen
- **Player Character**: 
  - Always has `characterEnter` animation
  - Lantern has continuous `pulse`
- **Enemy Character**:
  - Has `characterEnter` animation
  - Applies `attacking` class during resolution, triggering `enemyAttack`
- **Treasure/Fountain/Trap/Empty**: 
  - Appropriate visual applied with entry animation

#### Resolution Feedback Screen
- **Player Character**:
  - Shows with damage/healed CSS classes applied
  - `.damage` → `shake` + `damageFlash` (0.4s)
  - `.healed` → `healGlow` (0.6s)
- **Deltas Display**:
  - Damage indicators: Red box with `floatUp` animation
  - Heal indicators: Green box with `floatUp` animation
  - Loot indicators: Gold box with `floatUp` animation

#### Floor Start Screen
- **Player Character**:
  - Scaled to 150x150 pixels
  - Continuous `bounce` animation (2s infinite)
  - Lantern visible with `pulse` effect
- **Stats Banner**: Health, stamina, light, loot displayed below

#### Floor End Screen
- **Player Character**:
  - Class: `ll-character-victorious`
  - Scaled 1.1x larger
  - Has `characterEnter` then `pulse` animations
  - Gold glow effect (drop-shadow with gold color)

#### End of Run Screen
- **Victory Variant**:
  - Class: `ll-character-victorious`
  - Scaled larger with golden glow
  - Celebratory pose via animations
- **Defeat Variant**:
  - Class: `ll-character-defeated`
  - Reduced opacity (0.7)
  - Grayscale filter (50%)
  - Horizontal flip + rotation (-5deg)
  - Darker shadow effect

## CSS Classes & Styling

### Character Container Classes
- `.ll-character`: Base character div with flex layout
- `.ll-character-sprite`: SVG container with drop-shadow filter
- `.ll-character-name`: Label below sprite (enemy names)
- `.ll-character-victorious`: Victory state styling
- `.ll-character-defeated`: Defeat state styling
- `.ll-vs-label`: Combat label ("vs", "→", "⚠️", "...")

### Animation Trigger Classes
- `.damage`: Applied to player sprite on damage taken
- `.healed`: Applied to player sprite when healed
- `.attacking`: Applied to enemy sprite during combat
- `.treasure-visual`: Applied to treasure chest sprite
- `.trap-trigger`: Applied to trap visual when triggered

### Screen-Specific Classes
- `.ll-floor-start`: Floor start screen container
- `.ll-floor-end`: Floor end screen container
- `.ll-end-of-run`: End of run screen container
- `.ll-encounter-stage`: Combat room display area

## Visual Feedback Design

### Combat Encounter
1. Player and enemy characters appear with `characterEnter` animation
2. "vs" label between them indicates confrontation
3. Action buttons below allow decision-making
4. Upon resolution, enemy applies `attacking` class → `enemyAttack` animation
5. Player character shows damage/heal animation based on outcome
6. Deltas float up with appropriate colors (red/green/gold)

### Discovery (Treasure/Trap/Fountain)
1. Object visual appears with entry animation
2. Appropriate label identifies room type
3. Arrow "→" indicates approach/interaction
4. Upon action, object animates (sparkle for treasure, shake for trap)
5. Results displayed in delta indicators

### Floor Progression
- **Floor Start**: Bouncing character with readiness animation
- **Floor Complete**: Victorious character pose with gold glow
- **Run Complete**: 
  - Victory: Enlarged, glowing, pulsing character
  - Defeat: Grayed-out, rotated, defeated posture

## Implementation Details

### Character Generation
- All characters generated via SVG functions in `js/lanternLootV0/characters.js`
- Functions: `getPlayerCharacterSVG()`, `getEnemyCharacterSVG(difficulty, type)`, etc.
- SVG markup embedded directly in DOM (no external image dependencies)
- Generated on-demand (no pre-loading required)

### Animation Triggering
- CSS classes applied conditionally based on game events
- Pure CSS animations (no JavaScript animation loops)
- Triggers via game state changes and user actions
- All animations precomputed in CSS for smooth performance

### Responsive Design
- Character sizes scale with viewport
- Floor start character: 150x150 on desktop, smaller on mobile
- All animations work at 320px+ viewport widths
- Flex layout adapts character positioning across screen sizes

### Performance
- SVG characters are lightweight (<1KB each)
- CSS animations use GPU acceleration (transform, opacity)
- No animation loops running continuously (only on-demand)
- Minimal repaints per animation cycle

## Testing Checklist

- [ ] Character SVG renders correctly at different sizes
- [ ] All animations play smoothly without jank
- [ ] Floor-based enemy type progression works (floor 1→goblin, floor 2→skeleton, etc.)
- [ ] Damage/heal animations apply correctly during resolution
- [ ] Victory character shows golden glow and celebratory pose
- [ ] Defeat character appears grayed-out and defeated
- [ ] Animations work on mobile viewport (320px+)
- [ ] Game mechanics unchanged (all original logic preserved)
- [ ] Telemetry still logs correctly (no interference from visuals)
- [ ] Performance remains smooth even with multiple animations playing

## Future Enhancement Opportunities

1. **Particle Effects**: Add floating particles for magic spells or treasure
2. **Character Expressions**: Different facial expressions based on game state
3. **Combat Choreography**: More elaborate attack/defense animation sequences
4. **Environmental Effects**: Dungeon lighting effects that change with light stat
5. **Boss Characters**: Unique visual designs for floor 4 ogre encounters
6. **Equipment Visualization**: Visual representation of upgrades on character
7. **Attack Variations**: Different animation based on action type (explore, sneak, loot, rest)
8. **Sound Effects**: Audio paired with animations for sensory feedback
