import { Router } from 'express';
import { getSession } from '../middleware/session.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// GET /api/stats — dashboard stats
router.get('/stats', (req, res) => {
  const session = req.session;
  const { attempts, passed, problemHistory } = session;

  // Count total problems from catalog
  let totalProblems = 0;
  try {
    const data = JSON.parse(readFileSync(join(__dirname, '..', 'data', 'problems.json'), 'utf-8'));
    totalProblems = data.length;
  } catch { totalProblems = 0; }

  const solved = problemHistory.filter(p => p.solved).length;
  const passRate = attempts > 0 ? Math.round((passed / attempts) * 100) : 0;

  // Weekly: count attempts in last 7 days (simplified — session is in-memory so we count all)
  const weekly = attempts;

  // Streak: simplified — count consecutive days with attempts (placeholder)
  const streak = solved > 0 ? Math.min(solved, 7) : 0;

  return res.json({ solved, passRate, weekly, streak, totalProblems });
});

// GET /api/session/:id/summary — full session analytics
router.get('/session/:id/summary', async (req, res) => {
  const session = await getSession(req.params.id);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const { id, attempts, passed, failed, failureCategories, problemHistory } = session;

  const totalFailures = Object.values(failureCategories).reduce((a, b) => a + b, 0);
  
  const failureDistribution = {};
  if (totalFailures > 0) {
    for (const [category, count] of Object.entries(failureCategories)) {
      failureDistribution[category] = {
        count,
        percentage: Math.round((count / totalFailures) * 100),
      };
    }
  }

  return res.json({
    id,
    totalAttempts: attempts,
    passed,
    failed,
    passRate: attempts > 0 ? Math.round((passed / attempts) * 100) : 0,
    failureCategories,
    failureDistribution,
    problemHistory,
    problemsAttempted: problemHistory.length,
    problemsSolved: problemHistory.filter(p => p.solved).length,
  });
});

export default router;
