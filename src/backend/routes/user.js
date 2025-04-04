/**
 * User management routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, checkRole } = require('../middleware/auth');

// Get current user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.put('/profile', authenticate, userController.updateProfile);

// Get user's API keys
router.get('/api-keys', authenticate, userController.getApiKeys);

// Generate new API key
router.post('/api-keys', authenticate, userController.generateApiKey);

// Revoke API key
router.delete('/api-keys/:id', authenticate, userController.revokeApiKey);

// Admin routes
router.get('/list', authenticate, checkRole('admin'), userController.listUsers);
router.get('/:id', authenticate, checkRole('admin'), userController.getUserById);
router.put('/:id', authenticate, checkRole('admin'), userController.updateUser);
router.delete('/:id', authenticate, checkRole('admin'), userController.deleteUser);

module.exports = router; 