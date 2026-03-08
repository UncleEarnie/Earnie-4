// ========================================
// LIFESTYLE INFLATION TRAP - GAME VERSION
// ========================================

// ========================================
// SEEDED RANDOM NUMBER GENERATOR
// ========================================

class SeededRNG {
  constructor(seed = 12345) {
    this.seed = seed;
    this.current = seed;
  }
  next() {
    this.current = (this.current * 1103515245 + 12345) & 0x7fffffff;
    return this.current / 0x7fffffff;
  }
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  reset() {
    this.current = this.seed;
  }
}

// ========================================
// GAME STATE
// ========================================

const gameState = {
  // Current screen
  currentScreen: 'landing',
  
  // Game mode
  mode: null, // 'quick' or 'deep'
  
  // Game progression
  currentStep: 0,
  totalSteps: 0,
  completedSteps: [],
  
  // Financial state
  monthlyIncome: 0,
  buffer: 0,
  investments: 0,
  debt: 0,
  fixedCosts: 0,
  variableCosts: 0,
  satisfaction: 50,
  freedom: 50,
  
  // Commitments
  commitments: [],
  
  // Autopilot policy
  autopilotPolicy: null, // 'buffer', 'invest', 'split'
  
  // Game flags
  hasExperiencedShock1: false,
  hasExperiencedShock2: false,
  hadRaise: false,
  
  // Metrics tracking
  biggestLeaks: [],
  decisions: [],
  highlights: [],
  lastLaneRisk: 'medium',
  lastLaneName: '',
  
  // Visibility score components
  rng: new SeededRNG()
};

// ========================================
// GATE DEFINITIONS
// ========================================

const GATES = {
  subscriptions: {
    title: '📺 Streaming & Subscriptions',
    description: 'You need entertainment, but how much?',
    lanes: [
      {
        id: 'lean',
        icon: '🎯',
        name: 'Lean Stack',
        hint: '1-2 services, rotate as needed',
        risk: 'low',
        effects: {
          fixedCosts: 20,
          satisfaction: -5,
          freedom: 5
        }
      },
      {
        id: 'moderate',
        icon: '📦',
        name: 'Bundle Deal',
        hint: '3-4 services, locked in',
        risk: 'medium',
        effects: {
          fixedCosts: 50,
          satisfaction: 5,
          freedom: -5
        }
      },
      {
        id: 'everything',
        icon: '🌟',
        name: 'Everything',
        hint: '5+ services, FOMO-proof',
        risk: 'high',
        effects: {
          fixedCosts: 80,
          satisfaction: 10,
          freedom: -15
        }
      }
    ]
  },
  
  weekend: {
    title: '🎉 Weekend Spending',
    description: 'How will you unwind and socialize?',
    lanes: [
      {
        id: 'minimal',
        icon: '🏡',
        name: 'Home & Chill',
        hint: 'Low-cost activities',
        risk: 'low',
        effects: {
          variableCosts: 50,
          satisfaction: -10,
          freedom: 10
        }
      },
      {
        id: 'balanced',
        icon: '☕',
        name: 'Balanced Social',
        hint: 'Mix of out and in',
        risk: 'medium',
        effects: {
          variableCosts: 150,
          satisfaction: 5,
          freedom: 0
        }
      },
      {
        id: 'lifestyle',
        icon: '🍹',
        name: 'Full Lifestyle',
        hint: 'Regular dining & events',
        risk: 'high',
        effects: {
          variableCosts: 300,
          satisfaction: 15,
          freedom: -10
        }
      }
    ]
  },
  
  autopilot: {
    title: '🎒 Choose Your Backpack',
    description: 'How should extra income be handled automatically?',
    lanes: [
      {
        id: 'buffer',
        icon: '🛡️',
        name: 'Buffer Backpack',
        hint: 'Prioritize emergency fund',
        risk: 'low',
        effects: {
          autopilotPolicy: 'buffer',
          freedom: 10
        }
      },
      {
        id: 'invest',
        icon: '⭐',
        name: 'Invest Backpack',
        hint: 'Prioritize wealth building',
        risk: 'medium',
        effects: {
          autopilotPolicy: 'invest',
          freedom: 5
        }
      },
      {
        id: 'split',
        icon: '⚖️',
        name: 'Split Backpack',
        hint: 'Balance both goals',
        risk: 'low',
        effects: {
          autopilotPolicy: 'split',
          freedom: 7
        }
      }
    ]
  },
  
  housing: {
    title: '🏠 Housing Upgrade?',
    description: 'Your lease is up. Time to move?',
    lanes: [
      {
        id: 'stay',
        icon: '🔑',
        name: 'Stay Put',
        hint: 'Keep current place',
        risk: 'low',
        effects: {
          fixedCosts: 0,
          satisfaction: -5,
          freedom: 10
        }
      },
      {
        id: 'upgrade',
        icon: '🏡',
        name: 'Nice Upgrade',
        hint: '+30% rent, better location',
        risk: 'high',
        effects: {
          fixedCosts: 400,
          satisfaction: 15,
          freedom: -20,
          commitment: { name: 'Premium Rent', cost: 400 }
        }
      }
    ]
  },
  
  car: {
    title: '🚗 Car Decision',
    description: 'Your old car is running fine, but...',
    lanes: [
      {
        id: 'keep',
        icon: '🚙',
        name: 'Keep Old Car',
        hint: 'Stick with what works',
        risk: 'low',
        effects: {
          fixedCosts: 0,
          satisfaction: -5,
          freedom: 5
        }
      },
      {
        id: 'finance',
        icon: '🚗',
        name: 'Finance New',
        hint: 'Monthly payment',
        risk: 'high',
        effects: {
          fixedCosts: 350,
          satisfaction: 15,
          freedom: -20,
          debt: 20000,
          commitment: { name: 'Car Payment', cost: 350 }
        }
      }
    ]
  },
  
  discovery: {
    title: '🔍 Discovery Action',
    description: 'Take time to review your finances?',
    lanes: [
      {
        id: 'audit',
        icon: '📊',
        name: 'Full Audit',
        hint: 'Find hidden leaks',
        risk: 'low',
        effects: {
          freedom: 10,
          satisfaction: -5,
          visibilityBonus: 5
        }
      },
      {
        id: 'skip',
        icon: '⏩',
        name: 'Skip It',
        hint: 'Stay on cruise control',
        risk: 'medium',
        effects: {
          satisfaction: 5,
          visibilityBonus: -3
        }
      }
    ]
  },
  
  raise: {
    title: '🎈 You Got a Raise!',
    description: '+20% income! How will you use it?',
    lanes: [
      {
        id: 'save',
        icon: '💰',
        name: 'Save It All',
        hint: 'Autopilot handles it',
        risk: 'low',
        effects: {
          satisfaction: -5,
          freedom: 15
        }
      },
      {
        id: 'split',
        icon: '⚖️',
        name: 'Split 50/50',
        hint: 'Half lifestyle, half savings',
        risk: 'medium',
        effects: {
          fixedCosts: 150,
          satisfaction: 10,
          freedom: 5
        }
      },
      {
        id: 'lifestyle',
        icon: '🎊',
        name: 'Lifestyle Up',
        hint: 'Enjoy the upgrade',
        risk: 'high',
        effects: {
          fixedCosts: 300,
          satisfaction: 20,
          freedom: -10
        }
      }
    ]
  },
  
  optimize: {
    title: '🔧 Optimization Moment',
    description: 'Review and cut unnecessary spending?',
    lanes: [
      {
        id: 'cut',
        icon: '✂️',
        name: 'Cut Aggressively',
        hint: 'Reduce by 20%',
        risk: 'low',
        effects: {
          fixedCosts: -100,
          satisfaction: -10,
          freedom: 15
        }
      },
      {
        id: 'maintain',
        icon: '➡️',
        name: 'Maintain',
        hint: 'Keep as is',
        risk: 'medium',
        effects: {
          satisfaction: 5,
          freedom: 0
        }
      }
    ]
  },
  
  final: {
    title: '🏁 Final Choice',
    description: 'One last decision before the finish line',
    lanes: [
      {
        id: 'double-down-buffer',
        icon: '🛡️',
        name: 'Double Down Buffer',
        hint: 'Max out emergency fund',
        risk: 'low',
        effects: {
          buffer: 2000,
          satisfaction: -5,
          freedom: 10
        }
      },
      {
        id: 'invest-push',
        icon: '📈',
        name: 'Investment Push',
        hint: 'Accelerate wealth',
        risk: 'medium',
        effects: {
          investments: 2000,
          satisfaction: 0,
          freedom: 5
        }
      },
      {
        id: 'treat',
        icon: '🎁',
        name: 'Big Treat',
        hint: 'Reward yourself',
        risk: 'high',
        effects: {
          variableCosts: 500,
          satisfaction: 20,
          freedom: -5
        }
      }
    ]
  }
};

