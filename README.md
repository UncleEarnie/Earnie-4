# Uncle Earnie - Financial Education Platform

A pure static website for financial education featuring interactive games and experiences built with HTML, CSS, and vanilla JavaScript.

## Features

- **Dark Jungle/Green Glass UI** - Premium glassmorphism design with emerald accents
- **Visibility Points System** - Earn and spend points across experiences
- **Games Library** - 8+ educational financial games and experiences
- **Interactive Tools**:
  - Budget Calculator
  - KiwiSaver Fund Selector
  - Financial Goals Tracker
  - Visibility Index Widget
  - Wallet Activity Log
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Local Storage** - All data persists between sessions
- **No Dependencies** - Pure HTML/CSS/JS, works with file:// protocol

## Getting Started

1. Open `index.html` in any modern web browser
2. No server required - runs directly from files
3. All data is stored locally in your browser

## File Structure

```
/
├── index.html              # Home page with hero and games
├── profile.html            # User profile management
├── wallet.html            # Points balance and activity
├── insights.html          # Learning analytics
├── visibility-index.html  # Risk visibility dashboard
├── budgeting.html         # Budget calculator
├── kiwisaver.html         # Fund selection tool
├── goals.html             # Financial goals tracker
├── games.html             # Full games library
├── game.html              # Single game detail page
├── css/
│   └── styles.css         # All styles and design tokens
├── js/
│   ├── app.js             # Main application logic
│   ├── nav.js             # Navigation and mobile menu
│   ├── data.js            # Games library data
│   ├── ui.js              # UI components and icons
│   ├── toast.js           # Toast notifications
│   ├── gauge.js           # SVG gauge visualizations
│   └── storage.js         # localStorage utilities
└── assets/
    ├── giraffe.svg        # Uncle Earnie mascot
    ├── avatar.svg         # User avatar
    └── favicon.svg        # Site favicon
```

## Key Functionality

### Visibility Points
- Start with 150 points
- Each game costs 5 points to launch
- Activity is logged in the wallet
- Points can be reset to 150

### Games Library
All games include:
- Difficulty rating (Easy/Medium/Hard)
- Estimated time to complete
- Category tags
- Learning outcomes
- Related game suggestions

### Data Persistence
All user data is stored in localStorage:
- Visibility points balance
- Activity history
- Profile information
- Budget calculations
- KiwiSaver selections
- Financial goals

## Design Tokens

The design system uses CSS variables defined in `:root`:

- **Colors**: Dark backgrounds with emerald accents
- **Typography**: System font stack, 8 size scales
- **Spacing**: Consistent 8px rhythm
- **Glassmorphism**: Multiple opacity levels with backdrop blur
- **Shadows**: 3 depths for elevation
- **Radius**: 6 sizes from 8px to full circles

## Browser Compatibility

Works in all modern browsers that support:
- CSS Custom Properties
- CSS Grid and Flexbox
- localStorage API
- ES6 JavaScript

## Educational Purpose

This is an educational prototype designed to demonstrate:
- Financial literacy concepts
- Risk visibility awareness
- Interactive learning experiences

**Not financial advice** - For educational purposes only.

## License

Created for Uncle Earnie financial education platform.
