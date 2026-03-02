/**
 * Uncle Earnie Email Server
 * Handles verification code emails via SendGrid
 * 
 * Setup:
 * 1. npm install express cors dotenv @sendgrid/mail
 * 2. Get SendGrid API key from https://sendgrid.com
 * 3. Create .env file with SENDGRID_API_KEY
 * 4. Run: node server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Store verification codes in memory (use database in production)
const verificationCodes = {};

/**
 * POST /api/send-verification-code
 * Sends verification code email to user
 */
app.post('/api/send-verification-code', async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Validate input
    if (!email || !verificationCode) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and verification code required' 
      });
    }

    // Store code with expiration (24 hours)
    verificationCodes[email] = {
      code: verificationCode,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      attempts: 0
    };

    // Prepare email
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@uncleearnie.com',
      subject: 'Verify Your Uncle Earnie Account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { color: #0a0f0d; margin: 0; font-size: 24px; }
              .content { margin: 30px 0; line-height: 1.6; color: #333; }
              .code-box { 
                background-color: #f0f0f0; 
                padding: 20px; 
                border-radius: 8px; 
                text-align: center; 
                margin: 20px 0;
                border-left: 4px solid #86efac;
              }
              .code { 
                font-size: 36px; 
                font-weight: bold; 
                color: #86efac; 
                letter-spacing: 4px;
                font-family: 'Courier New', monospace;
              }
              .footer { 
                margin-top: 40px; 
                padding-top: 20px; 
                border-top: 1px solid #eee; 
                font-size: 12px; 
                color: #999;
              }
              .warning { color: #d97706; font-size: 12px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Uncle Earnie</h1>
                <p style="color: #86efac; margin: 5px 0;">Financial Education Platform</p>
              </div>
              
              <div class="content">
                <p>Hello,</p>
                <p>Welcome to Uncle Earnie! To verify your account, use the code below:</p>
                
                <div class="code-box">
                  <div class="code">${verificationCode}</div>
                  <div class="warning">This code expires in 24 hours</div>
                </div>
                
                <p>Enter this code on the verification page to complete your registration.</p>
                
                <p><strong>Didn't request this code?</strong> You can safely ignore this email.</p>
              </div>
              
              <div class="footer">
                <p>© 2026 Uncle Earnie. All rights reserved.</p>
                <p>This is an automated message, please do not reply.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Your Uncle Earnie verification code is: ${verificationCode}\n\nThis code expires in 24 hours.`
    };

    // Send email
    await sgMail.send(msg);

    console.log(`✓ Verification email sent to ${email}`);
    
    res.json({ 
      success: true, 
      message: 'Verification code sent successfully',
      email: email
    });

  } catch (error) {
    console.error('SendGrid Error:', error);
    
    // Check if it's SendGrid API key issue
    if (error.message.includes('API key')) {
      return res.status(500).json({ 
        success: false, 
        error: 'SendGrid API key not configured. Check .env file.'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to send verification code'
    });
  }
});

/**
 * POST /api/verify-code
 * Verifies the code submitted by user
 */
app.post('/api/verify-code', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and code required' 
      });
    }

    const stored = verificationCodes[email];

    if (!stored) {
      return res.status(400).json({ 
        success: false, 
        error: 'No verification code found for this email' 
      });
    }

    // Check expiration
    if (stored.expiresAt < Date.now()) {
      delete verificationCodes[email];
      return res.status(400).json({ 
        success: false, 
        error: 'Verification code has expired' 
      });
    }

    // Check attempts
    if (stored.attempts >= 3) {
      delete verificationCodes[email];
      return res.status(400).json({ 
        success: false, 
        error: 'Too many attempts. Please register again.' 
      });
    }

    // Verify code
    if (stored.code !== code.toString()) {
      stored.attempts++;
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid verification code',
        attempts: 3 - stored.attempts
      });
    }

    // Code is valid
    delete verificationCodes[email];
    
    res.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });

  } catch (error) {
    console.error('Verification Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  const sgReady = !!process.env.SENDGRID_API_KEY;
  
  res.json({ 
    status: 'ok',
    sendgrid: sgReady ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Uncle Earnie Email Server running on port ${PORT}`);
  console.log(`📧 SendGrid API: ${process.env.SENDGRID_API_KEY ? '✓ Configured' : '✗ Not configured'}`);
  console.log(`\nEndpoints:`);
  console.log(`  POST /api/send-verification-code`);
  console.log(`  POST /api/verify-code`);
  console.log(`  GET /api/health\n`);
});

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
