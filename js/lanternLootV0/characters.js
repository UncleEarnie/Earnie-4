/**
 * Character Assets - SVG-based character sprites
 * Generates lanternbearer, enemies, and visual effects
 */

function getPlayerCharacterSVG() {
  return `
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <!-- Head -->
      <circle cx="50" cy="25" r="12" fill="#f4a460"/>
      
      <!-- Hair -->
      <path d="M 38 20 Q 50 10 62 20" fill="#8b6f47" stroke="#8b6f47" stroke-width="2"/>
      
      <!-- Body -->
      <rect x="42" y="38" width="16" height="25" fill="#4a90e2" rx="2"/>
      
      <!-- Arms -->
      <rect x="35" y="42" width="7" height="22" fill="#f4a460" rx="3"/>
      <rect x="58" y="42" width="7" height="22" fill="#f4a460" rx="3"/>
      
      <!-- Legs -->
      <rect x="45" y="63" width="6" height="25" fill="#3d3d3d" rx="2"/>
      <rect x="49" y="63" width="6" height="25" fill="#3d3d3d" rx="2"/>
      
      <!-- Boots -->
      <rect x="44" y="87" width="12" height="8" fill="#1a1a1a" rx="2"/>
      
      <!-- Lantern in hand -->
      <rect x="58" y="48" width="8" height="10" fill="#ffd700" rx="1"/>
      <circle cx="62" cy="48" r="4" fill="#ffff00" opacity="0.8"/>
    </svg>
  `;
}

