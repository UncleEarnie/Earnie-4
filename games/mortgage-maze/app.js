// Mortgage Maze Game Logic

// Game State
let gameState = {
  persona: 'firstHome',
  depositBand: 'low',
  mode: 'quick',
  stats: {
    cashflow: 50,
    bufferMonths: 2,
    riskFog: 30,
    confidenceBias: 50,
    knowledge: 30,
    timeSpent: 0
  },
  history: [],
  currentRoom: 0,
  visitedRooms: [],
  maze: null,
  shocksEncountered: 0,
  seed: Date.now()
};

// Room definitions
const ROOMS = [
  {
    id: 0,
    icon: '🏁',
    title: 'Starting Point',
    description: 'You\'re ready to navigate the mortgage maze. Choose your first step carefully.',
    choices: [
      {
        id: 'start-research',
        label: 'Research rates online',
        description: 'Spend time comparing advertised rates',
        hint: 'Info Gathering',
        deltas: { knowledge: 10, timeSpent: 1, riskFog: -5 }
      },
      {
        id: 'start-broker',
        label: 'Talk to a mortgage broker',
        description: 'Get expert advice early',
        hint: 'Professional Help',
        deltas: { knowledge: 15, bufferMonths: -0.5, riskFog: -10 }
      },
      {
        id: 'start-rush',
        label: 'Just apply at your current bank',
        description: 'Quick and familiar',
        deltas: { timeSpent: -1, riskFog: 15, confidenceBias: 10 }
      }
    ]
  },
  {
    id: 1,
    icon: '📊',
    title: 'Rate Decision',
    description: 'You need to choose between fixed and floating rates. What matters most to you?',
    choices: [
      {
        id: 'rate-fixed-long',
        label: 'Lock in fixed for 5 years',
        description: 'Maximum certainty, but higher rate',
        hint: 'Stability Focus',
        deltas: { riskFog: -15, cashflow: -5, bufferMonths: -0.5 }
      },
      {
        id: 'rate-fixed-short',
        label: 'Fixed for 2 years',
        description: 'Balance of certainty and flexibility',
        hint: 'Balanced Approach',
        deltas: { riskFog: -5, knowledge: 5 }
      },
      {
        id: 'rate-floating',
        label: 'Stay floating',
        description: 'Lower rate now, but exposed to increases',
        deltas: { cashflow: 10, riskFog: 20, confidenceBias: 10 }
      },
      {
        id: 'rate-split',
        label: 'Split: 50% fixed, 50% floating',
        description: 'Hedge your bets',
        hint: 'Sophisticated',
        deltas: { knowledge: 10, riskFog: -5, cashflow: 3 }
      }
    ]
  },
  {
    id: 2,
    icon: '💰',
    title: 'Fee Disclosure',
    description: 'The lender reveals additional fees: application fee, valuation, legal, and insurance.',
    choices: [
      {
        id: 'fees-accept',
        label: 'Accept all fees',
        description: 'Just pay and move on',
        deltas: { bufferMonths: -1, timeSpent: -1 }
      },
      {
        id: 'fees-negotiate',
        label: 'Negotiate or shop around',
        description: 'Push back on some fees',
        hint: 'Assertiveness Pays',
        deltas: { bufferMonths: 0.5, knowledge: 10, timeSpent: 1 }
      },
      {
        id: 'fees-research',
        label: 'Research each fee in detail',
        description: 'Understand what you\'re paying for',
        hint: 'Visibility Boost',
        deltas: { knowledge: 15, riskFog: -10, timeSpent: 2 }
      }
    ]
  },
  {
    id: 3,
    icon: '🏠',
    title: 'Repayment Structure',
    description: 'How do you want to structure your repayments?',
    choices: [
      {
        id: 'repay-minimum',
        label: 'Minimum required payments',
        description: 'Keep cashflow flexible',
        deltas: { cashflow: 10, riskFog: 10 }
      },
      {
        id: 'repay-extra',
        label: 'Add extra $200/month',
        description: 'Pay down principal faster',
        hint: 'Long-term Savings',
        deltas: { cashflow: -5, bufferMonths: 1, knowledge: 5, riskFog: -5 }
      },
      {
        id: 'repay-revolving',
        label: 'Set up a revolving credit portion',
        description: 'Flexible access to equity',
        hint: 'Advanced Tool',
        deltas: { knowledge: 10, bufferMonths: 1.5, cashflow: -3 }
      }
    ]
  },
  {
    id: 4,
    icon: '📄',
    title: 'Insurance Bundling',
    description: 'The bank offers life and mortgage protection insurance. It\'s optional but "highly recommended".',
    choices: [
      {
        id: 'insurance-bank',
        label: 'Accept bank\'s insurance',
        description: 'Convenient, but possibly expensive',
        deltas: { cashflow: -8, bufferMonths: 0.5, riskFog: 5 }
      },
      {
        id: 'insurance-compare',
        label: 'Compare with external providers',
        description: 'Shop around for better rates',
        hint: 'Often Cheaper',
        deltas: { cashflow: -4, bufferMonths: 1, knowledge: 10, timeSpent: 1 }
      },
      {
        id: 'insurance-skip',
        label: 'Decline for now',
        description: 'Save money upfront',
        deltas: { cashflow: 5, riskFog: 25, confidenceBias: 15 }
      }
    ]
  },
  {
    id: 5,
    icon: '⚡',
    title: 'SHOCK: Rate Spike',
    description: 'Interest rates just jumped 0.75%! Your payments are increasing.',
    isShock: true,
    choices: [
      {
        id: 'shock-rate-absorb',
        label: 'Absorb the increase',
        description: 'Tighten the budget and carry on',
        deltas: { cashflow: -15, bufferMonths: -1, riskFog: 10 }
      },
      {
        id: 'shock-rate-refix',
        label: 'Refix at current rates',
        description: 'Lock in now before further increases',
        hint: 'Damage Control',
        deltas: { cashflow: -10, riskFog: -5, knowledge: 5 }
      },
      {
        id: 'shock-rate-extend',
        label: 'Extend loan term',
        description: 'Lower monthly payments, higher total cost',
        deltas: { cashflow: 5, riskFog: 15, knowledge: 5 }
      }
    ]
  },
  {
    id: 6,
    icon: '🔄',
    title: 'Refinancing Opportunity',
    description: 'A competitor is offering lower rates. Should you switch?',
    choices: [
      {
        id: 'refi-switch',
        label: 'Switch lenders',
        description: 'Lower rate, but break fees apply',
        hint: 'Check Break Fees',
        deltas: { cashflow: 5, bufferMonths: -1, knowledge: 10 }
      },
      {
        id: 'refi-negotiate',
        label: 'Negotiate with current lender',
        description: 'Use competition as leverage',
        hint: 'Often Works',
        deltas: { cashflow: 3, knowledge: 10, riskFog: -5 }
      },
      {
        id: 'refi-stay',
        label: 'Stay put',
        description: 'Avoid hassle and fees',
        deltas: { timeSpent: -1, riskFog: 5 }
      }
    ]
  },
  {
    id: 7,
    icon: '💸',
    title: 'SHOCK: Unexpected Expense',
    description: 'A $5,000 home repair is needed urgently. How do you cover it?',
    isShock: true,
    choices: [
      {
        id: 'shock-expense-savings',
        label: 'Use emergency savings',
        description: 'Depletes your buffer',
        deltas: { bufferMonths: -2, knowledge: 5 }
      },
      {
        id: 'shock-expense-credit',
        label: 'Increase mortgage or use credit',
        description: 'Easy access, but more debt',
        deltas: { cashflow: -5, riskFog: 15 }
      },
      {
        id: 'shock-expense-delay',
        label: 'Delay repair and save up',
        description: 'Risky if it\'s critical',
        deltas: { cashflow: 3, riskFog: 20, confidenceBias: 10 }
      }
    ]
  },
  {
    id: 8,
    icon: '🎓',
    title: 'Financial Review',
    description: 'Time for a mortgage health check. Do you understand your position?',
    choices: [
      {
        id: 'review-diy',
        label: 'Review it yourself',
        description: 'Check statements and compare rates online',
        hint: 'Self-education',
        deltas: { knowledge: 10, riskFog: -10, timeSpent: 1 }
      },
      {
        id: 'review-adviser',
        label: 'Hire a financial adviser',
        description: 'Professional review and recommendations',
        hint: 'Expert Insight',
        deltas: { knowledge: 20, riskFog: -20, bufferMonths: -0.5 }
      },
      {
        id: 'review-skip',
        label: 'Skip it, things seem fine',
        description: 'Save time and money',
        deltas: { timeSpent: -1, riskFog: 15, confidenceBias: 15 }
      }
    ]
  },
  {
    id: 9,
    icon: '🏁',
    title: 'Journey End',
    description: 'You\'ve navigated the mortgage maze. Time to see how well you managed the risks.',
    choices: []
  }
];

