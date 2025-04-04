import React, { useState, useEffect } from 'react';
import { Card } from './ui';
import styles from '../styles/MazeStats.module.css';

/**
 * MazeStats Component
 * Displays statistical data about maze solutions and user performance
 * 
 * @param {Object} props
 * @param {Object} props.userData - Current user data
 * @param {Object} props.mazeData - Current maze data
 * @param {boolean} props.isAuthenticated - Whether user is authenticated
 * @param {function} props.onRefresh - Function to refresh stats data
 */
const MazeStats = ({ userData, mazeData, isAuthenticated, onRefresh }) => {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    successRate: 0,
    averageTime: 0,
    fastestTime: 0,
    ranking: 0,
    difficulty: mazeData?.difficulty || 1,
  });
  
  const [loading, setLoading] = useState(true);

  // Fetch stats data
  useEffect(() => {
    if (!mazeData) return;
    
    const fetchStats = async () => {
      setLoading(true);
      try {
        // In a real implementation, this would fetch from an API
        // For now, we'll simulate with dummy data
        const dummyStats = {
          totalAttempts: Math.floor(Math.random() * 100) + 50,
          successRate: Math.floor(Math.random() * 60) + 40,
          averageTime: Math.floor(Math.random() * 120) + 60,
          fastestTime: Math.floor(Math.random() * 30) + 15,
          ranking: isAuthenticated ? (Math.floor(Math.random() * 100) + 1) : null,
          difficulty: mazeData.difficulty || 1,
        };
        
        // Simulate API delay
        setTimeout(() => {
          setStats(dummyStats);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching maze statistics:', error);
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [mazeData, isAuthenticated]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={styles.statsCard}>
      <h3 className={styles.statsTitle}>Maze Statistics</h3>
      
      {loading ? (
        <div className={styles.loading}>Loading statistics...</div>
      ) : (
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Difficulty</span>
            <span className={styles.statValue}>
              {Array(stats.difficulty).fill('★').join('')}
              {Array(5 - stats.difficulty).fill('☆').join('')}
            </span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Attempts</span>
            <span className={styles.statValue}>{stats.totalAttempts}</span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Success Rate</span>
            <span className={styles.statValue}>{stats.successRate}%</span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Average Time</span>
            <span className={styles.statValue}>{formatTime(stats.averageTime)}</span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Fastest Time</span>
            <span className={styles.statValue}>{formatTime(stats.fastestTime)}</span>
          </div>
          
          {isAuthenticated && stats.ranking && (
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Your Ranking</span>
              <span className={styles.statValue}>#{stats.ranking}</span>
            </div>
          )}
        </div>
      )}
      
      <button 
        className={styles.refreshButton} 
        onClick={onRefresh}
        disabled={loading}
      >
        Refresh Stats
      </button>
      
      {!isAuthenticated && (
        <p className={styles.authPrompt}>
          Sign in to track your personal statistics and rankings!
        </p>
      )}
    </Card>
  );
};

export default MazeStats; 