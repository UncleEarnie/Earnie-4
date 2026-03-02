# Uncle Earnie - Quick Start Guide

## Getting Started

### 1. First Time Visit
- Open `index.html` in your browser
- You'll be automatically redirected to `auth.html` (login page)

### 2. Create an Account
1. Click "Create one" link to go to registration
2. Fill in:
   - **Full Name**: Your name
   - **Email Address**: Your email
   - **Password**: Minimum 6 characters
   - **Confirm Password**: Same as above
3. Click "Create Account"
4. You'll see a verification screen
5. Check your browser's Developer Console (F12 → Console tab)
6. Look for message: `Verification code for [your-email]: XXXXXX`
7. Copy the 6-digit code
8. Paste it in the verification field
9. Click "Verify Email"
10. Automatically logged in and redirected to home

### 3. Explore the Site
Once logged in, you can:

**Home Page (`index.html`)**
- View Visibility Index widget
- See Earnie's personalized advice
- Click action buttons to explore services
- Play daily bonus game
- Earn points in three categories: Wallet, Squad, Donated

**Wallet Page (`wallet.html`)**
- View your points across all three categories
- Transfer points between categories
- See recent activity

**Dashboard (`dashboard.html`)**
- View all your statistics
- See engagement metrics
- Review recent activity log
- Track points earned

**KiwiSaver Page (`kiwisaver.html`)**
- View current fund (ASB Balanced)
- See Earnie's recommendations
- Compare 6 alternative funds
- Switch funds (simulated)

**Games** 
- Play games to earn points
- Choose which category to award points
- Build up points for different purposes

### 4. Using Action Buttons

All buttons now work:

| Button | Action |
|--------|--------|
| Switch KiwiSaver | Redirects to KiwiSaver page |
| Mortgages & Home Lending | Opens consultation modal |
| Review Insurance | Opens insurance review modal |
| Debt Solutions | Opens debt consultation modal |
| Tax & Accounting | Opens tax consultation modal |

Click any button, a modal appears confirming your action, and it's logged to your activity.

### 5. View Your Stats
1. Click on Dashboard in sidebar (or go to `dashboard.html`)
2. See your:
   - Total points earned
   - Games played
   - Member since date
   - Points distribution (Wallet/Squad/Donated)
   - Engagement metrics
   - Recent activities

### 6. Sign Out
1. Click your user menu (top right corner)
2. Click "Sign Out"
3. You'll be redirected to login page

## Demo Accounts

You can register as many accounts as you want. Each account has:
- Separate points and statistics
- Independent activity log
- Personalized dashboard

## Key Features

### Points System
Three categories of points:
- **💰 Wallet (Personal)**: Use for self-improvement
- **👥 Squad (Shared)**: Share with friends and family
- **❤️ Donated (Charitable)**: Support causes

### Statistics Tracked
- Games played
- Total points earned
- Points earned in each category
- Consultations requested
- Fund switches
- Point transfers
- Activity timestamps

### User Menu
Located in top-right corner:
- Shows your name
- Profile link
- Wallet link
- Sign Out button

## Troubleshooting

### Verification Code Not Showing?
1. Open DevTools: Press F12
2. Go to Console tab
3. Look for: `Verification code for [email]: XXXXXX`
4. Use this code in the verification field

### Lost Your Password?
Currently there's no password reset. To recover:
1. Sign out
2. Create a new account with a different email
3. Or open DevTools → Application → Storage → localStorage
4. Clear all data and start fresh

### Not Logged In?
1. Check if you're redirected to auth.html
2. Verify your email was verified during registration
3. Try clearing browser cache and localStorage

### Points Not Updating?
1. Make sure you've selected a category when winning points
2. Refresh the page
3. Check wallet page to confirm points were added
4. View dashboard for activity log confirmation

## File Locations

**Main Pages:**
- Home: `/index.html`
- Login/Register: `/auth.html`
- Dashboard: `/dashboard.html`
- Profile: `/profile.html`
- Wallet: `/wallet.html`
- KiwiSaver: `/kiwisaver.html`
- Finances: `/finances.html`
- And more...

**JavaScript Modules:**
- Authentication: `/js/auth.js`
- Statistics: `/js/stats.js`
- Button Handlers: `/js/buttons.js`
- Storage: `/js/storage.js`
- UI: `/js/ui.js`

## Email Simulation

In the demo, emails aren't actually sent. Instead:
1. Verification codes are generated and stored
2. Codes are logged to browser console
3. Codes expire after 24 hours (in-app time)
4. Use logged code in verification form

For production:
- Integrate with email service (SendGrid, etc.)
- Send real verification emails
- Implement proper email delivery

## Browser Storage

All data stored in browser localStorage:
- User accounts
- Verification codes
- Current user session
- Points and statistics
- Activity logs

Data persists across:
- Browser tabs
- Browser restarts
- Days/weeks (until cleared)

Data is lost if:
- Browser localStorage is cleared
- Using private/incognito mode
- Switching browsers

## Next Steps

1. **Explore Features**: Try all the buttons and pages
2. **Play Games**: Earn points and see statistics update
3. **Review Dashboard**: Check your activity log
4. **Test Registration**: Create multiple accounts
5. **Check Console**: See verification codes and debug info

## Support & Feedback

For issues with:
- **Authentication**: Check console for verification codes
- **Statistics**: View dashboard to see tracked activities
- **Buttons**: All should open modals or redirect pages
- **Data**: Check localStorage in DevTools

## Architecture Overview

```
Browser
├── auth.html (Login/Register)
├── index.html (Home - requires auth)
├── dashboard.html (Stats - requires auth)
└── Other pages (all require auth)
    ├── js/auth.js (User management)
    ├── js/stats.js (Activity tracking)
    ├── js/buttons.js (Button handlers)
    └── localStorage (Data storage)
```

User login redirects unauthenticated visitors to auth.html automatically.

Enjoy exploring Uncle Earnie!
