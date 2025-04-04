/**
 * User controller
 * Handles user profile management and API key operations
 */

const User = require('../models/User');
const crypto = require('crypto');

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getProfile = (req, res) => {
  // User is already attached to req by the auth middleware
  const user = req.user;
  
  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      subscription: user.subscription,
      walletAddress: user.walletAddress,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }
  });
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, walletAddress } = req.body;
    
    // Get current user
    const user = await User.findById(req.user.id);
    
    // Update fields
    if (name) user.name = name;
    if (walletAddress !== undefined) user.walletAddress = walletAddress;
    
    // Save updates
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        walletAddress: user.walletAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's API keys
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getApiKeys = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Return API keys without exposing the full key string
    const maskedApiKeys = user.apiKeys.map(key => ({
      id: key._id,
      name: key.name,
      createdAt: key.createdAt,
      lastUsed: key.lastUsed,
      // Show only first 4 and last 4 characters
      maskedKey: `${key.key.substring(0, 4)}...${key.key.substring(key.key.length - 4)}`
    }));
    
    res.status(200).json({
      success: true,
      apiKeys: maskedApiKeys
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate new API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.generateApiKey = async (req, res, next) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'API key name is required'
      });
    }
    
    // Generate random API key
    const apiKey = generateApiKey();
    
    // Add to user's API keys
    const user = await User.findById(req.user.id);
    
    // Limit number of API keys per user
    if (user.apiKeys.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum number of API keys reached (5)'
      });
    }
    
    user.apiKeys.push({
      key: apiKey,
      name,
      createdAt: Date.now()
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      apiKey: {
        key: apiKey, // Return full key only once
        name,
        createdAt: Date.now()
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke API key
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.revokeApiKey = async (req, res, next) => {
  try {
    const keyId = req.params.id;
    
    // Find user and remove the API key
    const user = await User.findById(req.user.id);
    
    // Find the key index
    const keyIndex = user.apiKeys.findIndex(k => k._id.toString() === keyId);
    
    if (keyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }
    
    // Remove the key
    user.apiKeys.splice(keyIndex, 1);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'API key revoked successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Admin functions

/**
 * List all users (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Get users with pagination
    const users = await User.find()
      .select('name email role createdAt lastLogin isActive')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await User.countDocuments();
    
    res.status(200).json({
      success: true,
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user by ID (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { name, email, role, isActive, subscription } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ['user', 'admin'].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (subscription) {
      user.subscription = {
        ...user.subscription,
        ...subscription
      };
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        subscription: user.subscription
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    
    // Prevent deleting self
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper functions

/**
 * Generate a random API key
 * @returns {string} Random API key
 */
function generateApiKey() {
  return 'sk_' + crypto.randomBytes(24).toString('hex');
} 