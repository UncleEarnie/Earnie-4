// toast.js - Toast notification system

let toastContainer = null;

// Initialize toast container
function initToast() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastContainer);
  }
}

// Show a toast notification
function showToast(message, type = 'success', duration = 3000) {
  initToast();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', 'Close notification');
  closeBtn.onclick = () => removeToast(toast);
  
  toast.appendChild(messageEl);
  toast.appendChild(closeBtn);
  toastContainer.appendChild(toast);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }
  
  return toast;
}

// Remove a toast
function removeToast(toast) {
  if (toast && toast.parentNode) {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

// Convenience methods
function showSuccess(message, duration) {
  return showToast(message, 'success', duration);
}

function showError(message, duration) {
  return showToast(message, 'error', duration);
}
