import { Router, Request, Response, NextFunction } from 'express';
import { Artist, Track, Follow } from '../models/index.js';
import { Types } from 'mongoose';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/artists
 * Get all artists with optional filtering
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 20, offset = 0, verified } = req.query;

        const filter: any = {};
        if (verified === 'true') {
            filter.verified = true;
        }

        const [artists, total] = await Promise.all([
            Artist.find(filter)
                .sort({ monthlyListeners: -1 })
                .skip(Number(offset))
                .limit(Number(limit)),
            Artist.countDocuments(filter),
        ]);

        res.json({ artists, total });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/artists/popular
 * Get popular artists
 */
router.get('/popular', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 10 } = req.query;

        const artists = await Artist.find()
            .sort({ monthlyListeners: -1 })
            .limit(Number(limit));

        res.json(artists);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/artists/:id
 * Get artist by ID
 */
router.get('/:id', optionalAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const artist = await Artist.findById(req.params.id);
        if (!artist) {
            res.status(404).json({ error: 'Artist not found' });
            return;
        }

        const artistObj = artist.toObject() as any;

        // Get follower count
        artistObj.followerCount = await Follow.countDocuments({
            followingId: artist._id,
            followingType: 'artist',
        });

        // Check if current user follows this artist
        if (req.userId) {
            const follow = await Follow.findOne({
                followerId: req.userId,
                followingId: artist._id,
                followingType: 'artist',
            });
            artistObj.isFollowing = !!follow;
        }

        res.json(artistObj);
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/artists/:id/tracks
 * Get all tracks by artist
 */
router.get('/:id/tracks', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const [tracks, total] = await Promise.all([
            Track.find({
                artistId: new Types.ObjectId(req.params.id),
                status: 'ready'
            })
                .sort({ plays: -1 })
                .skip(Number(offset))
                .limit(Number(limit)),
            Track.countDocuments({
                artistId: new Types.ObjectId(req.params.id),
                status: 'ready'
            }),
        ]);

        res.json({ tracks, total });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/artists/:id/top
 * Get top tracks by artist
 */
router.get('/:id/top', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 10 } = req.query;

        const tracks = await Track.find({
            artistId: new Types.ObjectId(req.params.id),
            status: 'ready'
        })
            .sort({ plays: -1 })
            .limit(Number(limit));

        res.json(tracks);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/artists/:id/follow
 * Follow an artist
 */
router.post('/:id/follow', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const artistId = new Types.ObjectId(req.params.id);

        // Check artist exists
        const artist = await Artist.findById(artistId);
        if (!artist) {
            res.status(404).json({ error: 'Artist not found' });
            return;
        }

        // Create follow relationship
        await Follow.findOneAndUpdate(
            {
                followerId: req.userId,
                followingId: artistId,
                followingType: 'artist',
            },
            {
                followerId: req.userId,
                followingId: artistId,
                followingType: 'artist',
            },
            { upsert: true }
        );

        res.json({ followed: true, message: 'Artist followed' });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/artists/:id/follow
 * Unfollow an artist
 */
router.delete('/:id/follow', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await Follow.findOneAndDelete({
            followerId: req.userId,
            followingId: new Types.ObjectId(req.params.id),
            followingType: 'artist',
        });

        res.json({
            unfollowed: !!result,
            message: result ? 'Artist unfollowed' : 'Was not following'
        });
    } catch (error) {
        next(error);
    }
});

export default router;
