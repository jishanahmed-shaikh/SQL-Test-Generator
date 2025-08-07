// Global stats API endpoint for Vercel
import { promises as fs } from 'fs';
import path from 'path';

// Simple file-based storage (you can replace with a database later)
const STATS_FILE = '/tmp/global-stats.json';

// Default stats structure
const DEFAULT_STATS = {
  totalGenerated: 0,
  goodFeedback: 0,
  badFeedback: 0,
  users: {},
  lastUpdated: new Date().toISOString()
};

// Read stats from file
async function readStats() {
  try {
    const data = await fs.readFile(STATS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return default stats
    return { ...DEFAULT_STATS };
  }
}

// Write stats to file
async function writeStats(stats) {
  stats.lastUpdated = new Date().toISOString();
  await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2));
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const stats = await readStats();

    if (req.method === 'GET') {
      // Return global stats
      return res.status(200).json({
        totalGenerated: stats.totalGenerated,
        goodFeedback: stats.goodFeedback,
        badFeedback: stats.badFeedback,
        totalUsers: Object.keys(stats.users).length,
        lastUpdated: stats.lastUpdated
      });
    }

    if (req.method === 'POST') {
      const { action, userId, count = 1 } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // Initialize user if doesn't exist
      if (!stats.users[userId]) {
        stats.users[userId] = {
          totalGenerated: 0,
          goodFeedback: 0,
          badFeedback: 0,
          firstSeen: new Date().toISOString(),
          lastSeen: new Date().toISOString()
        };
      }

      // Update user's last seen
      stats.users[userId].lastSeen = new Date().toISOString();

      // Handle different actions
      switch (action) {
        case 'generated':
          stats.totalGenerated += count;
          stats.users[userId].totalGenerated += count;
          break;
        case 'good_feedback':
          stats.goodFeedback += 1;
          stats.users[userId].goodFeedback += 1;
          break;
        case 'bad_feedback':
          stats.badFeedback += 1;
          stats.users[userId].badFeedback += 1;
          break;
        case 'clear_all':
          // Admin action to clear all stats
          const adminPasscode = req.body.passcode;
          if (adminPasscode !== '1072025') {
            return res.status(403).json({ error: 'Invalid passcode' });
          }
          Object.assign(stats, DEFAULT_STATS);
          break;
        default:
          return res.status(400).json({ error: 'Invalid action' });
      }

      await writeStats(stats);

      return res.status(200).json({
        success: true,
        globalStats: {
          totalGenerated: stats.totalGenerated,
          goodFeedback: stats.goodFeedback,
          badFeedback: stats.badFeedback,
          totalUsers: Object.keys(stats.users).length
        },
        userStats: stats.users[userId]
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}