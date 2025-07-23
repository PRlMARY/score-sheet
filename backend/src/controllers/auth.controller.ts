import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { createSession, getSessionByUserId, deleteSession, refreshUserSession } from '../utils/session';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export const signUp = async (req: Request, res: Response) => {
  try {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Create session
    const session = await createSession(savedUser._id.toString(), false);

    // Set HTTP-only cookie
    res.cookie('sessionId', session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { username, password, rememberMe = false } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Delete existing session for this user
    await deleteSession(null, user._id.toString());

    // Create new session
    const session = await createSession(user._id.toString(), rememberMe);

    // Set HTTP-only cookie with appropriate expiration
    const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 7 days or 1 hour

    res.cookie('sessionId', session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
    });

    res.json({
      message: 'Sign in successful',
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    res.clearCookie('sessionId');
    res.json({ message: 'Sign out successful' });
  } catch (error) {
    console.error('Sign out error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const checkAuth = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.cookies.sessionId;

    if (!sessionId) {
      return res.json({ authenticated: false });
    }

    const user = req.user;
    if (!user) {
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.json({ authenticated: false });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const refreshUserSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessionId = req.cookies.sessionId;
    const user = req.user;

    if (!sessionId || !user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Refresh the session
    await refreshUserSession(sessionId);

    res.json({ message: 'Session refreshed successfully' });
  } catch (error) {
    console.error('Refresh session error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
