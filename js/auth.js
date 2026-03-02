/**
 * Authentication System
 * Handles user registration, email verification, login, and logout
 */

const AUTH = {
  STORAGE_KEYS: {
    USERS: 'earnie_users',
    CURRENT_USER: 'earnie_current_user',
    VERIFICATION_CODES: 'earnie_verification_codes'
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    return !!localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
  },

  /**
   * Get current logged-in user
   */
  getCurrentUser() {
    const userEmail = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
    if (!userEmail) return null;
    
    const users = this.getAllUsers();
    return users.find(u => u.email === userEmail) || null;
  },

  /**
   * Get all registered users
   */
  getAllUsers() {
    const data = localStorage.getItem(this.STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Register a new user
   */
  register(email, password, name) {
    // Validate email format
    if (!this.validateEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Validate password
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Check if email already exists
    const users = this.getAllUsers();
    if (users.some(u => u.email === email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser = {
      id: this.generateUserId(),
      email: email,
      password: this.hashPassword(password), // Simple hash (in production, use bcrypt)
      name: name || email.split('@')[0],
      emailVerified: false,
      createdAt: new Date().toISOString(),
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
    };

    // Save user
    users.push(newUser);
    localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));

    // Generate and send verification code
    this.sendVerificationCode(email);

    return { success: true, message: 'Registration successful. Check your email for verification code.' };
  },

  /**
   * Send verification code via SendGrid (or fallback to console)
   */
  async sendVerificationCode(email) {
    const verificationCode = this.generateVerificationCode();
    
    // Try to send via SendGrid backend
    try {
      const response = await fetch('http://localhost:3001/api/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          verificationCode: verificationCode
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Verification email sent to ${email}`);
        return verificationCode;
      } else {
        const error = await response.json();
        console.warn('SendGrid error:', error.error);
        // Fall back to console/localStorage
        this.sendVerificationCodeFallback(email, verificationCode);
        return verificationCode;
      }
    } catch (error) {
      console.warn('Email server not available, using fallback method');
      console.warn('Make sure Node.js server is running: npm install && node server.js');
      // Fallback to localStorage + console
      this.sendVerificationCodeFallback(email, verificationCode);
      return verificationCode;
    }
  },

  /**
   * Fallback verification code method (console + localStorage)
   */
  sendVerificationCodeFallback(email, verificationCode) {
    const codes = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.VERIFICATION_CODES) || '{}');
    
    codes[email] = {
      code: verificationCode,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      attempts: 0
    };
    
    localStorage.setItem(this.STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
    
    // Log to console for development
    console.log(`%c📧 Verification code for ${email}: ${verificationCode}`, 'color: #86efac; font-size: 14px; font-weight: bold;');
  },

  /**
   * Verify email with code (supports both SendGrid and fallback)
   */
  async verifyEmail(email, code) {
    // First try backend verification
    try {
      const response = await fetch('http://localhost:3001/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      });

      if (response.ok) {
        // Mark email as verified
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);
        
        if (user) {
          user.emailVerified = true;
          localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
        }

        return { success: true, message: 'Email verified successfully!' };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Verification failed' };
      }
    } catch (error) {
      // Fallback to localStorage verification
      return this.verifyEmailFallback(email, code);
    }
  },

  /**
   * Fallback email verification (uses localStorage)
   */
  verifyEmailFallback(email, code) {
    const codes = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.VERIFICATION_CODES) || '{}');
    
    if (!codes[email]) {
      return { success: false, error: 'No verification code found. Please register again.' };
    }

    const codeData = codes[email];

    // Check if code expired
    if (codeData.expiresAt < Date.now()) {
      delete codes[email];
      localStorage.setItem(this.STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
      return { success: false, error: 'Verification code expired' };
    }

    // Check attempts
    if (codeData.attempts >= 3) {
      delete codes[email];
      localStorage.setItem(this.STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
      return { success: false, error: 'Too many attempts. Please register again.' };
    }

    // Verify code
    if (codeData.code !== code.toString()) {
      codeData.attempts++;
      localStorage.setItem(this.STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));
      return { success: false, error: 'Invalid verification code' };
    }

    // Mark email as verified
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      user.emailVerified = true;
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // Clean up verification code
    delete codes[email];
    localStorage.setItem(this.STORAGE_KEYS.VERIFICATION_CODES, JSON.stringify(codes));

    return { success: true, message: 'Email verified successfully!' };
  },

  /**
   * Login user
   */
  login(email, password) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Email not found' };
    }

    // Simple password check (in production, use bcrypt)
    if (this.hashPassword(password) !== user.password) {
      return { success: false, error: 'Incorrect password' };
    }

    if (!user.emailVerified) {
      return { success: false, error: 'Please verify your email first' };
    }

    // Set current user
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, email);

    return { success: true, message: 'Login successful!' };
  },

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    return { success: true, message: 'Logged out successfully' };
  },

  /**
   * Validate email format
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Simple password hash (for demo only - use bcrypt in production)
   */
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(36);
  },

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Generate verification code
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Update user stats
   */
  updateUserStats(email, statsUpdate) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      user.stats = { ...user.stats, ...statsUpdate };
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    }
    
    return false;
  },

  /**
   * Update user profile
   */
  updateUserProfile(email, profileUpdate) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      user.profile = { ...user.profile, ...profileUpdate };
      localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
      return true;
    }
    
    return false;
  },

  /**
   * Resend verification code
   */
  resendVerificationCode(email) {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Email not found' };
    }

    const verificationCode = this.sendVerificationCode(email);
    return { success: true, message: `Verification code sent to ${email}`, code: verificationCode };
  }
};

// Initialize auth on page load if user is logged in
document.addEventListener('DOMContentLoaded', () => {
  if (AUTH.isLoggedIn()) {
    const user = AUTH.getCurrentUser();
    // Update UI to show user is logged in
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
      el.textContent = user?.name || 'User';
    });
  }
});
