/**
 * Constants and configuration for Lantern & Loot V0
 * All numeric values tuned for V0 balance targets
 */

const GAME_CONFIG = {
  // Game structure
  FLOORS: 5,
  ROOMS_PER_FLOOR: 6,
  TOTAL_ROOMS: 30,

  // Starting resources
  STARTING_HEALTH: 100,
  STARTING_STAMINA: 100,
  STARTING_LIGHT: 100,
  STARTING_LOOT: 0,
  STARTING_BACKTRACK_TOKENS: 3,

  // Baseline drains per room entry
  BASELINE_LIGHT_DRAIN: 8,
  BASELINE_STAMINA_DRAIN: 2,

  // Light bands for visibility
  LIGHT_BANDS: {
    BRIGHT: { min: 70, label: 'Bright' },
    DIM: { min: 40, max: 69, label: 'Dim' },
    DARK: { max: 39, label: 'Dark' }
  },

  // Action costs (additional to baseline)
  ACTION_COSTS: {
    EXPLORE: { light: -2, stamina: 0 },
    SNEAK: { light: -1, stamina: -12 },
    LOOT: { light: -6, stamina: -4 },
    REST: { light: -10, stamina: 0 }, // Recovery applied after
    SCAN: { light: -1, stamina: -10 },
    BACKTRACK: { light: -10, stamina: -10 }
  },

  // Rest recovery
  REST_RECOVERY: {
    health: 6,
    stamina: 18
  },

  // Trap mechanics
  TRAP: {
    BASE_TRIGGER: 0.65,
    DIFFICULTY_MULTIPLIER: 0.05,
    SNEAK_MODIFIER: -0.25,
    BRIGHT_MODIFIER: -0.15,
    DARK_MODIFIER: 0.10,
    LOW_STAMINA_THRESHOLD: 30,
    LOW_STAMINA_MODIFIER: 0.10,
    TRIGGER_CLAMP_MIN: 0.05,
    TRIGGER_CLAMP_MAX: 0.95,

    BASE_DAMAGE: 6,
    DAMAGE_DIFFICULTY_MULTIPLIER: 4,
    BRIGHT_DAMAGE_REDUCTION: 0.20,
    DARK_DAMAGE_INCREASE: 0.20,
    SNEAK_DAMAGE_REDUCTION: 0.15,
    LOW_STAMINA_DAMAGE_INCREASE: 0.15
  },

  // Enemy mechanics
  ENEMY: {
    ENCOUNTER_CHANCE: {
      EXPLORE: 0.85,
      SNEAK: 0.55,
      LOOT: 0.95,
      REST: 1.00
    },
    BASE_WEIGHTS: {
      ADVANTAGE: 0.30,
      EVEN: 0.50,
      AMBUSH: 0.20
    },
    WEIGHT_MODIFIERS: {
      BRIGHT: { AMBUSH: -0.10, ADVANTAGE: 0.10 },
      DARK: { ADVANTAGE: -0.10, AMBUSH: 0.10 },
      SNEAK: { AMBUSH: -0.10, EVEN: 0.10 },
      LOOT: { EVEN: -0.10, AMBUSH: 0.10 },
      LOW_STAMINA: { ADVANTAGE: -0.10, AMBUSH: 0.10 },
      REST: { AMBUSH: 0.20 } // Renormalize after
    },
    DAMAGE_BY_RESULT: {
      ADVANTAGE: { base: 4, multiplier: 2 },
      EVEN: { base: 8, multiplier: 3 },
      AMBUSH: { base: 14, multiplier: 4 }
    },
    LOOT_BY_RESULT: {
      ADVANTAGE: { base: 10, multiplier: 4 },
      EVEN: { base: 7, multiplier: 3 },
      AMBUSH: { base: 3, multiplier: 2 }
    }
  },

  // Treasure mechanics
  TREASURE: {
    BASE_LOOT: 10,
    DIFFICULTY_MULTIPLIER: 6,
    ACTION_MODIFIERS: {
      EXPLORE: 1.00,
      SNEAK: 0.70,
      LOOT: 1.40,
      REST: 0
    },
    MIMIC_DARK_CHANCE: 0.10,
    MIMIC_DIFFICULTY_BOOST: 1
  },

  // Fountain mechanics
  FOUNTAIN: {
    BASE_HEAL: 10,
    DIFFICULTY_MULTIPLIER: 2,
    ACTION_MODIFIERS: {
      EXPLORE: 1.00,
      SNEAK: 0.70,
      LOOT: 0.50,
      REST: 1.00
    },
    LOOT_BONUS_RANGE: { min: 5, max: 10 }
  },

  // Empty room mechanics
  EMPTY: {
    LOOT_RANGE: { min: 1, max: 6 }
  },

  // Trap loot for Loot action
  TRAP_LOOT: {
    NO_TRIGGER: { min: 5, max: 12 },
    TRIGGERED: { min: 3, max: 8 }
  },

  // Sneak bonuses for no encounter
  SNEAK_BONUS: { min: 2, max: 6 },

  // Merchant inventory
  MERCHANT_ITEMS: {
    OIL_FLASK: { id: 'oil-flask', name: 'Oil Flask', cost: 18, effect: { light: 25 } },
    JERKY: { id: 'jerky', name: 'Jerky', cost: 14, effect: { stamina: 25 } },
    MED_KIT: { id: 'med-kit', name: 'Med Kit', cost: 22, effect: { health: 20 } },
    CHALK_MAP: { id: 'chalk-map', name: 'Chalk Map', cost: 12, effect: { revealNext: true } }
  },

  // Floor upgrades
  UPGRADES: {
    BIGGER_LANTERN: {
      id: 'bigger-lantern',
      name: 'Bigger Lantern',
      description: 'Reduce light drain per room by 1'
    },
    BETTER_BOOTS: {
      id: 'better-boots',
      name: 'Better Boots',
      description: 'Reduce Sneak and Loot stamina costs'
    },
    BANDAGES: {
      id: 'bandages',
      name: 'Bandages',
      description: 'Restore 15 health immediately'
    },
    MAP_FRAGMENT: {
      id: 'map-fragment',
      name: 'Map Fragment',
      description: 'Reveal next 2 rooms regardless of light'
    },
    LUCKY_CHARM: {
      id: 'lucky-charm',
      name: 'Lucky Charm',
      description: 'Increase loot gains by 10%'
    },
    TRAP_KIT: {
      id: 'trap-kit',
      name: 'Trap Kit',
      description: 'Reduce trap damage by 10%'
    }
  },

  // Room types and difficulty distribution
  ROOM_TYPES: {
    EMPTY: 'Empty',
    TREASURE: 'Treasure',
    TRAP: 'Trap',
    ENEMY: 'Enemy',
    FOUNTAIN: 'Fountain',
    MERCHANT: 'Merchant'
  },

  // Floor composition rules (for non-merchant rooms)
  FLOOR_COMPOSITION: {
    ENEMY: 2,
    TRAP: 1,
    TREASURE: 1,
    EMPTY: 1,
    FOUNTAIN_OR_TREASURE: { fountain: 0.60, treasure: 0.40 }
  },

  // Difficulty ranges
  DIFFICULTY_RANGE: { min: 1, max: 5 },

  // Tier thresholds (for end-of-run tier label)
  TIER_THRESHOLDS: {
    CAUTIOUS: { clarity: 0.35, rush: 0.30 },
    BALANCED: { clarity: 0.50, rush: 0.50 },
    GREEDY: { clarity: 0.20, rush: 0.70 }
  },

  // Health pity for upgrade offers
  HEALTH_PITY_THRESHOLD: 40
};

