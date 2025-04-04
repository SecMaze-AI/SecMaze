import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Maze from './Maze';
import styles from '../styles/MazeGenerator.module.css';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui';

/**
 * MazeGenerator component that handles maze generation and tracking
 */
const MazeGenerator = ({ 
  initialDifficulty = 1, 
  width = 10, 
  height = 10,
  onComplete,
  trackData = true,
  initialSeed = null,
  onShare = null
}) => {
  const { user, isAuthenticated } = useAuth();
  const [mazeData, setMazeData] = useState(null);
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [solutionStats, setSolutionStats] = useState(null);
  const [mazeHistory, setMazeHistory] = useState([]);
  const [seed, setSeed] = useState(() => initialSeed ? parseInt(initialSeed, 10) : Math.floor(Math.random() * 1000000));
  const [useSeed, setUseSeed] = useState(!!initialSeed);
  const [customSeed, setCustomSeed] = useState(initialSeed || '');
  
  // Update difficulty if initialDifficulty changes
  useEffect(() => {
    if (initialDifficulty) {
      setDifficulty(initialDifficulty);
    }
  }, [initialDifficulty]);
  
  // Generate maze data
  const generateMaze = useCallback(async (useCustomSeed = false) => {
    setLoading(true);
    setError(null);
    setMazeData(null);
    setSolutionStats(null);
    
    try {
      // Generate a new random seed if not using saved seed
      const currentSeed = useCustomSeed ? parseInt(customSeed, 10) : Math.floor(Math.random() * 1000000);
      
      // If using a custom seed, validate it
      if (useCustomSeed && isNaN(currentSeed)) {
        throw new Error('Invalid seed value. Please enter a number.');
      }
      
      // Save the seed we're using
      if (!useCustomSeed) {
        setSeed(currentSeed);
      }
      
      const response = await fetch('/api/maze/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          width,
          height,
          difficulty,
          seed: currentSeed
        }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate maze: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMazeData(data);
      
      // Track maze generation in history
      setMazeHistory(prev => [
        ...prev, 
        { 
          id: data.id, 
          difficulty, 
          timestamp: Date.now(),
          seed: currentSeed,
          completed: false 
        }
      ].slice(-10)); // Keep only last 10 mazes
    } catch (err) {
      console.error('Error generating maze:', err);
      setError(err.message || 'Failed to generate maze');
    } finally {
      setLoading(false);
    }
  }, [difficulty, width, height, customSeed]);
  
  // Initialize with a maze, using the initialSeed if provided
  useEffect(() => {
    if (initialSeed) {
      setCustomSeed(initialSeed);
      generateMaze(true);
    } else {
      generateMaze();
    }
  }, [generateMaze, initialSeed]);
  
  // Handle maze completion
  const handleMazeSolved = async (solutionData) => {
    const { path, solutionTime, wallCollisions, interactionData, movementData } = solutionData;
    
    // Create stats object
    const stats = {
      mazeId: mazeData.id,
      difficulty,
      solutionTime,
      wallCollisions,
      pathLength: path.length,
      completedAt: new Date().toISOString(),
      seed: seed // Include the seed in the stats
    };
    
    setSolutionStats(stats);
    setShowStats(true);
    
    // Update maze history
    setMazeHistory(prev => 
      prev.map(maze => 
        maze.id === mazeData.id 
          ? { ...maze, completed: true, solutionTime }
          : maze
      )
    );
    
    // Send solution data to API if user is authenticated
    if (isAuthenticated && trackData) {
      try {
        // Include movement and interaction data if tracking is enabled
        const trackingData = trackData ? {
          interactionData,
          movementData: movementData.slice(0, 1000) // Limit data size
        } : {};
        
        const response = await fetch('/api/maze/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mazeId: mazeData.id,
            path,
            solutionTime,
            wallCollisions,
            seed,
            ...trackingData
          }),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`Failed to submit solution: ${response.statusText}`);
        }
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete(stats);
        }
      } catch (err) {
        console.error('Error submitting solution:', err);
        setError(`Failed to submit solution: ${err.message}`);
      }
    } else if (onComplete) {
      onComplete(stats);
    }
  };
  
  // Track user interactions with the maze
  const handleMazeInteraction = async (interactionData) => {
    // Only send interaction data if authenticated and tracking is enabled
    if (!isAuthenticated || !trackData) return;
    
    // Don't send every interaction to reduce API calls
    // Only send for significant events
    if (['complete', 'start'].includes(interactionData.type)) {
      try {
        await fetch('/api/maze/interaction', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mazeId: mazeData.id,
            interaction: interactionData
          }),
          credentials: 'include'
        });
      } catch (err) {
        console.error('Error sending interaction data:', err);
      }
    }
  };
  
  // Share the current maze
  const handleShare = () => {
    if (onShare && seed) {
      onShare(seed, difficulty);
    }
  };
  
  // Function to increase difficulty
  const increaseDifficulty = () => {
    setDifficulty(prev => Math.min(prev + 1, 5));
  };
  
  // Function to decrease difficulty
  const decreaseDifficulty = () => {
    setDifficulty(prev => Math.max(prev - 1, 1));
  };
  
  // Toggle seed option
  const toggleSeedOption = () => {
    setUseSeed(!useSeed);
  };
  
  // Handle custom seed input change
  const handleSeedChange = (e) => {
    setCustomSeed(e.target.value);
  };
  
  // Generate maze with the same seed
  const regenerateWithSameSeed = () => {
    generateMaze(true);
  };
  
  // Regenerate current maze
  const regenerateCurrentMaze = () => {
    if (useSeed && customSeed) {
      regenerateWithSameSeed();
    } else {
      generateMaze();
    }
  };
  
  return (
    <div className={styles.mazeGeneratorContainer}>
      <div className={styles.mazeControls}>
        <div className={styles.difficultyControls}>
          <Button 
            onClick={decreaseDifficulty}
            className={styles.difficultyButton}
            disabled={difficulty <= 1}
            variant="tertiary"
            size="small"
          >
            -
          </Button>
          <span className={styles.difficultyLabel}>
            Difficulty: {difficulty}
          </span>
          <Button 
            onClick={increaseDifficulty}
            className={styles.difficultyButton}
            disabled={difficulty >= 5}
            variant="tertiary"
            size="small"
          >
            +
          </Button>
        </div>
        <div className={styles.controlButtons}>
          <Button 
            onClick={regenerateCurrentMaze} 
            className={styles.generateButton}
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Generating...' : 'Generate New Maze'}
          </Button>
          
          {onShare && (
            <Button 
              onClick={handleShare}
              className={styles.shareButton}
              disabled={loading || !mazeData}
              variant="secondary"
            >
              Share Maze
            </Button>
          )}
        </div>
      </div>
      
      <div className={styles.seedControls}>
        <div className={styles.seedToggle}>
          <input 
            type="checkbox" 
            id="useSeed" 
            checked={useSeed} 
            onChange={toggleSeedOption}
            className={styles.seedCheckbox}
          />
          <label htmlFor="useSeed" className={styles.seedLabel}>
            Use Custom Seed
          </label>
        </div>
        
        {useSeed && (
          <div className={styles.seedInputWrapper}>
            <input 
              type="text" 
              value={customSeed} 
              onChange={handleSeedChange}
              placeholder="Enter seed number" 
              className={styles.seedInput}
            />
            <Button 
              onClick={regenerateWithSameSeed}
              className={styles.seedButton}
              disabled={!customSeed || loading}
              variant="primary"
              size="small"
            >
              Generate
            </Button>
          </div>
        )}
        
        {!useSeed && mazeData && (
          <div className={styles.currentSeed}>
            <span>Current Seed: {seed}</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className={styles.error}>{error}</div>
      )}
      
      {mazeData ? (
        <Maze 
          mazeData={mazeData}
          difficulty={difficulty}
          onSolve={handleMazeSolved}
          onInteraction={handleMazeInteraction}
          trackMovement={trackData}
        />
      ) : loading ? (
        <div className={styles.loading}>Generating maze...</div>
      ) : null}
      
      {showStats && solutionStats && (
        <div className={styles.solutionStats}>
          <h3>Maze Completed!</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Time:</div>
              <div className={styles.statValue}>{solutionStats.solutionTime.toFixed(2)}s</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Path Length:</div>
              <div className={styles.statValue}>{solutionStats.pathLength}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Wall Collisions:</div>
              <div className={styles.statValue}>{solutionStats.wallCollisions}</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statLabel}>Difficulty:</div>
              <div className={styles.statValue}>{solutionStats.difficulty}</div>
            </div>
          </div>
          <div className={styles.seedInfo}>
            <span className={styles.seedValue}>Maze Seed: {solutionStats.seed}</span>
            {onShare && (
              <Button 
                onClick={() => onShare(solutionStats.seed, solutionStats.difficulty)}
                className={styles.shareSolutionButton}
                variant="secondary"
                size="small"
              >
                Share This Maze
              </Button>
            )}
          </div>
          <div className={styles.actionButtons}>
            <Button 
              onClick={() => {
                setShowStats(false);
                generateMaze();
              }}
              className={styles.generateButton}
              variant="primary"
            >
              New Maze
            </Button>
            <Button 
              onClick={() => setShowStats(false)}
              className={styles.closeButton}
              variant="tertiary"
            >
              Close
            </Button>
          </div>
        </div>
      )}
      
      {mazeHistory.length > 0 && (
        <div className={styles.mazeHistory}>
          <h3>Recent Mazes</h3>
          <div className={styles.historyList}>
            {mazeHistory.map((maze, index) => (
              <div key={index} className={styles.historyItem}>
                <div className={styles.historyInfo}>
                  <div className={styles.historyDifficulty}>
                    Level {maze.difficulty}
                  </div>
                  <div className={styles.historySeed}>
                    Seed: {maze.seed}
                  </div>
                </div>
                <div className={styles.historyStatus}>
                  {maze.completed ? (
                    <span className={styles.completed}>
                      Solved in {maze.solutionTime.toFixed(2)}s
                    </span>
                  ) : (
                    <span className={styles.incomplete}>Incomplete</span>
                  )}
                </div>
                <div className={styles.historyActions}>
                  <div className={styles.historyTime}>
                    {new Date(maze.timestamp).toLocaleTimeString()}
                  </div>
                  {onShare && (
                    <Button 
                      onClick={() => onShare(maze.seed, maze.difficulty)}
                      className={styles.historyShareButton}
                      title="Share this maze"
                      variant="secondary"
                      size="small"
                    >
                      <span className={styles.shareIcon}>↗</span> Share
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

MazeGenerator.propTypes = {
  initialDifficulty: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  onComplete: PropTypes.func,
  trackData: PropTypes.bool,
  initialSeed: PropTypes.string,
  onShare: PropTypes.func
};

export default MazeGenerator;