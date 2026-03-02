# Uncle Earnie - User Authentication & Statistics System

## Overview

This document describes the complete user authentication, verification, and statistics tracking system that has been implemented for the Uncle Earnie financial education platform.

## Features

### 1. User Authentication System

**Registration (`auth.html`)**
- Users can create a new account with:
  - Full name
  - Email address
  - Password (minimum 6 characters)
  - Password confirmation
- Email format validation
- Duplicate email prevention
- Secure password hashing (simple hash for demo, use bcrypt in production)

**Email Verification**
- 6-digit verification codes sent to user email (simulated in localStorage)
- 24-hour code expiration
- Maximum 3 verification attempts
- Automatic code regeneration

**Login**
- Email and password authentication
- Email verification requirement before login
- Session management via localStorage
- User data persistence across page reloads

**Logout**
- Secure logout with session clearing
- Automatic redirect to login page

### 2. User Data Management

Each user profile includes:
```javascript
{
  id: "user_[timestamp]_[random]",
  email: "[user@example.com]",
  password: "[hashed]",
  name: "[User Name]",
  emailVerified: true/false,
  createdAt: "[ISO timestamp]",
  profile: {
    riskProfile: null,
    visibilityIndex: null
  },
  stats: {
    pointsEarned: 0,
    gamePlayedCount: 0,
    totalPointsWalletSpent: 0,
    totalPointsSquadShared: 0,
    totalPointsDonated: 0
  }
}
```

### 3. Statistics Tracking

**Tracked Events:**
- Game plays and points earned
- Fund switches (KiwiSaver)
- Point transfers between categories
- Insurance reviews
- Tax consultations
- Debt consultations
- Mortgage consultations
- Activity timestamps

**Engagement Metrics:**
- Activities this week
- Activities this month
- Activities today
- Most recent activity
- Category-specific point accumulation

### 4. Action Buttons

All action buttons are now fully functional:

**KiwiSaver Section**
- "Switch your KiwiSaver" → Redirects to KiwiSaver page
- "Get started" → Same functionality
- Fund switch modal confirmation

**Mortgages Section**
- "Mortgages & home lending" → Opens consultation modal
- "Talk to an adviser" → Opens consultation modal

**Insurance Section**
- "Review & switch insurance" → Opens insurance review modal
- "Review my cover" → Opens insurance review modal

**Debt Section**
- "Debt solutions" → Opens debt consultation modal
- "Get help now" → Opens debt consultation modal

**Tax Section**
- "Tax & accounting support" → Opens tax consultation modal
- "Find an accountant" → Opens tax consultation modal

### 5. Dashboard Page

New `/dashboard.html` page shows:

**Summary Stats**
- Total points earned
- Games played count
- Member since date

**Points Breakdown**
- Wallet (personal) points with progress bar
- Squad (shared) points with progress bar
- Donated (charitable) points with progress bar

**Engagement Metrics**
- Activities this week
- Activities this month
- Activities today

**Recent Activity**
- Last 10 activities with timestamps
- Activity type indicators (icons)
- Point values for relevant activities

### 6. User Menu

Top-right user menu includes:
- Logged-in user name
- Link to Profile page
- Link to Wallet page
- Sign Out button

## File Structure

### New Files Created

```
js/auth.js              - Authentication system
js/stats.js             - Statistics tracking
js/buttons.js           - Action button handlers
auth.html              - Login & registration page
dashboard.html         - User statistics dashboard
```

### Modified Files

All HTML pages updated to include:
- `js/auth.js` script
- `js/stats.js` script
- `js/buttons.js` script
- User menu in topbar
- Authentication checks

Updated pages:
- `index.html`
- `profile.html`
- `wallet.html`
- `kiwisaver.html`
- `games.html`
- `game.html`
- `visibility-index.html`
- `insights.html`
- `budgeting.html`
- `goals.html`
- `net-worth-calculator.html`
- `finances.html`

## Usage

