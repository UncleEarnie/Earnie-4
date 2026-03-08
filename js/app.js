// app.js - Main application logic

// Check authentication status
function checkAuth() {
  if (!AUTH.isLoggedIn() && !window.location.pathname.includes('auth.html')) {
    // Redirect to login
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

// Initialize app
function initApp() {
  // Check if user is authenticated
  if (!checkAuth()) return;
  // Initialize storage defaults
  initDefaults();
  
  // Update visibility points display everywhere
  updatePointsDisplay();
  
  // Bind all launch buttons
  bindLaunchButtons();
  
  // Initialize daily bonus game
  initDailyBonus();
  
  // Initialize page-specific features
  initPageFeatures();
}

// Update visibility points display
function updatePointsDisplay() {
  // Update wallet points
  const walletPoints = getWalletPoints();
  const walletDisplays = document.querySelectorAll('[data-wallet-points]');
  walletDisplays.forEach(display => {
    display.textContent = walletPoints;
  });

  // Update squad points
  const squadPoints = getSquadPoints();
  const squadDisplays = document.querySelectorAll('[data-squad-points]');
  squadDisplays.forEach(display => {
    display.textContent = squadPoints;
  });

  // Update donated points
  const donatedPoints = getDonatedPoints();
  const donatedDisplays = document.querySelectorAll('[data-donated-points]');
  donatedDisplays.forEach(display => {
    display.textContent = donatedPoints;
  });

  // Update legacy visibility points display (total)
  const totalPoints = getVisibilityPoints();
  const displays = document.querySelectorAll('[data-visibility-points]');
  displays.forEach(display => {
    display.textContent = totalPoints;
  });

  // Update wallet page displays
  const walletPageDisplay = document.getElementById('wallet-points');
  if (walletPageDisplay) {
    walletPageDisplay.textContent = walletPoints;
  }

  const squadPageDisplay = document.getElementById('squad-points');
  if (squadPageDisplay) {
    squadPageDisplay.textContent = squadPoints;
  }

  const donatedPageDisplay = document.getElementById('donated-points');
  if (donatedPageDisplay) {
    donatedPageDisplay.textContent = donatedPoints;
  }

  const currentPointsDisplay = document.getElementById('current-points');
  if (currentPointsDisplay) {
    currentPointsDisplay.textContent = walletPoints;
  }
}

// Bind all launch/play/start buttons
function bindLaunchButtons() {
  const launchButtons = document.querySelectorAll('[data-action="launch"]');
  launchButtons.forEach(button => {
    button.addEventListener('click', handleLaunch);
  });
}

// Bind hero image hover effects for game cards
function bindHeroImageHovers() {
  // Disabled - hero image no longer switches on game hover
  return;
}

// Handle game launch
function handleLaunch(event) {
  const button = event.currentTarget;
  const gameSlug = button.getAttribute('data-game-slug');
  const gameTitle = button.getAttribute('data-game-title');
  const pointCost = 5;
  
  const currentPoints = getVisibilityPoints();
  
  if (currentPoints < pointCost) {
    showError('Not enough Visibility Points');
    return;
  }
  
  // Deduct points
  const success = deductPoints(pointCost, `Launched: ${gameTitle}`);
  
  if (success) {
    showSuccess(`Launched: ${gameTitle} (−${pointCost} Visibility Points)`);
    updatePointsDisplay();
    
    // Special handling for iframe games
    if (gameSlug === 'veil-of-risk') {
      openGameIframeModal('https://rubylabsalpha.com/games/earnie2/', gameTitle);
    } else if (gameSlug === 'mortgage-maze') {
      openGameIframeModal('games/mortgage-maze/index.html', gameTitle);
    } else if (gameSlug === 'lifestyle-inflation-trap') {
      openGameIframeModal('games/lifestyle-inflation-trap/index.html', gameTitle);
    } else if (gameSlug === 'market-garden') {
      openGameIframeModal('market-garden.html', gameTitle);
    } else if (gameSlug === 'lantern-loot') {
      openGameIframeModal('lantern-loot.html', gameTitle);
    } else if (gameSlug === 'earnies-journey') {
      openGameIframeModal('earnies-journey.html', gameTitle);
    } else if (gameSlug === 'earnies-journey-v2') {
      openGameIframeModal('earnies-journey-v2.html', gameTitle);
    } else if (gameSlug === 'earnie-match-v0') {
      openGameIframeModal('earnie-match-v0.html', gameTitle);
    } else {
      // For other games, navigate to game detail page
      setTimeout(() => {
        // Could navigate to game page: window.location.href = `game.html?slug=${gameSlug}`;
      }, 500);
    }
  }
}

// Open game in iframe modal with accessibility and responsive design
function openGameIframeModal(url, title) {
  // Lock body scroll
  document.body.style.overflow = 'hidden';
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'game-iframe-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'game-iframe-title');
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'game-iframe-modal';
  
  // Create header
  const header = document.createElement('div');
  header.className = 'game-iframe-header';
  
  const titleElement = document.createElement('h2');
  titleElement.className = 'game-iframe-title';
  titleElement.id = 'game-iframe-title';
  titleElement.textContent = title;
  
  const closeButton = document.createElement('button');
  closeButton.className = 'game-iframe-close';
  closeButton.innerHTML = '✕';
  closeButton.setAttribute('aria-label', 'Close game');
  closeButton.addEventListener('click', closeModal);
  
  header.appendChild(titleElement);
  header.appendChild(closeButton);
  
  // Create iframe container
  const iframeContainer = document.createElement('div');
  iframeContainer.className = 'game-iframe-content';
  
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.className = 'game-iframe';
  iframe.src = url;
  iframe.title = title;
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
  
  iframeContainer.appendChild(iframe);
  modal.appendChild(header);
  modal.appendChild(iframeContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  // Close handlers
  function closeModal() {
    overlay.remove();
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleEscape);
  }
  
  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  
  // Close on Escape key
  function handleEscape(e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  }
  document.addEventListener('keydown', handleEscape);
  
  // Focus trap (basic implementation)
  const focusableElements = modal.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });
  
  // Focus close button initially
  setTimeout(() => closeButton.focus(), 100);
}

