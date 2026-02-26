// dailyBonus.js - Daily Bonus Game Logic

const DAILY_BONUS_COOLDOWN = 60000; // 1 minute in milliseconds

class DailyBonusGame {
  constructor() {
    this.init();
  }

  init() {
    this.openGameModal();
  }

  openGameModal() {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'daily-bonus-backdrop';
    backdrop.id = 'daily-bonus-backdrop';

    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'daily-bonus-container';
    modal.id = 'daily-bonus-modal';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 500px;
      height: 90vh;
      max-height: 700px;
      z-index: 1000;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = 'daily-bonus.html';
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
    `;

    modal.appendChild(iframe);
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);

    // Handle backdrop click
    backdrop.addEventListener('click', () => this.closeModal());

    // Handle messages from iframe
    window.addEventListener('message', (event) => {
      if (event.data.type === 'DAILY_BONUS_WIN') {
        this.handleGameWin(event.data.points);
      }
    });

    // Close on escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  handleGameWin(points) {
    // Show category selection modal instead of awarding directly
    if (points > 0) {
      this.showCategorySelection(points);
    } else {
      this.closeModal();
    }
  }

  showCategorySelection(points) {
    const backdrop = document.getElementById('daily-bonus-backdrop');
    const modal = document.getElementById('daily-bonus-modal');

    // Clear the modal and show category selection
    modal.innerHTML = '';
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 450px;
      z-index: 1000;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    // Create selection content
    const content = document.createElement('div');
    content.className = 'card glass-heavy';
    content.style.cssText = `
      padding: 32px;
      text-align: center;
      color: var(--text-primary);
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%);
      border: 1px solid rgba(134, 239, 172, 0.2);
      border-radius: 16px;
    `;

    const winMessage = document.createElement('h2');
    winMessage.style.cssText = 'margin: 0 0 8px 0; font-size: 28px; color: var(--accent-primary);';
    winMessage.textContent = `You Won ${points} Points!`;

    const subtitle = document.createElement('p');
    subtitle.style.cssText = 'margin: 0 0 32px 0; color: var(--text-secondary); font-size: 14px;';
    subtitle.textContent = 'Where would you like to add these points?';

    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'display: flex; flex-direction: column; gap: 12px;';

    // Wallet option
    const walletBtn = document.createElement('button');
    walletBtn.style.cssText = `
      padding: 16px;
      background: linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(134, 239, 172, 0.05) 100%);
      border: 2px solid var(--accent-primary);
      border-radius: 8px;
      color: var(--accent-primary);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    walletBtn.innerHTML = '💰 <strong>Wallet</strong><br><span style="font-size: 12px; color: var(--text-secondary);">Personal points to use or donate</span>';
    walletBtn.addEventListener('mouseover', (e) => e.target.style.background = 'linear-gradient(135deg, rgba(134, 239, 172, 0.2) 0%, rgba(134, 239, 172, 0.1) 100%)');
    walletBtn.addEventListener('mouseout', (e) => e.target.style.background = 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(134, 239, 172, 0.05) 100%)');
    walletBtn.addEventListener('click', () => {
      addPointsToCategory(points, 'wallet', `Daily Bonus Game Won!`);
      updatePointsDisplay();
      this.setCooldown();
      setTimeout(() => this.closeModal(), 1000);
      showNotification(`${points} points added to your Wallet!`, 'success');
    });

    // Squad option
    const squadBtn = document.createElement('button');
    squadBtn.style.cssText = `
      padding: 16px;
      background: linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(134, 239, 172, 0.05) 100%);
      border: 2px solid #86efac;
      border-radius: 8px;
      color: #86efac;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    squadBtn.innerHTML = '👥 <strong>Squad</strong><br><span style="font-size: 12px; color: var(--text-secondary);">Bank points for friends & family</span>';
    squadBtn.addEventListener('mouseover', (e) => e.target.style.background = 'linear-gradient(135deg, rgba(134, 239, 172, 0.2) 0%, rgba(134, 239, 172, 0.1) 100%)');
    squadBtn.addEventListener('mouseout', (e) => e.target.style.background = 'linear-gradient(135deg, rgba(134, 239, 172, 0.1) 0%, rgba(134, 239, 172, 0.05) 100%)');
    squadBtn.addEventListener('click', () => {
      addPointsToCategory(points, 'squad', `Daily Bonus Game Won!`);
      updatePointsDisplay();
      this.setCooldown();
      setTimeout(() => this.closeModal(), 1000);
      showNotification(`${points} points added to your Squad!`, 'success');
    });

    // Donate option
    const donateBtn = document.createElement('button');
    donateBtn.style.cssText = `
      padding: 16px;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%);
      border: 2px solid #fbbf24;
      border-radius: 8px;
      color: #fbbf24;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    `;
    donateBtn.innerHTML = '❤️ <strong>Donate</strong><br><span style="font-size: 12px; color: var(--text-secondary);">Support charitable causes</span>';
    donateBtn.addEventListener('mouseover', (e) => e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.2) 0%, rgba(251, 191, 36, 0.1) 100%)');
    donateBtn.addEventListener('mouseout', (e) => e.target.style.background = 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)');
    donateBtn.addEventListener('click', () => {
      addPointsToCategory(points, 'donated', `Daily Bonus Game Won!`);
      updatePointsDisplay();
      this.setCooldown();
      setTimeout(() => this.closeModal(), 1000);
      showNotification(`${points} points donated to charitable causes!`, 'success');
    });

    optionsContainer.appendChild(walletBtn);
    optionsContainer.appendChild(squadBtn);
    optionsContainer.appendChild(donateBtn);

    content.appendChild(winMessage);
    content.appendChild(subtitle);
    content.appendChild(optionsContainer);
    modal.appendChild(content);
  }

  closeModal() {
    const backdrop = document.getElementById('daily-bonus-backdrop');
    const modal = document.getElementById('daily-bonus-modal');

    if (backdrop) backdrop.remove();
    if (modal) modal.remove();
  }

  setCooldown() {
    const lastPlayedTime = Date.now();
    localStorage.setItem('dailyBonusLastPlayed', lastPlayedTime.toString());
  }

  static isCooldownActive() {
    const lastPlayed = localStorage.getItem('dailyBonusLastPlayed');
    if (!lastPlayed) return false;

    const lastPlayedTime = parseInt(lastPlayed);
    const timeSinceLastPlay = Date.now() - lastPlayedTime;
    return timeSinceLastPlay < DAILY_BONUS_COOLDOWN;
  }

  static getRemainingCooldown() {
    const lastPlayed = localStorage.getItem('dailyBonusLastPlayed');
    if (!lastPlayed) return 0;

    const lastPlayedTime = parseInt(lastPlayed);
    const timeSinceLastPlay = Date.now() - lastPlayedTime;
    const remainingTime = DAILY_BONUS_COOLDOWN - timeSinceLastPlay;
    return Math.max(0, Math.ceil(remainingTime / 1000));
  }
}