// Initialize game
function initGame() {
  // Show landing screen
  showScreen('landing-screen');
  
  // Setup event listeners
  document.getElementById('quick-mode-btn').addEventListener('click', () => startGame('quick'));
  document.getElementById('deep-mode-btn').addEventListener('click', () => startGame('deep'));
  document.getElementById('play-again-btn').addEventListener('click', resetGame);
  document.getElementById('copy-summary-btn').addEventListener('click', copySummary);
  
  // Setup persona selection
  document.querySelectorAll('input[name="persona"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      gameState.persona = e.target.value;
    });
  });
  
  // Setup deposit selection
  document.querySelectorAll('input[name="deposit"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      gameState.depositBand = e.target.value;
      updateInitialStats();
    });
  });
}

// Update initial stats based on deposit band
function updateInitialStats() {
  const depositModifiers = {
    low: { cashflow: -10, bufferMonths: -1, riskFog: 20 },
    medium: { cashflow: 0, bufferMonths: 0, riskFog: 0 },
    high: { cashflow: 10, bufferMonths: 2, riskFog: -10 }
  };
  
  const mod = depositModifiers[gameState.depositBand] || depositModifiers.medium;
  gameState.stats.cashflow = 50 + mod.cashflow;
  gameState.stats.bufferMonths = 2 + mod.bufferMonths;
  gameState.stats.riskFog = 30 + mod.riskFog;
}

