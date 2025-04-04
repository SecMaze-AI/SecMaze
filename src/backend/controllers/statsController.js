/**
 * Statistics controller
 * Handles user and system statistics and analytics
 */

const User = require('../models/User');

/**
 * Get user statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getUserStats = async (req, res, next) => {
  try {
    // In a real application, these stats would come from a database
    // For this example, we'll return mock data
    const stats = {
      mazesCompleted: 28,
      successRate: 0.85,
      averageCompletionTime: 38.5, // seconds
      botDetectionRate: 0.95,
      threatSignaturesSubmitted: 12,
      tokenRewardsEarned: 245,
      subscriptionStatus: req.user.subscription.status,
      subscriptionPlan: req.user.subscription.plan,
      apiUsage: {
        daily: 125,
        monthly: 3250,
        limit: 5000
      }
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get site statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getSiteStats = async (req, res, next) => {
  try {
    // In a real application, these stats would come from a database
    // For this example, we'll return mock data
    const stats = {
      userCount: 1250,
      totalMazesGenerated: 45820,
      totalMazesSolved: 38475,
      averageCompletionTime: 42.3, // seconds
      totalBotsDetected: 5280,
      totalTokensRewarded: 125000,
      networkStatus: {
        uptime: 99.98, // percentage
        responseTime: 85, // milliseconds
        errorRate: 0.02 // percentage
      }
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed analytics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    // Ensure user is admin (though middleware should have already checked)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // In a real application, these analytics would come from a database
    // For this example, we'll return mock data
    const analytics = {
      userGrowth: {
        daily: [25, 30, 28, 35, 40, 38, 42],
        weekly: [185, 210, 225, 250],
        monthly: [800, 950, 1100, 1250]
      },
      mazeStats: {
        generationsByDifficulty: {
          1: 2500,
          2: 15000,
          3: 20000,
          4: 7500,
          5: 1000
        },
        completionRateByDifficulty: {
          1: 0.95,
          2: 0.90,
          3: 0.82,
          4: 0.70,
          5: 0.55
        },
        averageTimeByDifficulty: {
          1: 22.5,
          2: 35.8,
          3: 48.2,
          4: 65.5,
          5: 92.3
        }
      },
      botDetection: {
        dailyDetections: [58, 62, 55, 70, 68, 72, 75],
        detectionMethodEfficiency: {
          movementPatterns: 0.75,
          timingAnalysis: 0.82,
          browserFingerprinting: 0.90,
          mazeInteraction: 0.85
        },
        falsePositiveRate: 0.03
      },
      revenue: {
        subscription: {
          free: 950,
          professional: 250,
          enterprise: 50
        },
        totalRevenue: 35250,
        revenueGrowth: 0.15 // 15% growth
      }
    };
    
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get real-time metrics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getRealtimeMetrics = async (req, res, next) => {
  try {
    // Ensure user is admin (though middleware should have already checked)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    // In a real application, these metrics would come from a monitoring system
    // For this example, we'll return mock data
    const metrics = {
      activeUsers: 125,
      activeSessions: 185,
      requestsPerMinute: 350,
      cpuUsage: 42.5, // percentage
      memoryUsage: 58.2, // percentage
      databaseConnections: 75,
      averageResponseTime: 85, // milliseconds
      errorRate: 0.02, // percentage
      activeMazes: 32
    };
    
    res.status(200).json({
      success: true,
      metrics,
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get historical data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getHistoricalData = async (req, res, next) => {
  try {
    const { period = 'week', metric = 'mazes' } = req.query;
    
    // In a real application, this data would come from a database
    // For this example, we'll return mock data
    let data = [];
    let labels = [];
    
    if (period === 'day') {
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
      data = generateMockData(24, metric);
    } else if (period === 'week') {
      labels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      data = generateMockData(7, metric);
    } else if (period === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
      data = generateMockData(30, metric);
    } else if (period === 'year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      data = generateMockData(12, metric);
    }
    
    res.status(200).json({
      success: true,
      period,
      metric,
      labels,
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate mock data based on metric and length
 * @param {number} length - Number of data points
 * @param {string} metric - Type of metric
 * @returns {Array} Array of data points
 * @private
 */
function generateMockData(length, metric) {
  let baseValue = 0;
  let variance = 0;
  
  switch (metric) {
    case 'mazes':
      baseValue = 100;
      variance = 30;
      break;
    case 'users':
      baseValue = 50;
      variance = 15;
      break;
    case 'bots':
      baseValue = 20;
      variance = 10;
      break;
    case 'revenue':
      baseValue = 1000;
      variance = 250;
      break;
    default:
      baseValue = 100;
      variance = 20;
  }
  
  return Array.from({ length }, () => 
    Math.floor(baseValue + (Math.random() * 2 - 1) * variance)
  );
} 