function getEnemyCharacterSVG(difficulty, type = 'generic') {
  const scale = 0.7 + (difficulty * 0.05);
  
  if (type === 'goblin') {
    return `
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Head (green) -->
        <circle cx="50" cy="28" r="14" fill="#2d9f3d"/>
        
        <!-- Pointy ears -->
        <polygon points="40,18 35,8 42,20" fill="#2d9f3d"/>
        <polygon points="60,18 65,8 58,20" fill="#2d9f3d"/>
        
        <!-- Eyes (red) -->
        <circle cx="46" cy="26" r="2" fill="#ff3333"/>
        <circle cx="54" cy="26" r="2" fill="#ff3333"/>
        
        <!-- Sneering mouth -->
        <path d="M 48 32 Q 50 34 52 32" fill="none" stroke="#333" stroke-width="1.5"/>
        
        <!-- Body (hunched) -->
        <rect x="42" y="42" width="16" height="20" fill="#3a5f47" rx="2"/>
        
        <!-- Arms (clawed) -->
        <rect x="35" y="45" width="7" height="20" fill="#2d9f3d" rx="3"/>
        <rect x="58" y="45" width="7" height="20" fill="#2d9f3d" rx="3"/>
        <polygon points="62,64 65,62 66,68" fill="#333"/>
        <polygon points="38,64 35,62 34,68" fill="#333"/>
        
        <!-- Legs -->
        <rect x="45" y="62" width="6" height="22" fill="#1a3d28" rx="2"/>
        <rect x="49" y="62" width="6" height="22" fill="#1a3d28" rx="2"/>
      </svg>
    `;
  } else if (type === 'skeleton') {
    return `
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Skull -->
        <circle cx="50" cy="28" r="14" fill="#e0e0e0"/>
        
        <!-- Eye sockets -->
        <circle cx="46" cy="26" r="3" fill="#000"/>
        <circle cx="54" cy="26" r="3" fill="#000"/>
        
        <!-- Teeth -->
        <line x1="48" y1="32" x2="52" y2="32" stroke="#000" stroke-width="1"/>
        <line x1="48" y1="33" x2="52" y2="33" stroke="#000" stroke-width="0.5"/>
        
        <!-- Ribcage -->
        <ellipse cx="50" cy="50" rx="12" ry="15" fill="none" stroke="#b0b0b0" stroke-width="1.5"/>
        <path d="M 42 48 Q 40 50 42 52" fill="none" stroke="#b0b0b0" stroke-width="1"/>
        <path d="M 58 48 Q 60 50 58 52" fill="none" stroke="#b0b0b0" stroke-width="1"/>
        
        <!-- Spine -->
        <line x1="50" y1="40" x2="50" y2="65" stroke="#b0b0b0" stroke-width="2"/>
        <circle cx="50" cy="46" r="1.5" fill="#b0b0b0"/>
        <circle cx="50" cy="52" r="1.5" fill="#b0b0b0"/>
        <circle cx="50" cy="58" r="1.5" fill="#b0b0b0"/>
        
        <!-- Arms (bony) -->
        <line x1="38" y1="48" x2="30" y2="50" stroke="#b0b0b0" stroke-width="3"/>
        <line x1="62" y1="48" x2="70" y2="50" stroke="#b0b0b0" stroke-width="3"/>
        
        <!-- Legs -->
        <line x1="46" y1="65" x2="45" y2="88" stroke="#b0b0b0" stroke-width="3"/>
        <line x1="54" y1="65" x2="55" y2="88" stroke="#b0b0b0" stroke-width="3"/>
      </svg>
    `;
  } else if (type === 'spider') {
    return `
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Body -->
        <ellipse cx="50" cy="40" rx="15" ry="18" fill="#2d2d2d"/>
        
        <!-- Head -->
        <circle cx="50" cy="25" r="10" fill="#3d3d3d"/>
        
        <!-- Eyes -->
        <circle cx="46" cy="23" r="1.5" fill="#ff3333"/>
        <circle cx="54" cy="23" r="1.5" fill="#ff3333"/>
        <circle cx="46" cy="27" r="1.5" fill="#ff3333"/>
        <circle cx="54" cy="27" r="1.5" fill="#ff3333"/>
        
        <!-- Fangs -->
        <polygon points="48,30 47,34 50,32" fill="#999"/>
        <polygon points="52,30 53,34 50,32" fill="#999"/>
        
        <!-- Front legs (left) -->
        <line x1="40" y1="35" x2="25" y2="20" stroke="#3d3d3d" stroke-width="2"/>
        <line x1="40" y1="42" x2="20" y2="45" stroke="#3d3d3d" stroke-width="2"/>
        
        <!-- Front legs (right) -->
        <line x1="60" y1="35" x2="75" y2="20" stroke="#3d3d3d" stroke-width="2"/>
        <line x1="60" y1="42" x2="80" y2="45" stroke="#3d3d3d" stroke-width="2"/>
        
        <!-- Back legs (left) -->
        <line x1="42" y1="55" x2="22" y2="70" stroke="#3d3d3d" stroke-width="2"/>
        <line x1="42" y1="58" x2="18" y2="80" stroke="#3d3d3d" stroke-width="2"/>
        
        <!-- Back legs (right) -->
        <line x1="58" y1="55" x2="78" y2="70" stroke="#3d3d3d" stroke-width="2"/>
        <line x1="58" y1="58" x2="82" y2="80" stroke="#3d3d3d" stroke-width="2"/>
      </svg>
    `;
  } else if (type === 'ogre') {
    return `
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <!-- Head (large, purple) -->
        <circle cx="50" cy="32" r="16" fill="#7d3c98"/>
        
        <!-- Tusks -->
        <polygon points="46,48 43,52 47,50" fill="#f4a460"/>
        <polygon points="54,48 57,52 53,50" fill="#f4a460"/>
        
        <!-- Eyes (angry) -->
        <circle cx="44" cy="28" r="2.5" fill="#222"/>
        <circle cx="56" cy="28" r="2.5" fill="#222"/>
        
        <!-- Thick body -->
        <rect x="40" y="48" width="20" height="28" fill="#8d4ba8" rx="3"/>
        
        <!-- Club/weapon in hand -->
        <rect x="60" y="45" width="5" height="30" fill="#6b4423" rx="2"/>
        <circle cx="62.5" cy="43" r="6" fill="#5a3a1a"/>
        
        <!-- Thick arms -->
        <rect x="32" y="50" width="8" height="24" fill="#8d4ba8" rx="3"/>
        
        <!-- Stumpy legs -->
        <rect x="45" y="76" width="7" height="20" fill="#6d3a88" rx="2"/>
        <rect x="48" y="76" width="7" height="20" fill="#6d3a88" rx="2"/>
      </svg>
    `;
  }
  
  // Default generic enemy
  return `
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <!-- Head -->
      <circle cx="50" cy="28" r="13" fill="#666"/>
      
      <!-- Eyes (red) -->
      <circle cx="46" cy="26" r="2" fill="#ff3333"/>
      <circle cx="54" cy="26" r="2" fill="#ff3333"/>
      
      <!-- Body -->
      <rect x="42" y="41" width="16" height="24" fill="#555" rx="2"/>
      
      <!-- Arms -->
      <rect x="35" y="45" width="7" height="20" fill="#666" rx="3"/>
      <rect x="58" y="45" width="7" height="20" fill="#666" rx="3"/>
      
      <!-- Legs -->
      <rect x="45" y="65" width="6" height="22" fill="#444" rx="2"/>
      <rect x="49" y="65" width="6" height="22" fill="#444" rx="2"/>
    </svg>
  `;
}

