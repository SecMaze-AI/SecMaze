/**
 * SecMaze - Bot Detection Machine Learning Module
 * 
 * This module implements the machine learning algorithms used 
 * to identify automated bots based on behavior patterns.
 */

class BotDetector {
  /**
   * Create a new bot detector
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      threshold: 0.7, // Detection threshold (0-1)
      features: [
        'movementPatterns',
        'interactionTiming',
        'navigationFlow',
        'browserFingerprint',
        'mazeInteraction',
        'patternRecognition',  // New feature
        'behavioralAnalysis'   // New feature
      ],
      featureWeights: {
        movementPatterns: 0.20,
        interactionTiming: 0.15,
        navigationFlow: 0.15,
        browserFingerprint: 0.15,
        mazeInteraction: 0.15,
        patternRecognition: 0.10,  // New feature weight
        behavioralAnalysis: 0.10    // New feature weight
      },
      ...options
    };
    
    this.model = null;
    this.signatures = [];
    this.initialized = false;
    this.lastUpdated = Date.now();
  }
  
  /**
   * Initialize the detector with pre-trained model data
   * @param {Object} modelData - Pre-trained model data
   * @returns {Promise<boolean>} Success status
   */
  async initialize(modelData = null) {
    try {
      if (modelData) {
        // Load provided model data
        this.model = modelData;
      } else {
        // Load default model (this would typically fetch from a server or local storage)
        this.model = this._getDefaultModel();
      }
      
      // Load bot signatures
      await this._loadSignatures();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize bot detector:', error);
      return false;
    }
  }
  
  /**
   * Get the default detection model
   * @returns {Object} Default model data
   * @private
   */
  _getDefaultModel() {
    // In a real implementation, this would return an actual ML model
    // For this prototype, we'll use a simple rule-based approach
    return {
      type: 'rule-based',
      rules: [
        {
          feature: 'movementPatterns',
          condition: 'linearMovement',
          threshold: 0.8,
          weight: 0.25
        },
        {
          feature: 'interactionTiming',
          condition: 'consistentTiming',
          threshold: 0.9,
          weight: 0.20
        },
        {
          feature: 'browserFingerprint',
          condition: 'knownBotFingerprint',
          threshold: 0.7,
          weight: 0.15
        },
        {
          feature: 'mazeInteraction',
          condition: 'unnaturalSolving',
          threshold: 0.85,
          weight: 0.20
        },
        {
          feature: 'patternRecognition',
          condition: 'repeatedPatterns',
          threshold: 0.75,
          weight: 0.10
        },
        {
          feature: 'behavioralAnalysis',
          condition: 'anomalousDecisionMaking',
          threshold: 0.80,
          weight: 0.10
        }
      ]
    };
  }
  
  /**
   * Load known bot signatures from the database
   * @returns {Promise<void>}
   * @private
   */
  async _loadSignatures() {
    // In a production system, this would load from a database
    // For this prototype, we'll use hard-coded signatures
    this.signatures = [
      {
        id: 'sig-001',
        name: 'Generic Web Scraper',
        fingerprint: {
          userAgent: /bot|crawler|spider|scraper/i,
          headers: ['x-requested-with'],
          jsFeatures: {
            canvas: false,
            webgl: false
          }
        },
        behaviorPatterns: {
          clickRatio: 0.1,
          movementVariance: 0.05,
          interactionDelay: 50 // milliseconds
        }
      },
      {
        id: 'sig-002',
        name: 'Headless Browser',
        fingerprint: {
          userAgent: /headless|phantom|puppet|selenium/i,
          jsFeatures: {
            touchSupport: false,
            audioContext: false
          }
        },
        behaviorPatterns: {
          linearMovement: true,
          consistentTiming: true
        }
      }
    ];
    
    console.log(`Loaded ${this.signatures.length} bot signatures`);
  }
  
