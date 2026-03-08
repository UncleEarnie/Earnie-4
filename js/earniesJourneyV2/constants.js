/**
 * Earnie's Journey V2 - Enhanced Game Constants
 * More detailed with world context and action narratives
 */

const GAME_CONFIG_V2 = {
  TOTAL_WEEKS: 12,
  TIME_BUDGET_PER_WEEK: 100,
  STARTING_METERS: {
    momentum: 50,
    stability: 50,
    options: 50,
    joy: 50
  },
  EVENT_CHANCE: 0.7,
  PLANNER_BUFF_MULTIPLIER: 1.2,
  SCENARIO_SIM_DOWNSIDE_REDUCTION: 0.1
};

const PATHS_V2 = {
  BUILDER: {
    name: 'The Builder',
    icon: '🏗️',
    description: 'Focus on stability and momentum - build a secure foundation while keeping momentum strong',
    goalDescription: 'Stability ≥ 75 AND Momentum ≥ 60',
    winCondition: (meters) => meters.stability >= 75 && meters.momentum >= 60,
    narrative: 'You\'re constructing your future brick by brick - steady, deliberate, unstoppable.'
  },
  EXPLORER: {
    name: 'The Explorer',
    icon: '🗺️',
    description: 'Seek options and joy - maximize flexibility and personal satisfaction',
    goalDescription: 'Options ≥ 80 AND Joy ≥ 60',
    winCondition: (meters) => meters.options >= 80 && meters.joy >= 60,
    narrative: 'You\'re charting your own course - open-minded, curious, alive with possibility.'
  },
  CLOSER: {
    name: 'The Closer',
    icon: '🎯',
    description: 'Push for momentum and stability - balance aggressive goals with security',
    goalDescription: 'Momentum ≥ 85 AND Stability ≥ 55',
    winCondition: (meters) => meters.momentum >= 85 && meters.stability >= 55,
    narrative: 'You\'re driving toward victory - ambitious, focused, determined to win.'
  }
};

const LOCATIONS_V2 = {
  GIG: 'The Gig Hub',
  WORKSHOP: 'The Workshop',
  PLANNER: 'The Planner\'s Office',
  MARKET: 'The Market District',
  VAULT: 'The Vault',
  LOUNGE: 'The Lounge'
};

