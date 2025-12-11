import { Router, Request, Response, NextFunction } from 'express';
import { trackService } from '../services/index.js';
import { authenticate, optionalAuth, requireArtist, requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery, validateParams } from '../middleware/validate.js';
import {
    createTrackSchema,
    updateTrackSchema,
    searchTracksSchema,
    idParamSchema,
} from '../utils/schemas.js';

const router = Router();

/**
 * GET /api/tracks
 * Search and list tracks
 */
router.get(
    '/',
    validateQuery(searchTracksSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await trackService.searchTracks(req.query as any);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/tracks/:id
 * Get track by ID
 */
router.get(
    '/:id',
    optionalAuth,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const track = await trackService.getTrackById(req.params.id, req.userId);
            if (!track) {
                res.status(404).json({ error: 'Track not found' });
                return;
            }
            res.json(track);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/tracks
 * Create a new track (artist/admin only)
 */
router.post(
    '/',
    authenticate,
    requireArtist,
    validateBody(createTrackSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const track = await trackService.createTrack(req.body, req.userId!);
            res.status(201).json(track);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PATCH /api/tracks/:id
 * Update track metadata
 */
router.patch(
    '/:id',
    authenticate,
    validateParams(idParamSchema),
    validateBody(updateTrackSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const track = await trackService.updateTrack(req.params.id, req.userId!, req.body);
            res.json(track);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/tracks/:id
 * Delete a track
 */
router.delete(
    '/:id',
    authenticate,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isAdmin = req.user?.roles.includes('admin') ?? false;
            await trackService.deleteTrack(req.params.id, req.userId!, isAdmin);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/tracks/:id/like
 * Like a track
 */
router.post(
    '/:id/like',
    authenticate,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const liked = await trackService.likeTrack(req.userId!, req.params.id);
            res.json({ liked, message: liked ? 'Track liked' : 'Already liked' });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/tracks/:id/like
 * Unlike a track
 */
router.delete(
    '/:id/like',
    authenticate,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const unliked = await trackService.unlikeTrack(req.userId!, req.params.id);
            res.json({ unliked, message: unliked ? 'Track unliked' : 'Was not liked' });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/tracks/:id/play
 * Record a play event and increment play count
 */
router.post(
    '/:id/play',
    optionalAuth,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await trackService.incrementPlayCount(req.params.id);
            res.json({ message: 'Play recorded' });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
