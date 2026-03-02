/**
 * Button Handlers
 * Makes all action buttons on the site functional
 */

// Redirect to auth if not logged in
function requireAuth() {
  if (!AUTH.isLoggedIn()) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

// User menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const userMenuToggle = document.querySelector('.user-menu-toggle');
  const userMenu = document.querySelector('.user-menu');

  if (userMenuToggle && userMenu) {
    userMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', () => {
      userMenu.style.display = 'none';
    });
  }

  // Update user name in menu
  if (AUTH.isLoggedIn()) {
    const user = AUTH.getCurrentUser();
    const userNameEls = document.querySelectorAll('[data-user-name]');
    userNameEls.forEach(el => {
      el.textContent = user?.name || 'User';
    });
  }
});

// Handle logout
function handleLogout() {
  AUTH.logout();
  showNotification('You have been signed out', 'success');
  setTimeout(() => {
    window.location.href = 'auth.html';
  }, 1000);
}

// KiwiSaver section handlers
function handleSwitchKiwiSaver() {
  if (!requireAuth()) return;
  STATS.trackFundSwitch('Current Fund', 'New Fund');
  window.location.href = 'kiwisaver.html';
}

// Mortgages section handlers
function handleMortgageConsultation() {
  if (!requireAuth()) return;
  STATS.trackMortgageConsultation();
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div class="card glass-medium" style="max-width: 420px; padding: var(--space-2xl); text-align: center;">
      <h3 style="margin-bottom: var(--space-md);">Mortgage Consultation</h3>
      <p class="text-secondary" style="margin-bottom: var(--space-lg);">
        Our advisers will help you find better rates and terms for your mortgage.
      </p>
      <div style="background: rgba(134, 239, 172, 0.1); border: 1px solid var(--accent-primary); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); font-size: 13px;">
        <strong>Next Steps:</strong><br>
        We'll contact you within 24 hours to schedule a consultation.
      </div>
      <button class="btn btn-primary" onclick="this.closest('[style*=position]').remove(); showNotification('Consultation request submitted', 'success');">
        Got it
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  showNotification('Consultation request submitted! We\'ll be in touch soon.', 'success');
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Insurance section handlers
function handleInsuranceReview() {
  if (!requireAuth()) return;
  STATS.trackInsuranceReview();
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div class="card glass-medium" style="max-width: 420px; padding: var(--space-2xl); text-align: center;">
      <h3 style="margin-bottom: var(--space-md);">Insurance Review</h3>
      <p class="text-secondary" style="margin-bottom: var(--space-lg);">
        Let's make sure you have the right cover at the best price.
      </p>
      <div style="background: rgba(134, 239, 172, 0.1); border: 1px solid var(--accent-primary); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); font-size: 13px;">
        <strong>Coverage Types:</strong><br>
        • Life & Health<br>
        • Home & Contents<br>
        • Car & Vehicle
      </div>
      <button class="btn btn-primary" onclick="this.closest('[style*=position]').remove(); showNotification('Insurance review scheduled', 'success');">
        Schedule Review
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Debt section handlers
function handleDebtSolutions() {
  if (!requireAuth()) return;
  STATS.trackDebtConsultation();
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div class="card glass-medium" style="max-width: 420px; padding: var(--space-2xl); text-align: center;">
      <h3 style="margin-bottom: var(--space-md);">Debt Solutions</h3>
      <p class="text-secondary" style="margin-bottom: var(--space-lg);">
        We help consolidate debt and reduce financial stress.
      </p>
      <div style="background: rgba(134, 239, 172, 0.1); border: 1px solid var(--accent-primary); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); font-size: 13px;">
        <strong>Our Services:</strong><br>
        • Debt Consolidation<br>
        • Payment Plans<br>
        • Budget Support
      </div>
      <button class="btn btn-primary" onclick="this.closest('[style*=position]').remove(); showNotification('Debt consultation request submitted', 'success');">
        Get Help
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Tax section handlers
function handleTaxSupport() {
  if (!requireAuth()) return;
  STATS.trackTaxConsultation();
  
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;
  
  modal.innerHTML = `
    <div class="card glass-medium" style="max-width: 420px; padding: var(--space-2xl); text-align: center;">
      <h3 style="margin-bottom: var(--space-md);">Tax & Accounting</h3>
      <p class="text-secondary" style="margin-bottom: var(--space-lg);">
        Expert help with tax returns, compliance, and planning.
      </p>
      <div style="background: rgba(134, 239, 172, 0.1); border: 1px solid var(--accent-primary); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-lg); font-size: 13px;">
        <strong>Services:</strong><br>
        • Tax Returns<br>
        • Business Structure<br>
        • IRD Issues
      </div>
      <button class="btn btn-primary" onclick="this.closest('[style*=position]').remove(); showNotification('Tax consultant will contact you', 'success');">
        Find Accountant
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Get Started buttons
function handleGetStartedKiwiSaver() {
  if (!requireAuth()) return;
  window.location.href = 'kiwisaver.html';
}

function handleTalkToAdviser() {
  if (!requireAuth()) return;
  handleMortgageConsultation();
}

function handleReviewCover() {
  if (!requireAuth()) return;
  handleInsuranceReview();
}

function handleGetHelpNow() {
  if (!requireAuth()) return;
  handleDebtSolutions();
}

// Attach handlers to buttons
document.addEventListener('DOMContentLoaded', () => {
  // Find all buttons and action cards
  const buttons = document.querySelectorAll('button, a');
  
  buttons.forEach(btn => {
    const text = btn.textContent.toLowerCase();
    
    // KiwiSaver
    if (text.includes('switch your kiwisaver') || text.includes('get started')) {
      btn.onclick = (e) => {
        e.preventDefault();
        handleGetStartedKiwiSaver();
      };
    }
    
    // Mortgages
    if (text.includes('mortgages') || text.includes('talk to an adviser')) {
      btn.onclick = (e) => {
        e.preventDefault();
        handleTalkToAdviser();
      };
    }
    
    // Insurance
    if (text.includes('insurance') || text.includes('review my cover')) {
      btn.onclick = (e) => {
        e.preventDefault();
        handleReviewCover();
      };
    }
    
    // Debt
    if (text.includes('debt') || text.includes('get help now')) {
      btn.onclick = (e) => {
        e.preventDefault();
        handleDebtSolutions();
      };
    }
    
    // Tax
    if (text.includes('tax') || text.includes('find an accountant')) {
      btn.onclick = (e) => {
        e.preventDefault();
        handleTaxSupport();
      };
    }
  });

  // Check authentication on page load
  if (!AUTH.isLoggedIn() && !window.location.pathname.includes('auth.html')) {
    // Don't force redirect, just disable interactive elements
    // User can still view content but can't interact
  }
});

// Action card click handlers
function setupActionCardHandlers() {
  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (!requireAuth()) return;
      
      const heading = card.querySelector('h3').textContent.toLowerCase();
      
      if (heading.includes('kiwisaver')) {
        handleGetStartedKiwiSaver();
      } else if (heading.includes('mortgage')) {
        handleTalkToAdviser();
      } else if (heading.includes('insurance')) {
        handleReviewCover();
      } else if (heading.includes('debt')) {
        handleDebtSolutions();
      } else if (heading.includes('tax')) {
        handleTaxSupport();
      }
    });
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', setupActionCardHandlers);
