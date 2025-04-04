/**
 * Main router file combining all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const mazeRoutes = require('./maze');
const userRoutes = require('./user');
const statsRoutes = require('./stats');
const blockchainRoutes = require('./blockchain');

// Register routes
router.use('/auth', authRoutes);
router.use('/maze', mazeRoutes);
router.use('/user', userRoutes);
router.use('/stats', statsRoutes);
router.use('/blockchain', blockchainRoutes);

// Root API endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SecMaze API',
    version: '0.1.0',
    endpoints: [
      '/auth',
      '/maze',
      '/user',
      '/stats',
      '/blockchain'
    ]
  });
});

module.exports = router; 