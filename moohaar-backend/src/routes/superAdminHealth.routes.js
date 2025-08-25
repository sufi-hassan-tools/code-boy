import express from 'express';
import AdminRole from '../models/adminRole.model.js';
import connectDB from '../services/db.service.js';

const router = express.Router();

// Health check for super admin system
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await connectDB();
    
    // Check if we can query the admin roles collection
    const adminCount = await AdminRole.countDocuments();
    
    return res.status(200).json({
      success: true,
      message: 'Super Admin System Health Check',
      data: {
        database: 'connected',
        adminRolesCollection: 'accessible',
        totalAdmins: adminCount,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      data: {
        database: 'disconnected',
        adminRolesCollection: 'inaccessible',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });
  }
});

export default router;