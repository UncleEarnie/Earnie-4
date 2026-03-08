// data.js - Game library and content data

const GAMES_LIBRARY = [
  {
    slug: 'veil-of-risk',
    title: 'The Veil of Risk',
    subtitle: 'Navigate uncertainty with Uncle Earnie',
    description: 'Experience the challenge of making financial decisions when you cannot see the complete picture. Learn how hidden risks affect your choices and discover strategies to improve your financial visibility.',
    ctaLabel: 'Play',
    category: 'Core Experience',
    estimatedMinutes: 25,
    difficulty: 'Medium',
    tags: ['Risk', 'Decision Making', 'Uncertainty'],
    featured: true,
    overviewBullets: [
      'Explore how information gaps impact financial decision making',
      'Learn to identify and manage hidden risks in everyday finances',
      'Develop strategies to improve your financial visibility',
      'Experience real-world scenarios in a safe, educational environment'
    ],
    learnings: [
      {
        title: 'Understanding Hidden Risks',
        description: 'Learn to identify financial risks that are not immediately visible and understand their potential impact on your decisions.'
      },
      {
        title: 'Improving Financial Visibility',
        description: 'Discover practical techniques to gather more information and reduce uncertainty in your financial planning.'
      },
      {
        title: 'Decision Making Under Uncertainty',
        description: 'Build confidence in making sound financial choices even when you do not have complete information.'
      }
    ]
  },
  {
    slug: 'market-garden',
    title: 'Market Garden V0',
    subtitle: 'Manage your garden through seasons',
    description: 'A seasonal garden simulation where you make strategic decisions about planting, watering, and harvesting. Learn how weather and pests affect outcomes and discover the balance between growth and stability.',
    ctaLabel: 'Play',
    category: 'Decision Making',
    estimatedMinutes: 20,
    difficulty: 'Medium',
    tags: ['Strategy', 'Simulation', 'Planning', 'Decision Making'],
    featured: true,
    overviewBullets: [
      'Manage a 6-bed garden across 12 weeks of seasonal changes',
      'Balance growth with stability as you navigate weather and pests',
      'Choose from 5 plant types, each with unique characteristics',
      'Make tactical weekly decisions: water, fertilize, control pests, and more',
      'Track your reputation and harvest yields for a final reputation score'
    ],
    learnings: [
      {
        title: 'Planning Under Uncertainty',
        description: 'Learn to make decisions when outcomes depend on unpredictable factors like weather and garden events.'
      },
      {
        title: 'Resource Trade-offs',
        description: 'Discover how limited actions each week force you to prioritize and make strategic choices.'
      },
      {
        title: 'Long-term vs Short-term',
        description: 'Experience the tension between immediate gains (harvesting) and long-term health (plant development).'
      },
      {
        title: 'Resilience and Adaptation',
        description: 'Learn how good preparation and smart replanting can help you weather unexpected challenges.'
      }
    ]
  },
  {
    slug: 'lantern-loot',
    title: 'Lantern & Loot V0',
    subtitle: 'A roguelite dungeon crawler',
    description: 'Descend five floors of a mysterious dungeon using just your lantern and wits. Manage your health, stamina, and light while making strategic decisions about when to scout ahead, take risks, or play it safe. Every run is different.',
    ctaLabel: 'Play',
    category: 'Decision Making',
    estimatedMinutes: 15,
    difficulty: 'Medium',
    tags: ['Strategy', 'Dungeon Crawler', 'Resource Management', 'Roguelite'],
    featured: true,
    overviewBullets: [
      'Navigate 5 floors with 6 rooms each in a procedurally varied dungeon',
      'Balance resources: health, stamina, light, and loot',
      'Choose from 6 actions: Explore, Sneak, Loot, Rest, Scan, or Backtrack',
      'Face traps, enemies, fountains, and treasure with hidden or revealed dangers',
      'Encounter different challenges based on how much light you have',
      'Unlock upgrades at the end of each floor to improve your chances'
    ],
    learnings: [
      {
        title: 'Resource Management Under Pressure',
        description: 'Learn to balance multiple limited resources (health, stamina, light) while pursuing conflicting objectives (survival vs. loot).'
      },
      {
        title: 'Information-Seeking vs. Action',
        description: 'Experience the trade-off between gathering information (Scan action) and moving quickly, under uncertainty.'
      },
      {
        title: 'Risk Appetite and Stress Response',
        description: 'Observe your own behavior when facing surprises (traps, ambushes, fountain saves) and whether you become cautious or aggressive afterward.'
      },
      {
        title: 'Long-term Planning in Uncertain Environments',
        description: 'Develop strategies for upgrades and resource recovery that carry forward across multiple encounters.'
      }
    ]
  },
  {
    slug: 'kiwisaver-checkin',
    title: 'KiwiSaver Check-in',
    subtitle: 'Review your retirement savings strategy',
    description: 'A guided experience to help you understand your KiwiSaver options and ensure your settings align with your retirement goals.',
    ctaLabel: 'Play',
    category: 'KiwiSaver',
    estimatedMinutes: 15,
    difficulty: 'Easy',
    tags: ['Retirement', 'Savings', 'Planning'],
    overviewBullets: [
      'Review your current KiwiSaver fund type and contribution rate',
      'Understand the differences between Conservative, Balanced, and Growth funds',
      'Learn how your age and goals should influence your KiwiSaver strategy',
      'Get personalized insights on optimizing your retirement savings'
    ],
    learnings: [
      {
        title: 'Fund Types Explained',
        description: 'Understand the risk and return profiles of different KiwiSaver fund types and which might suit your situation.'
      },
      {
        title: 'Contribution Strategies',
        description: 'Learn how different contribution rates can impact your retirement savings over time.'
      },
      {
        title: 'Regular Reviews',
        description: 'Discover why regular KiwiSaver reviews are important and when you should consider making changes.'
      }
    ]
  },
  {
    slug: 'mortgage-maze',
    title: 'Mortgage Maze',
    subtitle: 'Navigate home loan decisions',
    description: 'Navigate the complexities of mortgage decisions, from fixed vs floating rates to understanding true costs beyond the interest rate.',
    ctaLabel: 'Play',
    category: 'Mortgages',
    estimatedMinutes: 20,
    difficulty: 'Medium',
    tags: ['Mortgages', 'Home Loans', 'Interest Rates'],
    overviewBullets: [
      'Compare fixed and floating interest rate options',
      'Understand the total cost of a mortgage beyond the headline rate',
      'Learn about different loan structures and their implications',
      'Explore refinancing scenarios and when they make sense'
    ],
    learnings: [
      {
        title: 'Rate Types Demystified',
        description: 'Understand the trade-offs between fixed and floating rates and how to choose based on your circumstances.'
      },
      {
        title: 'Hidden Costs',
        description: 'Learn about fees, insurance, and other costs that affect the true price of your mortgage.'
      },
      {
        title: 'Repayment Strategies',
        description: 'Discover how different repayment approaches can save you thousands in interest over the life of your loan.'
      }
    ]
  },
  {
    slug: 'lifestyle-inflation-trap',
    title: 'Lifestyle Inflation Trap',
    subtitle: 'Will income gains become freedom or overhead?',
    description: 'Navigate 10-12 chapters of financial decisions as your income grows. Will raises translate to freedom, or just more recurring expenses? Experience the challenge of lifestyle inflation.',
    ctaLabel: 'Play',
    category: 'Personal Finance',
    estimatedMinutes: 15,
    difficulty: 'Medium',
    tags: ['Budgeting', 'Lifestyle', 'Decision Making'],
    featured: true,
    overviewBullets: [
      'Make 10-12 pivotal financial decisions across 3 chapters',
      'Experience 2 shock events and 1 raise moment',
      'Set autopilot savings policies that run automatically',
      'Track runway, fixed cost ratio, and freedom score in real-time'
    ],
    learnings: [
      {
        title: 'Lifestyle Inflation Awareness',
        description: 'Understand how small recurring upgrades compound to erode financial freedom over time.'
      },
      {
        title: 'Autopilot Discipline',
        description: 'Learn to automate savings decisions so raises build wealth before lifestyle creeps up.'
      },
      {
        title: 'Shock Resilience',
        description: 'Experience how runway and fixed costs determine your ability to weather financial surprises.'
      }
    ]
  },
  {
    slug: 'earnies-journey',
    title: "Earnie's Journey V0",
    subtitle: '12 weeks of life-building decisions',
    description: 'Navigate 12 weeks balancing momentum, stability, options, and joy. Each action costs time, builds or erodes your meters, and shapes your path. Weekend events curveball you. Choose clarity tools at the Planner to forecast, buff actions, or blunt shocks. Will you hit your path goal?',
    ctaLabel: 'Play',
    category: 'Decision Making',
    estimatedMinutes: 20,
    difficulty: 'Medium',
    tags: ['Strategy', 'Life Simulation', 'Resource Management', 'Behavioral Insights'],
    featured: true,
    overviewBullets: [
      'Balance 4 meters (Momentum, Stability, Options, Joy) across 12 weeks',
      'Choose from 3 paths: Builder, Explorer, or Closer - each with unique win conditions',
      'Manage 100 time units per week across 24 different action cards',
      'Use clarity tools at the Planner to forecast events, buff actions, and reduce downside',
      'Face weekend events that can help or hurt based on your choices',
      'Track all decisions with telemetry and export weekly CSV data'
    ],
    learnings: [
      {
        title: 'Multi-Constraint Decision Making',
        description: 'Learn to balance competing priorities (momentum vs stability, options vs joy) under time pressure across multiple weeks.'
      },
      {
        title: 'Planning vs Doing Trade-offs',
        description: 'Experience the tension between using clarity tools (information gathering) and taking actions that move meters directly.'
      },
      {
        title: 'Ongoing Effects and Consequences',
        description: 'Understand how certain decisions create multi-week consequences (good or bad) that compound over time.'
      },
      {
        title: 'Stress Response Under Uncertainty',
        description: 'Observe your own behavioral patterns when facing weekend shocks: do you seek planning tools or double down on immediate gains?'
      }
    ]
  },
  {
    slug: 'earnies-journey-v2',
    title: "Earnie's Journey V2",
    subtitle: 'The Detailed Adventure - Rich narratives and choices',
    description: 'Experience Earnie\'s story with rich, detailed narratives. Before each action, discover what happens, the world context, and real consequences. Weekend events offer meaningful choices. Same core mechanics as V0, but deeper storytelling and character development.',
    ctaLabel: 'Play',
    category: 'Decision Making',
    estimatedMinutes: 25,
    difficulty: 'Medium',
    tags: ['Strategy', 'Life Simulation', 'Narrative', 'Character Development', 'Consequences'],
    featured: true,
    overviewBullets: [
      'Same 12-week structure as V0 with enhanced narrative depth',
      'Detailed action pop-ups show what happens, world context, and real consequences',
      'Choose from 3 character paths: Builder, Explorer, or Closer with personality narratives',
      'Rich event narratives with meaningful decision points',
      'Explore a detailed world map with 6 unique locations',
      'Experience how choices create emotional and practical consequences'
    ],
    learnings: [
      {
        title: 'Consequence Awareness',
        description: 'Understand the full impact of your decisions before committing, considering emotional, practical, and long-term effects.'
      },
      {
        title: 'Character-Driven Decisions',
        description: 'Explore how different personality archetypes (Builder, Explorer, Closer) make distinct choices and achieve different outcomes.'
      },
      {
        title: 'Narrative Understanding of Meters',
        description: 'See meters not as abstract numbers but as emotional states: momentum as forward drive, stability as security, options as possibility, joy as fulfillment.'
      },
      {
        title: 'World-Building and Context',
        description: 'Experience how location context and atmosphere influence decision-making and character development.'
      },
      {
        title: 'Multi-Layered Storytelling',
        description: 'Understand narrative structure where actions have immediate effects, ongoing consequences, and cumulative impacts on your character\'s journey.'
      }
    ]
  },
  {
    slug: 'earnie-match-v0',
    title: 'Earnie Match V0',
    subtitle: 'Match-3 with tokens, tools, and streak rewards',
    description: 'Play a fast 8x8 match-3 challenge with level objectives, limited moves, and Earnie bank tools. Build tokens from strong matches, spend them on tactical boosts, and manage your streak for rewards.',
    ctaLabel: 'Play',
    category: 'Decision Making',
    estimatedMinutes: 12,
    difficulty: 'Medium',
    tags: ['Puzzle', 'Match-3', 'Strategy', 'Resource Management'],
    featured: true,
    overviewBullets: [
      '8x8 board with cascades, striped specials, and bomb specials',
      'Beat score or color-collection objectives within move limits',
      'Earn and spend Bank Tokens on Add Move, Convert, Shuffle, and Stabilise',
      'Use Hint and one-time Undo with move costs',
      'Build streaks for bonus tokens and free striped tile rewards',
      'Export telemetry JSON and level summary CSV after runs'
    ],
    learnings: [
      {
        title: 'Tactical Trade-offs',
        description: 'Learn when to spend scarce tokens now versus saving them for endgame pressure.'
      },
      {
        title: 'Move Economy',
        description: 'Experience how each move has opportunity cost when objectives are strict.'
      },
      {
        title: 'Streak Discipline',
        description: 'See how consistent objective-focused play creates compounding rewards.'
      }
    ]
  },
  {
    slug: 'rate-shock-simulator',
    title: 'Rate Shock Simulator',
    subtitle: 'Prepare for interest rate changes',
    description: 'Simulate the impact of interest rate changes on your mortgage and learn strategies to prepare for rate increases.',
    ctaLabel: 'Play',
    category: 'Mortgages',
    estimatedMinutes: 12,
    difficulty: 'Easy',
    tags: ['Interest Rates', 'Risk Management', 'Planning'],
    overviewBullets: [
      'See how rate increases affect your monthly payments',
      'Calculate the budget impact of different rate scenarios',
      'Learn strategies to buffer against rate shock',
      'Understand when to fix your rate and for how long'
    ],
    learnings: [
      {
        title: 'Rate Impact Awareness',
        description: 'Gain a clear understanding of how even small rate changes can significantly affect your repayments.'
      },
      {
        title: 'Building Buffers',
        description: 'Learn practical ways to create financial buffers to absorb potential rate increases.'
      },
      {
        title: 'Timing Decisions',
        description: 'Understand the factors that influence when to lock in fixed rates and for what duration.'
      }
    ]
  },
  {
    slug: 'long-horizon',
    title: 'The Long Horizon',
    subtitle: 'Understanding investment timeframes',
    description: 'Experience how time horizon affects investment decisions and learn why patience is a powerful tool in wealth building.',
    ctaLabel: 'Start',
    category: 'Investing',
    estimatedMinutes: 18,
    difficulty: 'Medium',
    tags: ['Investing', 'Long-term', 'Strategy'],
    overviewBullets: [
      'Visualize the power of compound growth over different timeframes',
      'Understand how time horizon should influence your risk tolerance',
      'Learn why short-term volatility matters less with a long horizon',
      'Explore real examples of long-term investment outcomes'
    ],
    learnings: [
      {
        title: 'Time and Risk',
        description: 'Discover how a longer investment horizon can reduce the impact of short-term market volatility.'
      },
      {
        title: 'Compound Growth',
        description: 'Experience the dramatic effect of compound returns when given sufficient time to work.'
      },
      {
        title: 'Patience Pays',
        description: 'Learn why staying invested through market cycles typically produces better outcomes than trying to time the market.'
      }
    ]
  },
  {
    slug: 'market-noise-filter',
    title: 'Market Noise Filter',
    subtitle: 'Focus on what matters',
    description: 'Learn to filter out market noise and focus on the factors that truly matter for your long-term investment success.',
    ctaLabel: 'Start',
    category: 'Investing',
    estimatedMinutes: 15,
    difficulty: 'Easy',
    tags: ['Investing', 'Behavioral Finance', 'Strategy'],
    overviewBullets: [
      'Identify the difference between news and noise in financial markets',
      'Learn which information sources are most valuable for long-term investors',
      'Understand how media narratives can trigger emotional decisions',
      'Develop a framework for evaluating market information'
    ],
    learnings: [
      {
        title: 'Signal vs Noise',
        description: 'Learn to distinguish between meaningful market signals and irrelevant short-term noise.'
      },
      {
        title: 'Emotional Triggers',
        description: 'Recognize how sensational headlines and market commentary can trigger unhelpful emotional responses.'
      },
      {
        title: 'Information Diet',
        description: 'Create a healthy information consumption strategy that supports rather than undermines your investment plan.'
      }
    ]
  },
  {
    slug: 'retirement-runway',
    title: 'Retirement Runway',
    subtitle: 'Plan your path to retirement',
    description: 'Map out your retirement journey, understand how much you need, and create a realistic plan to get there.',
    ctaLabel: 'Start',
    category: 'Retirement',
    estimatedMinutes: 22,
    difficulty: 'Hard',
    tags: ['Retirement', 'Planning', 'Savings'],
    overviewBullets: [
      'Calculate your retirement savings target based on your goals',
      'Understand the assumptions and uncertainties in retirement planning',
      'Learn about different retirement income sources and strategies',
      'Create a personalized action plan to stay on track'
    ],
    learnings: [
      {
        title: 'Retirement Math',
        description: 'Understand the key calculations behind retirement planning and what you will realistically need to save.'
      },
      {
        title: 'Income Strategies',
        description: 'Explore different approaches to generating income in retirement, from NZ Super to investment income.'
      },
      {
        title: 'Course Corrections',
        description: 'Learn how to monitor your progress and make adjustments to stay on track for your retirement goals.'
      }
    ]
  },
  {
    slug: 'budget-reality-check',
    title: 'Budget Reality Check',
    subtitle: 'See where your money really goes',
    description: 'An interactive experience that helps you understand your actual spending patterns and identify opportunities to improve your financial position.',
    ctaLabel: 'Start',
    category: 'Budgeting',
    estimatedMinutes: 10,
    difficulty: 'Easy',
    tags: ['Budgeting', 'Spending', 'Awareness'],
    overviewBullets: [
      'Track your actual spending across different categories',
      'Compare your spending to typical New Zealand households',
      'Identify spending categories with the most opportunity',
      'Set realistic budgets based on your real patterns'
    ],
    learnings: [
      {
        title: 'Spending Awareness',
        description: 'Gain clear visibility into where your money actually goes, often revealing surprises.'
      },
      {
        title: 'Benchmarking',
        description: 'See how your spending compares to others and identify categories where you might be overspending.'
      },
      {
        title: 'Practical Changes',
        description: 'Learn which changes to your spending will have the biggest impact on your financial position.'
      }
    ]
  }
];

