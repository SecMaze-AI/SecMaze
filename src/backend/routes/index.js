/**
 * Main router file combining all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const mazeRoutes = require('./maze');
const statsRoutes = require('./stats');
const userRoutes = require('./user');
const blockchainRoutes = require('./blockchain');

// Mount routes
router.use('/auth', authRoutes);
router.use('/maze', mazeRoutes);
router.use('/stats', statsRoutes);
router.use('/user', userRoutes);
router.use('/blockchain', blockchainRoutes);

// API health check and status route
router.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'SecMaze API is running',
    environment: process.env.NODE_ENV,
    documentation: '/api/docs',
    endpoints: ['/api/auth', '/api/maze', '/api/stats', '/api/user', '/api/blockchain', '/api/analytics'],
  });
});

// Add Analytics API route
router.use('/analytics', require('./analytics'));

module.exports = router; 