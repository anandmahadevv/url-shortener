import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getAuth } from '@clerk/express';

const JWT_SECRET = process.env.JWT_SECRET || '3a6b9465a306a3d7e039aca801094e35ea0bd13d0eb0d342cd112311b9a16e12';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email?: string;
  };
}

export function extractAuthUser(req: AuthRequest): { userId: string; email?: string } | null {
  // 1. Try Clerk Auth
  try {
    const clerkAuth = getAuth(req);
    if (clerkAuth && clerkAuth.userId) {
      return { userId: clerkAuth.userId };
    }
  } catch (err) {
    // Clerk not configured or token unverified
  }

  // 2. Try Bearer JWT Token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      // Decode Clerk JWT token or fallback secret token
      const decoded = jwt.decode(token) as any;
      if (decoded && (decoded.sub || decoded.userId)) {
        return {
          userId: decoded.sub || decoded.userId,
          email: decoded.email || undefined
        };
      }
    } catch (err) {
      // Ignore parse error
    }
  }

  return null;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const user = extractAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication is required. Please sign in via Clerk.' });
    return;
  }
  req.user = user;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const user = extractAuthUser(req);
  if (user) {
    req.user = user;
  }
  next();
}
