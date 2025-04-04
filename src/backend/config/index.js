/**
 * Backend configuration settings
 */
module.exports = {
  // MongoDB connection
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/secmaze',
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || 'secmaze_development_secret_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // CORS settings
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'https://secmaze.xyz'],
  
  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // Blockchain settings
  blockchain: {
    network: process.env.BLOCKCHAIN_NETWORK || 'testnet',
    contractAddress: process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    providerUrl: process.env.PROVIDER_URL || 'https://rpc-mumbai.maticvigil.com'
  },
  
  // Maze generation settings
  maze: {
    defaultDifficulty: 2,
    minDifficulty: 1,
    maxDifficulty: 5,
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  }
}; 