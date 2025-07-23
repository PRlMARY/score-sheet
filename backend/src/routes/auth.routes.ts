import { Router } from 'express';
import { signUp, signIn, signOut, checkAuth, getMe, refreshUserSession } from '../controllers/auth.controller';
import { authenticateSession, optionalAuthentication } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);

// Protected routes
router.get('/me', authenticateSession, getMe);
router.post('/refresh', authenticateSession, refreshUserSession);

// Optional authentication (for checking auth status)
router.get('/check', optionalAuthentication, checkAuth);

export default router;
