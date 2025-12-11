import { Router, Request, Response, NextFunction } from 'express';
import { playlistService, trackService } from '../services/index.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
    createPlaylistSchema,
    updatePlaylistSchema,
    addTrackToPlaylistSchema,
    reorderTracksSchema,
    idParamSchema,
} from '../utils/schemas.js';

const router = Router();

/**
 * GET /api/playlists
 * Get current user's playlists
 */
router.get(
    '/',
    authenticate,
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const playlists = await playlistService.getUserPlaylists(req.userId!);
            res.json(playlists);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/playlists
 * Create a new playlist
 */
router.post(
    '/',
    authenticate,
    validateBody(createPlaylistSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const playlist = await playlistService.createPlaylist(req.userId!, req.body);
            res.status(201).json(playlist);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/playlists/:id
 * Get playlist by ID
 */
router.get(
    '/:id',
    optionalAuth,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const playlist = await playlistService.getPlaylistById(req.params.id, req.userId);
            if (!playlist) {
                res.status(404).json({ error: 'Playlist not found' });
                return;
            }
            res.json(playlist);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PATCH /api/playlists/:id
 * Update playlist
 */
router.patch(
    '/:id',
    authenticate,
    validateParams(idParamSchema),
    validateBody(updatePlaylistSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const playlist = await playlistService.updatePlaylist(req.params.id, req.userId!, req.body);
            res.json(playlist);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/playlists/:id
 * Delete playlist
 */
router.delete(
    '/:id',
    authenticate,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await playlistService.deletePlaylist(req.params.id, req.userId!);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/playlists/:id/tracks
 * Add track to playlist
 */
router.post(
    '/:id/tracks',
    authenticate,
    validateParams(idParamSchema),
    validateBody(addTrackToPlaylistSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const playlist = await playlistService.addTrackToPlaylist(
                req.params.id,
                req.body.trackId,
                req.userId!
            );
            res.json(playlist);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /api/playlists/:id/tracks/:trackId
 * Remove track from playlist
 */
router.delete(
    '/:id/tracks/:trackId',
    authenticate,
    validateParams(idParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const playlist = await playlistService.removeTrackFromPlaylist(
                req.params.id,
                req.params.trackId,
                req.userId!
            );
            res.json(playlist);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PUT /api/playlists/:id/tracks/order
 * Reorder tracks in playlist
 */
router.put(
    '/:id/tracks/order',
    authenticate,
    validateParams(idParamSchema),
    validateBody(reorderTracksSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const playlist = await playlistService.reorderPlaylistTracks(
                req.params.id,
                req.body.trackOrders,
                req.userId!
            );
            res.json(playlist);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