  /**
   * Analyze session data to detect if it's a bot
   * @param {Object} session - Session data containing user behavior
   * @returns {Object} Detection result with confidence score and reasoning
   */
  analyze(session) {
    if (!this.initialized) {
      throw new Error('Bot detector not initialized. Call initialize() first.');
    }
    
    const features = this._extractFeatures(session);
    const scores = this._scoreFeatures(features);
    
    // Calculate weighted score
    let weightedScore = 0;
    let totalWeight = 0;
    
    for (const feature in scores) {
      const weight = this.options.featureWeights[feature] || 0.1;
      weightedScore += scores[feature] * weight;
      totalWeight += weight;
    }
    
    const normalizedScore = totalWeight > 0 ? weightedScore / totalWeight : 0;
    const isBot = normalizedScore >= this.options.threshold;
    
    // Generate reasoning
    const reasoning = this._generateReasoning(scores, normalizedScore);
    
    return {
      isBot,
      score: normalizedScore,
      confidence: Math.abs((normalizedScore - 0.5) * 2), // Convert to 0-1 confidence
      features: scores,
      reasoning,
      timestamp: Date.now()
    };
  }
  
  /**
   * Extract feature data from session
   * @param {Object} session - Session data
   * @returns {Object} Extracted features
   * @private
   */
  _extractFeatures(session) {
    const features = {};
    
    // Extract movement patterns
    features.movementPatterns = this._analyzeMovementPatterns(session.movements || []);
    
    // Extract interaction timing
    features.interactionTiming = this._analyzeInteractionTiming(session.interactions || []);
    
    // Extract navigation flow
    features.navigationFlow = this._analyzeNavigationFlow(session.pageViews || []);
    
    // Extract browser fingerprint
    features.browserFingerprint = this._analyzeBrowserFingerprint(session.fingerprint || {});
    
    // Extract maze interaction
    features.mazeInteraction = this._analyzeMazeInteraction(session.mazeInteraction || {});
    
    // New features
    features.patternRecognition = this._analyzePatterns(session);
    features.behavioralAnalysis = this._analyzeBehavior(session);
    
    return features;
  }
  
  /**
   * Analyze mouse/touch movement patterns
   * @param {Array} movements - Movement data points
   * @returns {Object} Movement analysis
   * @private
   */
  _analyzeMovementPatterns(movements) {
    if (!movements.length) {
      return { score: 0.9 }; // No movements is suspicious
    }
    
    // Check for linear/straight movements (common in bots)
    let linearSegments = 0;
    
    for (let i = 2; i < movements.length; i++) {
      const p1 = movements[i - 2];
      const p2 = movements[i - 1];
      const p3 = movements[i];
      
      // Check if three points form approximately a straight line
      const dx1 = p2.x - p1.x;
      const dy1 = p2.y - p1.y;
      const dx2 = p3.x - p2.x;
      const dy2 = p3.y - p2.y;
      
      // Calculate angles and compare
      const angle1 = Math.atan2(dy1, dx1);
      const angle2 = Math.atan2(dy2, dx2);
      const angleDiff = Math.abs(angle1 - angle2);
      
      if (angleDiff < 0.1 || Math.abs(angleDiff - Math.PI) < 0.1) {
        linearSegments++;
      }
    }
    
    const linearRatio = movements.length > 2 ? linearSegments / (movements.length - 2) : 0;
    
    // Check for consistent movement speeds (common in bots)
    const speeds = [];
    for (let i = 1; i < movements.length; i++) {
      const p1 = movements[i - 1];
      const p2 = movements[i];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const time = p2.timestamp - p1.timestamp;
      const speed = time > 0 ? distance / time : 0;
      speeds.push(speed);
    }
    
    // Calculate speed variance (low variance suggests bot)
    let speedSum = 0;
    for (const speed of speeds) {
      speedSum += speed;
    }
    const speedAvg = speeds.length > 0 ? speedSum / speeds.length : 0;
    
    let speedVarSum = 0;
    for (const speed of speeds) {
      speedVarSum += Math.pow(speed - speedAvg, 2);
    }
    const speedVariance = speeds.length > 0 ? speedVarSum / speeds.length : 0;
    const normalizedVariance = Math.min(1, speedVariance / 0.01);
    
    // Combine factors (low variance and high linearity suggest bot)
    const movementScore = 0.7 * linearRatio + 0.3 * (1 - normalizedVariance);
    
    return {
      score: movementScore,
      linearRatio,
      speedVariance: normalizedVariance
    };
  }
  
