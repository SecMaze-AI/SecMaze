/**
 * Blockchain integration routes
 */

const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { authenticate } = require('../middleware/auth');

// Get token balance
router.get('/balance', authenticate, blockchainController.getBalance);

// Get token price
router.get('/price', blockchainController.getTokenPrice);

// Get transaction history
router.get('/transactions', authenticate, blockchainController.getTransactions);

// Submit threat intelligence to blockchain
router.post('/threat', authenticate, blockchainController.submitThreatData);

// Get threat intelligence data
router.get('/threat', authenticate, blockchainController.getThreatData);

// Verify blockchain connection
router.get('/status', blockchainController.getBlockchainStatus);

module.exports = router; 