// Initialize page-specific features
function initPageFeatures() {
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);
  
  // Home page
  if (page === '' || page === 'index.html') {
    initHomePage();
  }
  
  // Visibility Index page
  if (page === 'visibility-index.html') {
    initVisibilityIndexPage();
  }
  
  // Wallet page
  if (page === 'wallet.html') {
    initWalletPage();
  }
  
  // Games page
  if (page === 'games.html') {
    initGamesPage();
  }
  
  // Single game page
  if (page === 'game.html') {
    initGamePage();
  }
  
  // Budgeting page
  if (page === 'budgeting.html') {
    initBudgetingPage();
  }
  
  // KiwiSaver page
  if (page === 'kiwisaver.html') {
    initKiwiSaverPage();
  }
  
  // Goals page
  if (page === 'goals.html') {
    initGoalsPage();
  }
  
  // Profile page
  if (page === 'profile.html') {
    initProfilePage();
  }
}

// Home page initialization
function initHomePage() {
  // Initialize gauge if container exists
  const gaugeContainer = document.getElementById('visibility-gauge');
  if (gaugeContainer) {
    createGauge('visibility-gauge', 67, 100);
  }
  
  // Render games library
  const gamesGrid = document.getElementById('games-grid');
  if (gamesGrid) {
    const games = getAllGames();
    games.forEach((game, index) => {
      const card = renderGameCard(game, game.featured);
      gamesGrid.appendChild(card);
    });
    // Re-bind launch buttons after rendering
    bindLaunchButtons();
    // Bind hero image hover effects
    bindHeroImageHovers();
  }
}

