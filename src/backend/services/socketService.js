/**
 * Socket.io real-time communication service
 */

// Connected clients
const connectedClients = new Map();

/**
 * Setup socket.io connections and event handlers
 * @param {Object} io - Socket.io server instance
 */
const setupSocket = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    // Here we would normally verify the token
    // For simplicity, we'll accept any token
    
    next();
  });
  
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Store client connection
    connectedClients.set(socket.id, {
      id: socket.id,
      userId: socket.handshake.auth.userId || null,
      connectedAt: Date.now()
    });
    
    // Join rooms based on user ID or other criteria
    if (socket.handshake.auth.userId) {
      socket.join(`user:${socket.handshake.auth.userId}`);
    }
    
    // Handle real-time maze events
    socket.on('maze:start', (data) => {
      console.log(`Maze started by client ${socket.id}`, data);
      // Process maze start event
    });
    
    socket.on('maze:checkpoint', (data) => {
      console.log(`Maze checkpoint reached by client ${socket.id}`, data);
      // Process checkpoint data
    });
    
    socket.on('maze:complete', (data) => {
      console.log(`Maze completed by client ${socket.id}`, data);
      // Process maze completion
      
      // Emit completion acknowledgement
      socket.emit('maze:complete:ack', {
        success: true,
        timestamp: Date.now()
      });
    });
    
    // Handle threat intelligence events
    socket.on('threat:report', (data) => {
      console.log(`Threat reported by client ${socket.id}`, data);
      // Process threat report
      
      // Broadcast to admin room
      io.to('admin').emit('threat:new', {
        reportId: generateId(),
        ...data,
        reportedAt: Date.now()
      });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);
    });
  });
  
  // Regular status updates to clients
  setInterval(() => {
    io.emit('server:status', {
      connectedClients: connectedClients.size,
      timestamp: Date.now()
    });
  }, 30000); // every 30 seconds
};

/**
 * Send a notification to a specific user
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 */
const notifyUser = (io, userId, type, data) => {
  io.to(`user:${userId}`).emit('notification', {
    type,
    data,
    timestamp: Date.now()
  });
};

/**
 * Send a broadcast message to all connected clients
 * @param {string} type - Message type
 * @param {Object} data - Message data
 */
const broadcastMessage = (io, type, data) => {
  io.emit(type, {
    ...data,
    timestamp: Date.now()
  });
};

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

module.exports = {
  setupSocket,
  notifyUser,
  broadcastMessage
};