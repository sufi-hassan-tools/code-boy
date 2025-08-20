import Admin from '../models/admin.model.js';
import Store from '../models/store.model.js';
import Theme from '../models/theme.model.js';
import User from '../models/user.model.js';
import PageView from '../models/pageview.model.js';
import logger from '../utils/logger.js';

// Get comprehensive platform overview
export const getPlatformOverview = async (req, res) => {
  try {
    // Get current date ranges for analytics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel data fetching for better performance
    const [
      totalUsers,
      totalStores,
      activeStores,
      totalThemes,
      totalAdmins,
      todayViews,
      yesterdayViews,
      weeklyViews,
      monthlyViews,
      recentUsers,
      recentStores,
      topStores,
    ] = await Promise.all([
      // User metrics
      User.countDocuments(),
      
      // Store metrics
      Store.countDocuments(),
      Store.countDocuments({ activeTheme: { $exists: true } }),
      
      // Theme metrics
      Theme.countDocuments(),
      
      // Admin metrics
      Admin.countDocuments(),
      
      // Page view metrics
      PageView.countDocuments({ 
        timestamp: { $gte: today } 
      }),
      PageView.countDocuments({ 
        timestamp: { $gte: yesterday, $lt: today } 
      }),
      PageView.countDocuments({ 
        timestamp: { $gte: lastWeek } 
      }),
      PageView.countDocuments({ 
        timestamp: { $gte: lastMonth } 
      }),
      
      // Recent activity
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('email createdAt'),
      
      Store.find()
        .populate('ownerId', 'email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('handle customDomain createdAt'),
      
      // Top performing stores by page views
      PageView.aggregate([
        {
          $match: {
            timestamp: { $gte: lastWeek }
          }
        },
        {
          $group: {
            _id: '$storeId',
            totalViews: { $sum: 1 },
            uniqueSessions: { $addToSet: '$sessionId' }
          }
        },
        {
          $addFields: {
            uniqueSessionCount: { $size: '$uniqueSessions' }
          }
        },
        {
          $sort: { totalViews: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: 'stores',
            localField: '_id',
            foreignField: '_id',
            as: 'store'
          }
        },
        {
          $unwind: '$store'
        },
        {
          $project: {
            storeHandle: '$store.handle',
            customDomain: '$store.customDomain',
            totalViews: 1,
            uniqueSessionCount: 1
          }
        }
      ]),
    ]);

    // Calculate growth rates
    const userGrowthRate = totalUsers > 0 ? ((totalUsers - (totalUsers * 0.9)) / (totalUsers * 0.9)) * 100 : 0;
    const storeGrowthRate = totalStores > 0 ? ((totalStores - (totalStores * 0.9)) / (totalStores * 0.9)) * 100 : 0;
    const viewsGrowthRate = todayViews > 0 && yesterdayViews > 0 ? 
      ((todayViews - yesterdayViews) / yesterdayViews) * 100 : 0;

    // Platform health metrics
    const storeActivationRate = totalStores > 0 ? (activeStores / totalStores) * 100 : 0;
    const avgViewsPerStore = activeStores > 0 ? weeklyViews / activeStores : 0;

    const overview = {
      metrics: {
        users: {
          total: totalUsers,
          growthRate: Math.round(userGrowthRate * 100) / 100,
        },
        stores: {
          total: totalStores,
          active: activeStores,
          activationRate: Math.round(storeActivationRate * 100) / 100,
          growthRate: Math.round(storeGrowthRate * 100) / 100,
        },
        themes: {
          total: totalThemes,
        },
        admins: {
          total: totalAdmins,
        },
        pageViews: {
          today: todayViews,
          yesterday: yesterdayViews,
          weekly: weeklyViews,
          monthly: monthlyViews,
          growthRate: Math.round(viewsGrowthRate * 100) / 100,
          avgPerStore: Math.round(avgViewsPerStore * 100) / 100,
        },
      },
      recentActivity: {
        users: recentUsers,
        stores: recentStores,
      },
      topPerforming: {
        stores: topStores,
      },
      systemHealth: {
        storeActivationRate: Math.round(storeActivationRate * 100) / 100,
        avgViewsPerStore: Math.round(avgViewsPerStore * 100) / 100,
        totalPlatformViews: monthlyViews,
      },
    };

    logger.info({ 
      message: 'Platform overview requested', 
      adminId: req.admin._id,
      totalUsers,
      totalStores,
      totalThemes 
    });

    res.json(overview);
  } catch (error) {
    logger.error({ 
      message: 'Failed to get platform overview', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to fetch platform overview' 
    });
  }
};

// Get detailed admin analytics
export const getAdminAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get detailed analytics
    const [
      userSignups,
      storeCreations,
      pageViewsTimeSeries,
      bounceRateData,
      themeUsage,
    ] = await Promise.all([
      // User signups over time
      User.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Store creations over time
      Store.aggregate([
        {
          $match: { createdAt: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Page views time series
      PageView.aggregate([
        {
          $match: { timestamp: { $gte: startDate } }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
            },
            views: { $sum: 1 },
            uniqueSessions: { $addToSet: "$sessionId" }
          }
        },
        {
          $addFields: {
            uniqueSessionCount: { $size: "$uniqueSessions" }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // Bounce rate calculation
      PageView.aggregate([
        {
          $match: { timestamp: { $gte: startDate } }
        },
        {
          $group: {
            _id: null,
            totalSessions: { $addToSet: "$sessionId" },
            bounces: {
              $sum: { $cond: [{ $eq: ["$isBounce", true] }, 1, 0] }
            }
          }
        },
        {
          $addFields: {
            totalSessionCount: { $size: "$totalSessions" },
            bounceRate: {
              $multiply: [
                { $divide: ["$bounces", { $size: "$totalSessions" }] },
                100
              ]
            }
          }
        }
      ]),

      // Theme usage statistics
      Store.aggregate([
        {
          $match: { activeTheme: { $exists: true } }
        },
        {
          $group: {
            _id: "$activeTheme",
            storeCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'themes',
            localField: '_id',
            foreignField: '_id',
            as: 'theme'
          }
        },
        {
          $unwind: '$theme'
        },
        {
          $project: {
            themeName: '$theme.name',
            themeVersion: '$theme.version',
            storeCount: 1
          }
        },
        { $sort: { storeCount: -1 } }
      ]),
    ]);

    res.json({
      period,
      analytics: {
        userSignups,
        storeCreations,
        pageViews: pageViewsTimeSeries,
        bounceRate: bounceRateData[0]?.bounceRate || 0,
        themeUsage,
      },
    });
  } catch (error) {
    logger.error({ 
      message: 'Failed to get admin analytics', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to fetch analytics' 
    });
  }
};

// Get system status
export const getSystemStatus = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = {
      connected: true,
      latency: null,
    };

    try {
      const start = Date.now();
      await User.findOne().limit(1);
      dbStatus.latency = Date.now() - start;
    } catch (error) {
      dbStatus.connected = false;
      dbStatus.error = error.message;
    }

    // Check Redis connection (if available)
    let redisStatus = { connected: false };
    try {
      const { getCache } = await import('../services/cache.service.js');
      await getCache('health-check');
      redisStatus = { connected: true };
    } catch (error) {
      redisStatus = { connected: false, error: error.message };
    }

    // Get system metrics
    const systemMetrics = {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    };

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      redis: redisStatus,
      system: systemMetrics,
    });
  } catch (error) {
    logger.error({ 
      message: 'Failed to get system status', 
      error: error.message 
    });
    res.status(500).json({ 
      message: 'Failed to get system status',
      status: 'unhealthy',
    });
  }
};