// Start game
function startGame(mode) {
  gameState.mode = mode;
  gameState.currentRoom = 0;
  gameState.visitedRooms = [0];
  gameState.history = [];
  gameState.shocksEncountered = 0;
  
  updateInitialStats();
  
  // Generate maze path (simple linear for now with shock insertions)
  const roomSequence = mode === 'quick' 
    ? [0, 1, 2, 3, 5, 6, 9] // Quick: 5-7 rooms, 1 shock
    : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; // Deep: full journey, 2 shocks
  
  gameState.maze = roomSequence;
  
  showScreen('game-screen');
  updateStatsDisplay();
  renderMaze();
  renderRoom(ROOMS[0]);
  notifyParentHeight();
}

// Show screen
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
  notifyParentHeight();
}

// Update stats display
function updateStatsDisplay() {
  document.getElementById('cashflow-stat').textContent = Math.round(gameState.stats.cashflow);
  document.getElementById('buffer-stat').textContent = gameState.stats.bufferMonths.toFixed(1);
  document.getElementById('fog-stat').textContent = Math.round(gameState.stats.riskFog);
  document.getElementById('knowledge-stat').textContent = Math.round(gameState.stats.knowledge);
}

// Render maze grid
function renderMaze() {
  const container = document.getElementById('maze-container');
  container.innerHTML = '';
  
  // Create 5x5 grid
  for (let i = 0; i < 25; i++) {
    const node = document.createElement('div');
    node.className = 'maze-node hidden';
    
    const roomIndex = gameState.maze.indexOf(i);
    const currentIndex = gameState.maze.indexOf(gameState.currentRoom);
    
    if (roomIndex !== -1) {
      if (roomIndex === currentIndex) {
        node.className = 'maze-node current';
        const room = ROOMS.find(r => r.id === gameState.currentRoom);
        node.textContent = room?.icon || '📍';
      } else if (roomIndex < currentIndex) {
        node.className = 'maze-node visited';
        const room = ROOMS.find(r => r.id === gameState.maze[roomIndex]);
        node.textContent = room?.icon || '✓';
      } else if (roomIndex === currentIndex + 1) {
        // Next room is partially visible
        node.className = 'maze-node visible';
        node.textContent = '?';
      } else if (gameState.stats.riskFog < 30 && roomIndex === currentIndex + 2) {
        // If fog is low, can see 2 ahead
        node.className = 'maze-node visible';
        node.textContent = '?';
      }
    }
    
    container.appendChild(node);
  }
}

