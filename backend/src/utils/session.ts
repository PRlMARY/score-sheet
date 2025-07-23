import crypto from 'crypto';
import { User } from '../models/user.model';

export interface Session {
  sessionId: string;
  userId: string;
  expiresAt: Date;
  rememberMe: boolean;
  createdAt: Date;
}

// In-memory session storage (for demonstration - in production, use Redis or database)
const sessions = new Map<string, Session>();

export const createSession = async (userId: string, rememberMe: boolean = false): Promise<Session> => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000)); // 7 days or 1 hour

  const session: Session = {
    sessionId,
    userId,
    expiresAt,
    rememberMe,
    createdAt: now,
  };

  sessions.set(sessionId, session);

  // Update user's session info
  await User.findByIdAndUpdate(userId, {
    currentSessionId: sessionId,
    sessionExpiresAt: expiresAt,
    lastLoginAt: now,
  });

  return session;
};

export const getSession = (sessionId: string): Session | null => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
};

export const getSessionByUserId = (userId: string): Session | null => {
  for (const [sessionId, session] of sessions.entries()) {
    if (session.userId === userId) {
      // Check if session is expired
      if (new Date() > session.expiresAt) {
        sessions.delete(sessionId);
        return null;
      }
      return session;
    }
  }
  return null;
};

export const deleteSession = async (sessionId?: string | null, userId?: string): Promise<void> => {
  if (sessionId) {
    sessions.delete(sessionId);
  }

  if (userId) {
    // Find and delete session by user ID
    for (const [id, session] of sessions.entries()) {
      if (session.userId === userId) {
        sessions.delete(id);
        break;
      }
    }

    // Clear user's session info
    await User.findByIdAndUpdate(userId, {
      $unset: {
        currentSessionId: 1,
        sessionExpiresAt: 1,
      },
    });
  }
};

export const refreshUserSession = async (sessionId: string): Promise<Session | null> => {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return null;
  }

  // Check if session is expired
  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }

  // Extend session expiration
  const now = new Date();
  session.expiresAt = new Date(now.getTime() + (session.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000));

  sessions.set(sessionId, session);

  // Update user's session info
  await User.findByIdAndUpdate(session.userId, {
    sessionExpiresAt: session.expiresAt,
  });

  return session;
};

// Clean up expired sessions every hour
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export const cleanupExpiredSessions = () => {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(sessionId);
    }
  }
};