// Initialize daily bonus trigger
function initDailyBonus() {
  const triggers = document.querySelectorAll('.daily-bonus-trigger');
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Don't allow click if button is disabled
      if (trigger.disabled || DailyBonusGame.isCooldownActive()) {
        const remaining = DailyBonusGame.getRemainingCooldown();
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        showError(
          `Daily bonus on cooldown. Come back in ${minutes}:${seconds.toString().padStart(2, '0')}`
        );
        return;
      }

      const game = new DailyBonusGame();
    });
  });

  // Update cooldown display on button
  updateDailyBonusDisplay();
  setInterval(updateDailyBonusDisplay, 1000);
}

// Update daily bonus button display
function updateDailyBonusDisplay() {
  const triggers = document.querySelectorAll('.daily-bonus-trigger');
  triggers.forEach(trigger => {
    if (DailyBonusGame.isCooldownActive()) {
      const remaining = DailyBonusGame.getRemainingCooldown();
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      trigger.disabled = true;
      trigger.setAttribute('disabled', 'disabled');
      trigger.style.opacity = '0.5';
      trigger.style.cursor = 'not-allowed';
      trigger.style.pointerEvents = 'none';
      
      // Update button text to show timer
      const span = trigger.querySelector('span');
      if (span) {
        span.textContent = timeString;
      }
    } else {
      trigger.disabled = false;
      trigger.removeAttribute('disabled');
      trigger.style.opacity = '1';
      trigger.style.cursor = 'pointer';
      trigger.style.pointerEvents = 'auto';
      
      // Restore original text
      const span = trigger.querySelector('span');
      if (span) {
        span.textContent = 'Daily Bonus';
      }
    }
  });
}
