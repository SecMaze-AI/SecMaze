import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MazeGenerator from '../components/MazeGenerator';
import styles from '../styles/MazePage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { generateShareLinks, copyToClipboard, generateMazeShareUrl } from '../utils/shareHelpers';
import { Button, SocialIcon, MazeStats } from '../components/ui';
import { Maze } from '../components';

/**
 * Maze page component that hosts the maze challenge
 */
const MazePage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [completedMazes, setCompletedMazes] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [initialSeed, setInitialSeed] = useState(null);
  const [initialDifficulty, setInitialDifficulty] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  // Add state for current shared maze
  const [currentSharedMaze, setCurrentSharedMaze] = useState({
    seed: null,
    difficulty: null
  });
  const [shareLinks, setShareLinks] = useState({});
  
  // Parse query parameters for seed and difficulty
  useEffect(() => {
    if (router.isReady) {
      const { seed, difficulty } = router.query;
      
      if (seed) {
        setInitialSeed(seed);
      }
      
      if (difficulty) {
        const diffLevel = parseInt(difficulty, 10);
        if (!isNaN(diffLevel) && diffLevel >= 1 && diffLevel <= 5) {
          setInitialDifficulty(diffLevel);
        }
      }
    }
  }, [router.isReady, router.query]);
  
  // Handle maze completion
  const handleMazeComplete = (stats) => {
    setCompletedMazes(prev => prev + 1);
    setTotalTime(prev => prev + stats.solutionTime);
    
    // Show login prompt after completing a maze if not logged in
    if (!isAuthenticated && completedMazes >= 2) {
      setShowLoginPrompt(true);
    }
  };
  
  // Open share modal with the current maze seed
  const handleShareMaze = (seed, difficulty) => {
    // Create shareable URL using helper function
    const shareableUrl = generateMazeShareUrl(seed, difficulty);
    
    // Generate social media sharing links
    const links = generateShareLinks(shareableUrl, {
      seed,
      difficulty,
      hashtags: 'secmaze,maze,challenge'
    });
    
    setShareUrl(shareableUrl);
    setShareLinks(links);
    setCurrentSharedMaze({
      seed: seed,
      difficulty: difficulty
    });
    setShowShareModal(true);
  };
  
  // Copy share URL to clipboard using helper function
  const handleCopyToClipboard = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopySuccess(true);
      
      // Reset copy success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };
  
  // Calculate average completion time
  const getAverageTime = () => {
    if (completedMazes === 0) return 0;
    return (totalTime / completedMazes).toFixed(2);
  };
  
  return (
    <>
      <Head>
        <title>SecMaze Challenge | Solve Security Mazes</title>
        <meta name="description" content="Test your security analysis skills by navigating through our adaptive security maze challenges." />
      </Head>
      
      <div className={styles.mazePage}>
        <header className={styles.header}>
          <Link href="/" className={styles.logo}>
            SecMaze
          </Link>
          
          <h1 className={styles.pageTitle}>Security Maze Challenge</h1>
          
          <div className={styles.userSection}>
            {!isLoading && (
              isAuthenticated ? (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user.username}</span>
                  <Link href="/dashboard" className={styles.dashboardLink}>
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className={styles.authLinks}>
                  <Link href="/login" className={styles.loginLink}>
                    Login
                  </Link>
                  <Link href="/register" className={styles.registerLink}>
                    Register
                  </Link>
                </div>
              )
            )}
          </div>
        </header>
        
        <main className={styles.main}>
          <section className={styles.mazeSection}>
            {showLoginPrompt && !isAuthenticated && (
              <div className={styles.loginPrompt}>
                <h3>Enjoying the challenge?</h3>
                <p>
                  Create an account to track your progress, earn rewards,
                  and access more advanced security mazes.
                </p>
                <div className={styles.promptButtons}>
                  <button 
                    onClick={() => router.push('/register')}
                    className={styles.registerButton}
                  >
                    Create Account
                  </button>
                  <button 
                    onClick={() => setShowLoginPrompt(false)}
                    className={styles.dismissButton}
                  >
                    Continue as Guest
                  </button>
                </div>
              </div>
            )}
            
            <div className={styles.mazeContainer}>
              <MazeGenerator 
                initialDifficulty={initialDifficulty || (isAuthenticated ? 2 : 1)}
                onComplete={handleMazeComplete}
                trackData={isAuthenticated}
                initialSeed={initialSeed}
                onShare={handleShareMaze}
              />
            </div>
            
            <MazeStats 
              userData={user}
              mazeData={{ difficulty: initialDifficulty, seed: initialSeed }}
              isAuthenticated={isAuthenticated}
              onRefresh={() => console.log('Refreshing stats...')}
            />
            
            <div className={styles.mazeInfo}>
              <h2>About SecMaze Challenge</h2>
              <p>
                Each maze represents a security challenge. Navigate through the maze 
                using arrow keys, WASD, or by clicking on adjacent cells. The movement 
                patterns you use are analyzed by our machine learning engine to detect 
                unusual behaviors that might indicate automated solvers.
              </p>
              <p>
                As you progress, the mazes become more complex, reflecting the increasingly 
                sophisticated nature of modern security threats. Can you solve them efficiently 
                while avoiding detection?
              </p>
              
              {completedMazes > 0 && (
                <div className={styles.userStats}>
                  <h3>Your Progress</h3>
                  <div className={styles.statsGrid}>
                    <div className={styles.statBlock}>
                      <div className={styles.statValue}>{completedMazes}</div>
                      <div className={styles.statLabel}>Mazes Completed</div>
                    </div>
                    <div className={styles.statBlock}>
                      <div className={styles.statValue}>{getAverageTime()}s</div>
                      <div className={styles.statLabel}>Avg. Completion Time</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
          
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3>How It Works</h3>
              <ol className={styles.stepsList}>
                <li>Generate a maze with your chosen difficulty level</li>
                <li>Navigate through the maze to find the exit</li>
                <li>Your movements are analyzed for patterns</li>
                <li>Complete mazes to earn points and advance in difficulty</li>
                <li>Unlock rewards based on your performance</li>
              </ol>
            </div>
            
            <div className={styles.sidebarCard}>
              <h3>Benefits of Registration</h3>
              <ul className={styles.benefitsList}>
                <li>Track your progress across sessions</li>
                <li>Access advanced difficulty levels</li>
                <li>Earn SecMaze tokens for successful completions</li>
                <li>Submit your own maze challenges</li>
                <li>Join the global leaderboard</li>
              </ul>
              
              {!isAuthenticated && (
                <Link href="/register" className={styles.sidebarCta}>
                  Create Free Account
                </Link>
              )}
            </div>
            
            {isAuthenticated && (
              <div className={styles.sidebarCard}>
                <h3>Next Steps</h3>
                <p>
                  Now that you're logged in, try advancing to higher difficulty 
                  levels or check your dashboard to see detailed stats about 
                  your maze-solving patterns.
                </p>
                <Link href="/dashboard" className={styles.sidebarCta}>
                  View Dashboard
                </Link>
              </div>
            )}
          </aside>
        </main>
        
        <footer className={styles.footer}>
          <div className={styles.footerLinks}>
            <Link href="/about">About</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </div>
          <div className={styles.copyright}>
            &copy; {new Date().getFullYear()} SecMaze. All rights reserved.
          </div>
        </footer>
        
        {/* Share Maze Modal */}
        {showShareModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Share this Maze</h3>
              <p>Challenge your friends with the same maze configuration:</p>
              
              <div className={styles.shareUrlContainer}>
                <input 
                  type="text" 
                  readOnly 
                  value={shareUrl} 
                  className={styles.shareUrlInput}
                />
                <Button 
                  onClick={handleCopyToClipboard} 
                  className={styles.copyButton}
                  variant="tertiary"
                  size="small"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              
              <div className={styles.shareInfo}>
                <div className={styles.shareDetails}>
                  <span className={styles.shareSeedInfo}>Maze Seed: {currentSharedMaze.seed}</span>
                  <span className={styles.shareDifficultyInfo}>Difficulty: {currentSharedMaze.difficulty}</span>
                </div>
              </div>
              
              <div className={styles.socialShare}>
                <a 
                  href={shareLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.twitterShare}
                  aria-label="Share on Twitter"
                >
                  <SocialIcon type="twitter" /> Share on Twitter
                </a>
                
                <a 
                  href={shareLinks.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.facebookShare}
                  aria-label="Share on Facebook"
                >
                  <SocialIcon type="facebook" /> Share on Facebook
                </a>
                
                <a 
                  href={shareLinks.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.whatsappShare}
                  aria-label="Share on WhatsApp"
                >
                  <SocialIcon type="whatsapp" /> Share on WhatsApp
                </a>
                
                <a 
                  href={shareLinks.linkedin} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.linkedinShare}
                  aria-label="Share on LinkedIn"
                >
                  <SocialIcon type="linkedin" /> Share on LinkedIn
                </a>
                
                <a 
                  href={shareLinks.email} 
                  rel="noopener noreferrer"
                  className={styles.emailShare}
                  aria-label="Share via Email"
                >
                  <SocialIcon type="email" /> Share via Email
                </a>
              </div>
              
              <Button 
                onClick={() => setShowShareModal(false)} 
                className={styles.closeModalButton}
                variant="tertiary"
                fullWidth
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MazePage; 