/**
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Verify token
router.get('/verify', authenticate, authController.verify);

// Logout
router.post('/logout', authenticate, authController.logout);

// Password reset request
router.post('/forgot-password', authController.forgotPassword);

// Reset password with token
router.post('/reset-password', authController.resetPassword);

// Update user's password
router.post('/update-password', authenticate, authController.updatePassword);

module.exports = router; 