// Expanded action card data with detailed descriptions
const ACTIONS_V2 = [
  // GIG HUB - Work & Income
  {
    id: 'gig_freelance_project',
    title: 'Freelance Project',
    location: LOCATIONS_V2.GIG,
    timeCost: 15,
    effects: { momentum: 12, stability: 5, options: 0, joy: -3 },
    tags: ['work', 'income', 'greedy'],
    riskBand: 'greedy',
    detailedDescription: 'Take on a challenging freelance gig. Quick money but demanding work that leaves you exhausted.',
    worldContext: 'The Gig Hub is buzzing with opportunity - people hustle here day and night.',
    consequences: 'You\'re earning good money, but the work is relentless. Your joy dips slightly from the grind.'
  },
  {
    id: 'gig_part_time',
    title: 'Part-Time Shift',
    location: LOCATIONS_V2.GIG,
    timeCost: 20,
    effects: { momentum: 8, stability: 8, options: 2, joy: -2 },
    tags: ['work', 'income', 'neutral'],
    riskBand: 'neutral',
    detailedDescription: 'Work a steady part-time position. Balanced income with some predictability and room to grow.',
    worldContext: 'Reliable employment with room for advancement and skill development.',
    consequences: 'Steady progress on multiple fronts. Your income is stable, your skills grow, but the routine takes a toll.'
  },
  {
    id: 'gig_side_hustle',
    title: 'Side Hustle',
    location: LOCATIONS_V2.GIG,
    timeCost: 12,
    effects: { momentum: 6, stability: 2, options: 4, joy: 1 },
    tags: ['work', 'income', 'safe'],
    riskBand: 'safe',
    detailedDescription: 'Run your own small side project. Less intense income, but flexibility to pursue other interests.',
    worldContext: 'Small business owners thrive in this district with entrepreneurial energy.',
    consequences: 'You maintain flexibility while building extra income. Adds options without exhaustion.'
  },
  {
    id: 'gig_negotiate_raise',
    title: 'Negotiate Raise',
    location: LOCATIONS_V2.GIG,
    timeCost: 8,
    effects: { momentum: 15, stability: 10, options: 0, joy: 8 },
    tags: ['work', 'strategic', 'high-reward'],
    riskBand: 'greedy',
    detailedDescription: 'Advocate for better pay. Risky but potentially transformative - success feels amazing!',
    worldContext: 'The power broker\'s district - those who ask often get.',
    consequences: 'Success! Your confidence soars, your income rises significantly. You feel valued.',
    ongoingEffect: { name: 'Raise Momentum', perWeek: { momentum: 5, stability: 0, options: 0, joy: 0 }, remainingWeeks: 6 }
  },

  // WORKSHOP - Learning & Growth
  {
    id: 'workshop_skill_course',
    title: 'Online Course',
    location: LOCATIONS_V2.WORKSHOP,
    timeCost: 18,
    effects: { momentum: 2, stability: 8, options: 12, joy: 2 },
    tags: ['learning', 'growth', 'investment'],
    riskBand: 'safe',
    detailedDescription: 'Invest time in a structured learning program. Opens doors and expands your capabilities.',
    worldContext: 'The Workshop buzzes with learners - this is where potential transforms into skill.',
    consequences: 'You gain new abilities and see your options expand. The learning feels rewarding.'
  },
  {
    id: 'workshop_experiment',
    title: 'Creative Experiment',
    location: LOCATIONS_V2.WORKSHOP,
    timeCost: 14,
    effects: { momentum: 4, stability: -2, options: 10, joy: 15 },
    tags: ['learning', 'exploration', 'creative'],
    riskBand: 'neutral',
    detailedDescription: 'Try something new and creative. Risky but deeply satisfying - you discover something about yourself.',
    worldContext: 'Artists and creators congregate here, transforming raw materials into beauty.',
    consequences: 'Your joy spikes! You feel alive and creative. But there\'s some uncertainty in this path.'
  },
  {
    id: 'workshop_read_study',
    title: 'Study & Read',
    location: LOCATIONS_V2.WORKSHOP,
    timeCost: 10,
    effects: { momentum: 0, stability: 4, options: 8, joy: 3 },
    tags: ['learning', 'knowledge', 'safe'],
    riskBand: 'safe',
    detailedDescription: 'Dive into books and education. Slow but steady growth in knowledge and perspective.',
    worldContext: 'The library of possibilities - quiet, thoughtful, full of hidden wisdom.',
    consequences: 'Your mind expands. You feel smarter and more capable.'
  },
  {
    id: 'workshop_mentor_meeting',
    title: 'Mentor Session',
    location: LOCATIONS_V2.WORKSHOP,
    timeCost: 12,
    effects: { momentum: 8, stability: 6, options: 6, joy: 6 },
    tags: ['learning', 'connection', 'growth'],
    riskBand: 'safe',
    detailedDescription: 'Meet with someone who\'s been where you want to go. Guidance, support, and inspiration.',
    worldContext: 'Experienced guides share their wisdom, accelerating your journey.',
    consequences: 'You feel supported and guided. Their wisdom helps you move forward on all fronts.'
  },

  // PLANNER'S OFFICE - Clarity Tools
  {
    id: 'planner_forecast_shield',
    title: 'Forecast Shield',
    location: LOCATIONS_V2.PLANNER,
    timeCost: 8,
    effects: { momentum: 0, stability: 0, options: 0, joy: 0 },
    tags: ['clarity', 'protective'],
    riskBand: 'safe',
    clarityTool: 'forecastShield',
    detailedDescription: 'Use advanced forecasting to see and prepare for coming events. Reduces negative surprises.',
    worldContext: 'The Planner\'s office is filled with charts, data, and foresight. You see what\'s coming.',
    consequences: 'You feel prepared. Weekend events that would have hurt you are softened or turned positive.'
  },
  {
    id: 'planner_buff',
    title: 'Planner Buff',
    location: LOCATIONS_V2.PLANNER,
    timeCost: 10,
    effects: { momentum: 0, stability: 0, options: 0, joy: 0 },
    tags: ['clarity', 'amplifying'],
    riskBand: 'safe',
    clarityTool: 'plannerBuff',
    detailedDescription: 'Set up a system where your next action has 20% more impact. Optimization at its finest.',
    worldContext: 'Systems thinking - you design your life for maximum efficiency.',
    consequences: 'Your next action will hit harder. All effects amplified by 20%.'
  },
  {
    id: 'planner_cost_check',
    title: 'Cost Check',
    location: LOCATIONS_V2.PLANNER,
    timeCost: 6,
    effects: { momentum: 0, stability: 0, options: 0, joy: 0 },
    tags: ['clarity', 'protective'],
    riskBand: 'safe',
    clarityTool: 'costCheck',
    detailedDescription: 'Review your finances to prevent hidden costs from surprising you. Avoids one financial trap.',
    worldContext: 'Financial literacy is power. You see the traps others fall into.',
    consequences: 'You sidestep a financial disaster. The "Hidden Fee" event cannot happen this week.'
  },
  {
    id: 'planner_scenario_sim',
    title: 'Scenario Simulation',
    location: LOCATIONS_V2.PLANNER,
    timeCost: 9,
    effects: { momentum: 0, stability: 0, options: 0, joy: 0 },
    tags: ['clarity', 'protective'],
    riskBand: 'safe',
    clarityTool: 'scenarioSim',
    detailedDescription: 'Run simulations of possible weekend scenarios. Reduces downside risk of negative events.',
    worldContext: 'You rehearse the future, preparing mentally and emotionally for what might come.',
    consequences: 'When negative events occur, their impact is reduced by 10%. You\'re ready.'
  },

  // MARKET DISTRICT - Spending & Lifestyle
  {
    id: 'market_indulgence',
    title: 'Treat Yourself',
    location: LOCATIONS_V2.MARKET,
    timeCost: 8,
    effects: { momentum: 0, stability: -5, options: -3, joy: 15 },
    tags: ['spending', 'lifestyle', 'risky'],
    riskBand: 'greedy',
    detailedDescription: 'Buy something nice for yourself. Huge joy spike but creates financial obligation.',
    worldContext: 'The Market tempts with pleasures - designer goods, fine dining, luxury experiences.',
    consequences: 'Immediate happiness! But a nagging worry about money lingers.',
    ongoingEffect: { name: 'Financial Obligation', perWeek: { momentum: -2, stability: -3, options: -1, joy: 0 }, remainingWeeks: 4 }
  },
  {
    id: 'market_smart_purchase',
    title: 'Smart Investment Purchase',
    location: LOCATIONS_V2.MARKET,
    timeCost: 12,
    effects: { momentum: 6, stability: 8, options: 4, joy: 2 },
    tags: ['spending', 'investment', 'balanced'],
    riskBand: 'neutral',
    detailedDescription: 'Buy something that improves your life and holds value. Money spent well.',
    worldContext: 'Smart shoppers know where true value lies - quality over quantity.',
    consequences: 'You own something better. Your stability improves, and you feel good about the decision.'
  },
  {
    id: 'market_experience',
    title: 'Memorable Experience',
    location: LOCATIONS_V2.MARKET,
    timeCost: 10,
    effects: { momentum: 2, stability: 1, options: 2, joy: 12 },
    tags: ['spending', 'lifestyle', 'memories'],
    riskBand: 'neutral',
    detailedDescription: 'Spend on an experience - travel, events, quality time. Creates lasting joy.',
    worldContext: 'Experiences bind communities together - concerts, festivals, shared moments.',
    consequences: 'You create memories that sustain you. Joy increases significantly.'
  },
  {
    id: 'market_budget_conscious',
    title: 'Budget Shopping',
    location: LOCATIONS_V2.MARKET,
    timeCost: 6,
    effects: { momentum: 0, stability: 6, options: 3, joy: 0 },
    tags: ['spending', 'prudent', 'safe'],
    riskBand: 'safe',
    detailedDescription: 'Get what you need at good prices. Practical, not exciting, but financially sound.',
    worldContext: 'Savvy shoppers stretch every dollar - they know all the best deals.',
    consequences: 'Your financial position strengthens. You feel in control.'
  },

  // THE VAULT - Safety & Savings
  {
    id: 'vault_emergency_fund',
    title: 'Build Emergency Fund',
    location: LOCATIONS_V2.VAULT,
    timeCost: 14,
    effects: { momentum: 0, stability: 15, options: 8, joy: 2 },
    tags: ['safety', 'savings', 'secure'],
    riskBand: 'safe',
    detailedDescription: 'Systematically save money for emergencies. Boring but incredibly empowering.',
    worldContext: 'The Vault is where security is forged - thick walls, iron doors, peace of mind.',
    consequences: 'You feel safer. Your stability increases significantly. Flexibility improves too.'
  },
  {
    id: 'vault_invest_long_term',
    title: 'Long-Term Investment',
    location: LOCATIONS_V2.VAULT,
    timeCost: 12,
    effects: { momentum: -2, stability: 10, options: 5, joy: 1 },
    tags: ['safety', 'investing', 'patient'],
    riskBand: 'safe',
    detailedDescription: 'Put money into slow-growth investments. Patience now, security later.',
    worldContext: 'Long-term thinkers gather here, building wealth that compounds over decades.',
    consequences: 'You\'re playing the long game. Immediate returns are low, but security grows.'
  },
  {
    id: 'vault_insurance_review',
    title: 'Insurance Review',
    location: LOCATIONS_V2.VAULT,
    timeCost: 8,
    effects: { momentum: 2, stability: 12, options: 4, joy: 3 },
    tags: ['safety', 'protection', 'practical'],
    riskBand: 'safe',
    detailedDescription: 'Ensure you\'re properly protected. Prevents catastrophic losses from unexpected events.',
    worldContext: 'Insurance brokers protect against the unthinkable - you sleep soundly knowing they\'ve got your back.',
    consequences: 'You feel protected. Stability and options both improve.'
  },
  {
    id: 'vault_risk_mitigation',
    title: 'Reduce Financial Risks',
    location: LOCATIONS_V2.VAULT,
    timeCost: 10,
    effects: { momentum: 0, stability: 14, options: 6, joy: 0 },
    tags: ['safety', 'protection', 'strategic'],
    riskBand: 'safe',
    detailedDescription: 'Actively manage your risks and exposures. Minimize downside while maintaining growth potential.',
    worldContext: 'Risk managers work here - they\'ve seen it all and know how to protect against disaster.',
    consequences: 'Your financial foundation becomes rock-solid. You sleep better at night.'
  },

  // THE LOUNGE - Joy & Recovery
  {
    id: 'lounge_rest_day',
    title: 'Rest & Recovery',
    location: LOCATIONS_V2.LOUNGE,
    timeCost: 8,
    effects: { momentum: -3, stability: 2, options: 0, joy: 14 },
    tags: ['recovery', 'self-care', 'restorative'],
    riskBand: 'safe',
    detailedDescription: 'Give yourself permission to rest. Essential maintenance for your well-being.',
    worldContext: 'The Lounge is a sanctuary - soft music, comfortable chairs, no expectations.',
    consequences: 'You feel refreshed and alive. Your joy soars. Your momentum pauses but will return.'
  },
  {
    id: 'lounge_social_time',
    title: 'Connect with Friends',
    location: LOCATIONS_V2.LOUNGE,
    timeCost: 10,
    effects: { momentum: 1, stability: 4, options: 3, joy: 16 },
    tags: ['connection', 'social', 'restorative'],
    riskBand: 'safe',
    detailedDescription: 'Spend quality time with people you care about. Deep nourishment for the soul.',
    worldContext: 'Community flows here - laughter, shared stories, genuine connection.',
    consequences: 'You feel heard and valued. Your relationships strengthen. Joy and stability both increase.'
  },
  {
    id: 'lounge_hobby_time',
    title: 'Pursue a Hobby',
    location: LOCATIONS_V2.LOUNGE,
    timeCost: 12,
    effects: { momentum: 2, stability: 3, options: 8, joy: 12 },
    tags: ['hobby', 'creative', 'restorative'],
    riskBand: 'safe',
    detailedDescription: 'Dedicate time to something you love. Feeds your soul and expands your world.',
    worldContext: 'Hobbies connect you to your deeper self - creative fulfillment awaits.',
    consequences: 'You remember why you love what you love. Joy peaks and options expand.'
  },
  {
    id: 'lounge_meditation',
    title: 'Mindfulness Practice',
    location: LOCATIONS_V2.LOUNGE,
    timeCost: 8,
    effects: { momentum: 0, stability: 10, options: 4, joy: 8 },
    tags: ['mindfulness', 'practice', 'centering'],
    riskBand: 'safe',
    detailedDescription: 'Practice presence and awareness. Calms your mind and clarifies your priorities.',
    worldContext: 'Meditation studios hum with peaceful energy - this is where clarity is found.',
    consequences: 'You feel centered and calm. Your stability and options both improve.'
  }
];

