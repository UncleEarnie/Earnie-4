/**
 * Earnie's Journey V0 - Constants
 * All game actions, events, paths, and configuration
 */

const GAME_CONFIG = {
  TOTAL_WEEKS: 12,
  TIME_BUDGET_PER_WEEK: 100,
  
  STARTING_METERS: {
    momentum: 40,
    stability: 40,
    options: 40,
    joy: 55
  },
  
  EVENT_CHANCE: 0.7, // 70% chance of event per week
  
  PLANNER_BUFF_MULTIPLIER: 1.20, // +20% for Review Your Week
  SCENARIO_SIM_DOWNSIDE_REDUCTION: 0.10 // -10% negative deltas
};

const PATHS = {
  BUILDER: {
    id: 'builder',
    name: 'Builder Path',
    description: 'Steady compounding. Build a stable foundation.',
    goal: 'Stability ≥ 75 AND Momentum ≥ 60',
    winCondition: (meters) => meters.stability >= 75 && meters.momentum >= 60
  },
  EXPLORER: {
    id: 'explorer',
    name: 'Explorer Path',
    description: 'Options and flexibility. Keep doors open.',
    goal: 'Options ≥ 80 AND Joy ≥ 60',
    winCondition: (meters) => meters.options >= 80 && meters.joy >= 60
  },
  CLOSER: {
    id: 'closer',
    name: 'Closer Path',
    description: 'Momentum and execution. Ship fast.',
    goal: 'Momentum ≥ 85 AND Stability ≥ 55',
    winCondition: (meters) => meters.momentum >= 85 && meters.stability >= 55
  }
};

const LOCATIONS = {
  GIG: 'The Gig',
  WORKSHOP: 'The Workshop',
  PLANNER: 'The Planner',
  MARKET: 'The Market',
  VAULT: 'The Vault',
  LOUNGE: 'The Lounge'
};

