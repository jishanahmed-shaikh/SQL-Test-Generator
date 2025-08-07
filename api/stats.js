// Optimized Global Stats API for Vercel
import { promises as fs } from 'fs';

// Persistent storage location
const STATS_FILE = '/tmp/global-stats.json';
const ADMIN_PASSCODE = '1072025';

// Default stats structure
const DEFAULT_STATS = {
  totalGenerated: 0,
  goodFeedback: 0,
  badFeedback: 0,
  users: {},
  lastUpdated: new Date().toISOString(),
  version: '1.0'
};

// Atomic file operations with error handling
async function readStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    const stats = JSON.parse(data);
    
    // Ensure all required fields exist
    return {
      ...DEFAULT_STATS,
      ...stats,
      users: stats.users || {}
    };
  } catch (error) {
    console.log('Creating new stats file');
    return { ...DEFAULT_STATS };
  }
}

async function writeStats(stats) {
  try {
    stats.lastUpdated = new Date().toISOString();
    const tempFile = `${STATS_FILE}.tmp`;
    
    // Write to temp file first, then rename (atomic operation)
    await fs.writeFile(tempFile, JSON.stringify(stats, null, 2));
    await fs.rename(tempFile, STATS_FILE);
  } catch (error) {
    console.error('Error writing stats:', error);
    throw error;
  }
}

// Validate user ID format
function isValidUserId(userId) {
  return typeof userId === 'string' && 
         userId.length >= 8 && 
         userId.length <= 50 && 
         /^[a-zA-Z0-9-_]+$/.test(userId);
}

export default async function handler(req, res) {
  // Security headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const stats = await readStats();

    // GET: Return global stats (public endpoint)
    if (req.method === 'GET') {
      return res.status(200).json({
        totalGenerated: stats.totalGenerated || 0,
        goodFeedback: stats.goodFeedback || 0,
        badFeedback: stats.badFeedback || 0,
        totalUsers: Object.keys(stats.users || {}).length,
        lastUpdated: stats.lastUpdated,
        status: 'active'
      });
    }

    // POST: Update stats
    if (req.method === 'POST') {
      const { action, userId, count = 1, passcode } = req.body;

      // Validate required fields
      if (!action) {
        return res.status(400).json({ 
          error: 'Missing action',
          message: 'Action field is required'
        });
      }

      // Validate user ID for non-admin actions
      if (action !== 'clear_all' && !isValidUserId(userId)) {
        return res.status(400).json({ 
          error: 'Invalid userId',
          message: 'User ID must be 8-50 characters, alphanumeric with dashes/underscores'
        });
      }

      // Initialize user if doesn't exist
      if (userId && !stats.users[userId]) {
        stats.users[userId] = {
          totalGenerated: 0,
          goodFeedback: 0,
          badFeedback: 0,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        };
      }

      // Update user's last seen timestamp
      if (userId && stats.users[userId]) {
        stats.users[userId].lastSeen = new Date().toISOString();
      }

      // Handle different actions
      switch (action) {
        case 'generated':
          const questionCount = Math.max(1, Math.min(count || 1, 10)); // Clamp 1-10
          stats.totalGenerated += questionCount;
          if (userId) stats.users[userId].totalGenerated += questionCount;
          break;

        case 'good_feedback':
          stats.goodFeedback += 1;
          if (userId) stats.users[userId].goodFeedback += 1;
          break;

        case 'bad_feedback':
          stats.badFeedback += 1;
          if (userId) stats.users[userId].badFeedback += 1;
          break;

        case 'clear_all':
          // Admin-only action
          if (passcode !== ADMIN_PASSCODE) {
            return res.status(403).json({ 
              error: 'Access denied',
              message: 'Invalid admin passcode'
            });
          }
          Object.assign(stats, { ...DEFAULT_STATS, users: {} });
          break;

        default:
          return res.status(400).json({ 
            error: 'Invalid action',
            message: 'Supported actions: generated, good_feedback, bad_feedback, clear_all'
          });
      }

      // Save updated stats
      await writeStats(stats);

      // Return success response
      return res.status(200).json({
        success: true,
        action: action,
        globalStats: {
          totalGenerated: stats.totalGenerated,
          goodFeedback: stats.goodFeedback,
          badFeedback: stats.badFeedback,
          totalUsers: Object.keys(stats.users).length
        },
        userStats: userId ? stats.users[userId] : null,
        timestamp: new Date().toISOString()
      });
    }

    // Method not allowed
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET and POST methods are supported'
    });

  } catch (error) {
    console.error('Stats API error:', error.message);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process request'
    });
  }
}