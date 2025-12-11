import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/index.js';
import { validateBody } from '../middleware/index.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { authenticate } from '../middleware/auth.js';
import {
    registerSchema,
    loginSchema,
    refreshSchema,
    googleAuthSchema,
} from '../utils/schemas.js';

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 * Register a new user with email/password
 */
router.post(
    '/register',
    validateBody(registerSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, username, password } = req.body;
            const { user, tokens } = await authService.registerUser(email, username, password);

            res.status(201).json({
                message: 'Registration successful',
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/login
 * Login with email/password
 */
router.post(
    '/login',
    validateBody(loginSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;
            const { user, tokens } = await authService.loginUser(email, password);

            res.json({
                message: 'Login successful',
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
    '/refresh',
    validateBody(refreshSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            const { accessToken, refreshToken: newRefreshToken, user } =
                await authService.refreshTokens(refreshToken);

            res.json({
                accessToken,
                refreshToken: newRefreshToken,
                user,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/logout
 * Logout and invalidate refresh token
 */
router.post(
    '/logout',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { refreshToken } = req.body;
            if (refreshToken && req.userId) {
                await authService.invalidateRefreshToken(req.userId, refreshToken);
            }

            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/logout-all
 * Logout from all devices
 */
router.post(
    '/logout-all',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.userId) {
                await authService.invalidateAllRefreshTokens(req.userId);
            }

            res.json({ message: 'Logged out from all devices' });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/auth/oauth/google
 * Login or register with Google OAuth
 */
router.post(
    '/oauth/google',
    validateBody(googleAuthSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idToken } = req.body;
            const { user, tokens, isNewUser } = await authService.googleAuth(idToken);

            res.json({
                message: isNewUser ? 'Account created successfully' : 'Login successful',
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                isNewUser,
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
