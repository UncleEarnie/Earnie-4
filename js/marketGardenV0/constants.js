/**
 * Market Garden V0 - Game Constants
 */

const GAME_CONFIG = {
  TOTAL_WEEKS: 12,
  STARTING_TOKENS: 0,
  STARTING_REPUTATION: 10,
  STARTING_COMPOST: 0,
  ACTIONS_PER_WEEK: 3,

  WEATHER_PROBABILITIES: {
    Clear: 0.45,
    Windy: 0.30,
    StormRisk: 0.25,
  },

  PROTECTED_WEEKS: [1, 2],
  EVENT_TRIGGER_CHANCE: 0.25,

  EVENT_DISTRIBUTION: {
    Aphids: 0.35,
    FungalSpots: 0.25,
    HelpfulNeighbour: 0.25,
    CompostDelivery: 0.15,
  },

  PLANTS: {
    Kale: {
      label: 'Hardy',
      growthRateBase: 10,
      healthDecayBase: 1,
      weatherSensitivity: 0.5,
      pestSensitivity: 0.5,
      harvestValue: 2,
      harvestThreshold: 80,
      emoji: '🥬',
    },
    Tomatoes: {
      label: 'High Yield',
      growthRateBase: 14,
      healthDecayBase: 2,
      weatherSensitivity: 1.0,
      pestSensitivity: 1.0,
      harvestValue: 4,
      harvestThreshold: 85,
      emoji: '🍅',
    },
    Strawberries: {
      label: 'Temperamental',
      growthRateBase: 13,
      healthDecayBase: 3,
      weatherSensitivity: 1.4,
      pestSensitivity: 1.3,
      harvestValue: 5,
      harvestThreshold: 85,
      emoji: '🍓',
    },
    Herbs: {
      label: 'Supportive',
      growthRateBase: 9,
      healthDecayBase: 1,
      weatherSensitivity: 0.6,
      pestSensitivity: 0.6,
      harvestValue: 2,
      harvestThreshold: 75,
      emoji: '🌿',
    },
    Sunflowers: {
      label: 'Moonshot',
      growthRateBase: 16,
      healthDecayBase: 3,
      weatherSensitivity: 1.6,
      pestSensitivity: 1.1,
      harvestValue: 7,
      harvestThreshold: 90,
      emoji: '🌻',
    },
  },

  HERBS_ADJACENCY_BONUS: { health: 2, pestReduction: 2 },

  GROWTH_STAGES: {
    Seedling: { min: 0, max: 35 },
    Growing: { min: 35, max: 80 },
    Mature: { min: 80, max: 100 },
  },

  MOISTURE_STATES: {
    Dry: { min: 0, max: 30 },
    OK: { min: 30, max: 71 },
    Soaked: { min: 71, max: 100 },
  },

  PEST_STATES: {
    None: { min: 0, max: 25 },
    Mild: { min: 25, max: 61 },
    Heavy: { min: 61, max: 100 },
  },

  REPUTATION: {
    healthyBedBonus: 1,
    poorBedsPenalty: 2,
    replantsOveragePenalty: 1,
    harvestBonus: 2,
    helpfulNeighbourBonus: 3,
  },

  HEALTH_THRESHOLD_GOOD: 70,
  HEALTH_THRESHOLD_POOR: 40,
  HEALTH_THRESHOLD_HARVEST: 40,
  PEST_THRESHOLD_HEAVY: 60,
  MOISTURE_THRESHOLD_DRY: 30,
  MOISTURE_THRESHOLD_SOAKED: 70,

  ACTIONS: {
    Water: { moistureGain: 25, healthGain: 3 },
    Fertilise: { growthBonus: 6, pestDrift: 6 },
    PestControl: { pestReduction: 30, healthGain: 4 },
    Replant: { initialHealth: 80, initialGrowth: 0, initialPests: 10, initialMoisture: 55 },
    Compost: { maxLevel: 3, levelGain: 1, growthBonusPerLevel: 1 },
  },

  HARVEST_REGROWTH: 30,

  DEFAULT_BEDS: ['Kale', 'Tomatoes', 'Herbs', 'Strawberries', 'Kale', 'Sunflowers'],
  BED_INITIAL: { health: 85, growth: 20, moisture: 55, pests: 10 },

  MARKET_PREFERENCES: [
    ['Kale', 'Tomatoes'],
    ['Strawberries', 'Herbs'],
    ['Sunflowers', 'Kale'],
    ['Tomatoes', 'Herbs'],
    ['Strawberries', 'Sunflowers'],
    ['Herbs', 'Kale'],
  ],

  GROWTH_MODIFIERS: {
    Clear: 2,
    Windy: 0,
    LightRain: 1,
    Storm: -2,
  },

  HEALTH_DRY_PENALTY: 4,
  HEALTH_SOAKED_PENALTY: 2,
  HEALTH_HEAVY_PESTS_PENALTY: 6,
  HEALTH_STORM_PENALTY: 8,

  PESTS_BASE_DRIFT: 2,
  PESTS_CLEAR: 1,
  PESTS_WINDY: 0,
  PESTS_LIGHT_RAIN: 2,
  PESTS_STORM: 4,

  MOISTURE_CLEAR: -8,
  MOISTURE_WINDY: -12,
  MOISTURE_LIGHT_RAIN: 8,
  MOISTURE_STORM: 15,

  GROWTH_HEAVY_PESTS_PENALTY: 4,
};

const TIER_LABELS = {
  CozyGardener: { minTokens: 0, minRep: 0, label: 'Cozy Gardener' },
  MarketRegular: { minTokens: 10, minRep: 20, label: 'Market Regular' },
  RooftopLegend: { minTokens: 25, minRep: 30, label: 'Rooftop Legend' },
};