### Typical User Flow

1. **Initial Visit**
   - Redirected to `auth.html`
   - Can create account or login

2. **Registration**
   - Enter name, email, password
   - Click "Create Account"
   - Receive 6-digit verification code (shown in console for demo)
   - Enter code to verify email
   - Automatically logged in

3. **Dashboard Access**
   - Full access to all pages
   - Points tracked across activities
   - Statistics updated in real-time
   - Can view dashboard for activity summary

4. **Using Features**
   - Play games → points awarded to selected category
   - Switch KiwiSaver fund → tracked in activity log
   - Use action buttons → opens modals, tracks consultations
   - View profile, wallet, games → all accessible

5. **Sign Out**
   - Click user menu → Sign Out
   - Redirected to login page

### Storage Details

**localStorage Keys:**
```javascript
earnie_users              // Array of all registered users
earnie_current_user       // Email of logged-in user
earnie_verification_codes // Pending verification codes
user_activities           // User activity log
walletPoints              // Wallet category points
squadPoints               // Squad category points
donatedPoints             // Donated category points
```

## Security Notes

**Production Recommendations:**

1. **Backend Integration**
   - Use real email service (SendGrid, Mailgun, etc.)
   - Implement server-side authentication
   - Use bcrypt for password hashing
   - Use JWT tokens for sessions
   - Add HTTPS

2. **Data Protection**
   - Never store passwords in localStorage
   - Implement rate limiting on login attempts
   - Add CSRF protection
   - Validate all inputs server-side
   - Use secure session cookies

3. **API Integration**
   - Move statistics to database
   - Sync user data securely
   - Implement proper error handling
   - Add activity audit logs

## Testing

### Test Credentials

For demonstration purposes, try:
- Email: `test@example.com`
- Password: `password123`

### Test Scenarios

1. **Register New Account**
   - Create account
   - Verify email with code
   - Login with credentials
   - Check dashboard

2. **Activity Tracking**
   - Play a game
   - View dashboard → points increase
   - Switch KiwiSaver fund
   - See activity in log

3. **Action Buttons**
   - Click any action button
   - See consultation modal
   - Check activity log update

4. **Multi-Category Points**
   - Play game → select wallet
   - Play game → select squad
   - Play game → select donated
   - View wallet page → see distribution

## API Reference

### AUTH Object

```javascript
// Check authentication
AUTH.isLoggedIn()

// Get current user
AUTH.getCurrentUser()

// Register user
AUTH.register(email, password, name)

// Verify email
AUTH.verifyEmail(email, code)

// Login
AUTH.login(email, password)

// Logout
AUTH.logout()

// Update user stats
AUTH.updateUserStats(email, statsUpdate)

// Update user profile
AUTH.updateUserProfile(email, profileUpdate)
```

### STATS Object

```javascript
// Track game play
STATS.trackGamePlay(gameName, pointsEarned, category)

// Track fund switch
STATS.trackFundSwitch(fromFund, toFund)

// Track point transfer
STATS.trackPointTransfer(fromCategory, toCategory, amount)

// Track consultations
STATS.trackInsuranceReview()
STATS.trackTaxConsultation()
STATS.trackDebtConsultation()
STATS.trackMortgageConsultation()

// Get statistics
STATS.getStatsSummary()
STATS.getEngagementMetrics()
STATS.getActivityLog(limit)
```

## Verification Code Reference

During development, verification codes are logged to browser console. Format:
```
Verification code for user@example.com: 123456
```

## Future Enhancements

1. Social features (Squad invites, leaderboards)
2. Achievement badges
3. Push notifications
4. Email notifications
5. Advanced analytics
6. Export activity reports
7. Integration with real financial APIs
8. Mobile app
9. Two-factor authentication
10. Social login (Google, Apple)

## Support

For issues or questions about the authentication system, check:
- Browser console for verification codes
- localStorage contents (DevTools → Application → Storage)
- User email in user menu (top right)
