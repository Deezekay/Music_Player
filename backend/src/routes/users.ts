import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { updateProfileSchema } from '../utils/schemas.js';
import { User } from '../models/index.js';
import { trackService } from '../services/index.js';
import { ListenEvent } from '../models/ListenEvent.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
    res.json(req.user);
});

/**
 * PATCH /api/users/me
 * Update current user profile
 */
router.patch(
    '/me',
    validateBody(updateProfileSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updates: any = {};
            if (req.body.displayName) updates['profile.displayName'] = req.body.displayName;
            if (req.body.bio !== undefined) updates['profile.bio'] = req.body.bio;

            const user = await User.findByIdAndUpdate(
                req.userId,
                { $set: updates },
                { new: true }
            );

            res.json(user);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/users/me/likes
 * Get user's liked tracks
 */
router.get('/me/likes', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const offset = parseInt(req.query.offset as string) || 0;

        const tracks = await trackService.getLikedTracks(req.userId!, limit, offset);
        res.json(tracks);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/users/me/history
 * Get user's listening history
 */
router.get('/me/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const offset = parseInt(req.query.offset as string) || 0;

        const history = await ListenEvent.find({ userId: req.userId })
            .sort({ startedAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate({
                path: 'trackId',
                populate: { path: 'artistId', select: 'name avatarUrl' },
            });

        res.json(history);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/users/me/history
 * Record a listen event
 */
router.post('/me/history', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { trackId, duration, completed, source, context } = req.body;

        const event = await ListenEvent.create({
            userId: req.userId,
            trackId,
            startedAt: new Date(),
            duration: duration || 0,
            completed: completed || false,
            source: source || 'web',
            context: context || { type: 'direct' },
            deviceInfo: {
                platform: req.headers['sec-ch-ua-platform'] as string,
                browser: req.headers['user-agent'],
            },
        });

        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
});

export default router;
