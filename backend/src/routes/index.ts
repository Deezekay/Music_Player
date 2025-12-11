import { Router } from 'express';
import authRoutes from './auth.js';
import tracksRoutes from './tracks.js';
import streamRoutes from './stream.js';
import playlistsRoutes from './playlists.js';
import usersRoutes from './users.js';
import artistsRoutes from './artists.js';
import adminRoutes from './admin.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/tracks', tracksRoutes);
router.use('/stream', streamRoutes);
router.use('/playlists', playlistsRoutes);
router.use('/users', usersRoutes);
router.use('/artists', artistsRoutes);
router.use('/admin', adminRoutes);

// Health check
router.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

export default router;
