/**
 * Statistics Tracking System
 * Tracks user actions and updates statistics
 */

const STATS = {
  /**
   * Track game play
   */
  trackGamePlay(gameName, pointsEarned, category) {
    const user = AUTH.getCurrentUser();
    if (!user) return;

    const stats = {
      gamePlayedCount: (user.stats.gamePlayedCount || 0) + 1,
      pointsEarned: (user.stats.pointsEarned || 0) + pointsEarned
    };

    // Track category-specific spending
    if (category === 'wallet') {
      stats.totalPointsWalletSpent = (user.stats.totalPointsWalletSpent || 0) + pointsEarned;
    } else if (category === 'squad') {
      stats.totalPointsSquadShared = (user.stats.totalPointsSquadShared || 0) + pointsEarned;
    } else if (category === 'donated') {
      stats.totalPointsDonated = (user.stats.totalPointsDonated || 0) + pointsEarned;
    }

    AUTH.updateUserStats(user.email, stats);
    this.logActivity(`Played ${gameName}`, 'game', pointsEarned);
  },

  /**
   * Track KiwiSaver switch
   */
  trackFundSwitch(fromFund, toFund) {
    const user = AUTH.getCurrentUser();
    if (!user) return;

    const activity = {
      action: 'fund_switch',
      timestamp: new Date().toISOString(),
      fromFund: fromFund,
      toFund: toFund
    };

    // Store in activity log
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    activities.push(activity);
    localStorage.setItem('user_activities', JSON.stringify(activities));

    this.logActivity(`Switched from ${fromFund} to ${toFund}`, 'investment');
  },

  /**
   * Track point transfer
   */
  trackPointTransfer(fromCategory, toCategory, amount) {
    const user = AUTH.getCurrentUser();
    if (!user) return;

    const activity = {
      action: 'point_transfer',
      timestamp: new Date().toISOString(),
      from: fromCategory,
      to: toCategory,
      amount: amount
    };

    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    activities.push(activity);
    localStorage.setItem('user_activities', JSON.stringify(activities));

    this.logActivity(`Transferred ${amount} points from ${fromCategory} to ${toCategory}`, 'transfer', amount);
  },

  /**
   * Track insurance review
   */
  trackInsuranceReview() {
    this.logActivity('Reviewed insurance options', 'insurance');
  },

  /**
   * Track tax consultation
   */
  trackTaxConsultation() {
    this.logActivity('Initiated tax consultation', 'tax');
  },

  /**
   * Track debt consultation
   */
  trackDebtConsultation() {
    this.logActivity('Initiated debt consultation', 'debt');
  },

  /**
   * Track mortgage consultation
   */
  trackMortgageConsultation() {
    this.logActivity('Initiated mortgage consultation', 'mortgage');
  },

  /**
   * General activity logger
   */
  logActivity(description, type, value = 0) {
    const user = AUTH.getCurrentUser();
    if (!user) return;

    const activity = {
      id: 'activity_' + Date.now(),
      email: user.email,
      description: description,
      type: type,
      value: value,
      timestamp: new Date().toISOString()
    };

    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    activities.push(activity);
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.shift();
    }
    localStorage.setItem('user_activities', JSON.stringify(activities));
  },

  /**
   * Get user activity log
   */
  getActivityLog(limit = 20) {
    const activities = JSON.parse(localStorage.getItem('user_activities') || '[]');
    return activities.slice(-limit).reverse();
  },

  /**
   * Get user statistics summary
   */
  getStatsSummary() {
    const user = AUTH.getCurrentUser();
    if (!user) return null;

    return {
      name: user.name,
      email: user.email,
      pointsEarned: user.stats.pointsEarned || 0,
      gamesPlayed: user.stats.gamePlayedCount || 0,
      walletPoints: STORAGE.getWalletPoints(),
      squadPoints: STORAGE.getSquadPoints(),
      donatedPoints: STORAGE.getDonatedPoints(),
      totalPointsWalletSpent: user.stats.totalPointsWalletSpent || 0,
      totalPointsSquadShared: user.stats.totalPointsSquadShared || 0,
      totalPointsDonated: user.stats.totalPointsDonated || 0,
      memberSince: new Date(user.createdAt).toLocaleDateString()
    };
  },

  /**
   * Get engagement metrics
   */
  getEngagementMetrics() {
    const user = AUTH.getCurrentUser();
    if (!user) return null;

    const activities = this.getActivityLog(100);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = activities.filter(a => {
      const actDate = new Date(a.timestamp);
      actDate.setHours(0, 0, 0, 0);
      return actDate.getTime() === today.getTime();
    });

    return {
      activitiesThisWeek: activities.filter(a => {
        const actDate = new Date(a.timestamp);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return actDate >= weekAgo;
      }).length,
      activitiesThisMonth: activities.filter(a => {
        const actDate = new Date(a.timestamp);
        return actDate.getMonth() === today.getMonth() && 
               actDate.getFullYear() === today.getFullYear();
      }).length,
      activitiesThisDay: todayActivities.length,
      mostRecentActivity: activities[0] || null
    };
  }
};