const ACTIONS = [
  // The Gig (Work)
  {
    id: 'gig_steady',
    title: 'Steady Shift',
    location: LOCATIONS.GIG,
    timeCost: 40,
    effects: { momentum: 8, stability: 2, options: 0, joy: -4 },
    tags: ['neutral'],
    riskBand: 'low'
  },
  {
    id: 'gig_overtime',
    title: 'Overtime Push',
    location: LOCATIONS.GIG,
    timeCost: 55,
    effects: { momentum: 14, stability: -2, options: 0, joy: -10 },
    tags: ['greedy'],
    riskBand: 'medium'
  },
  {
    id: 'gig_hustle',
    title: 'Side Hustle Sprint',
    location: LOCATIONS.GIG,
    timeCost: 45,
    effects: { momentum: 10, stability: 0, options: 4, joy: -7 },
    tags: ['greedy'],
    riskBand: 'medium'
  },
  {
    id: 'gig_hunt',
    title: 'Job Hunt',
    location: LOCATIONS.GIG,
    timeCost: 35,
    effects: { momentum: 2, stability: 0, options: 10, joy: -3 },
    tags: ['neutral'],
    riskBand: 'low'
  },
  
  // The Workshop (Learn)
  {
    id: 'workshop_skill',
    title: 'Skill Session',
    location: LOCATIONS.WORKSHOP,
    timeCost: 35,
    effects: { momentum: 4, stability: 0, options: 6, joy: -2 },
    tags: ['safe', 'neutral'],
    riskBand: 'low'
  },
  {
    id: 'workshop_cert',
    title: 'Certification Track',
    location: LOCATIONS.WORKSHOP,
    timeCost: 50,
    effects: { momentum: 6, stability: 0, options: 10, joy: -6 },
    tags: ['neutral'],
    riskBand: 'low',
    delayedEffect: { momentum: 4 } // Next week bonus
  },
  {
    id: 'workshop_mentor',
    title: 'Mentorship Meetup',
    location: LOCATIONS.WORKSHOP,
    timeCost: 30,
    effects: { momentum: 0, stability: 0, options: 8, joy: 3 },
    tags: ['safe'],
    riskBand: 'low'
  },
  {
    id: 'workshop_deep',
    title: 'Deep Work Block',
    location: LOCATIONS.WORKSHOP,
    timeCost: 45,
    effects: { momentum: 12, stability: 0, options: 0, joy: -8 },
    tags: ['neutral'],
    riskBand: 'medium'
  },
  
  // The Planner (Clarity tools)
  {
    id: 'planner_forecast',
    title: 'Forecast the Weekend',
    location: LOCATIONS.PLANNER,
    timeCost: 20,
    effects: { momentum: 0, stability: 1, options: 0, joy: 1 },
    tags: ['safe', 'clarityTool'],
    riskBand: 'low',
    clarityTool: 'forecastShield'
  },
  {
    id: 'planner_review',
    title: 'Review Your Week',
    location: LOCATIONS.PLANNER,
    timeCost: 15,
    effects: { momentum: 0, stability: 0, options: 0, joy: 2 },
    tags: ['safe', 'clarityTool'],
    riskBand: 'low',
    clarityTool: 'plannerBuff'
  },
  {
    id: 'planner_costcheck',
    title: 'Cost Check',
    location: LOCATIONS.PLANNER,
    timeCost: 15,
    effects: { momentum: 0, stability: 0, options: 2, joy: 0 },
    tags: ['safe', 'clarityTool'],
    riskBand: 'low',
    clarityTool: 'costCheck'
  },
  {
    id: 'planner_scenario',
    title: 'Scenario Sim',
    location: LOCATIONS.PLANNER,
    timeCost: 25,
    effects: { momentum: 0, stability: 0, options: 2, joy: -1 },
    tags: ['safe', 'clarityTool'],
    riskBand: 'low',
    clarityTool: 'scenarioSim'
  },
  
  // The Market (Spend)
  {
    id: 'market_treat',
    title: 'Treat Yourself',
    location: LOCATIONS.MARKET,
    timeCost: 20,
    effects: { momentum: 0, stability: -2, options: 0, joy: 10 },
    tags: ['neutral'],
    riskBand: 'low'
  },
  {
    id: 'market_gear',
    title: 'Upgrade Gear',
    location: LOCATIONS.MARKET,
    timeCost: 35,
    effects: { momentum: 6, stability: -4, options: 4, joy: 0 },
    tags: ['neutral'],
    riskBand: 'medium'
  },
  {
    id: 'market_splash',
    title: 'Big Splash',
    location: LOCATIONS.MARKET,
    timeCost: 45,
    effects: { momentum: 0, stability: -8, options: -6, joy: 14 },
    tags: ['greedy'],
    riskBand: 'high',
    ongoingEffect: {
      id: 'market_splash_upkeep',
      label: 'Big Splash Upkeep',
      remainingWeeks: 3,
      perWeek: { stability: -2 }
    }
  },
  {
    id: 'market_subs',
    title: 'Subscription Stack',
    location: LOCATIONS.MARKET,
    timeCost: 25,
    effects: { momentum: 0, stability: 0, options: -4, joy: 6 },
    tags: ['greedy'],
    riskBand: 'medium',
    ongoingEffect: {
      id: 'market_subs_upkeep',
      label: 'Subscription Upkeep',
      remainingWeeks: 4,
      perWeek: { options: -1 }
    }
  },
  
  // The Vault (Bank)
  {
    id: 'vault_buffer',
    title: 'Build Buffer',
    location: LOCATIONS.VAULT,
    timeCost: 30,
    effects: { momentum: 0, stability: 10, options: 2, joy: -2 },
    tags: ['safe'],
    riskBand: 'low'
  },
  {
    id: 'vault_simplify',
    title: 'Simplify',
    location: LOCATIONS.VAULT,
    timeCost: 25,
    effects: { momentum: 0, stability: 4, options: 8, joy: 0 },
    tags: ['safe'],
    riskBand: 'low',
    removesOngoingEffect: true
  },
  {
    id: 'vault_longgame',
    title: 'Long Game',
    location: LOCATIONS.VAULT,
    timeCost: 40,
    effects: { momentum: 6, stability: 6, options: 0, joy: -4 },
    tags: ['neutral'],
    riskBand: 'low'
  },
  {
    id: 'vault_safety',
    title: 'Safety Net',
    location: LOCATIONS.VAULT,
    timeCost: 35,
    effects: { momentum: -2, stability: 12, options: 0, joy: 0 },
    tags: ['safe'],
    riskBand: 'low'
  },
  
  // The Lounge (Chill)
  {
    id: 'lounge_reset',
    title: 'Reset Day',
    location: LOCATIONS.LOUNGE,
    timeCost: 35,
    effects: { momentum: -3, stability: 4, options: 0, joy: 12 },
    tags: ['safe'],
    riskBand: 'low'
  },
  {
    id: 'lounge_social',
    title: 'Social Night',
    location: LOCATIONS.LOUNGE,
    timeCost: 30,
    effects: { momentum: 0, stability: -2, options: 4, joy: 10 },
    tags: ['neutral'],
    riskBand: 'low'
  },
  {
    id: 'lounge_sleep',
    title: 'Sleep In',
    location: LOCATIONS.LOUNGE,
    timeCost: 20,
    effects: { momentum: 0, stability: 2, options: 0, joy: 6 },
    tags: ['safe'],
    riskBand: 'low'
  },
  {
    id: 'lounge_detox',
    title: 'Digital Detox',
    location: LOCATIONS.LOUNGE,
    timeCost: 25,
    effects: { momentum: 0, stability: 0, options: 2, joy: 8 },
    tags: ['safe'],
    riskBand: 'low'
  }
];