  /**
   * Analyze interaction timing patterns
   * @param {Array} interactions - Interaction events with timestamps
   * @returns {Object} Timing analysis
   * @private
   */
  _analyzeInteractionTiming(interactions) {
    if (!interactions.length) {
      return { score: 0.7 }; // No interactions is somewhat suspicious
    }
    
    // Calculate intervals between interactions
    const intervals = [];
    for (let i = 1; i < interactions.length; i++) {
      intervals.push(interactions[i].timestamp - interactions[i - 1].timestamp);
    }
    
    // Check for consistent intervals (bots often have very consistent timing)
    let intervalSum = 0;
    for (const interval of intervals) {
      intervalSum += interval;
    }
    const avgInterval = intervals.length > 0 ? intervalSum / intervals.length : 0;
    
    let varianceSum = 0;
    for (const interval of intervals) {
      varianceSum += Math.pow(interval - avgInterval, 2);
    }
    const variance = intervals.length > 0 ? varianceSum / intervals.length : 0;
    const normalizedVariance = Math.min(1, variance / (avgInterval * avgInterval));
    
    // Check for superhuman speed (too fast interactions)
    const tooFastInteractions = intervals.filter(interval => interval < 50).length;
    const fastRatio = intervals.length > 0 ? tooFastInteractions / intervals.length : 0;
    
    // Combine factors
    const timingScore = 0.5 * (1 - normalizedVariance) + 0.5 * fastRatio;
    
    return {
      score: timingScore,
      intervalVariance: normalizedVariance,
      fastRatio
    };
  }
  
  /**
   * Analyze navigation flow for patterns
   * @param {Array} pageViews - Page view history
   * @returns {Object} Navigation analysis
   * @private
   */
  _analyzeNavigationFlow(pageViews) {
    // Simple implementation - more sophisticated analysis would be used in production
    if (!pageViews.length) {
      return { score: 0.5 }; // Neutral if no page views
    }
    
    // Calculate time spent on each page
    const pageTimeSpent = [];
    for (let i = 1; i < pageViews.length; i++) {
      pageTimeSpent.push(pageViews[i].timestamp - pageViews[i - 1].timestamp);
    }
    
    // Very short page views are suspicious
    const shortPageViews = pageTimeSpent.filter(time => time < 1000).length;
    const shortRatio = pageTimeSpent.length > 0 ? shortPageViews / pageTimeSpent.length : 0;
    
    // Very consistent page view times are suspicious
    let timeSum = 0;
    for (const time of pageTimeSpent) {
      timeSum += time;
    }
    const avgTime = pageTimeSpent.length > 0 ? timeSum / pageTimeSpent.length : 0;
    
    let varianceSum = 0;
    for (const time of pageTimeSpent) {
      varianceSum += Math.pow(time - avgTime, 2);
    }
    const variance = pageTimeSpent.length > 0 ? varianceSum / pageTimeSpent.length : 0;
    const normalizedVariance = Math.min(1, variance / (avgTime * avgTime));
    
    // Combine factors
    const navigationScore = 0.6 * shortRatio + 0.4 * (1 - normalizedVariance);
    
    return {
      score: navigationScore,
      shortPageViewRatio: shortRatio,
      timeVariance: normalizedVariance
    };
  }
  
  /**
   * Analyze browser fingerprint for bot indicators
   * @param {Object} fingerprint - Browser and device fingerprint
   * @returns {Object} Fingerprint analysis
   * @private
   */
  _analyzeBrowserFingerprint(fingerprint) {
    // Check for known bot signatures
    for (const signature of this.signatures) {
      if (signature.fingerprint.userAgent && fingerprint.userAgent) {
        if (signature.fingerprint.userAgent.test(fingerprint.userAgent)) {
          return { score: 0.95, matchedSignature: signature.id };
        }
      }
    }
    
    // Check for inconsistencies in fingerprint
    const inconsistencies = [];
    
    // Check for browser inconsistencies
    if (fingerprint.userAgent && fingerprint.userAgent.includes('Chrome') && 
        fingerprint.navigator && !fingerprint.navigator.chrome) {
      inconsistencies.push('chrome-mismatch');
    }
    
    // Check for missing browser features
    if (fingerprint.missingFeatures) {
      const criticalFeatures = ['localStorage', 'sessionStorage', 'canvas'];
      const missingCritical = criticalFeatures.filter(f => fingerprint.missingFeatures.includes(f));
      if (missingCritical.length > 0) {
        inconsistencies.push('missing-critical-features');
      }
    }
    
    // Check for headless browser indicators
    const headlessIndicators = [
      !fingerprint.plugins || fingerprint.plugins.length === 0,
      fingerprint.navigator && fingerprint.navigator.webdriver,
      fingerprint.languages && fingerprint.languages.length === 0
    ];
    
    const headlessScore = headlessIndicators.filter(Boolean).length / headlessIndicators.length;
    
    // Calculate fingerprint score
    const fingerprintScore = Math.max(
      inconsistencies.length * 0.2,
      headlessScore
    );
    
    return {
      score: Math.min(0.9, fingerprintScore), // Cap at 0.9
      inconsistencies,
      headlessIndicators: headlessIndicators.filter(Boolean).length
    };
  }
  
