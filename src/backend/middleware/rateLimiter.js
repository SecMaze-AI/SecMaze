/**
 * Rate limiting middleware to prevent API abuse
 */

const config = require('../config');

// In-memory storage for rate limiting
// In production, this should be replaced with Redis or another distributed solution
const requestCounts = new Map();

/**
 * Basic rate limiter middleware
 */
const rateLimiter = (req, res, next) => {
  // Get client IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  const now = Date.now();
  const windowStartTime = now - config.rateLimit.windowMs;
  
  // Clear old entries
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip);
  const recentRequests = requests.filter(timestamp => timestamp > windowStartTime);
  
  // Update requests for this IP
  requestCounts.set(ip, [...recentRequests, now]);
  
  // Check if rate limit exceeded
  if (recentRequests.length >= config.rateLimit.max) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil((windowStartTime + config.rateLimit.windowMs - now) / 1000)
    });
  }
  
  // If we get here, the request is allowed
  next();
};

/**
 * Advanced rate limiter for specific endpoints with different limits
 */
const createEndpointRateLimiter = (options = {}) => {
  const windowMs = options.windowMs || config.rateLimit.windowMs;
  const max = options.max || config.rateLimit.max;
  const keyGenerator = options.keyGenerator || ((req) => req.headers['x-forwarded-for'] || req.socket.remoteAddress);
  
  const limiterMap = new Map();
  
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStartTime = now - windowMs;
    
    if (!limiterMap.has(key)) {
      limiterMap.set(key, []);
    }
    
    const requests = limiterMap.get(key);
    const recentRequests = requests.filter(timestamp => timestamp > windowStartTime);
    
    limiterMap.set(key, [...recentRequests, now]);
    
    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded for this endpoint. Please try again later.',
        retryAfter: Math.ceil((windowStartTime + windowMs - now) / 1000)
      });
    }
    
    next();
  };
};

module.exports = {
  rateLimiter,
  createEndpointRateLimiter
}; 