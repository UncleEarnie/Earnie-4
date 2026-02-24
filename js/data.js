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