// Visibility Index page initialization
function initVisibilityIndexPage() {
  const gaugeContainer = document.getElementById('visibility-gauge-large');
  if (gaugeContainer) {
    createGauge('visibility-gauge-large', 67, 100);
  }
}

// Wallet page initialization
function initWalletPage() {
  const currentPoints = getVisibilityPoints();
  const pointsDisplay = document.getElementById('current-points');
  if (pointsDisplay) {
    pointsDisplay.textContent = currentPoints;
  }
  
  // Render activity log
  const activityList = document.getElementById('activity-list');
  if (activityList) {
    const activities = getActivity();
    
    if (activities.length === 0) {
      activityList.innerHTML = '<p class="text-muted text-center">No activity yet</p>';
    } else {
      activityList.innerHTML = '';
      activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.cssText = 'display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05);';
        
        const left = document.createElement('div');
        const label = document.createElement('div');
        label.textContent = activity.label;
        label.style.color = 'var(--text-primary)';
        
        const time = document.createElement('div');
        time.textContent = formatActivityTime(activity.ts);
        time.style.cssText = 'font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;';
        
        left.appendChild(label);
        left.appendChild(time);
        
        const right = document.createElement('div');
        right.textContent = activity.delta > 0 ? `+${activity.delta}` : activity.delta;
        right.style.cssText = `font-weight: 600; color: ${activity.delta > 0 ? 'var(--accent-primary)' : 'var(--danger)'};`;
        
        item.appendChild(left);
        item.appendChild(right);
        activityList.appendChild(item);
      });
    }
  }
  
  // Bind reset button
  const resetBtn = document.getElementById('reset-points-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset Visibility Points to 150?')) {
        resetPoints();
        showSuccess('Points reset to 150');
        // Reload page to update display
        window.location.reload();
      }
    });
  }
}

// Format activity timestamp
function formatActivityTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

// Games page initialization
function initGamesPage() {
  const gamesGrid = document.getElementById('all-games-grid');
  const filterBtns = document.querySelectorAll('[data-filter]');
  
  if (!gamesGrid) return;
  
  let currentFilter = 'All';
  
  function renderGames(category) {
    const games = getGamesByCategory(category);
    gamesGrid.innerHTML = '';
    
    games.forEach(game => {
      const card = renderGameCard(game, false);
      
      // Add view button
      const footer = card.querySelector('.game-card-footer');
      const viewBtn = document.createElement('a');
      viewBtn.href = `game.html?slug=${game.slug}`;
      viewBtn.className = 'btn btn-secondary btn-sm';
      viewBtn.textContent = 'View';
      viewBtn.style.marginRight = '8px';
      footer.insertBefore(viewBtn, footer.firstChild);
      
      gamesGrid.appendChild(card);
    });
    
    bindLaunchButtons();
  }
  
  // Initial render
  renderGames(currentFilter);
  
  // Filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-filter');
      
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Render filtered games
      renderGames(currentFilter);
    });
  });
}

// Single game page initialization
function initGamePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  
  if (!slug) {
    document.body.innerHTML = '<div class="app-container"><p>Game not found</p></div>';
    return;
  }
  
  const game = getGameBySlug(slug);
  if (!game) {
    document.body.innerHTML = '<div class="app-container"><p>Game not found</p></div>';
    return;
  }
  
  // Update page content
  document.getElementById('game-title').textContent = game.title;
  document.getElementById('game-subtitle').textContent = game.subtitle;
  
  const metaContainer = document.getElementById('game-meta');
  if (metaContainer) {
    const meta = renderMetaPills(game);
    metaContainer.appendChild(meta);
  }
  
  // Overview content
  const overviewList = document.getElementById('overview-bullets');
  if (overviewList && game.overviewBullets) {
    game.overviewBullets.forEach(bullet => {
      const li = document.createElement('li');
      li.textContent = bullet;
      overviewList.appendChild(li);
    });
  }
  
  // Learnings
  const learningsContainer = document.getElementById('learnings-container');
  if (learningsContainer && game.learnings) {
    game.learnings.forEach(learning => {
      const card = document.createElement('div');
      card.className = 'card glass-medium';
      card.innerHTML = `
        <h4>${learning.title}</h4>
        <p class="text-secondary">${learning.description}</p>
      `;
      learningsContainer.appendChild(card);
    });
  }
  
  // Related games
  const relatedContainer = document.getElementById('related-games');
  if (relatedContainer) {
    const related = getRelatedGames(slug, 3);
    related.forEach(relGame => {
      const card = renderGameCard(relGame, false);
      relatedContainer.appendChild(card);
    });
    bindLaunchButtons();
  }
  
  // Tabs
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      tabContents.forEach(content => {
        if (content.id === target) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });
  
  // Launch button
  const launchBtn = document.getElementById('game-launch-btn');
  if (launchBtn) {
    launchBtn.setAttribute('data-game-slug', game.slug);
    launchBtn.setAttribute('data-game-title', game.title);
  }
}

