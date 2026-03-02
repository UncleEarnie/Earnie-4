# 🚀 Uncle Earnie - SendGrid Email Integration

## Setup Summary

Your site now has **real email verification via SendGrid**! Here's the quick version:

### Quick Start (5 minutes)

#### 1. Install Node.js
- Download from https://nodejs.org (LTS version)
- Install it on your computer

#### 2. Get SendGrid API Key
- Go to https://sendgrid.com
- Sign up (free account)
- Settings → API Keys → Create API Key
- Copy your API key

#### 3. Create .env File
In your project folder, create a file named `.env`:

```env
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@uncleearnie.com
PORT=3001
```

Replace `SG.your_api_key_here` with your actual key from SendGrid.

#### 4. Install & Start Server

**On Windows:**
- Double-click `start-server.bat`

**On Mac/Linux:**
```bash
bash start-server.sh
```

Or manually:
```bash
npm install
node server.js
```

You should see:
```
🚀 Uncle Earnie Email Server running on port 3001
📧 SendGrid API: ✓ Configured
```

#### 5. Test It!
1. Open your site
2. Register a new account
3. **Check your email inbox** - you'll get the verification code!
4. Use it to complete registration

## How It Works

```
User → Registers → Code Sent via SendGrid → User Gets Real Email ✓
```

## Two Modes

### Mode 1: With SendGrid (Real Emails)
- Server running
- Real emails sent to users
- Professional experience

### Mode 2: Without Server (Fallback)
- Server NOT running
- Codes appear in browser console (F12)
- Still works for testing

## Files Included

```
server.js              - Email server (Node.js)
package.json          - Dependencies list
.env.example          - Configuration template
.env                  - Your actual config (you create this)
start-server.bat      - Windows starter
start-server.sh       - Mac/Linux starter
SENDGRID_SETUP.md     - Detailed setup guide
```

## Full Setup Guide

See **SENDGRID_SETUP.md** for:
- Detailed step-by-step instructions
- Troubleshooting
- Production deployment
- How to verify sender email
- Free tier information

## Sending Verification Codes

The backend automatically:
1. Generates 6-digit code
2. Sends via SendGrid email service
3. User receives real email
4. Code expires after 24 hours
5. Maximum 3 verification attempts

## What Changed

**Updated files:**
- `js/auth.js` - Now calls email server API
- `auth.html` - Added helpful tip about setup

**New files:**
- `server.js` - Email server
- `package.json` - Node.js config
- `.env` - Your API key (create this)
- `start-server.bat` - Windows starter script
- `start-server.sh` - Mac/Linux starter script
- `SENDGRID_SETUP.md` - Detailed guide

## Troubleshooting

### "Email server not available"
- Make sure `node server.js` is running
- Check that `.env` file exists
- Try checking console for fallback codes (F12)

### "Too many attempts"
- User tried 3 wrong codes
- Must register again to get new code

### Email not arriving
- Check spam/junk folder
- Make sure email address is correct
- Wait a few seconds

### "API Key not configured"
- Create `.env` file
- Add your SendGrid API key
- Restart server

## API Endpoints

The server provides:

```
POST /api/send-verification-code
  - Sends email with verification code
  - Input: { email, verificationCode }

POST /api/verify-code
  - Verifies code from email
  - Input: { email, code }

GET /api/health
  - Check server status
```

## Free SendGrid Account

Includes:
- ✅ 100 emails/day
- ✅ Full features
- ✅ No credit card for free tier
- ✅ Perfect for testing

## Production Ready

For production (hosting your site):

1. Deploy `server.js` to:
   - Heroku
   - AWS Lambda
   - DigitalOcean
   - Your own server

2. Set environment variables:
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `PORT`

3. Update frontend to point to your server URL

## Support

- **SendGrid Docs**: https://docs.sendgrid.com
- **Node.js Docs**: https://nodejs.org
- **Common Issues**: See SENDGRID_SETUP.md

## Next Steps

1. ✅ Download Node.js
2. ✅ Create .env file with API key
3. ✅ Run start-server script
4. ✅ Test registration flow
5. ✅ Deploy to production when ready

---

You're all set! Real emails are now working on your Uncle Earnie site. 🎉
