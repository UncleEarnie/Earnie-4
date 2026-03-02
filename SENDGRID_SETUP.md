# SendGrid Email Setup Guide

Your Uncle Earnie site now has **real email verification** via SendGrid! Here's how to set it up.

## Step 1: Install Dependencies

Open terminal/PowerShell in your project folder and run:

```bash
npm install
```

This installs:
- `express` - Web server
- `@sendgrid/mail` - SendGrid email library
- `cors` - Allow browser requests
- `dotenv` - Environment configuration

## Step 2: Get SendGrid API Key

1. Go to **https://sendgrid.com**
2. Click "Sign Up" (or login if you have account)
3. Create free account
4. Go to **Settings** → **API Keys**
5. Click **Create API Key**
6. Name it "Uncle Earnie"
7. Give it **Full Access**
8. Copy the API key (you'll only see it once!)

## Step 3: Configure Environment

1. In your project folder, create a file named `.env`
2. Copy this into it:

```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@uncleearnie.com
PORT=3001
```

3. Replace `SG.your_api_key_here` with your actual API key from Step 2

## Step 4: Verify Sender Email (Important!)

1. Go back to SendGrid dashboard
2. Go to **Settings** → **Sender Authentication**
3. Click **Create New Sender**
4. Fill in sender details:
   - From Email: `noreply@uncleearnie.com` (or your email)
   - From Name: `Uncle Earnie`
5. Verify the email address
6. Update `.env` file with your verified email

## Step 5: Start the Email Server

In terminal/PowerShell:

```bash
node server.js
```

You should see:
```
🚀 Uncle Earnie Email Server running on port 3001
📧 SendGrid API: ✓ Configured
```

## Step 6: Test It Out!

1. Open your site at `http://localhost:5500` (or wherever you're hosting it)
2. Register a new account
3. **Check your email inbox** - you'll get the verification email!
4. Use the code from the email to verify
5. Login successfully

## Troubleshooting

### "SendGrid API: ✗ Not configured"
- Check your `.env` file exists
- Check `SENDGRID_API_KEY` is set correctly
- Restart the server

### "Email server not available"
- Make sure `node server.js` is running
- Check that port 3001 is not blocked
- Server must run while you're testing

### Email not arriving
- Check spam/junk folder
- Verify sender email is verified in SendGrid
- Check email address is correct
- Wait a few seconds (emails can take time)

### "Invalid from email address"
- Your sending email must be verified in SendGrid
- Go to SendGrid → Sender Authentication
- Verify the email address

## How It Works

```
User Registration
    ↓
Registration form submitted
    ↓
Server generates 6-digit code
    ↓
Server calls SendGrid API
    ↓
Real email sent to user
    ↓
User receives email
    ↓
User enters code from email
    ↓
Code verified via server
    ↓
Account activated
```

## For Production

When deploying to production:

1. **Host the server**: Deploy `server.js` to:
   - Heroku (free tier available)
   - AWS Lambda
   - DigitalOcean
   - Netlify Functions
   - Your own server

2. **Update frontend**: Change `http://localhost:3001` to your server URL in `js/auth.js`

3. **Environment variables**: Set on your hosting platform:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `PORT`

4. **Keep API key secret**: Never expose in code (use environment variables)

## Free Tier Limits

SendGrid free account includes:
- ✅ 100 emails per day
- ✅ Unlimited accounts
- ✅ Full features

Perfect for testing and small deployments!

## Example Deployment (Heroku)

```bash
# Install Heroku CLI
# Then:
heroku login
heroku create your-app-name
git push heroku main
heroku config:set SENDGRID_API_KEY=SG.your_key_here
```

## Fallback Behavior

If the email server isn't running:
- Verification codes appear in browser console (like before)
- Site still works normally
- Just no actual emails sent
- Perfect for development without server!

## Files Created/Modified

**New files:**
- `server.js` - Email server with SendGrid integration
- `package.json` - Node.js dependencies
- `.env.example` - Configuration template
- This file - Setup instructions

**Modified files:**
- `js/auth.js` - Updated to call email API

## Questions?

- SendGrid docs: https://docs.sendgrid.com
- Node.js docs: https://nodejs.org
- Express docs: https://expressjs.com

Enjoy real email verification! 📧