// ========================================
// SHOCK (BOSS) DEFINITIONS
// ========================================

const SHOCKS = {
  surprise_expense: {
    title: '💥 Surprise Expense!',
    description: 'Your car needs a $1,500 repair. How do you handle it?',
    icon: '⚠️',
    shields: [
      {
        id: 'buffer',
        icon: '🛡️',
        name: 'Buffer Shield',
        effect: 'Use emergency fund',
        condition: (state) => state.buffer >= 1500,
        apply: (state) => {
          state.buffer -= 1500;
          state.freedom += 5;
          state.highlights.push('Used Buffer Shield in Shock 1 - avoided debt!');
          return 'Buffer absorbed the hit. Smart planning!';
        }
      },
      {
        id: 'debt',
        icon: '💳',
        name: 'Debt Shield',
        effect: 'Put on credit card',
        condition: () => true,
        apply: (state) => {
          state.debt += 1500;
          state.freedom -= 15;
          state.satisfaction -= 10;
          state.highlights.push('Took on debt in Shock 1');
          return 'Added to debt. This will cost you freedom.';
        }
      },
      {
        id: 'sell',
        icon: '📉',
        name: 'Sell Investments',
        effect: 'Cash out early',
        condition: (state) => state.investments >= 1500,
        apply: (state) => {
          state.investments -= 1500;
          state.freedom -= 5;
          state.highlights.push('Sold investments early in Shock 1');
          return 'Sold investments. Lost potential gains.';
        }
      }
    ]
  },
  
  income_dip: {
    title: '📉 Income Disruption!',
    description: 'Freelance work slows down. Income drops 20% for next few months.',
    icon: '⚠️',
    shields: [
      {
        id: 'cut',
        icon: '✂️',
        name: 'Cut Back Lane',
        effect: 'Reduce spending',
        condition: () => true,
        apply: (state) => {
          state.fixedCosts = Math.max(0, state.fixedCosts - 200);
          state.satisfaction -= 15;
          state.freedom += 10;
          state.highlights.push('Cut spending during Shock 2 income dip');
          return 'Tightened belt. Freedom preserved.';
        }
      },
      {
        id: 'maintain',
        icon: '➡️',
        name: 'Maintain Lifestyle',
        effect: 'Keep spending same',
        condition: () => true,
        apply: (state) => {
          state.buffer = Math.max(0, state.buffer - 1000);
          if (state.buffer === 0) {
            state.debt += 500;
          }
          state.freedom -= 20;
          state.highlights.push('Maintained lifestyle through Shock 2 - burned buffer');
          return 'Burned through buffer. Risky move.';
        }
      }
    ]
  }
};