// Budgeting page initialization
function initBudgetingPage() {
  const form = document.getElementById('budget-form');
  const resultSection = document.getElementById('budget-result');
  
  if (!form) return;
  
  // Load saved values
  const savedBudget = safeGet(STORAGE_KEYS.BUDGET_DATA, {});
  if (savedBudget.income) {
    document.getElementById('income').value = savedBudget.income;
    document.getElementById('fixed-costs').value = savedBudget.fixedCosts || '';
    document.getElementById('variable-costs').value = savedBudget.variableCosts || '';
    document.getElementById('savings-target').value = savedBudget.savingsTarget || '';
    calculateBudget();
  }
  
  // Calculate on input
  form.addEventListener('input', calculateBudget);
  
  function calculateBudget() {
    const income = parseFloat(document.getElementById('income').value) || 0;
    const fixed = parseFloat(document.getElementById('fixed-costs').value) || 0;
    const variable = parseFloat(document.getElementById('variable-costs').value) || 0;
    const savings = parseFloat(document.getElementById('savings-target').value) || 0;
    
    const remaining = income - fixed - variable - savings;
    
    // Save to localStorage
    safeSet(STORAGE_KEYS.BUDGET_DATA, {
      income,
      fixedCosts: fixed,
      variableCosts: variable,
      savingsTarget: savings
    });
    
    // Update display
    if (income > 0) {
      resultSection.classList.remove('hidden');
      document.getElementById('remaining-amount').textContent = remaining.toFixed(2);
      document.getElementById('remaining-amount').style.color = 
        remaining >= 0 ? 'var(--accent-primary)' : 'var(--danger)';
      
      // Update bar visualization
      updateBudgetBar(income, fixed, variable, savings, remaining);
    }
  }
  
  function updateBudgetBar(income, fixed, variable, savings, remaining) {
    const bar = document.getElementById('budget-bar');
    if (!bar || income === 0) return;
    
    const fixedPct = (fixed / income) * 100;
    const variablePct = (variable / income) * 100;
    const savingsPct = (savings / income) * 100;
    const remainingPct = Math.max(0, (remaining / income) * 100);
    
    bar.innerHTML = `
      <div style="width: ${fixedPct}%; background: rgba(252, 165, 165, 0.6); height: 32px; display: inline-block;"></div>
      <div style="width: ${variablePct}%; background: rgba(251, 191, 36, 0.6); height: 32px; display: inline-block;"></div>
      <div style="width: ${savingsPct}%; background: rgba(134, 239, 172, 0.6); height: 32px; display: inline-block;"></div>
      <div style="width: ${remainingPct}%; background: rgba(255, 255, 255, 0.1); height: 32px; display: inline-block;"></div>
    `;
  }
  
  // Reset button
  const resetBtn = document.getElementById('budget-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all budget data?')) {
        form.reset();
        safeSet(STORAGE_KEYS.BUDGET_DATA, {});
        resultSection.classList.add('hidden');
        showSuccess('Budget data cleared');
      }
    });
  }
}

