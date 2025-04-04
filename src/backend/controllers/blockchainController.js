/**
 * Blockchain controller
 * Handles interactions with the blockchain and token operations
 */

const SecMazeContract = require('../../blockchain/secmazeContract');
const config = require('../config');
const User = require('../models/User');

// Initialize blockchain contract
const secMazeContract = new SecMazeContract({
  providerUrl: config.blockchain.providerUrl,
  secTokenAddress: config.blockchain.contractAddress,
  network: config.blockchain.network
});

// Initialize blockchain connection
secMazeContract.initialize().catch(err => {
  console.error('Failed to initialize blockchain contract:', err);
});

/**
 * Get token balance
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getBalance = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'No wallet address associated with this account'
      });
    }
    
    const balance = await secMazeContract.getBalance(user.walletAddress);
    
    res.status(200).json({
      success: true,
      balance,
      walletAddress: user.walletAddress
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    next(error);
  }
};

/**
 * Get token price
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getTokenPrice = (req, res) => {
  // In a real application, this would fetch from a price oracle or API
  // For this example, we'll return mock data
  res.status(200).json({
    success: true,
    price: {
      usd: 0.15,
      eth: 0.000075,
      btc: 0.00000425
    },
    lastUpdated: Date.now()
  });
};

/**
 * Get transaction history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'No wallet address associated with this account'
      });
    }
    
    // In a real implementation, this would fetch transaction history from a blockchain explorer API
    // For this example, we'll return mock data
    const transactions = [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        type: 'transfer',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        to: user.walletAddress,
        amount: '100',
        timestamp: Date.now() - 3600000 * 24,
        status: 'confirmed'
      },
      {
        hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
        type: 'reward',
        from: '0x0000000000000000000000000000000000000000',
        to: user.walletAddress,
        amount: '25',
        timestamp: Date.now() - 3600000 * 48,
        status: 'confirmed'
      }
    ];
    
    res.status(200).json({
      success: true,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit threat intelligence data to blockchain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.submitThreatData = async (req, res, next) => {
  try {
    const { signature, confidence, privateKey } = req.body;
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Signature is required'
      });
    }
    
    // For security, private key handling would be done differently in production
    // Ideally, users would sign transactions in their wallet
    if (!privateKey) {
      return res.status(400).json({
        success: false,
        message: 'Private key is required for submitting to blockchain'
      });
    }
    
    // Initialize with private key for transaction signing
    await secMazeContract.initialize(privateKey);
    
    // Submit threat data
    const result = await secMazeContract.submitThreatSignature(
      signature,
      confidence || 80 // Default confidence if not provided
    );
    
    res.status(200).json({
      success: true,
      message: 'Threat data submitted to blockchain',
      transactionHash: result.transactionHash,
      signatureId: result.signatureId
    });
  } catch (error) {
    console.error('Error submitting threat data:', error);
    next(error);
  }
};

/**
 * Get threat intelligence data from blockchain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getThreatData = async (req, res, next) => {
  try {
    const count = parseInt(req.query.count) || 10;
    
    const signatures = await secMazeContract.getRecentThreatSignatures(count);
    
    res.status(200).json({
      success: true,
      signatures
    });
  } catch (error) {
    console.error('Error getting threat data:', error);
    next(error);
  }
};

/**
 * Get blockchain connection status
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getBlockchainStatus = async (req, res, next) => {
  try {
    const status = await secMazeContract.getNetworkStatus();
    
    res.status(200).json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting blockchain status:', error);
    next(error);
  }
}; 