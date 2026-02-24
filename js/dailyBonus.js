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
    // Award points
    if (points > 0) {
      addVisibilityPoints(points, `Daily Bonus Game Won!`);
      updatePointsDisplay();
    }

    // Set cooldown
    this.setCooldown();

    // Close after 3 seconds
    setTimeout(() => {
      this.closeModal();
    }, 3000);
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