// Render room
function renderRoom(room) {
  document.getElementById('room-title').textContent = room.title;
  document.getElementById('room-description').textContent = room.description;
  
  const choicesContainer = document.getElementById('choices');
  choicesContainer.innerHTML = '';
  
  if (room.choices.length === 0) {
    // End of game
    showResults();
    return;
  }
  
  room.choices.forEach(choice => {
    const button = document.createElement('button');
    button.className = 'choice-btn';
    
    const label = document.createElement('strong');
    label.textContent = choice.label;
    
    const description = document.createElement('small');
    description.textContent = choice.description;
    
    button.appendChild(label);
    button.appendChild(description);
    
    if (choice.hint) {
      const hintTag = document.createElement('span');
      hintTag.className = 'hint-tag';
      hintTag.textContent = choice.hint;
      button.appendChild(hintTag);
    }
    
    button.addEventListener('click', () => makeChoice(room, choice));
    
    choicesContainer.appendChild(button);
  });
  
  // Update timeline
  updateTimeline();
  
  // Show hint if applicable
  if (room.isShock) {
    showHint('This is a shock event! Your decisions here will significantly impact your visibility score.');
    gameState.shocksEncountered++;
  } else {
    hideHint();
  }
}

// Make choice
function makeChoice(room, choice) {
  // Apply deltas
  Object.keys(choice.deltas).forEach(stat => {
    if (gameState.stats.hasOwnProperty(stat)) {
      gameState.stats[stat] += choice.deltas[stat];
      // Clamp values
      if (stat === 'riskFog') {
        gameState.stats[stat] = Math.max(0, Math.min(100, gameState.stats[stat]));
      }
      if (stat === 'knowledge') {
        gameState.stats[stat] = Math.max(0, Math.min(100, gameState.stats[stat]));
      }
      if (stat === 'bufferMonths') {
        gameState.stats[stat] = Math.max(0, gameState.stats[stat]);
      }
    }
  });
  
  // Record in history
  gameState.history.push({
    roomId: room.id,
    choiceId: choice.id,
    deltas: choice.deltas,
    timestamp: Date.now()
  });
  
  // Move to next room
  const currentIndex = gameState.maze.indexOf(gameState.currentRoom);
  if (currentIndex < gameState.maze.length - 1) {
    gameState.currentRoom = gameState.maze[currentIndex + 1];
    gameState.visitedRooms.push(gameState.currentRoom);
    
    const nextRoom = ROOMS.find(r => r.id === gameState.currentRoom);
    if (nextRoom) {
      updateStatsDisplay();
      renderMaze();
      renderRoom(nextRoom);
      notifyParentHeight();
    }
  }
}

// Update timeline
function updateTimeline() {
  const container = document.getElementById('timeline-items');
  container.innerHTML = '';
  
  gameState.visitedRooms.forEach(roomId => {
    const room = ROOMS.find(r => r.id === roomId);
    if (room) {
      const item = document.createElement('div');
      item.className = room.isShock ? 'timeline-item shock' : 'timeline-item';
      item.textContent = room.icon;
      container.appendChild(item);
    }
  });
}

// Show/hide hint
function showHint(text) {
  const hintBox = document.getElementById('hint-box');
  const hintText = document.getElementById('hint-text');
  hintText.textContent = text;
  hintBox.style.display = 'flex';
}

function hideHint() {
  document.getElementById('hint-box').style.display = 'none';
}

// Calculate score
function calculateScore() {
  const stats = gameState.stats;
  
  // Base score
  let score = 50;
  
  // Add points for good behaviors
  score += (stats.knowledge * 0.3); // Knowledge is valuable
  score += (stats.bufferMonths * 5); // Buffer is critical
  score += ((100 - stats.riskFog) * 0.2); // Low fog is good
  
  // Subtract for risky behaviors
  score -= (stats.confidenceBias * 0.1);
  if (stats.cashflow < 20) {
    score -= 10; // Penalty for low cashflow
  }
  
  // Bonus for completing deep mode
  if (gameState.mode === 'deep') {
    score += 5;
  }
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  // Calculate subscores
  const visible = Math.round(stats.knowledge * 0.8 + (100 - stats.riskFog) * 0.2);
  const partial = Math.round((stats.bufferMonths / 6) * 100);
  const hidden = Math.round(stats.riskFog);
  
  return { score, visible, partial, hidden };
}

