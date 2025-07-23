import { Router } from 'express';
import type { Response } from 'express';
import { authenticateSession, type AuthenticatedRequest } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authenticateSession);

// Example protected route
router.get('/profile', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'This is a protected route',
    user: req.user,
  });
});

// Example protected route for dashboard
router.get('/dashboard', (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'Welcome to your dashboard',
    user: req.user,
    timestamp: new Date().toISOString(),
  });
});

export default router;
