import { Router, Request, Response, NextFunction } from 'express';
import { User, Track, Artist, Playlist } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/dashboard
 * Platform statistics overview
 */
router.get('/dashboard', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            newUsersThisMonth,
            totalTracks,
            pendingTracks,
            totalArtists,
            totalPlaylists,
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
            Track.countDocuments({ status: 'ready' }),
            Track.countDocuments({ status: 'pending' }),
            Artist.countDocuments(),
            Playlist.countDocuments(),
        ]);

        // Calculate total plays
        const totalPlays = await Track.aggregate([
            { $group: { _id: null, total: { $sum: '$plays' } } },
        ]);

        res.json({
            users: {
                total: totalUsers,
                newThisMonth: newUsersThisMonth,
            },
            tracks: {
                total: totalTracks,
                pending: pendingTracks,
            },
            artists: {
                total: totalArtists,
            },
            playlists: {
                total: totalPlaylists,
            },
            plays: {
                total: totalPlays[0]?.total || 0,
            },
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/tracks/pending
 * Get tracks awaiting approval
 */
router.get('/tracks/pending', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 50, offset = 0 } = req.query;

        const [tracks, total] = await Promise.all([
            Track.find({ status: 'pending' })
                .sort({ createdAt: -1 })
                .skip(Number(offset))
                .limit(Number(limit))
                .populate('createdByUserId', 'username email')
                .populate('artistId', 'name'),
            Track.countDocuments({ status: 'pending' }),
        ]);

        res.json({ tracks, total });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/admin/tracks/:id/approve
 * Approve a pending track
 */
router.patch('/tracks/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const track = await Track.findByIdAndUpdate(
            req.params.id,
            {
                status: 'ready',
                approvedByUserId: req.userId,
            },
            { new: true }
        );

        if (!track) {
            res.status(404).json({ error: 'Track not found' });
            return;
        }

        res.json({ message: 'Track approved', track });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/admin/tracks/:id/reject
 * Reject a pending track
 */
router.patch('/tracks/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { reason } = req.body;

        const track = await Track.findByIdAndUpdate(
            req.params.id,
            {
                status: 'rejected',
                processingError: reason || 'Rejected by admin',
            },
            { new: true }
        );

        if (!track) {
            res.status(404).json({ error: 'Track not found' });
            return;
        }

        res.json({ message: 'Track rejected', track });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/admin/users
 * List all users with filtering
 */
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { limit = 50, offset = 0, search, role } = req.query;

        const filter: any = {};
        if (search) {
            const searchRegex = new RegExp(String(search), 'i');
            filter.$or = [
                { username: searchRegex },
                { email: searchRegex },
            ];
        }
        if (role) {
            filter.roles = role;
        }

        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .skip(Number(offset))
                .limit(Number(limit)),
            User.countDocuments(filter),
        ]);

        res.json({ users, total });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /api/admin/users/:id/role
 * Update user role
 */
router.patch('/users/:id/role', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { roles } = req.body;

        if (!Array.isArray(roles)) {
            res.status(400).json({ error: 'roles must be an array' });
            return;
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { roles },
            { new: true }
        ).select('-passwordHash');

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ message: 'User roles updated', user });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete a user
 */
router.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({ message: 'User deleted' });
    } catch (error) {
        next(error);
    }
});

export default router;
