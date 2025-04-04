/**
 * SecMaze Blockchain Contract Interface
 * 
 * This module provides functionality to interact with the SecMaze
 * smart contract on the blockchain.
 */

const { ethers } = require('ethers');

// ABI for the SecMaze token contract
const SEC_TOKEN_ABI = [
  // Read-only functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  
  // Write functions
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// ABI for the SecMaze threat intelligence contract
const THREAT_INTEL_ABI = [
  // Read-only functions
  "function getSignatureCount() view returns (uint256)",
  "function getSignature(uint256 id) view returns (string memory signature, address reporter, uint256 timestamp, uint256 confidence)",
  "function getSignaturesByReporter(address reporter) view returns (uint256[] memory)",
  "function getRecentSignatures(uint256 count) view returns (uint256[] memory)",
  
  // Write functions
  "function reportSignature(string memory signature, uint256 confidence) returns (uint256)",
  "function updateSignature(uint256 id, string memory signature, uint256 confidence) returns (bool)",
  "function rewardReporter(address reporter, uint256 amount) returns (bool)",
  
  // Events
  "event SignatureReported(uint256 indexed id, address indexed reporter, uint256 timestamp)",
  "event SignatureUpdated(uint256 indexed id, address indexed reporter, uint256 timestamp)",
  "event ReporterRewarded(address indexed reporter, uint256 amount, uint256 timestamp)"
];

/**
 * SecMaze Blockchain Interface
 */
class SecMazeContract {
  /**
   * Create a new blockchain interface
   * @param {Object} config - Configuration object
   */
  constructor(config = {}) {
    this.config = {
      providerUrl: config.providerUrl || 'https://rpc-mumbai.maticvigil.com', // Mumbai testnet
      secTokenAddress: config.secTokenAddress || '0x0000000000000000000000000000000000000000', // Placeholder
      threatIntelAddress: config.threatIntelAddress || '0x0000000000000000000000000000000000000000', // Placeholder
      network: config.network || 'testnet',
      ...config
    };
    
    this.provider = null;
    this.signer = null;
    this.secToken = null;
    this.threatIntel = null;
    
    this.initialized = false;
  }
  
  /**
   * Initialize the blockchain interface
   * @param {string} privateKey - Optional private key for signing transactions
   * @returns {Promise<boolean>} Success status
   */
  async initialize(privateKey = null) {
    try {
      // Initialize provider
      this.provider = new ethers.providers.JsonRpcProvider(this.config.providerUrl);
      
      // Initialize signer if private key is provided
      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
      }
      
      // Initialize contracts
      this.secToken = new ethers.Contract(
        this.config.secTokenAddress,
        SEC_TOKEN_ABI,
        this.signer || this.provider
      );
      
      this.threatIntel = new ethers.Contract(
        this.config.threatIntelAddress,
        THREAT_INTEL_ABI,
        this.signer || this.provider
      );
      
      this.initialized = true;
      
      // Basic validation of connection and contracts
      await this.validateConnection();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain interface:', error);
      this.initialized = false;
      return false;
    }
  }
  
  /**
   * Validate the connection to the blockchain and contracts
   * @private
   */
  async validateConnection() {
    try {
      // Check network connection
      const network = await this.provider.getNetwork();
      console.log(`Connected to network: ${network.name} (${network.chainId})`);
      
      // Try to call a contract method to validate
      if (this.config.secTokenAddress !== '0x0000000000000000000000000000000000000000') {
        const symbol = await this.secToken.symbol();
        console.log(`SEC Token symbol: ${symbol}`);
      }
      
    } catch (error) {
      console.warn('Blockchain connection validation failed:', error.message);
    }
  }
  
  /**
   * Check if the interface is initialized
   * @private
   */
  checkInitialized() {
    if (!this.initialized) {
      throw new Error('Blockchain interface not initialized. Call initialize() first.');
    }
  }
  
  /**
   * Get SEC token balance for an address
   * @param {string} address - Ethereum address
   * @returns {Promise<string>} Balance as a string in SEC tokens
   */
  async getBalance(address) {
    this.checkInitialized();
    
    try {
      const balanceWei = await this.secToken.balanceOf(address);
      const decimals = await this.secToken.decimals();
      
      // Convert from wei to token amount
      const balance = ethers.utils.formatUnits(balanceWei, decimals);
      return balance;
    } catch (error) {
      console.error('Failed to get token balance:', error);
      throw error;
    }
  }
  
  /**
   * Get total supply of SEC tokens
   * @returns {Promise<string>} Total supply as a string
   */
  async getTotalSupply() {
    this.checkInitialized();
    
    try {
      const supplyWei = await this.secToken.totalSupply();
      const decimals = await this.secToken.decimals();
      
      // Convert from wei to token amount
      const supply = ethers.utils.formatUnits(supplyWei, decimals);
      return supply;
    } catch (error) {
      console.error('Failed to get total supply:', error);
      throw error;
    }
  }
  
  /**
   * Transfer SEC tokens to another address
   * @param {string} toAddress - Recipient address
   * @param {string|number} amount - Amount to transfer
   * @returns {Promise<Object>} Transaction result
   */
  async transfer(toAddress, amount) {
    this.checkInitialized();
    
    if (!this.signer) {
      throw new Error('No signer available. Initialize with a private key to make transactions.');
    }
    
    try {
      const decimals = await this.secToken.decimals();
      const amountWei = ethers.utils.parseUnits(amount.toString(), decimals);
      
      const tx = await this.secToken.transfer(toAddress, amountWei);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Token transfer failed:', error);
      throw error;
    }
  }
  
  /**
   * Submit threat intelligence to the blockchain
   * @param {string} signature - Threat signature
   * @param {number} confidence - Confidence level (0-100)
   * @returns {Promise<Object>} Transaction result with signature ID
   */
  async submitThreatSignature(signature, confidence) {
    this.checkInitialized();
    
    if (!this.signer) {
      throw new Error('No signer available. Initialize with a private key to make transactions.');
    }
    
    try {
      // Convert confidence to scale of 0-100 if needed
      const normalizedConfidence = Math.min(100, Math.max(0, confidence));
      
      const tx = await this.threatIntel.reportSignature(signature, normalizedConfidence);
      const receipt = await tx.wait();
      
      // Parse the transaction logs to get the signature ID
      // This is a simplification - actual implementation would decode the event logs
      const signatureId = 0; // Placeholder - would be extracted from event logs in production
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        signatureId
      };
    } catch (error) {
      console.error('Failed to submit threat signature:', error);
      throw error;
    }
  }
  
  /**
   * Get recent threat signatures from the blockchain
   * @param {number} count - Number of signatures to retrieve
   * @returns {Promise<Array>} Array of signature objects
   */
  async getRecentThreatSignatures(count = 10) {
    this.checkInitialized();
    
    try {
      // Get IDs of recent signatures
      const signatureIds = await this.threatIntel.getRecentSignatures(count);
      
      // Fetch details for each signature
      const signatures = [];
      for (const id of signatureIds) {
        const sigData = await this.threatIntel.getSignature(id);
        signatures.push({
          id: id.toString(),
          signature: sigData.signature,
          reporter: sigData.reporter,
          timestamp: new Date(sigData.timestamp.toNumber() * 1000), // Convert to JS Date
          confidence: sigData.confidence.toNumber()
        });
      }
      
      return signatures;
    } catch (error) {
      console.error('Failed to get recent threat signatures:', error);
      
      // In case of error or for development purposes, return mock data
      if (this.config.network === 'testnet') {
        return this._getMockSignatures(count);
      }
      
      throw error;
    }
  }
  
  /**
   * Generate mock signature data for development and testing
   * @param {number} count - Number of signatures to generate
   * @returns {Array} Array of mock signature objects
   * @private
   */
  _getMockSignatures(count) {
    const signatures = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      signatures.push({
        id: i.toString(),
        signature: `bot_signature_${Math.random().toString(36).substring(2, 10)}`,
        reporter: `0x${Math.random().toString(16).substring(2, 42)}`,
        timestamp: new Date(now - i * 3600000), // 1 hour apart
        confidence: Math.floor(Math.random() * 100)
      });
    }
    
    return signatures;
  }
  
  /**
   * Get blockchain network status
   * @returns {Promise<Object>} Network status information
   */
  async getNetworkStatus() {
    this.checkInitialized();
    
    try {
      const [network, blockNumber, gasPrice] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
        this.provider.getGasPrice()
      ]);
      
      return {
        network: {
          name: network.name,
          chainId: network.chainId
        },
        blockNumber,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        secTokenAddress: this.config.secTokenAddress,
        threatIntelAddress: this.config.threatIntelAddress,
        isConnected: true
      };
    } catch (error) {
      console.error('Failed to get network status:', error);
      return {
        isConnected: false,
        error: error.message
      };
    }
  }
}

module.exports = SecMazeContract; 