// Show results
function showResults() {
  const { score, visible, partial, hidden } = calculateScore();
  
  // Update display
  document.getElementById('final-score').textContent = score;
  document.getElementById('visible-score').textContent = visible;
  document.getElementById('partial-score').textContent = partial;
  document.getElementById('hidden-score').textContent = hidden;
  
  // Score description
  let description = '';
  if (score >= 80) {
    description = 'Excellent! You have strong mortgage visibility.';
  } else if (score >= 60) {
    description = 'Good work! Some areas could use more attention.';
  } else if (score >= 40) {
    description = 'Developing. Many hidden risks remain.';
  } else {
    description = 'Critical gaps. Seek professional advice.';
  }
  document.getElementById('score-description').textContent = description;
  
  // Outcome snapshot
  const snapshotGrid = document.getElementById('snapshot-grid');
  snapshotGrid.innerHTML = `
    <div class="snapshot-item">
      <div class="snapshot-item-label">Monthly Cashflow</div>
      <div class="snapshot-item-value">${Math.round(gameState.stats.cashflow)}</div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-item-label">Buffer Months</div>
      <div class="snapshot-item-value">${gameState.stats.bufferMonths.toFixed(1)}</div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-item-label">Risk Fog Level</div>
      <div class="snapshot-item-value">${Math.round(gameState.stats.riskFog)}%</div>
    </div>
    <div class="snapshot-item">
      <div class="snapshot-item-label">Knowledge Gained</div>
      <div class="snapshot-item-value">${Math.round(gameState.stats.knowledge)}</div>
    </div>
  `;
  
  // Next steps
  const nextStepsList = document.getElementById('next-steps-list');
  const steps = generateNextSteps(score);
  nextStepsList.innerHTML = steps.map(step => `<li>${step}</li>`).join('');
  
  showScreen('results-screen');
  
  // Notify parent of completion
  notifyParentCompletion(score);
}

// Generate next steps based on score
function generateNextSteps(score) {
  const steps = [];
  
  if (gameState.stats.riskFog > 50) {
    steps.push('Research mortgage options thoroughly before committing');
  }
  
  if (gameState.stats.bufferMonths < 3) {
    steps.push('Build an emergency fund of at least 3-6 months expenses');
  }
  
  if (gameState.stats.knowledge < 50) {
    steps.push('Read mortgage guides or consult with a broker to understand your options');
  }
  
  steps.push('Compare rates from at least 3 lenders before deciding');
  steps.push('Review your mortgage annually to ensure it still fits your needs');
  
  if (score < 60) {
    steps.push('Consider booking a session with a financial adviser');
  }
  
  return steps;
}

// Copy summary
function copySummary() {
  const { score, visible, partial, hidden } = calculateScore();
  
  const summary = `
Mortgage Maze Results
======================
Mortgage Visibility Index: ${score}/100

Subscores:
- Visible: ${visible}
- Partial: ${partial}
- Hidden: ${hidden}

Final Stats:
- Cashflow: ${Math.round(gameState.stats.cashflow)}
- Buffer Months: ${gameState.stats.bufferMonths.toFixed(1)}
- Risk Fog: ${Math.round(gameState.stats.riskFog)}%
- Knowledge: ${Math.round(gameState.stats.knowledge)}

Played in ${gameState.mode} mode | ${gameState.history.length} decisions made
`;
  
  navigator.clipboard.writeText(summary.trim()).then(() => {
    const btn = document.getElementById('copy-summary-btn');
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }).catch(err => {
    alert('Could not copy to clipboard');
  });
}

// Reset game
function resetGame() {
  gameState = {
    persona: 'firstHome',
    depositBand: 'low',
    mode: 'quick',
    stats: {
      cashflow: 50,
      bufferMonths: 2,
      riskFog: 30,
      confidenceBias: 50,
      knowledge: 30,
      timeSpent: 0
    },
    history: [],
    currentRoom: 0,
    visitedRooms: [],
    maze: null,
    shocksEncountered: 0,
    seed: Date.now()
  };
  
  showScreen('landing-screen');
}

// PostMessage communication with parent
function notifyParentHeight() {
  if (window.parent !== window) {
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({
      type: 'MORTGAGE_MAZE_HEIGHT',
      height: height
    }, '*');
  }
}

function notifyParentCompletion(score) {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'MORTGAGE_MAZE_COMPLETE',
      score: score
    }, '*');
  }
}

// Listen for resize
window.addEventListener('resize', notifyParentHeight);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
