import type { Request, Response, NextFunction } from 'express';
import { getSession } from '../utils/session';
import { User } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const authenticateSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.status(401).json({ message: 'No session found' });
    }

    const session = getSession(sessionId);
    if (!session) {
      res.clearCookie('sessionId');
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Get user from database
    const user = await User.findById(session.userId);
    if (!user) {
      res.clearCookie('sessionId');
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request object
    req.user = {
      id: user._id.toString(),
      username: user.username,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const optionalAuthentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (sessionId) {
      const session = getSession(sessionId);
      if (session) {
        // Get user from database
        const user = await User.findById(session.userId);
        if (user) {
          req.user = {
            id: user._id.toString(),
            username: user.username,
          };
        }
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue even if authentication fails
  }
};