// KiwiSaver page initialization
function initKiwiSaverPage() {
  const radios = document.querySelectorAll('input[name="fund-type"]');
  const riskLabel = document.getElementById('risk-label');
  const riskDescription = document.getElementById('risk-description');
  
  // Load saved selection
  const saved = safeGet(STORAGE_KEYS.KIWISAVER_SELECTION, 'balanced');
  const savedRadio = document.querySelector(`input[value="${saved}"]`);
  if (savedRadio) {
    savedRadio.checked = true;
    updateRiskInfo(saved);
  }
  
  // Listen for changes
  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const value = e.target.value;
      safeSet(STORAGE_KEYS.KIWISAVER_SELECTION, value);
      updateRiskInfo(value);
      showSuccess(`Fund type updated to ${value}`);
    });
  });
  
  function updateRiskInfo(fundType) {
    const info = {
      conservative: {
        label: 'Lower Risk',
        description: 'Conservative funds invest mainly in cash and bonds. They have lower potential returns but also lower risk of losses.'
      },
      balanced: {
        label: 'Medium Risk',
        description: 'Balanced funds mix growth assets (shares, property) with income assets (cash, bonds). Good middle ground for most people.'
      },
      growth: {
        label: 'Higher Risk',
        description: 'Growth funds invest mainly in shares and property. Higher potential returns over time, but more short-term ups and downs.'
      }
    };
    
    if (riskLabel && info[fundType]) {
      riskLabel.textContent = info[fundType].label;
      riskDescription.textContent = info[fundType].description;
    }
  }
}