// Detailed weekend events with rich narratives
const EVENTS_V2 = [
  {
    id: 'event_opportunity',
    name: 'Lucky Opportunity',
    description: 'An unexpected opportunity falls into your lap - someone refers you for a great opportunity.',
    isNegative: false,
    narrative: 'Your network pays off in a big way. Someone believes in you.',
    options: [
      {
        id: 'opp_pursue',
        label: 'Pursue It Aggressively',
        narrative: 'You dive in headfirst, seizing the moment.',
        effects: { momentum: 12, stability: 2, options: 4, joy: 8 }
      },
      {
        id: 'opp_cautious',
        label: 'Explore Carefully',
        narrative: 'You investigate first, then decide. Wisdom prevails.',
        effects: { momentum: 6, stability: 8, options: 10, joy: 6 }
      }
    ]
  },
  {
    id: 'event_health_scare',
    name: 'Health Scare',
    description: 'A health concern surfaces - nothing serious, but it makes you stop and think.',
    isNegative: true,
    narrative: 'Your body sends a signal. Time to listen.',
    options: [
      {
        id: 'health_ignore',
        label: 'Brush It Off',
        narrative: 'You push through, but worry lingers.',
        effects: { momentum: 2, stability: -8, options: -2, joy: -5 }
      },
      {
        id: 'health_address',
        label: 'Address It Head-On',
        narrative: 'You take action - rest, check-ups, lifestyle changes.',
        effects: { momentum: 0, stability: 6, options: 4, joy: 2 }
      }
    ]
  },
  {
    id: 'event_surprise_expense',
    name: 'Surprise Expense',
    description: 'Your car needs repairs. A medical bill arrives. Life happens.',
    isNegative: true,
    narrative: 'The universe sends an invoice.',
    preventedByCostCheck: true,
    options: [
      {
        id: 'expense_debt',
        label: 'Put It on Credit',
        narrative: 'Quick fix, but future pain.',
        effects: { momentum: 0, stability: -12, options: -8, joy: -4 }
      },
      {
        id: 'expense_savings',
        label: 'Use Your Savings',
        narrative: 'You had a backup plan. Security saves you.',
        effects: { momentum: 2, stability: -2, options: 4, joy: 6 }
      }
    ]
  },
  {
    id: 'event_relationship_boost',
    name: 'Relationship Magic',
    description: 'Someone important expresses genuine appreciation for you.',
    isNegative: false,
    narrative: 'You matter more than you know.',
    options: [
      {
        id: 'rel_celebrate',
        label: 'Celebrate Together',
        narrative: 'You deepen the connection through shared joy.',
        effects: { momentum: 4, stability: 8, options: 2, joy: 16 }
      },
      {
        id: 'rel_reciprocate',
        label: 'Reciprocate Thoughtfully',
        narrative: 'You show appreciation back - bonds strengthen.',
        effects: { momentum: 6, stability: 10, options: 0, joy: 12 }
      }
    ]
  },
  {
    id: 'event_work_crisis',
    name: 'Work Crisis',
    description: 'A work situation demands your attention - deadline moved up, conflict to resolve.',
    isNegative: true,
    narrative: 'Work demands you show up.',
    options: [
      {
        id: 'crisis_heroic',
        label: 'Rise to the Challenge',
        narrative: 'You step up and excel. They see your worth.',
        effects: { momentum: 16, stability: 4, options: -4, joy: -6 }
      },
      {
        id: 'crisis_boundary',
        label: 'Set Healthy Boundaries',
        narrative: 'You do your part but protect your peace.',
        effects: { momentum: 6, stability: 8, options: 6, joy: 2 }
      }
    ]
  },
  {
    id: 'event_unexpected_joy',
    name: 'Pure Joy',
    description: 'Something happens that just brings a smile to your face - no reason, pure luck.',
    isNegative: false,
    narrative: 'The universe smiles at you today.',
    options: [
      {
        id: 'joy_savor',
        label: 'Savor the Moment',
        narrative: 'You pause and truly feel the happiness.',
        effects: { momentum: 2, stability: 4, options: 2, joy: 18 }
      },
      {
        id: 'joy_share',
        label: 'Share the Joy',
        narrative: 'You spread the happiness - it multiplies.',
        effects: { momentum: 4, stability: 6, options: 4, joy: 14 }
      }
    ]
  },
  {
    id: 'event_failure',
    name: 'Failure & Disappointment',
    description: 'Something you tried didn\'t work out. Plans fell through. Not catastrophic, but disappointing.',
    isNegative: true,
    narrative: 'Not every attempt succeeds. That\'s growth.',
    options: [
      {
        id: 'fail_wallow',
        label: 'Wallow in Disappointment',
        narrative: 'You let it get to you. Momentum stalls.',
        effects: { momentum: -10, stability: -6, options: -4, joy: -12 }
      },
      {
        id: 'fail_learn',
        label: 'Extract the Lesson',
        narrative: 'You find the silver lining - growth disguised as failure.',
        effects: { momentum: 2, stability: 4, options: 12, joy: 0 }
      }
    ]
  },
  {
    id: 'event_financial_boost',
    name: 'Financial Win',
    description: 'A refund arrives, an investment pays off, or you win something small.',
    isNegative: false,
    narrative: 'Money flows to you.',
    options: [
      {
        id: 'fin_splurge',
        label: 'Treat Yourself',
        narrative: 'You enjoy the windfall immediately.',
        effects: { momentum: 2, stability: -2, options: -4, joy: 14 }
      },
      {
        id: 'fin_save',
        label: 'Save It Wisely',
        narrative: 'You strengthen your foundation.',
        effects: { momentum: 4, stability: 16, options: 8, joy: 2 }
      }
    ]
  },
  {
    id: 'event_growth_moment',
    name: 'Personal Growth',
    description: 'You reach a milestone or accomplish something you\'ve been working toward.',
    isNegative: false,
    narrative: 'You\'re becoming who you want to be.',
    options: [
      {
        id: 'growth_celebrate',
        label: 'Celebrate Achievement',
        narrative: 'You acknowledge your progress and feel proud.',
        effects: { momentum: 14, stability: 6, options: 4, joy: 12 }
      },
      {
        id: 'growth_next',
        label: 'Set New Goals',
        narrative: 'You immediately aim higher - growth momentum continues.',
        effects: { momentum: 18, stability: 2, options: 8, joy: 6 }
      }
    ]
  },
  {
    id: 'event_burnout',
    name: 'Burnout Warning',
    description: 'You wake up one day feeling exhausted - physically, mentally, emotionally drained.',
    isNegative: true,
    narrative: 'Your body is asking you to slow down.',
    options: [
      {
        id: 'burnout_ignore',
        label: 'Push Through',
        narrative: 'You ignore the warning signs.',
        effects: { momentum: -4, stability: -14, options: -8, joy: -16 }
      },
      {
        id: 'burnout_rest',
        label: 'Take Time to Recover',
        narrative: 'You prioritize your well-being. Healing begins.',
        effects: { momentum: -8, stability: 8, options: 4, joy: 12 }
      }
    ]
  }
];

const LOCATIONS_LIST = [LOCATIONS_V2.GIG, LOCATIONS_V2.WORKSHOP, LOCATIONS_V2.PLANNER, LOCATIONS_V2.MARKET, LOCATIONS_V2.VAULT, LOCATIONS_V2.LOUNGE];
