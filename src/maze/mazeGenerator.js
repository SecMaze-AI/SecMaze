/**
 * SecMaze - Core Maze Generation Algorithm
 * 
 * This module provides the functionality to generate complex digital mazes
 * that are used for distinguishing human users from bots.
 */

/**
 * Cell class representing a single cell in the maze
 */
class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.visited = false;
    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };
  }
}

/**
 * MazeGenerator class
 */
class MazeGenerator {
  /**
   * Create a new maze generator
   * @param {number} width - Width of the maze
   * @param {number} height - Height of the maze
   * @param {number} difficulty - Difficulty level (1-5)
   * @param {Object} options - Additional options
   */
  constructor(width, height, difficulty = 2, options = {}) {
    this.width = width;
    this.height = height;
    this.difficulty = Math.min(Math.max(difficulty, 1), 5);
    this.options = {
      seed: Date.now(),
      extraPaths: Math.round(this.difficulty * 2),
      loopFactor: this.difficulty * 0.1,
      ...options
    };
    
    this.grid = [];
    this.initializeGrid();
  }
  
  /**
   * Initialize the maze grid
   * @private
   */
  initializeGrid() {
    // Create a grid of cells
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(new Cell(x, y));
      }
      this.grid.push(row);
    }
  }
  
  /**
   * Get a cell at the specified coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {Cell} The cell at the specified coordinates or undefined if out of bounds
   * @private
   */
  getCell(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return undefined;
    }
    return this.grid[y][x];
  }
  
  /**
   * Get all unvisited neighbors of a cell
   * @param {Cell} cell - The cell to get neighbors for
   * @returns {Cell[]} Array of unvisited neighbor cells
   * @private
   */
  getUnvisitedNeighbors(cell) {
    const neighbors = [];
    
    const top = this.getCell(cell.x, cell.y - 1);
    const right = this.getCell(cell.x + 1, cell.y);
    const bottom = this.getCell(cell.x, cell.y + 1);
    const left = this.getCell(cell.x - 1, cell.y);
    
    if (top && !top.visited) neighbors.push({ cell: top, direction: 'top' });
    if (right && !right.visited) neighbors.push({ cell: right, direction: 'right' });
    if (bottom && !bottom.visited) neighbors.push({ cell: bottom, direction: 'bottom' });
    if (left && !left.visited) neighbors.push({ cell: left, direction: 'left' });
    
    return neighbors;
  }
  
  /**
   * Remove a wall between two cells
   * @param {Cell} current - Current cell
   * @param {Cell} next - Next cell
   * @param {string} direction - Direction from current to next ('top', 'right', 'bottom', 'left')
   * @private
   */
  removeWall(current, next, direction) {
    switch (direction) {
      case 'top':
        current.walls.top = false;
        next.walls.bottom = false;
        break;
      case 'right':
        current.walls.right = false;
        next.walls.left = false;
        break;
      case 'bottom':
        current.walls.bottom = false;
        next.walls.top = false;
        break;
      case 'left':
        current.walls.left = false;
        next.walls.right = false;
        break;
    }
  }
  
  /**
   * Generate the maze using a modified depth-first search algorithm
   * @returns {Object} The generated maze
   */
  generate() {
    const stack = [];
    
    // Start at a random position
    const startX = Math.floor(Math.random() * this.width);
    const startY = Math.floor(Math.random() * this.height);
    const start = this.grid[startY][startX];
    start.visited = true;
    stack.push(start);
    
    // Continue until all cells have been visited
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current);
      
      if (neighbors.length > 0) {
        // Choose a random unvisited neighbor
        const randomIndex = Math.floor(Math.random() * neighbors.length);
        const { cell: next, direction } = neighbors[randomIndex];
        
        // Remove the wall between the current cell and the chosen cell
        this.removeWall(current, next, direction);
        
        // Mark the chosen cell as visited and push it to the stack
        next.visited = true;
        stack.push(next);
      } else {
        // Backtrack if no unvisited neighbors
        stack.pop();
      }
    }
    
    // Add extra paths to create loops based on difficulty
    this.addExtraPaths();
    
    // Define entry and exit points based on difficulty
    const entry = { x: 0, y: Math.floor(Math.random() * this.height) };
    const exit = { x: this.width - 1, y: Math.floor(Math.random() * this.height) };
    
    // Remove walls at entry and exit
    this.grid[entry.y][entry.x].walls.left = false;
    this.grid[exit.y][exit.x].walls.right = false;
    
    return {
      grid: this.grid,
      width: this.width,
      height: this.height,
      difficulty: this.difficulty,
      entry,
      exit
    };
  }
  
  /**
   * Add extra paths to the maze to create loops
   * @private
   */
  addExtraPaths() {
    const extraPaths = this.options.extraPaths;
    
    for (let i = 0; i < extraPaths; i++) {
      // Choose a random cell
      const x = Math.floor(Math.random() * (this.width - 1));
      const y = Math.floor(Math.random() * (this.height - 1));
      const cell = this.grid[y][x];
      
      // Choose a random direction (right or bottom)
      const direction = Math.random() < 0.5 ? 'right' : 'bottom';
      
      if (direction === 'right') {
        const nextCell = this.grid[y][x + 1];
        this.removeWall(cell, nextCell, 'right');
      } else {
        const nextCell = this.grid[y + 1][x];
        this.removeWall(cell, nextCell, 'bottom');
      }
    }
  }
  
  /**
   * Serialize the maze to a compact format
   * @returns {Object} Serialized maze
   */
  serialize() {
    const wallsData = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        let wallBits = 0;
        
        if (cell.walls.top) wallBits |= 1;
        if (cell.walls.right) wallBits |= 2;
        if (cell.walls.bottom) wallBits |= 4;
        if (cell.walls.left) wallBits |= 8;
        
        wallsData.push(wallBits);
      }
    }
    
    return {
      width: this.width,
      height: this.height,
      difficulty: this.difficulty,
      walls: wallsData
    };
  }
  
  /**
   * Get a solution to the maze
   * @returns {Array} Array of points representing the solution path
   */
  getSolution() {
    // Implement the A* pathfinding algorithm to find a solution
    // This is a simplified version that returns the optimal path from entry to exit
    
    const entryCell = this.grid[0][0]; // Assuming entry is at top-left
    const exitCell = this.grid[this.height - 1][this.width - 1]; // Assuming exit is at bottom-right
    
    // The complete solution would include A* pathfinding
    // For now, we'll return a dummy solution path
    return [
      { x: 0, y: 0 },
      { x: this.width - 1, y: this.height - 1 }
    ];
  }
}

module.exports = {
  MazeGenerator,
  Cell
}; 