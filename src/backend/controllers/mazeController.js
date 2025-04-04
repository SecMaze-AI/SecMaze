/**
 * Maze controller
 * Handles maze generation, verification, and configuration
 */

const { MazeGenerator } = require('../../maze/mazeGenerator');
const BotDetector = require('../../ml/botDetector');
const config = require('../config');

// Initialize bot detector
const botDetector = new BotDetector();
botDetector.initialize().catch(err => {
  console.error('Failed to initialize bot detector:', err);
});

// Cache for storing active mazes
const mazeCache = new Map();

/**
 * Generate a new maze
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.generateMaze = async (req, res, next) => {
  try {
    const { difficulty = config.maze.defaultDifficulty, width = 10, height = 10 } = req.body;
    
    // Validate difficulty level
    const validatedDifficulty = Math.min(
      Math.max(difficulty, config.maze.minDifficulty),
      config.maze.maxDifficulty
    );
    
    // Generate maze
    const mazeGenerator = new MazeGenerator(width, height, validatedDifficulty);
    const maze = mazeGenerator.generate();
    
    // Create a session token
    const sessionToken = generateSessionToken();
    
    // Store in cache with expiry
    mazeCache.set(sessionToken, {
      maze,
      createdAt: Date.now(),
      expiresAt: Date.now() + config.maze.sessionTimeout,
      attempts: 0,
      solved: false,
      sessionData: {
        fingerprint: req.body.fingerprint || {},
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }
    });
    
    // Send serialized maze to client
    res.status(200).json({
      success: true,
      sessionToken,
      maze: mazeGenerator.serialize(),
      expiresAt: Date.now() + config.maze.sessionTimeout
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a maze solution
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.verifyMaze = async (req, res, next) => {
  try {
    const { sessionToken, solution, interactionData } = req.body;
    
    // Check if session exists
    const session = mazeCache.get(sessionToken);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Maze session not found or expired'
      });
    }
    
    // Check if session has expired
    if (Date.now() > session.expiresAt) {
      mazeCache.delete(sessionToken);
      return res.status(400).json({
        success: false,
        message: 'Maze session has expired'
      });
    }
    
    // Increment attempt counter
    session.attempts += 1;
    
    // Update session data with interaction data
    if (interactionData) {
      session.sessionData = {
        ...session.sessionData,
        ...interactionData
      };
    }
    
    // Verify solution
    const isValid = verifySolution(session.maze, solution);
    
    // Bot detection analysis
    const botAnalysis = await botDetector.analyze(session.sessionData);
    
    if (isValid) {
      // Mark as solved
      session.solved = true;
      
      // Generate verification token
      const verificationToken = generateVerificationToken(sessionToken, botAnalysis.isBot);
      
      res.status(200).json({
        success: true,
        message: 'Maze solved successfully',
        verificationToken,
        humanProbability: 1 - botAnalysis.score
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid solution',
        attempts: session.attempts,
        isBot: botAnalysis.isBot,
        humanProbability: 1 - botAnalysis.score
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get maze stats
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getMazeStats = async (req, res, next) => {
  try {
    // In a real application, these stats would come from a database
    const stats = {
      totalGenerated: 10000,
      successRate: 0.78,
      averageCompletionTime: 45.2, // seconds
      botDetectionRate: 0.92,
      difficultyDistribution: {
        1: 0.2,
        2: 0.35,
        3: 0.25,
        4: 0.15,
        5: 0.05
      }
    };
    
    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get maze configuration
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMazeConfig = (req, res) => {
  // Only return safe config values (not internal ones)
  const safeConfig = {
    defaultDifficulty: config.maze.defaultDifficulty,
    minDifficulty: config.maze.minDifficulty,
    maxDifficulty: config.maze.maxDifficulty,
    sessionTimeoutMinutes: config.maze.sessionTimeout / (60 * 1000)
  };
  
  res.status(200).json({
    success: true,
    config: safeConfig
  });
};

/**
 * Update maze configuration (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.updateMazeConfig = async (req, res, next) => {
  try {
    // Ensure user is admin (though middleware should have already checked)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }
    
    const { defaultDifficulty, minDifficulty, maxDifficulty, sessionTimeout } = req.body;
    
    // Update config (in a real app, this would update a database or config file)
    if (defaultDifficulty !== undefined) config.maze.defaultDifficulty = defaultDifficulty;
    if (minDifficulty !== undefined) config.maze.minDifficulty = minDifficulty;
    if (maxDifficulty !== undefined) config.maze.maxDifficulty = maxDifficulty;
    if (sessionTimeout !== undefined) config.maze.sessionTimeout = sessionTimeout * 60 * 1000; // Convert minutes to ms
    
    res.status(200).json({
      success: true,
      message: 'Configuration updated',
      config: {
        defaultDifficulty: config.maze.defaultDifficulty,
        minDifficulty: config.maze.minDifficulty,
        maxDifficulty: config.maze.maxDifficulty,
        sessionTimeoutMinutes: config.maze.sessionTimeout / (60 * 1000)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get maze analytics (admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
exports.getMazeAnalytics = async (req, res, next) => {
  try {
    // Mock analytics data (in a real app, would come from a database)
    const analytics = {
      daily: {
        generated: [120, 145, 132, 160, 175, 190, 205],
        solved: [85, 102, 95, 115, 140, 160, 175],
        botDetections: [15, 20, 18, 22, 25, 18, 20]
      },
      monthly: {
        generated: 4500,
        solved: 3600,
        botDetections: 750
      },
      performance: {
        averageGenerationTime: 12, // ms
        averageSolutionVerificationTime: 8, // ms
        serverLoad: 0.35
      }
    };
    
    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    next(error);
  }
};

// Helper Functions

/**
 * Generate a session token
 * @returns {string} Session token
 */
function generateSessionToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Generate a verification token
 * @param {string} sessionToken - Original session token
 * @param {boolean} isBot - Whether the solver is a bot
 * @returns {string} Verification token
 */
function generateVerificationToken(sessionToken, isBot) {
  const timestamp = Date.now();
  const data = `${sessionToken}:${timestamp}:${isBot ? '1' : '0'}`;
  
  // In a real app, this would be signed with a secret key
  return Buffer.from(data).toString('base64');
}

/**
 * Verify maze solution path
 * @param {Object} maze - Maze object
 * @param {Array} solution - Solution path
 * @returns {boolean} Whether solution is valid
 */
function verifySolution(maze, solution) {
  // Basic validation
  if (!solution || !Array.isArray(solution) || solution.length < 2) {
    return false;
  }
  
  // Check if solution starts at entry point
  if (solution[0].x !== maze.entry.x || solution[0].y !== maze.entry.y) {
    return false;
  }
  
  // Check if solution ends at exit point
  if (solution[solution.length - 1].x !== maze.exit.x || 
      solution[solution.length - 1].y !== maze.exit.y) {
    return false;
  }
  
  // Check each step for validity
  for (let i = 1; i < solution.length; i++) {
    const current = solution[i - 1];
    const next = solution[i];
    
    // Check if move is to an adjacent cell (no diagonal moves)
    const isAdjacent = (
      (current.x === next.x && Math.abs(current.y - next.y) === 1) ||
      (current.y === next.y && Math.abs(current.x - next.x) === 1)
    );
    
    if (!isAdjacent) {
      return false;
    }
    
    // Check if there is a wall between cells
    const currentCell = maze.grid[current.y][current.x];
    
    if (next.x > current.x && currentCell.walls.right) return false; // Moving right
    if (next.x < current.x && currentCell.walls.left) return false; // Moving left
    if (next.y > current.y && currentCell.walls.bottom) return false; // Moving down
    if (next.y < current.y && currentCell.walls.top) return false; // Moving up
  }
  
  return true;
} 