// Get all games
function getAllGames() {
  return GAMES_LIBRARY;
}

// Get game by slug
function getGameBySlug(slug) {
  return GAMES_LIBRARY.find(game => game.slug === slug);
}

// Get featured games
function getFeaturedGames() {
  return GAMES_LIBRARY.filter(game => game.featured);
}

// Get games by category
function getGamesByCategory(category) {
  if (!category || category === 'All') {
    return GAMES_LIBRARY;
  }
  return GAMES_LIBRARY.filter(game => game.category === category);
}

// Get all categories
function getCategories() {
  const categories = ['All'];
  const categorySet = new Set();
  GAMES_LIBRARY.forEach(game => {
    if (game.category) {
      categorySet.add(game.category);
    }
  });
  return [...categories, ...Array.from(categorySet)];
}

// Get related games (exclude current, same category preferred)
function getRelatedGames(currentSlug, limit = 3) {
  const currentGame = getGameBySlug(currentSlug);
  if (!currentGame) return GAMES_LIBRARY.slice(0, limit);
  
  // Try to find games in same category first
  let related = GAMES_LIBRARY.filter(game => 
    game.slug !== currentSlug && game.category === currentGame.category
  );
  
  // If not enough, add other games
  if (related.length < limit) {
    const others = GAMES_LIBRARY.filter(game => 
      game.slug !== currentSlug && game.category !== currentGame.category
    );
    related = [...related, ...others];
  }
  
  return related.slice(0, limit);
}