// Goals page initialization
function initGoalsPage() {
  const goalsList = document.getElementById('goals-list');
  const addForm = document.getElementById('add-goal-form');
  
  if (!goalsList) return;
  
  function renderGoals() {
    const goals = safeGet(STORAGE_KEYS.GOALS, []);
    
    if (goals.length === 0) {
      goalsList.innerHTML = '<p class="text-muted text-center">No goals yet. Add your first goal below.</p>';
      return;
    }
    
    goalsList.innerHTML = '';
    goals.forEach((goal, index) => {
      const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
      
      const card = document.createElement('div');
      card.className = 'card glass-medium';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
          <div>
            <h4 style="margin-bottom: 4px;">${goal.name}</h4>
            <p class="text-muted" style="font-size: 14px; margin: 0;">$${goal.current.toFixed(2)} of $${goal.target.toFixed(2)}</p>
          </div>
          <button class="btn-icon" data-action="delete-goal" data-index="${index}" aria-label="Delete goal">
            ${getIcon('close')}
          </button>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden; margin-bottom: 12px;">
          <div style="width: ${Math.min(progress, 100)}%; height: 100%; background: var(--accent-primary); transition: width 0.3s;"></div>
        </div>
        <div style="display: flex; gap: 8px;">
          <input type="number" placeholder="Add amount" style="flex: 1; padding: 8px; background: var(--glass-light); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-primary);" data-goal-index="${index}">
          <button class="btn btn-primary btn-sm" data-action="add-to-goal" data-index="${index}">Add</button>
        </div>
      `;
      goalsList.appendChild(card);
    });
    
    // Bind delete buttons
    document.querySelectorAll('[data-action="delete-goal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        deleteGoal(index);
      });
    });
    
    // Bind add buttons
    document.querySelectorAll('[data-action="add-to-goal"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index'));
        const input = document.querySelector(`input[data-goal-index="${index}"]`);
        const amount = parseFloat(input.value);
        if (amount > 0) {
          addToGoal(index, amount);
          input.value = '';
        }
      });
    });
  }
  
  function addGoal(name, target) {
    const goals = safeGet(STORAGE_KEYS.GOALS, []);
    goals.push({ name, target, current: 0 });
    safeSet(STORAGE_KEYS.GOALS, goals);
    renderGoals();
    showSuccess('Goal added');
  }
  
  function deleteGoal(index) {
    if (!confirm('Delete this goal?')) return;
    const goals = safeGet(STORAGE_KEYS.GOALS, []);
    goals.splice(index, 1);
    safeSet(STORAGE_KEYS.GOALS, goals);
    renderGoals();
    showSuccess('Goal deleted');
  }
  
  function addToGoal(index, amount) {
    const goals = safeGet(STORAGE_KEYS.GOALS, []);
    if (goals[index]) {
      goals[index].current += amount;
      safeSet(STORAGE_KEYS.GOALS, goals);
      renderGoals();
      showSuccess(`Added $${amount.toFixed(2)} to goal`);
    }
  }
  
  // Initial render
  renderGoals();
  
  // Add goal form
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('goal-name').value.trim();
      const target = parseFloat(document.getElementById('goal-target').value);
      
      if (name && target > 0) {
        addGoal(name, target);
        addForm.reset();
      }
    });
  }
}

// Profile page initialization
function initProfilePage() {
  const form = document.getElementById('profile-form');
  
  if (!form) return;
  
  // Load saved profile
  const profile = safeGet(STORAGE_KEYS.USER_PROFILE, {});
  if (profile.name) {
    document.getElementById('profile-name').value = profile.name;
    document.getElementById('profile-age').value = profile.age || '';
    document.getElementById('profile-email').value = profile.email || '';
    document.getElementById('profile-experience').value = profile.experience || '';
  }
  
  // Save profile
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const profileData = {
      name: document.getElementById('profile-name').value,
      age: document.getElementById('profile-age').value,
      email: document.getElementById('profile-email').value,
      experience: document.getElementById('profile-experience').value
    };
    
    safeSet(STORAGE_KEYS.USER_PROFILE, profileData);
    showSuccess('Profile saved');
  });
}

// PostMessage listener for iframe games
window.addEventListener('message', (event) => {
  // Validate message structure
  if (!event.data || typeof event.data !== 'object') return;
  
  const { type, game, height, score, visibilityIndex, band } = event.data;
  
  // Handle generic height adjustment messages
  if (type === 'EARNIE_GAME_HEIGHT' && typeof height === 'number' && game) {
    const iframe = document.querySelector(`.game-iframe[src*="${game}"]`);
    if (iframe && height > 0) {
      // Adjust iframe height dynamically (optional enhancement)
      // For now, we use fixed 85vh which works well
    }
  }
  
  // Handle legacy Mortgage Maze height messages
  if (type === 'MORTGAGE_MAZE_HEIGHT' && typeof height === 'number') {
    const iframe = document.querySelector('.game-iframe[src*="mortgage-maze"]');
    if (iframe && height > 0) {
      // Adjust iframe height dynamically (optional enhancement)
      // For now, we use fixed 85vh which works well
    }
  }
  
  // Handle generic game completion messages
  if (type === 'EARNIE_GAME_COMPLETE' && typeof visibilityIndex === 'number' && game) {
    const bonusPoints = Math.floor(visibilityIndex / 10);
    if (bonusPoints > 0) {
      addPoints(bonusPoints, `${game} completion bonus`);
      updatePointsDisplay();
      
      // Show success after a delay (so user can see results first)
      setTimeout(() => {
        const bandEmoji = band === 'visible' ? '🌟' : band === 'partial' ? '⭐' : '✨';
        showSuccess(`${bandEmoji} Earned ${bonusPoints} bonus Visibility Points!`);
      }, 1000);
    }
  }
  
  // Handle legacy Mortgage Maze completion messages
  if (type === 'MORTGAGE_MAZE_COMPLETE' && typeof score === 'number') {
    const bonusPoints = Math.floor(score / 10);
    if (bonusPoints > 0) {
      addPoints(bonusPoints, 'Mortgage Maze completion bonus');
      updatePointsDisplay();
      
      // Show success after a delay (so user can see results first)
      setTimeout(() => {
        showSuccess(`Earned ${bonusPoints} bonus Visibility Points!`);
      }, 1000);
    }
  }
});

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