  /**
   * Analyze maze interaction patterns
   * @param {Object} mazeData - Maze interaction data
   * @returns {Object} Maze interaction analysis
   * @private
   */
  _analyzeMazeInteraction(mazeData) {
    if (!mazeData || !mazeData.path || mazeData.path.length === 0) {
      return { score: 0.5 }; // Neutral if no maze data
    }
    
    // Check for direct path to solution (too efficient)
    const pathEfficiency = mazeData.optimalPathLength / mazeData.path.length;
    
    // Too efficient might be suspicious
    const efficiencyScore = pathEfficiency > 0.9 ? 0.8 : 0.3;
    
    // Check for consistent movement speed
    const pathTimes = mazeData.path.map(p => p.timestamp);
    const intervals = [];
    for (let i = 1; i < pathTimes.length; i++) {
      intervals.push(pathTimes[i] - pathTimes[i - 1]);
    }
    
    let intervalSum = 0;
    for (const interval of intervals) {
      intervalSum += interval;
    }
    const avgInterval = intervals.length > 0 ? intervalSum / intervals.length : 0;
    
    let varianceSum = 0;
    for (const interval of intervals) {
      varianceSum += Math.pow(interval - avgInterval, 2);
    }
    const variance = intervals.length > 0 ? varianceSum / intervals.length : 0;
    const normalizedVariance = Math.min(1, variance / (avgInterval * avgInterval));
    
    // Low variance is suspicious
    const varianceScore = 1 - normalizedVariance;
    
    // Check for wall collisions (bots might have none)
    const collisionScore = !mazeData.wallCollisions || mazeData.wallCollisions === 0 ? 0.7 : 0.3;
    
    // Combine factors
    const mazeScore = 0.4 * efficiencyScore + 0.4 * varianceScore + 0.2 * collisionScore;
    
    return {
      score: mazeScore,
      efficiency: pathEfficiency,
      intervalVariance: normalizedVariance,
      noCollisions: !mazeData.wallCollisions || mazeData.wallCollisions === 0
    };
  }
  
  /**
   * Analyze patterns in user interaction
   * @param {Object} session - Session data
   * @returns {Object} Pattern analysis
   * @private
   */
  _analyzePatterns(session) {
    const movements = session.movements || [];
    const interactions = session.interactions || [];
    
    if (!movements.length || !interactions.length) {
      return { score: 0.85 }; // Suspicious if no data
    }
    
    // Extract patterns from movements
    const movementPatterns = [];
    for (let i = 1; i < movements.length; i++) {
      const prev = movements[i - 1];
      const curr = movements[i];
      
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      movementPatterns.push({
        distance,
        angle,
        time: curr.timestamp - prev.timestamp
      });
    }
    
    // Check for repeated patterns
    const patternCounts = {};
    for (let i = 0; i < movementPatterns.length - 3; i++) {
      const pattern = movementPatterns.slice(i, i + 3)
        .map(p => `${Math.round(p.angle * 10)}:${Math.round(p.distance / 10)}`)
        .join('|');
      
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    }
    
    // Calculate repetition score
    const maxCount = Math.max(...Object.values(patternCounts), 0);
    const repetitionScore = movementPatterns.length > 10 
      ? maxCount / (movementPatterns.length / 3) 
      : 0.5;
    
    return {
      score: repetitionScore,
      details: {
        uniquePatterns: Object.keys(patternCounts).length,
        mostFrequentPattern: maxCount,
        totalPatterns: movementPatterns.length
      }
    };
  }
  
