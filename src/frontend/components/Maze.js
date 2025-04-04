import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/Maze.module.css';

/**
 * Maze component that renders and handles maze interactions
 */
const Maze = ({ 
  mazeData, 
  difficulty = 2, 
  onSolve, 
  onInteraction,
  trackMovement = true,
  width = 500,
  height = 500,
  cellSize = 30
}) => {
  const canvasRef = useRef(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mazeGrid, setMazeGrid] = useState(null);
  const [pathHistory, setPathHistory] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [solving, setSolving] = useState(false);
  const [wallCollisions, setWallCollisions] = useState(0);
  
  // Movement tracking for ML analysis
  const movementData = useRef([]);
  const interactionData = useRef([]);
  
  // Initialize maze from data
  useEffect(() => {
    if (!mazeData) {
      setError('No maze data provided');
      setIsLoading(false);
      return;
    }
    
    try {
      // Parse maze data
      const grid = parseMazeData(mazeData);
      setMazeGrid(grid);
      
      // Set player at entry point
      const entryPoint = grid.entry || { x: 0, y: 0 };
      setPlayerPosition(entryPoint);
      setPathHistory([{ ...entryPoint, timestamp: Date.now() }]);
      
      // Start timer
      setStartTime(Date.now());
      setIsLoading(false);
      
      // Record start event
      if (onInteraction) {
        onInteraction({
          type: 'start',
          timestamp: Date.now(),
          position: entryPoint
        });
      }
      
      interactionData.current.push({
        type: 'start',
        timestamp: Date.now()
      });
    } catch (err) {
      setError(`Failed to parse maze data: ${err.message}`);
      setIsLoading(false);
    }
  }, [mazeData, onInteraction]);
  
  // Draw maze when grid or player position changes
  useEffect(() => {
    if (!mazeGrid || isLoading) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    drawMaze(ctx, mazeGrid, playerPosition);
    
    // Check if player has reached the exit
    if (
      playerPosition.x === mazeGrid.exit.x && 
      playerPosition.y === mazeGrid.exit.y &&
      !solving
    ) {
      setSolving(true);
      const endTime = Date.now();
      const solutionTime = (endTime - startTime) / 1000; // in seconds
      
      // Add final position to path history
      const finalPath = [
        ...pathHistory, 
        { ...playerPosition, timestamp: endTime }
      ];
      setPathHistory(finalPath);
      
      // Record completion event
      if (onInteraction) {
        onInteraction({
          type: 'complete',
          timestamp: endTime,
          position: playerPosition,
          solutionTime,
          path: finalPath
        });
      }
      
      interactionData.current.push({
        type: 'complete',
        timestamp: endTime,
        solutionTime
      });
      
      // Call onSolve with solution path
      if (onSolve) {
        onSolve({
          path: finalPath,
          solutionTime,
          wallCollisions,
          interactionData: interactionData.current,
          movementData: movementData.current
        });
      }
    }
  }, [mazeGrid, playerPosition, isLoading, solving, pathHistory, startTime, onSolve, onInteraction, wallCollisions]);
  
  // Handle keyboard navigation
  useEffect(() => {
    if (isLoading || !mazeGrid || solving) return;
    
    const handleKeyDown = (e) => {
      if (solving) return;
      
      let newPosition = { ...playerPosition };
      let direction = '';
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          newPosition = { x: playerPosition.x, y: playerPosition.y - 1 };
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
          newPosition = { x: playerPosition.x, y: playerPosition.y + 1 };
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
          newPosition = { x: playerPosition.x - 1, y: playerPosition.y };
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
          newPosition = { x: playerPosition.x + 1, y: playerPosition.y };
          direction = 'right';
          break;
        default:
          return; // Ignore other keys
      }
      
      // Record key press interaction
      if (onInteraction) {
        onInteraction({
          type: 'keypress',
          key: e.key,
          timestamp: Date.now(),
          position: playerPosition
        });
      }
      
      interactionData.current.push({
        type: 'keypress',
        key: e.key,
        timestamp: Date.now()
      });
      
      // Check if the move is valid (no walls)
      if (isValidMove(mazeGrid, playerPosition, newPosition, direction)) {
        // Update player position
        setPlayerPosition(newPosition);
        
        // Add to path history
        setPathHistory([...pathHistory, { ...newPosition, timestamp: Date.now() }]);
      } else {
        // Count wall collision
        setWallCollisions(prev => prev + 1);
        
        // Record wall collision
        if (onInteraction) {
          onInteraction({
            type: 'wallCollision',
            timestamp: Date.now(),
            position: playerPosition,
            attemptedDirection: direction
          });
        }
        
        interactionData.current.push({
          type: 'wallCollision',
          timestamp: Date.now(),
          direction
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mazeGrid, playerPosition, isLoading, solving, pathHistory, onInteraction]);
  
  // Track mouse/touch movement for ML analysis
  useEffect(() => {
    if (!trackMovement || !canvasRef.current) return;
    
    const handleMouseMove = (e) => {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Add movement data
      movementData.current.push({
        x,
        y,
        timestamp: Date.now()
      });
    };
    
    const handleTouchMove = (e) => {
      if (e.touches.length === 0) return;
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      
      // Add movement data
      movementData.current.push({
        x,
        y,
        timestamp: Date.now(),
        touch: true
      });
    };
    
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [trackMovement]);
  
  // Handle canvas click for movement
  const handleCanvasClick = (e) => {
    if (isLoading || !mazeGrid || solving) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate clicked cell
    const cellX = Math.floor(x / cellSize);
    const cellY = Math.floor(y / cellSize);
    
    // Only allow moves to adjacent cells
    if (
      (Math.abs(cellX - playerPosition.x) === 1 && cellY === playerPosition.y) ||
      (Math.abs(cellY - playerPosition.y) === 1 && cellX === playerPosition.x)
    ) {
      let direction = '';
      if (cellX > playerPosition.x) direction = 'right';
      else if (cellX < playerPosition.x) direction = 'left';
      else if (cellY > playerPosition.y) direction = 'down';
      else if (cellY < playerPosition.y) direction = 'up';
      
      // Record click interaction
      if (onInteraction) {
        onInteraction({
          type: 'click',
          timestamp: Date.now(),
          position: playerPosition,
          target: { x: cellX, y: cellY }
        });
      }
      
      interactionData.current.push({
        type: 'click',
        timestamp: Date.now(),
        target: { x: cellX, y: cellY }
      });
      
      // Check if the move is valid (no walls)
      if (isValidMove(mazeGrid, playerPosition, { x: cellX, y: cellY }, direction)) {
        // Update player position
        setPlayerPosition({ x: cellX, y: cellY });
        
        // Add to path history
        setPathHistory([...pathHistory, { x: cellX, y: cellY, timestamp: Date.now() }]);
      } else {
        // Count wall collision
        setWallCollisions(prev => prev + 1);
        
        // Record wall collision
        if (onInteraction) {
          onInteraction({
            type: 'wallCollision',
            timestamp: Date.now(),
            position: playerPosition,
            attemptedDirection: direction
          });
        }
        
        interactionData.current.push({
          type: 'wallCollision',
          timestamp: Date.now(),
          direction
        });
      }
    }
  };
  
  if (isLoading) {
    return <div className={styles.loading}>Loading maze...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  
  return (
    <div className={styles.mazeContainer}>
      <div className={styles.mazeInfo}>
        <span className={styles.difficulty}>Difficulty: {difficulty}</span>
        {solving && <span className={styles.solved}>Solved!</span>}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={styles.mazeCanvas}
        onClick={handleCanvasClick}
      />
      <div className={styles.instructions}>
        <p>Use arrow keys or WASD to navigate the maze</p>
        <p>Or click on adjacent cells to move</p>
      </div>
    </div>
  );
};

// Helper functions

/**
 * Parse maze data into a grid
 * @param {Object} data - Maze data from API
 * @returns {Object} Parsed maze grid
 */
function parseMazeData(data) {
  const { width, height, walls, difficulty } = data;
  
  // Create grid
  const grid = {
    width,
    height,
    cells: [],
    difficulty,
    entry: { x: 0, y: Math.floor(height / 2) }, // Default entry point
    exit: { x: width - 1, y: Math.floor(height / 2) } // Default exit point
  };
  
  // Initialize cells
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const wallBits = walls[index] || 0;
      
      row.push({
        x,
        y,
        walls: {
          top: (wallBits & 1) !== 0,
          right: (wallBits & 2) !== 0,
          bottom: (wallBits & 4) !== 0,
          left: (wallBits & 8) !== 0
        }
      });
    }
    grid.cells.push(row);
  }
  
  return grid;
}

/**
 * Draw maze on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {Object} grid - Maze grid
 * @param {Object} playerPos - Player position
 */
function drawMaze(ctx, grid, playerPos) {
  const { width, height, cells, entry, exit } = grid;
  const cellSize = ctx.canvas.width / width;
  
  // Clear canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw background
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw cells and walls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = cells[y][x];
      const posX = x * cellSize;
      const posY = y * cellSize;
      
      // Draw cell
      ctx.fillStyle = '#222';
      ctx.fillRect(posX, posY, cellSize, cellSize);
      
      // Highlight entry and exit
      if ((x === entry.x && y === entry.y) || (x === exit.x && y === exit.y)) {
        ctx.fillStyle = x === entry.x && y === entry.y ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
        ctx.fillRect(posX, posY, cellSize, cellSize);
      }
      
      // Draw walls
      ctx.strokeStyle = '#4fd1c5';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      if (cell.walls.top) {
        ctx.moveTo(posX, posY);
        ctx.lineTo(posX + cellSize, posY);
      }
      
      if (cell.walls.right) {
        ctx.moveTo(posX + cellSize, posY);
        ctx.lineTo(posX + cellSize, posY + cellSize);
      }
      
      if (cell.walls.bottom) {
        ctx.moveTo(posX, posY + cellSize);
        ctx.lineTo(posX + cellSize, posY + cellSize);
      }
      
      if (cell.walls.left) {
        ctx.moveTo(posX, posY);
        ctx.lineTo(posX, posY + cellSize);
      }
      
      ctx.stroke();
    }
  }
  
  // Draw player
  const playerX = playerPos.x * cellSize + cellSize / 2;
  const playerY = playerPos.y * cellSize + cellSize / 2;
  
  ctx.fillStyle = '#f9cb28';
  ctx.beginPath();
  ctx.arc(playerX, playerY, cellSize / 3, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw entry and exit labels
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('START', entry.x * cellSize + cellSize / 2, entry.y * cellSize + cellSize / 2 + 4);
  ctx.fillText('EXIT', exit.x * cellSize + cellSize / 2, exit.y * cellSize + cellSize / 2 + 4);
}

/**
 * Check if a move is valid (no walls blocking)
 * @param {Object} grid - Maze grid
 * @param {Object} from - Starting position
 * @param {Object} to - Target position
 * @param {string} direction - Movement direction
 * @returns {boolean} Whether move is valid
 */
function isValidMove(grid, from, to, direction) {
  // Check if target is within bounds
  if (
    to.x < 0 || 
    to.x >= grid.width || 
    to.y < 0 || 
    to.y >= grid.height
  ) {
    return false;
  }
  
  // Check walls based on direction
  const cell = grid.cells[from.y][from.x];
  
  switch (direction) {
    case 'up':
      return !cell.walls.top;
    case 'right':
      return !cell.walls.right;
    case 'down':
      return !cell.walls.bottom;
    case 'left':
      return !cell.walls.left;
    default:
      return false;
  }
}

Maze.propTypes = {
  mazeData: PropTypes.object.isRequired,
  difficulty: PropTypes.number,
  onSolve: PropTypes.func,
  onInteraction: PropTypes.func,
  trackMovement: PropTypes.bool,
  width: PropTypes.number,
  height: PropTypes.number,
  cellSize: PropTypes.number
};

export default Maze; 