const EVENTS = [
  {
    id: 'event_fix',
    name: 'Unexpected Fix',
    description: 'Something broke and needs attention.',
    isNegative: true,
    options: [
      {
        id: 'A',
        label: 'Pay time to fix it',
        effects: { momentum: -2, stability: 2, options: 0, joy: -2 }
      },
      {
        id: 'B',
        label: 'Ignore for now',
        effects: { momentum: 0, stability: -8, options: -4, joy: 0 }
      }
    ]
  },
  {
    id: 'event_opportunity',
    name: 'Opportunity Ping',
    description: 'An unexpected opportunity landed in your inbox.',
    isNegative: false,
    options: [
      {
        id: 'A',
        label: 'Take it',
        effects: { momentum: 10, stability: 0, options: 0, joy: -4 }
      },
      {
        id: 'B',
        label: 'Pass',
        effects: { momentum: 0, stability: 0, options: 4, joy: 2 }
      }
    ]
  },
  {
    id: 'event_burnout',
    name: 'Burnout Warning',
    description: 'You\'re feeling exhausted.',
    isNegative: true,
    options: [
      {
        id: 'A',
        label: 'Rest hard',
        effects: { momentum: -4, stability: 0, options: 0, joy: 10 }
      },
      {
        id: 'B',
        label: 'Push through',
        effects: { momentum: 8, stability: -4, options: 0, joy: -10 }
      }
    ]
  },
  {
    id: 'event_friend',
    name: 'Friend Needs Help',
    description: 'A friend reaches out for help.',
    isNegative: false,
    options: [
      {
        id: 'A',
        label: 'Help them',
        effects: { momentum: 0, stability: 0, options: 4, joy: 6 }
      },
      {
        id: 'B',
        label: 'Decline',
        effects: { momentum: 0, stability: 2, options: 0, joy: -4 }
      }
    ]
  },
  {
    id: 'event_hiddenfee',
    name: 'Hidden Fee',
    description: 'A subscription you forgot about charged you.',
    isNegative: true,
    preventedByCostCheck: true,
    options: [
      {
        id: 'A',
        label: 'Clean it up',
        effects: { momentum: 0, stability: 2, options: 2, joy: -2 }
      },
      {
        id: 'B',
        label: 'Absorb it',
        effects: { momentum: 0, stability: -6, options: 0, joy: 0 }
      }
    ]
  },
  {
    id: 'event_lucky',
    name: 'Lucky Break',
    description: 'Something good happened!',
    isNegative: false,
    options: [
      {
        id: 'A',
        label: 'Bank it',
        effects: { momentum: 0, stability: 8, options: 2, joy: 0 }
      },
      {
        id: 'B',
        label: 'Celebrate',
        effects: { momentum: 0, stability: -2, options: 0, joy: 10 }
      }
    ]
  },
  {
    id: 'event_gear',
    name: 'Gear Breaks',
    description: 'Your equipment needs replacement.',
    isNegative: true,
    options: [
      {
        id: 'A',
        label: 'Replace',
        effects: { momentum: 2, stability: -6, options: 0, joy: -2 }
      },
      {
        id: 'B',
        label: 'Make do',
        effects: { momentum: -6, stability: 0, options: 2, joy: 0 }
      }
    ]
  },
  {
    id: 'event_social',
    name: 'Social Invite',
    description: 'Friends invited you out.',
    isNegative: false,
    options: [
      {
        id: 'A',
        label: 'Go',
        effects: { momentum: 0, stability: -2, options: 2, joy: 8 }
      },
      {
        id: 'B',
        label: 'Skip',
        effects: { momentum: 0, stability: 2, options: 0, joy: -2 }
      }
    ]
  },
  {
    id: 'event_chaos',
    name: 'Schedule Chaos',
    description: 'Your plans got disrupted.',
    isNegative: true,
    options: [
      {
        id: 'A',
        label: 'Replan',
        effects: { momentum: 0, stability: 0, options: 6, joy: -2 }
      },
      {
        id: 'B',
        label: 'Wing it',
        effects: { momentum: 4, stability: -4, options: 0, joy: 0 }
      }
    ]
  },
  {
    id: 'event_calm',
    name: 'Calm Weekend',
    description: 'A peaceful weekend.',
    isNegative: false,
    options: [
      {
        id: 'A',
        label: 'Reflect',
        effects: { momentum: 0, stability: 2, options: 0, joy: 4 }
      },
      {
        id: 'B',
        label: 'Explore',
        effects: { momentum: 0, stability: 0, options: 6, joy: 2 }
      }
    ]
  }
];
