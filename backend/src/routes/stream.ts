import { Router, Request, Response, NextFunction } from 'express';
import { uploadService, trackService } from '../services/index.js';
import { authenticate, requireArtist } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { uploadLimiter, streamLimiter } from '../middleware/rateLimit.js';
import { presignedUploadSchema, completeUploadSchema, trackIdParamSchema } from '../utils/schemas.js';

const router = Router();

/**
 * POST /api/upload/audio/:trackId
 * Get presigned URL for audio upload
 */
router.post(
    '/audio/:trackId',
    authenticate,
    requireArtist,
    uploadLimiter,
    validateParams(trackIdParamSchema),
    validateBody(presignedUploadSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await uploadService.getAudioUploadUrl(
                req.params.trackId,
                req.body.contentType,
                req.userId!
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/upload/cover/:trackId
 * Get presigned URL for cover art upload
 */
router.post(
    '/cover/:trackId',
    authenticate,
    requireArtist,
    uploadLimiter,
    validateParams(trackIdParamSchema),
    validateBody(presignedUploadSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await uploadService.getCoverUploadUrl(
                req.params.trackId,
                req.body.contentType,
                req.userId!
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /api/upload/complete
 * Complete upload and trigger processing
 */
router.post(
    '/complete',
    authenticate,
    validateBody(completeUploadSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await uploadService.completeUpload(req.body.uploadId, req.userId!);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/stream/:trackId
 * Get streaming URL for a track
 */
router.get(
    '/:trackId',
    streamLimiter,
    validateParams(trackIdParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const quality = (req.query.quality as 'high' | 'medium') || 'high';
            const result = await uploadService.getStreamUrl(req.params.trackId, quality);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /api/stream/:trackId/waveform
 * Get waveform data URL for a track
 */
router.get(
    '/:trackId/waveform',
    validateParams(trackIdParamSchema),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const url = await uploadService.getWaveformUrl(req.params.trackId);
            if (!url) {
                res.status(404).json({ error: 'Waveform not available' });
                return;
            }
            res.json({ url });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