// ========================================
// GAME FLOW SEQUENCE
// ========================================

const GAME_SEQUENCE = {
  quick: [
    { type: 'gate', gateId: 'subscriptions' },
    { type: 'gate', gateId: 'weekend' },
    { type: 'gate', gateId: 'autopilot' },
    { type: 'runner', duration: 22000 },
    { type: 'boss', shockId: 'surprise_expense' },
    { type: 'gate', gateId: 'housing' },
    { type: 'runner', duration: 22000 },
    { type: 'gate', gateId: 'car' },
    { type: 'gate', gateId: 'raise' },
    { type: 'runner', duration: 22000 },
    { type: 'boss', shockId: 'income_dip' },
    { type: 'gate', gateId: 'final' }
  ],
  deep: [
    { type: 'gate', gateId: 'subscriptions' },
    { type: 'gate', gateId: 'weekend' },
    { type: 'gate', gateId: 'autopilot' },
    { type: 'runner', duration: 24000 },
    { type: 'boss', shockId: 'surprise_expense' },
    { type: 'gate', gateId: 'housing' },
    { type: 'runner', duration: 24000 },
    { type: 'gate', gateId: 'car' },
    { type: 'gate', gateId: 'discovery' },
    { type: 'gate', gateId: 'raise' },
    { type: 'runner', duration: 24000 },
    { type: 'boss', shockId: 'income_dip' },
    { type: 'gate', gateId: 'optimize' },
    { type: 'gate', gateId: 'final' }
  ]
};

// ========================================
// CANVAS & RENDERING
// ========================================

let canvas, ctx;
let canvasWidth, canvasHeight;

// Giraffe character
const giraffe = {
  x: 100,
  y: 300,
  width: 40,
  height: 60,
  velocityY: 0,
  isJumping: false,
  isMoving: false
};

// Collectibles and obstacles
let entities = [];

function initCanvas() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  // Set canvas size
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  
  // Reset giraffe position
  giraffe.y = canvasHeight - 150;
  giraffe.velocityY = 0;
  giraffe.isJumping = false;
}

