// gauge.js - Semicircle gauge visualization

function createGauge(containerId, value, max = 100) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const percentage = (value / max) * 100;
  const radius = 60;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;
  
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '150');
  svg.setAttribute('height', '90');
  svg.setAttribute('viewBox', '0 0 150 90');
  
  // Background arc
  const bgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  bgPath.setAttribute('d', `M 15 75 A ${radius} ${radius} 0 0 1 135 75`);
  bgPath.setAttribute('fill', 'none');
  bgPath.setAttribute('stroke', 'rgba(255, 255, 255, 0.1)');
  bgPath.setAttribute('stroke-width', strokeWidth);
  bgPath.setAttribute('stroke-linecap', 'round');
  
  // Value arc
  const valuePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  valuePath.setAttribute('d', `M 15 75 A ${radius} ${radius} 0 0 1 135 75`);
  valuePath.setAttribute('fill', 'none');
  valuePath.setAttribute('stroke', '#86efac');
  valuePath.setAttribute('stroke-width', strokeWidth);
  valuePath.setAttribute('stroke-linecap', 'round');
  valuePath.setAttribute('stroke-dasharray', circumference);
  valuePath.setAttribute('stroke-dashoffset', circumference);
  valuePath.style.transition = 'stroke-dashoffset 1s ease-out';
  
  svg.appendChild(bgPath);
  svg.appendChild(valuePath);
  container.innerHTML = '';
  container.appendChild(svg);
  
  // Animate
  setTimeout(() => {
    valuePath.setAttribute('stroke-dashoffset', dashOffset);
  }, 100);
}

function updateGauge(containerId, value, max = 100) {
  createGauge(containerId, value, max);
}