// Room flavour hints based on light band and room type
const FLAVOUR_HINTS = {
  Empty: {
    Bright: 'The room is barren. Dust motes catch your lamplight.',
    Dim: 'You hear echoes in the darkness. Something empty here.',
    Dark: 'Silence presses in. You sense nothing ahead.'
  },
  Treasure: {
    Bright: 'A shimmer catches your eye! Something glimmers.',
    Dim: 'You spot a vague glint in the murk.',
    Dark: 'You hear something metallic in the darkness.'
  },
  Trap: {
    Bright: 'You spot suspicious marks on the floor. Danger!',
    Dim: 'Something seems wrong about this chamber.',
    Dark: 'The air feels... threatening.'
  },
  Enemy: {
    Bright: 'You hear growls ahead. Something watches you.',
    Dim: 'You sense movement in the shadows.',
    Dark: 'Invisible dread fills the air.'
  },
  Fountain: {
    Bright: 'Water sparkles! A fountain beckons.',
    Dim: 'You hear water trickling somewhere.',
    Dark: 'The scent of moisture in the dark.'
  },
  Merchant: {
    Bright: 'A robed figure sits at a table, waving you over.',
    Dim: 'Someone moves behind candlelight.',
    Dark: 'You hear a voice: "Welcome, weary traveler..."'
  }
};
