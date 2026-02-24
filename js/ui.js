// ui.js - UI component builders and icons

// SVG Icons
const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>',
  
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12h.01"/></svg>',
  
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  
  calculator: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="12" y1="18" x2="12" y2="18"/></svg>',
  
  piggyBank: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2h0V5z"/><circle cx="13" cy="12" r="1"/></svg>',
  
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  
  gamepad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 11h4m-2-2v4m8-1h.01M19 11h.01"/><path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 019.828 16h4.344a2 2 0 011.414.586L17 18c.5.5 1 1 2 1a3 3 0 003-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0017.32 5z"/></svg>',
  
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>',
  
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
  
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
};

// Get icon SVG
function getIcon(name) {
  return ICONS[name] || '';
}

// Render game card
function renderGameCard(game, featured = false) {
  const card = document.createElement('div');
  card.className = `game-card glass ${featured ? 'featured' : ''}`;
  card.setAttribute('data-game-slug', game.slug);
  
  // Add background image if available
  const gameImageMap = {
    'veil-of-risk': 'Veil of Risk.png',
    'kiwisaver-checkin': 'Kiwisaver check in.png',
    'mortgage-maze': 'Mortgage maze.png',
    'rate-shock-simulator': 'Rate shock simulator.png'
  };
  
  // Games that are coming soon
  const comingSoonGames = ['long-horizon', 'market-noise-filter', 'retirement-runway', 'budget-reality-check'];
  const isComingSoon = comingSoonGames.includes(game.slug);
  
  if (gameImageMap[game.slug]) {
    card.style.backgroundImage = `url('${gameImageMap[game.slug]}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    
    // Add dark overlay for text readability
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10, 15, 13, 0.6) 0%, rgba(10, 15, 13, 0.8) 100%); border-radius: inherit; pointer-events: none;';
    card.style.position = 'relative';
    card.appendChild(overlay);
  }
  
  // Add coming soon overlay if applicable
  if (isComingSoon) {
    const comingSoonOverlay = document.createElement('div');
    comingSoonOverlay.style.cssText = 'position: absolute; inset: 0; background: rgba(10, 15, 13, 0.9); border-radius: inherit; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; gap: 12px;';
    
    const lockIcon = document.createElement('div');
    lockIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 48px; height: 48px; color: var(--text-muted);"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    
    const comingSoonText = document.createElement('div');
    comingSoonText.textContent = 'Coming Soon';
    comingSoonText.style.cssText = 'color: var(--text-secondary); font-weight: 600; font-size: 16px;';
    
    comingSoonOverlay.appendChild(lockIcon);
    comingSoonOverlay.appendChild(comingSoonText);
    card.style.position = 'relative';
    card.appendChild(comingSoonOverlay);
  }
  
  const header = document.createElement('div');
  header.className = 'game-card-header';
  header.style.position = 'relative';
  header.style.zIndex = '2';
  
  const title = document.createElement('h3');
  title.className = 'game-title';
  title.textContent = game.title;
  
  const description = document.createElement('p');
  description.className = 'game-description';
  description.textContent = game.description;
  
  const meta = document.createElement('div');
  meta.className = 'game-meta';
  
  if (game.difficulty) {
    const difficultyPill = document.createElement('span');
    difficultyPill.className = `pill difficulty-${game.difficulty.toLowerCase()}`;
    difficultyPill.textContent = game.difficulty;
    meta.appendChild(difficultyPill);
  }
  
  if (game.estimatedMinutes) {
    const timePill = document.createElement('span');
    timePill.className = 'pill';
    timePill.textContent = `${game.estimatedMinutes} min`;
    meta.appendChild(timePill);
  }
  
  if (game.category) {
    const categoryPill = document.createElement('span');
    categoryPill.className = 'pill accent';
    categoryPill.textContent = game.category;
    meta.appendChild(categoryPill);
  }
  
  header.appendChild(title);
  header.appendChild(description);
  header.appendChild(meta);
  
  const footer = document.createElement('div');
  footer.className = 'game-card-footer';
  footer.style.position = 'relative';
  footer.style.zIndex = '2';
  
  const actionBtn = document.createElement('button');
  actionBtn.className = 'btn btn-primary btn-sm';
  actionBtn.textContent = game.ctaLabel || 'Play';
  actionBtn.setAttribute('data-action', 'launch');
  actionBtn.setAttribute('data-game-slug', game.slug);
  actionBtn.setAttribute('data-game-title', game.title);
  
  if (isComingSoon) {
    actionBtn.disabled = true;
    actionBtn.style.opacity = '0.5';
    actionBtn.style.cursor = 'not-allowed';
  }
  
  footer.appendChild(actionBtn);
  
  card.appendChild(header);
  card.appendChild(footer);
  
  return card;
}

// Render meta pills
function renderMetaPills(game) {
  const container = document.createElement('div');
  container.className = 'game-meta';
  
  if (game.difficulty) {
    const pill = document.createElement('span');
    pill.className = `pill difficulty-${game.difficulty.toLowerCase()}`;
    pill.textContent = game.difficulty;
    container.appendChild(pill);
  }
  
  if (game.estimatedMinutes) {
    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = `${game.estimatedMinutes} minutes`;
    container.appendChild(pill);
  }
  
  if (game.category) {
    const pill = document.createElement('span');
    pill.className = 'pill accent';
    pill.textContent = game.category;
    container.appendChild(pill);
  }
  
  if (game.tags && game.tags.length > 0) {
    game.tags.forEach(tag => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = tag;
      container.appendChild(pill);
    });
  }
  
  return container;
}

// Build sidebar navigation
function buildSidebar() {
  const navItems = [
    { label: 'Home', href: 'index.html', icon: 'home' },
    { label: 'Profile', href: 'profile.html', icon: 'user' },
    { label: 'Wallet', href: 'wallet.html', icon: 'wallet' },
    { label: 'Insights', href: 'insights.html', icon: 'chart' },
    { label: 'Visibility Index', href: 'visibility-index.html', icon: 'eye' },
    { label: 'Budgeting', href: 'budgeting.html', icon: 'calculator' },
    { label: 'KiwiSaver', href: 'kiwisaver.html', icon: 'piggyBank' },
    { label: 'Goals', href: 'goals.html', icon: 'target' }
  ];
  
  const nav = document.createElement('ul');
  nav.className = 'sidebar-nav';
  
  navItems.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = item.href;
    a.innerHTML = `${getIcon(item.icon)}<span>${item.label}</span>`;
    li.appendChild(a);
    nav.appendChild(li);
  });
  
  return nav;
}
