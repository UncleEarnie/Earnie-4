// nav.js - Navigation and mobile drawer functionality

// Set active navigation item based on current page
function setActiveNav() {
  const currentPath = window.location.pathname;
  const currentPage = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
  
  const navLinks = document.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(link => {
    const linkHref = link.getAttribute('href');
    if (linkHref === currentPage || (currentPage === '' && linkHref === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Bind mobile drawer functionality
function bindMobileDrawer() {
  const menuToggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (!menuToggle || !sidebar) return;
  
  // Create overlay if it doesn't exist
  let sidebarOverlay = overlay;
  if (!sidebarOverlay) {
    sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
  }
  
  // Toggle sidebar
  function toggleSidebar() {
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
  }
  
  // Close sidebar
  function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  }
  
  // Event listeners
  menuToggle.addEventListener('click', toggleSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);
  
  // Close sidebar when clicking a nav link
  const navLinks = sidebar.querySelectorAll('.sidebar-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', closeSidebar);
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      closeSidebar();
    }
  });
}

// Initialize navigation
function initNav() {
  setActiveNav();
  bindMobileDrawer();
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNav);
} else {
  initNav();
}