function getTrapVisualSVG() {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Trap spikes -->
      <polygon points="50,10 60,40 50,35 40,40" fill="#cc3333" stroke="#990000" stroke-width="1"/>
      <polygon points="30,50 60,50 55,60 25,60" fill="#cc3333" stroke="#990000" stroke-width="1"/>
      <polygon points="50,90 60,60 50,65 40,60" fill="#cc3333" stroke="#990000" stroke-width="1"/>
      
      <!-- Chain -->
      <circle cx="50" cy="50" r="15" fill="none" stroke="#444" stroke-width="2" stroke-dasharray="5,3"/>
    </svg>
  `;
}

function getTreasureVisualSVG() {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Chest -->
      <rect x="20" y="35" width="60" height="40" fill="#8b6f47" stroke="#5a4a2a" stroke-width="2" rx="3"/>
      
      <!-- Lid -->
      <path d="M 20 35 Q 20 20 50 15 Q 80 20 80 35" fill="#a0826d" stroke="#5a4a2a" stroke-width="2"/>
      
      <!-- Gold coins inside -->
      <circle cx="35" cy="50" r="6" fill="#ffd700"/>
      <circle cx="50" cy="48" r="6" fill="#ffd700"/>
      <circle cx="65" cy="50" r="6" fill="#ffd700"/>
      <circle cx="42" cy="60" r="5" fill="#ffed4e"/>
      <circle cx="58" cy="60" r="5" fill="#ffed4e"/>
      
      <!-- Sparkle stars -->
      <path d="M 30 25 L 32 30 L 37 32 L 32 34 L 30 39 L 28 34 L 23 32 L 28 30 Z" fill="#ffff00" opacity="0.7"/>
      <path d="M 70 28 L 71 31 L 74 32 L 71 33 L 70 36 L 69 33 L 66 32 L 69 31 Z" fill="#ffff00" opacity="0.7"/>
    </svg>
  `;
}

function getFountainVisualSVG() {
  return `
    <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
      <!-- Base -->
      <ellipse cx="50" cy="100" rx="35" ry="15" fill="#8b7355" stroke="#5a4a3a" stroke-width="1"/>
      
      <!-- Pool -->
      <ellipse cx="50" cy="95" rx="30" ry="12" fill="#4da6ff" opacity="0.6"/>
      
      <!-- Fountain structure -->
      <rect x="45" y="40" width="10" height="55" fill="#a0a0a0" stroke="#666" stroke-width="1"/>
      
      <!-- Top basin -->
      <ellipse cx="50" cy="40" rx="20" ry="8" fill="#c0c0c0" stroke="#666" stroke-width="1"/>
      <ellipse cx="50" cy="38" rx="18" ry="6" fill="#4da6ff" opacity="0.7"/>
      
      <!-- Water streams -->
      <path d="M 45 38 Q 40 50 38 70" fill="none" stroke="#4da6ff" stroke-width="2" opacity="0.7"/>
      <path d="M 55 38 Q 60 50 62 70" fill="none" stroke="#4da6ff" stroke-width="2" opacity="0.7"/>
      <path d="M 50 38 Q 50 60 50 90" fill="none" stroke="#4da6ff" stroke-width="1.5" opacity="0.5"/>
    </svg>
  `;
}

function getEmptyRoomVisualSVG() {
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <!-- Empty dungeon chamber -->
      <rect x="10" y="10" width="80" height="80" fill="none" stroke="#666" stroke-width="2" rx="4"/>
      
      <!-- Torch on wall -->
      <circle cx="15" cy="20" r="3" fill="#ff8833" opacity="0.6"/>
      <path d="M 15 20 L 12 28" stroke="#ff8833" stroke-width="2" opacity="0.4"/>
      
      <!-- Dust motes -->
      <circle cx="30" cy="35" r="0.5" fill="#999" opacity="0.5"/>
      <circle cx="50" cy="45" r="0.5" fill="#999" opacity="0.5"/>
      <circle cx="70" cy="40" r="0.5" fill="#999" opacity="0.5"/>
    </svg>
  `;
}