  /**
   * Analyze behavioral aspects of user interaction
   * @param {Object} session - Session data
   * @returns {Object} Behavioral analysis
   * @private
   */
  _analyzeBehavior(session) {
    const mazeInteractions = session.mazeInteraction || {};
    const movements = session.movements || [];
    
    // No data is suspicious
    if (!movements.length) {
      return { score: 0.9 };
    }
    
    // Check decision points - humans typically pause at junctions
    let decisionPoints = 0;
    let naturalPauses = 0;
    
    if (mazeInteractions.path && mazeInteractions.path.length > 2) {
      const path = mazeInteractions.path;
      
      for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const curr = path[i];
        const next = path[i + 1];
        
        // Identify a direction change (decision point)
        const prevDir = this._getDirection(prev, curr);
        const nextDir = this._getDirection(curr, next);
        
        if (prevDir !== nextDir) {
          decisionPoints++;
          
          // Check if there was a pause at this decision point
          const timeDiff = next.timestamp - curr.timestamp;
          if (timeDiff > 500) { // Pause threshold in ms
            naturalPauses++;
          }
        }
      }
    }
    
    // Humans tend to pause at decision points
    const pauseRatio = decisionPoints > 0 ? naturalPauses / decisionPoints : 0;
    let behaviorScore = 1 - pauseRatio; // Higher score = more bot-like
    
    // Adjust score based on additional behavioral factors
    if (session.userInteractions) {
      // Humans often hover before clicking
      const hasHoverBeforeClick = session.userInteractions.some(
        i => i.type === 'hover' && i.followed === 'click'
      );
      
      if (hasHoverBeforeClick) {
        behaviorScore *= 0.8; // Reduce bot score for natural behavior
      }
      
      // Bots often have very consistent movement speeds
      const timings = movements
        .filter((_, i) => i > 0)
        .map((m, i) => m.timestamp - movements[i].timestamp);
      
      const avgTiming = timings.reduce((sum, t) => sum + t, 0) / timings.length;
      const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgTiming, 2), 0) / timings.length;
      const standardDev = Math.sqrt(variance);
      
      // Very low standard deviation suggests bot-like behavior
      const variabilityScore = Math.min(standardDev / avgTiming, 1);
      behaviorScore = (behaviorScore + (1 - variabilityScore)) / 2;
    }
    
    return {
      score: behaviorScore,
      details: {
        decisionPoints,
        naturalPauses,
        pauseRatio
      }
    };
  }
  
  /**
   * Get direction between two points
   * @param {Object} p1 - First point
   * @param {Object} p2 - Second point
   * @returns {string} Direction
   * @private
   */
  _getDirection(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }
  
  /**
   * Score extracted features against the model
   * @param {Object} features - Extracted features
   * @returns {Object} Feature scores
   * @private
   */
  _scoreFeatures(features) {
    const scores = {};
    
    // For each feature, either use the pre-calculated score or calculate based on rules
    for (const feature in features) {
      if (features[feature].score !== undefined) {
        scores[feature] = features[feature].score;
      } else {
        // Apply model rules if no pre-calculated score
        const rules = this.model.rules.filter(r => r.feature === feature);
        if (rules.length > 0) {
          let ruleScore = 0;
          let totalWeight = 0;
          
          for (const rule of rules) {
            // Apply rule logic (simplified)
            const score = 0.5; // Default score
            ruleScore += score * rule.weight;
            totalWeight += rule.weight;
          }
          
          scores[feature] = totalWeight > 0 ? ruleScore / totalWeight : 0.5;
        } else {
          scores[feature] = 0.5; // Default neutral score
        }
      }
    }
    
    return scores;
  }
  
  /**
   * Generate human-readable reasoning for the detection result
   * @param {Object} scores - Feature scores
   * @param {number} overallScore - Overall bot detection score
   * @returns {Array} Reasoning statements
   * @private
   */
  _generateReasoning(scores, overallScore) {
    const reasoning = [];
    
    // Add overall assessment
    if (overallScore >= this.options.threshold) {
      reasoning.push(`Overall bot score (${overallScore.toFixed(2)}) exceeds threshold (${this.options.threshold})`);
    } else {
      reasoning.push(`Overall bot score (${overallScore.toFixed(2)}) is below threshold (${this.options.threshold})`);
    }
    
    // Add reasoning for each feature
    for (const feature in scores) {
      const score = scores[feature];
      const weight = this.options.featureWeights[feature] || 0.1;
      
      if (score > 0.7) {
        reasoning.push(`${feature}: High bot indicators (${score.toFixed(2)}, weight: ${weight})`);
      } else if (score > 0.4) {
        reasoning.push(`${feature}: Some bot indicators (${score.toFixed(2)}, weight: ${weight})`);
      } else {
        reasoning.push(`${feature}: Low bot indicators (${score.toFixed(2)}, weight: ${weight})`);
      }
    }
    
    return reasoning;
  }
}

module.exports = BotDetector; 