function drawGiraffe() {
  ctx.save();
  
  // Side-scroller style giraffe rendering
  const centerX = giraffe.x + giraffe.width / 2;
  const centerY = giraffe.y + giraffe.height / 2;
  
  // Draw solid background rectangle for character
  ctx.fillStyle = '#1a3830';
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.8)';
  ctx.lineWidth = 3;
  ctx.fillRect(giraffe.x - 10, giraffe.y - 20, 80, 100);
  ctx.strokeRect(giraffe.x - 10, giraffe.y - 20, 80, 100);
  
  // Draw giraffe emoji facing right (flipped horizontally)
  ctx.translate(centerX, centerY);
  ctx.scale(-1, 1); // Flip horizontally to face right
  ctx.font = `bold 90px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🦒', 0, 0);
  ctx.translate(-centerX, -centerY);
  
  ctx.restore();
}

function drawEntities() {
  entities.forEach(entity => {
    // Calculate scale based on distance from spawn (perspective effect)
    const distanceTraveled = entity.spawnX - entity.x;
    const maxDistance = entity.spawnX - 100; // When it reaches giraffe
    const progress = Math.min(1, distanceTraveled / maxDistance);
    
    // Scale from 0.5x to 1.5x based on approach
    const scale = 0.5 + (progress * 1);
    const currentSize = entity.baseSize * scale;
    
    // Draw with scaling
    ctx.save();
    ctx.globalAlpha = 0.8 + (progress * 0.2); // Slightly more opaque as it approaches
    
    // Special rendering for platforms
    if (entity.type === 'platform') {
      // Draw platform as a solid rectangle
      ctx.fillStyle = 'rgba(134, 239, 172, 0.9)';
      ctx.strokeStyle = 'rgba(134, 239, 172, 1)';
      ctx.lineWidth = 3;
      const platformWidth = currentSize * 2.5;
      const platformHeight = currentSize * 0.4;
      ctx.fillRect(entity.x - platformWidth / 2, entity.y - platformHeight / 2, platformWidth, platformHeight);
      ctx.strokeRect(entity.x - platformWidth / 2, entity.y - platformHeight / 2, platformWidth, platformHeight);
      
      // Add glow effect
      if (progress > 0.4) {
        ctx.shadowColor = 'rgba(134, 239, 172, 0.8)';
        ctx.shadowBlur = 15 * progress;
      }
    } else {
      // Regular emoji rendering
      ctx.font = `bold ${currentSize + 10}px Arial`;
      
      // Add glow effect for blocks as they approach
      if (entity.type === 'block' && progress > 0.5) {
        ctx.shadowColor = 'rgba(239, 68, 68, 0.6)';
        ctx.shadowBlur = 20 * progress;
      }
      
      ctx.fillText(entity.emoji, entity.x - 5, entity.y + currentSize);
    }
    
    ctx.restore();
  });
}

function drawBackground() {
  // Ground platform
  const groundY = canvasHeight - 100;
  ctx.fillStyle = 'rgba(134, 239, 172, 0.15)';
  ctx.fillRect(0, groundY, canvasWidth, canvasHeight - groundY);
  
  // Ground line (more visible)
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvasWidth, groundY);
  ctx.stroke();
  
  // Grid lines for visual depth
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < canvasWidth; i += 100) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvasHeight);
    ctx.stroke();
  }
}

function updateGiraffe(deltaTime) {
  const moveSpeed = 6 * (deltaTime / 16);

  if (keys['arrowleft'] || keys['a'] || moveLeftActive) {
    giraffe.x -= moveSpeed;
  }
  if (keys['arrowright'] || keys['d'] || moveRightActive) {
    giraffe.x += moveSpeed;
  }

  giraffe.x = Math.max(20, Math.min(canvasWidth - 60, giraffe.x));

  // Apply gravity
  if (giraffe.isJumping) {
    giraffe.velocityY += 0.8;
    giraffe.y += giraffe.velocityY;
    
    // Ground collision
    const groundY = canvasHeight - 150;
    if (giraffe.y >= groundY) {
      giraffe.y = groundY;
      giraffe.velocityY = 0;
      giraffe.isJumping = false;
    }
  }
}

function updateEntities(deltaTime) {
  // Move entities left
  entities.forEach(entity => {
    entity.x -= entity.speed * (deltaTime / 16);
  });
  
  // Remove off-screen entities
  entities = entities.filter(e => e.x > -100);
  
  // Check collisions
  entities.forEach(entity => {
    // Calculate scaled size for collision
    const distanceTraveled = entity.spawnX - entity.x;
    const maxDistance = entity.spawnX - 100;
    const progress = Math.min(1, distanceTraveled / maxDistance);
    const scale = 0.5 + (progress * 1);
    const scaledSize = entity.baseSize * scale;
    
    if (!entity.collected && 
        giraffe.x < entity.x + scaledSize &&
        giraffe.x + giraffe.width > entity.x &&
        giraffe.y < entity.y &&
        giraffe.y + giraffe.height > entity.y - scaledSize) {
      
      // For platforms: allow jumping off them
      if (entity.type === 'platform') {
        // Check if giraffe is on top of platform (landing from above)
        if (giraffe.velocityY >= 0 && giraffe.y + giraffe.height >= entity.y - scaledSize - 20) {
          // Land on platform
          giraffe.y = entity.y - scaledSize - giraffe.height;
          giraffe.velocityY = 0;
          giraffe.isJumping = false;
          showFloatingText('⬆️ Jump here!', entity.x, entity.y, '#86efac');
        }
      }
      // For blocks: push giraffe back if not jumping
      else if (entity.type === 'block') {
        if (!giraffe.isJumping) {
          // Push giraffe backwards (left)
          giraffe.x -= entity.speed * (deltaTime / 16) * 1.5;
          giraffe.x = Math.max(20, giraffe.x);
          
          if (!entity.hitOnce) {
            entity.hitOnce = true;
            gameState.freedom -= 3;
            showFloatingText('⚠️ Pushed back!', entity.x, entity.y, '#fca5a5');
            updateHUD();
          }
        } else {
          // Successfully jumped over
          entity.collected = true;
          showFloatingText('✓ Jumped over obstacle!', entity.x, entity.y, '#86efac');
        }
      } else {
        // Regular collectibles
        entity.collected = true;
        handleEntityCollision(entity);
      }
    }
  });
}

function handleEntityCollision(entity) {
  // Apply effects based on entity type
  switch (entity.type) {
    case 'buffer-seed':
      gameState.buffer += 200;
      gameState.freedom += 2;
      showFloatingText('+2 Visibility: buffer increased', entity.x, entity.y, '#86efac');
      break;
    case 'investment-star':
      gameState.investments += 300;
      gameState.freedom += 3;
      showFloatingText('+3 Visibility: investments growing', entity.x, entity.y, '#86efac');
      break;
    case 'subscription-gremlin':
      gameState.fixedCosts += 15;
      gameState.freedom -= 2;
      showFloatingText('-2 Visibility: new subscription', entity.x, entity.y, '#fca5a5');
      break;
    case 'lifestyle-lure':
      gameState.fixedCosts += 30;
      gameState.satisfaction += 5;
      gameState.freedom -= 3;
      showFloatingText('-3 Visibility: lifestyle creep', entity.x, entity.y, '#fde047');
      break;
  }
  
  updateHUD();
}

function spawnEntity(type, x) {
  const entityConfig = {
    'buffer-seed': { emoji: '🌱', baseSize: 45, speed: 2 },
    'investment-star': { emoji: '⭐', baseSize: 45, speed: 2 },
    'subscription-gremlin': { emoji: '👾', baseSize: 45, speed: 2 },
    'lifestyle-lure': { emoji: '💎', baseSize: 45, speed: 2 },
    'block': { emoji: '📦', baseSize: 50, speed: 2 },
    'platform': { emoji: '▬', baseSize: 60, speed: 2 }
  };
  
  const config = entityConfig[type];
  entities.push({
    type,
    emoji: config.emoji,
    baseSize: config.baseSize,
    speed: config.speed,
    x: x || canvasWidth,
    y: canvasHeight - 120 - gameState.rng.nextInt(0, 150),
    collected: false,
    hitOnce: false,
    spawnX: x || canvasWidth // Track original spawn position
  });
}

function renderGame() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  drawEntities();
  drawGiraffe();
  
  // Draw progress text on canvas
  if (runnerActive) {
    ctx.save();
    ctx.fillStyle = 'rgba(134, 239, 172, 0.7)';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(`Step ${gameState.currentStep + 1} / ${gameState.totalSteps}`, 20, 40);
    ctx.restore();
  }
}

// ========================================
// GAME LOOP
// ========================================

let lastTime = 0;
let runnerActive = false;
let runnerStartTime = 0;
let runnerDuration = 0;
let spawnTimer = 0;
let moveLeftActive = false;
let moveRightActive = false;
let currentRunnerProfile = {
  badChance: 0.5,
  label: 'Balanced run'
};

function updatePhaseTag(label) {
  const phaseTag = document.getElementById('phaseTag');
  if (phaseTag) phaseTag.textContent = label;
}

function refreshRunnerProfile() {
  const risk = gameState.lastLaneRisk || 'medium';
  let badChance = 0.5;
  let label = 'Balanced run';

  if (risk === 'low') {
    badChance = 0.35;
    label = 'Safer lane momentum';
  } else if (risk === 'high') {
    badChance = 0.65;
    label = 'Risky lane pressure';
  }

  if (gameState.autopilotPolicy === 'buffer') {
    label += ' • Buffer bonus';
  } else if (gameState.autopilotPolicy === 'invest') {
    label += ' • Invest bonus';
  }

  currentRunnerProfile = { badChance, label };
}

function pickSpawnType() {
  const badPool = ['subscription-gremlin', 'lifestyle-lure'];
  const blockChance = 0.20; // 20% chance to spawn a block
  const platformChance = 0.15; // 15% chance to spawn a platform
  
  const rand = gameState.rng.next();
  
  if (rand < platformChance) {
    return 'platform';
  }
  if (rand < platformChance + blockChance) {
    return 'block';
  }
  
  if (gameState.rng.next() < currentRunnerProfile.badChance) {
    return badPool[gameState.rng.nextInt(0, badPool.length - 1)];
  }

  if (gameState.autopilotPolicy === 'buffer') {
    return gameState.rng.next() < 0.7 ? 'buffer-seed' : 'investment-star';
  }
  if (gameState.autopilotPolicy === 'invest') {
    return gameState.rng.next() < 0.7 ? 'investment-star' : 'buffer-seed';
  }
  return gameState.rng.next() < 0.5 ? 'buffer-seed' : 'investment-star';
}

function gameLoop(timestamp) {
  if (!runnerActive) return;
  
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  
  updateGiraffe(deltaTime);
  updateEntities(deltaTime);
  renderGame();
  
  // Spawn entities periodically
  spawnTimer += deltaTime;
  if (spawnTimer > 1200) {
    spawnTimer = 0;
    const randomType = pickSpawnType();
    spawnEntity(randomType);
  }
  
  // Check if runner segment is complete
  if (timestamp - runnerStartTime >= runnerDuration) {
    endRunnerSegment();
    return;
  }
  
  requestAnimationFrame(gameLoop);
}

function startRunnerSegment(duration) {
  runnerActive = true;
  runnerDuration = duration;
  runnerStartTime = performance.now();
  lastTime = performance.now();
  entities = [];
  spawnTimer = 0;
  
  // Show game screen if not already visible
  showScreen('game');
  refreshRunnerProfile();
  updatePhaseTag(`Runner • ${currentRunnerProfile.label}`);
  
  // Apply autopilot if set
  if (gameState.autopilotPolicy) {
    applyAutopilot();
  }
  
  requestAnimationFrame(gameLoop);
}

function endRunnerSegment() {
  runnerActive = false;
  updatePhaseTag('Hub');
  advanceGameFlow();
}

// ========================================
// CONTROLS
// ========================================

const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
  
  if ((e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') && !giraffe.isJumping) {
    giraffe.isJumping = true;
    giraffe.velocityY = -15;
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// ========================================
// HUD UPDATES
// ========================================

function updateHUD() {
  const visibilityScore = calculateVisibilityIndex();
  const runway = calculateRunway();
  const fixedRatio = calculateFixedRatio();
  
  const hudVisibility = document.getElementById('hudVisibility');
  hudVisibility.textContent = Math.round(visibilityScore);
  
  // Apply class based on score for visual feedback
  hudVisibility.classList.remove('visibility-critical', 'visibility-warning', 'visibility-good');
  if (visibilityScore < 40) {
    hudVisibility.classList.add('visibility-critical');
  } else if (visibilityScore < 70) {
    hudVisibility.classList.add('visibility-warning');
  } else {
    hudVisibility.classList.add('visibility-good');
  }
  
  document.getElementById('hudRunway').textContent = `${runway}m`;
  document.getElementById('hudFixed').textContent = `${Math.round(fixedRatio)}%`;
  document.getElementById('hudFreedom').textContent = Math.round(gameState.freedom);
  document.getElementById('hudSatisfaction').textContent = Math.round(gameState.satisfaction);
  const hudBackpack = document.getElementById('hudBackpack');
  if (hudBackpack) {
    hudBackpack.textContent = gameState.autopilotPolicy
      ? `🎒 ${gameState.autopilotPolicy.toUpperCase()}`
      : '🎒 None';
  }
}

function calculateRunway() {
  if (gameState.fixedCosts === 0) return 0;
  return Math.round(gameState.buffer / (gameState.fixedCosts + gameState.variableCosts / 4));
}

function calculateFixedRatio() {
  if (gameState.monthlyIncome === 0) return 0;
  return (gameState.fixedCosts / gameState.monthlyIncome) * 100;
}

// ========================================
// FLOATING TEXT
// ========================================

function showFloatingText(text, x, y, color) {
  const container = document.getElementById('floatingTextContainer');
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.color = color;
  el.style.position = 'absolute';
  el.style.whiteSpace = 'nowrap';
  
  // Ensure better visibility on canvas
  container.appendChild(el);
  
  setTimeout(() => {
    el.remove();
  }, 2500);
}

// ========================================
// AUTOPILOT LOGIC
// ========================================

function applyAutopilot() {
  const surplus = (gameState.monthlyIncome * 0.1); // 10% of income per runner segment
  
  switch (gameState.autopilotPolicy) {
    case 'buffer':
      gameState.buffer += surplus * 0.7;
      gameState.investments += surplus * 0.3;
      showFloatingText('Buffer Backpack: +70% to savings', 100, 100, '#86efac');
      break;
    case 'invest':
      gameState.buffer += surplus * 0.3;
      gameState.investments += surplus * 0.7;
      showFloatingText('Invest Backpack: +70% to investments', 100, 100, '#7dd3fc');
      break;
    case 'split':
      gameState.buffer += surplus * 0.5;
      gameState.investments += surplus * 0.5;
      showFloatingText('Split Backpack: 50/50', 100, 100, '#fde047');
      break;
  }
  
  updateHUD();
}

// ========================================
// GATE SYSTEM
// ========================================

function showGate(gateId) {
  const gate = GATES[gateId];
  const overlay = document.getElementById('gateOverlay');
  const title = document.getElementById('gateTitle');
  const description = document.getElementById('gateDescription');
  const lanesContainer = document.getElementById('gateLanes');
  
  title.textContent = `${gate.title} · Gate ${gameState.currentStep + 1}/${gameState.totalSteps}`;
  description.textContent = gate.description;
  updatePhaseTag(`Gate • ${gate.title}`);
  lanesContainer.innerHTML = '';
  
  gate.lanes.forEach(lane => {
    const laneEl = document.createElement('div');
    laneEl.className = 'gate-lane';
    laneEl.innerHTML = `
      <span class="gate-lane-icon">${lane.icon}</span>
      <div class="gate-lane-name">${lane.name}</div>
      <div class="gate-lane-hint">${lane.hint}</div>
      <span class="gate-lane-risk ${lane.risk}">${lane.risk} risk</span>
    `;
    laneEl.addEventListener('click', () => chooseLane(gateId, lane));
    lanesContainer.appendChild(laneEl);
  });
  
  overlay.classList.remove('hidden');
}

function chooseLane(gateId, lane) {
  // Apply effects
  if (lane.effects.fixedCosts) gameState.fixedCosts += lane.effects.fixedCosts;
  if (lane.effects.variableCosts) gameState.variableCosts += lane.effects.variableCosts;
  if (lane.effects.satisfaction) gameState.satisfaction += lane.effects.satisfaction;
  if (lane.effects.freedom) gameState.freedom += lane.effects.freedom;
  if (lane.effects.buffer) gameState.buffer += lane.effects.buffer;
  if (lane.effects.investments) gameState.investments += lane.effects.investments;
  if (lane.effects.debt) gameState.debt += lane.effects.debt;
  if (lane.effects.autopilotPolicy) {
    gameState.autopilotPolicy = lane.effects.autopilotPolicy;
    showBackpack(lane.effects.autopilotPolicy);
  }
  if (lane.effects.commitment) {
    gameState.commitments.push(lane.effects.commitment);
  }
  
  // Track decision
  gameState.decisions.push({
    gate: gateId,
    choice: lane.id,
    name: lane.name
  });
  gameState.lastLaneRisk = lane.risk || 'medium';
  gameState.lastLaneName = lane.name;
  
  // Track leaks
  if (lane.effects.fixedCosts > 0) {
    gameState.biggestLeaks.push({
      source: `${GATES[gateId].title} - ${lane.name}`,
      amount: lane.effects.fixedCosts
    });
  }
  
  updateHUD();
  
  // Close gate overlay
  document.getElementById('gateOverlay').classList.add('hidden');
  
  // Continue game flow
  advanceGameFlow();
}

function showBackpack(policy) {
  const backpackIndicator = document.getElementById('backpackIndicator');
  const backpackIcon = document.getElementById('backpackIcon');
  const backpackName = document.getElementById('backpackName');
  
  const backpackConfig = {
    buffer: { icon: '🛡️', name: 'Buffer Backpack Active' },
    invest: { icon: '⭐', name: 'Invest Backpack Active' },
    split: { icon: '⚖️', name: 'Split Backpack Active' }
  };
  
  backpackIcon.textContent = backpackConfig[policy].icon;
  backpackName.textContent = backpackConfig[policy].name;
  backpackIndicator.classList.remove('hidden');
}

// ========================================
// BOSS (SHOCK) SYSTEM
// ========================================

function showBoss(shockId) {
  const shock = SHOCKS[shockId];
  const overlay = document.getElementById('bossOverlay');
  const title = document.getElementById('bossTitle');
  const description = document.getElementById('bossDescription');
  const shieldsContainer = document.getElementById('bossShields');
  
  title.textContent = shock.title;
  description.textContent = shock.description;
  updatePhaseTag(`Boss • ${shock.title}`);
  shieldsContainer.innerHTML = '';
  
  shock.shields.forEach(shield => {
    const available = shield.condition(gameState);
    const shieldEl = document.createElement('div');
    shieldEl.className = `boss-shield ${available ? '' : 'disabled'}`;
    shieldEl.innerHTML = `
      <span class="boss-shield-icon">${shield.icon}</span>
      <div class="boss-shield-name">${shield.name}</div>
      <div class="boss-shield-effect">${shield.effect}</div>
    `;
    if (available) {
      shieldEl.addEventListener('click', () => chooseShield(shockId, shield));
    }
    shieldsContainer.appendChild(shieldEl);
  });
  
  overlay.classList.remove('hidden');
}

function chooseShield(shockId, shield) {
  const result = shield.apply(gameState);
  
  // Show result as floating text
  showFloatingText(result, canvasWidth / 2, canvasHeight / 2, '#fca5a5');
  
  // Track shock handled
  if (shockId === 'surprise_expense') gameState.hasExperiencedShock1 = true;
  if (shockId === 'income_dip') gameState.hasExperiencedShock2 = true;
  
  updateHUD();
  
  // Close boss overlay
  document.getElementById('bossOverlay').classList.add('hidden');
  
  // Continue game flow
  advanceGameFlow();
}

// ========================================
// GAME FLOW CONTROL
// ========================================

function advanceGameFlow() {
  gameState.currentStep++;
  
  const sequence = GAME_SEQUENCE[gameState.mode];
  if (gameState.currentStep >= sequence.length) {
    // Game complete
    endGame();
    return;
  }
  
  const nextStep = sequence[gameState.currentStep];
  updatePhaseTag(`Step ${gameState.currentStep + 1}/${gameState.totalSteps}`);
  
  switch (nextStep.type) {
    case 'gate':
      showGate(nextStep.gateId);
      break;
    case 'runner':
      startRunnerSegment(nextStep.duration);
      break;
    case 'boss':
      showBoss(nextStep.shockId);
      break;
  }
}

// ========================================
// VISIBILITY INDEX CALCULATION
// ========================================

function calculateVisibilityIndex() {
  let score = 50; // Base score
  
  // Runway factor (0-25 points)
  const runway = calculateRunway();
  if (runway >= 6) score += 25;
  else if (runway >= 4) score += 15;
  else if (runway >= 2) score += 8;
  else score -= 10;
  
  // Fixed cost ratio factor (0-20 points)
  const fixedRatio = calculateFixedRatio();
  if (fixedRatio <= 40) score += 20;
  else if (fixedRatio <= 60) score += 10;
  else if (fixedRatio <= 80) score -= 5;
  else score -= 15;
  
  // Debt factor (-20 to 0 points)
  if (gameState.debt === 0) score += 5;
  else if (gameState.debt < 5000) score -= 5;
  else if (gameState.debt < 15000) score -= 10;
  else score -= 20;
  
  // Investments factor (0-15 points)
  if (gameState.investments > 10000) score += 15;
  else if (gameState.investments > 5000) score += 10;
  else if (gameState.investments > 0) score += 5;
  
  // Freedom factor (0-10 points)
  if (gameState.freedom > 70) score += 10;
  else if (gameState.freedom > 50) score += 5;
  else if (gameState.freedom < 30) score -= 10;
  
  // Autopilot bonus
  if (gameState.autopilotPolicy === 'buffer') score += 5;
  if (gameState.autopilotPolicy === 'invest') score += 3;
  if (gameState.autopilotPolicy === 'split') score += 4;
  
  return Math.max(0, Math.min(100, score));
}

function getVisibilityBand(score) {
  if (score >= 70) return 'visible';
  if (score >= 40) return 'partial';
  return 'hidden';
}

function getVisionDescription(band) {
  if (band === 'visible') return 'Clear Vision 👁️';
  if (band === 'partial') return 'Hazy Vision 🌫️';
  return 'Foggy Vision 🌁';
}

// ========================================
// GAME END
// ========================================

function endGame() {
  showScreen('results');
  
  const finalScore = calculateVisibilityIndex();
  const finalBand = getVisibilityBand(finalScore);
  const finalVision = getVisionDescription(finalBand);
  
  document.getElementById('finalScore').textContent = Math.round(finalScore);
  document.getElementById('finalBand').textContent = finalBand.toUpperCase();
  document.getElementById('finalBand').className = `badge-band ${finalBand}`;
  document.getElementById('finalVision').textContent = finalVision;
  
  // Populate highlights
  const highlightsList = document.getElementById('highlightsList');
  highlightsList.innerHTML = '';
  
  // Sort leaks by amount
  const topLeaks = [...gameState.biggestLeaks]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
  
  if (topLeaks.length > 0) {
    gameState.highlights.unshift(`Biggest leak: ${topLeaks[0].source} ($${topLeaks[0].amount}/mo)`);
  }
  
  if (gameState.decisions.length > 0) {
    const raiseDecision = gameState.decisions.find(d => d.gate === 'raise');
    if (raiseDecision) {
      gameState.highlights.push(`Used raise for: ${raiseDecision.name}`);
    }
  }
  
  gameState.highlights.forEach(h => {
    const li = document.createElement('li');
    li.textContent = h;
    highlightsList.appendChild(li);
  });
  
  // Populate snapshot
  const snapshotList = document.getElementById('snapshotList');
  snapshotList.innerHTML = `
    <li>Runway: ${calculateRunway()} months</li>
    <li>Fixed Cost Ratio: ${Math.round(calculateFixedRatio())}%</li>
    <li>Buffer: $${Math.round(gameState.buffer)}</li>
    <li>Investments: $${Math.round(gameState.investments)}</li>
    <li>Debt: $${Math.round(gameState.debt)}</li>
    <li>Freedom: ${Math.round(gameState.freedom)}/100</li>
    <li>Satisfaction: ${Math.round(gameState.satisfaction)}/100</li>
  `;
  
  // Populate leaks
  const leaksList = document.getElementById('leaksList');
  leaksList.innerHTML = '';
  topLeaks.forEach(leak => {
    const li = document.createElement('li');
    li.textContent = `${leak.source}: $${leak.amount}/month`;
    leaksList.appendChild(li);
  });
  
  // Generate insights
  const insightsList = document.getElementById('insightsList');
  insightsList.innerHTML = '';
  const insights = generateInsights(finalScore, finalBand);
  insights.forEach(insight => {
    const li = document.createElement('li');
    li.textContent = insight;
    insightsList.appendChild(li);
  });
  
  // Notify parent
  notifyParentCompletion(finalScore, finalBand);
}

function generateInsights(score, band) {
  const insights = [];
  const runway = calculateRunway();
  const fixedRatio = calculateFixedRatio();
  
  if (runway < 3) {
    insights.push('Low runway means shocks can force panic decisions. Build buffer first.');
  } else if (runway >= 6) {
    insights.push('Strong buffer gives you freedom to make long-term choices.');
  }
  
  if (fixedRatio > 70) {
    insights.push('High fixed costs lock you in. Even small income dips hurt.');
  } else if (fixedRatio < 50) {
    insights.push('Keeping fixed costs low preserves freedom and flexibility.');
  }
  
  if (gameState.debt > 10000) {
    insights.push('Debt compounds invisibility. Each payment reduces future options.');
  }
  
  if (band === 'hidden') {
    insights.push('Your financial picture is foggy. Start with a spending audit.');
  } else if (band === 'visible') {
    insights.push('Clear visibility means you can plan confidently for the future.');
  }
  
  return insights.slice(0, 3);
}

// ========================================
// SCREEN MANAGEMENT
// ========================================

function showScreen(screenName) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('visible'));
  document.getElementById(`${screenName}Screen`).classList.add('visible');
  gameState.currentScreen = screenName;
  
  if (screenName === 'game') {
    if (!canvas) {
      initCanvas();
    }
  }
}

// ========================================
// INIT & EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  // Landing screen
  document.getElementById('startGameBtn')?.addEventListener('click', () => {
    showScreen('setup');
  });
  
  // Setup screen
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      const mode = card.dataset.mode;
      startGame(mode);
    });
  });
  
  // Results screen
  document.getElementById('copySummaryBtn')?.addEventListener('click', copySummary);
  document.getElementById('replayBtn')?.addEventListener('click', resetGame);

  const leftBtn = document.getElementById('leftBtn');
  const rightBtn = document.getElementById('rightBtn');
  const jumpBtn = document.getElementById('jumpBtn');

  const setMove = (dir, value) => {
    if (dir === 'left') moveLeftActive = value;
    if (dir === 'right') moveRightActive = value;
  };

  leftBtn?.addEventListener('touchstart', () => setMove('left', true), { passive: true });
  leftBtn?.addEventListener('touchend', () => setMove('left', false), { passive: true });
  rightBtn?.addEventListener('touchstart', () => setMove('right', true), { passive: true });
  rightBtn?.addEventListener('touchend', () => setMove('right', false), { passive: true });
  leftBtn?.addEventListener('mousedown', () => setMove('left', true));
  leftBtn?.addEventListener('mouseup', () => setMove('left', false));
  rightBtn?.addEventListener('mousedown', () => setMove('right', true));
  rightBtn?.addEventListener('mouseup', () => setMove('right', false));

  jumpBtn?.addEventListener('click', () => {
    if (!giraffe.isJumping) {
      giraffe.isJumping = true;
      giraffe.velocityY = -15;
    }
  });
});

function startGame(mode) {
  gameState.mode = mode;
  gameState.currentStep = -1; // Will be incremented to 0
  gameState.totalSteps = GAME_SEQUENCE[mode].length;
  
  // Initialize starting conditions
  gameState.monthlyIncome = mode === 'deep' ? 5000 : 3500;
  gameState.buffer = 1000;
  gameState.investments = 500;
  gameState.debt = 0;
  gameState.fixedCosts = 800;
  gameState.variableCosts = 200;
  gameState.satisfaction = 50;
  gameState.freedom = 50;
  gameState.commitments = [];
  gameState.autopilotPolicy = null;
  gameState.biggestLeaks = [];
  gameState.decisions = [];
  gameState.highlights = [];
  gameState.hasExperiencedShock1 = false;
  gameState.hasExperiencedShock2 = false;
  gameState.hadRaise = false;
  gameState.lastLaneRisk = 'medium';
  gameState.lastLaneName = '';
  
  showScreen('game');
  initCanvas();
  updateHUD();
  updatePhaseTag('Learn by moving into lanes');
  showFloatingText('Tip: A/D or ←/→ to move, Space to jump', 60, 90, '#7dd3fc');
  
  // Start first step
  advanceGameFlow();
}

function resetGame() {
  showScreen('landing');
  gameState.currentStep = 0;
  entities = [];
  runnerActive = false;
}

function copySummary() {
  const finalScore = calculateVisibilityIndex();
  const runway = calculateRunway();
  const fixedRatio = calculateFixedRatio();
  
  const summary = `
