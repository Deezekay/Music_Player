import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { User, IUser } from '../models/index.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
            userId?: string;
        }
    }
}

interface JwtPayload {
    userId: string;
    roles: string[];
    iat: number;
    exp: number;
}

/**
 * Verify JWT access token and attach user to request
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

        // Attach user info to request
        req.userId = decoded.userId;

        // Optionally fetch full user (for routes that need it)
        const user = await User.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ error: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        res.status(500).json({ error: 'Authentication failed' });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
            req.userId = decoded.userId;

            const user = await User.findById(decoded.userId);
            if (user) {
                req.user = user;
            }
        }
        next();
    } catch {
        // Ignore errors - just continue without auth
        next();
    }
}

/**
 * Require specific role(s)
 */
export function requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const hasRole = roles.some((role) => req.user!.roles.includes(role as any));
        if (!hasRole) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
}

/**
 * Require admin role
 */
export const requireAdmin = requireRole('admin');

/**
 * Require artist or admin role
 */
export const requireArtist = requireRole('artist', 'admin');

export default { authenticate, optionalAuth, requireRole, requireAdmin, requireArtist };