🦒 Lifestyle Inflation Trap - Results

Visibility Index: ${Math.round(finalScore)}/100 (${getVisibilityBand(finalScore).toUpperCase()})

Final Stats:
- Runway: ${runway} months
- Fixed Cost Ratio: ${Math.round(fixedRatio)}%
- Buffer: $${Math.round(gameState.buffer)}
- Investments: $${Math.round(gameState.investments)}
- Debt: $${Math.round(gameState.debt)}
- Freedom: ${Math.round(gameState.freedom)}/100
- Satisfaction: ${Math.round(gameState.satisfaction)}/100

Key Highlights:
${gameState.highlights.map(h => `- ${h}`).join('\n')}

Played on Uncle Earnie's financial education platform.
  `.trim();
  
  navigator.clipboard.writeText(summary).then(() => {
    alert('Summary copied to clipboard!');
  });
}

// ========================================
// PARENT COMMUNICATION
// ========================================

function notifyParentHeight() {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'EARNIE_GAME_HEIGHT',
      game: 'lifestyle-inflation-trap',
      height: document.body.scrollHeight
    }, '*');
  }
}

function notifyParentCompletion(score, band) {
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'EARNIE_GAME_COMPLETE',
      game: 'lifestyle-inflation-trap',
      visibilityIndex: score,
      band: band
    }, '*');
  }
}

// Notify height on load
window.addEventListener('load', notifyParentHeight);

// Notify height on resize (for dynamic content)
const resizeObserver = new ResizeObserver(notifyParentHeight);
resizeObserver.observe(document.body);
