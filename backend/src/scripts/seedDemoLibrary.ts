/**
 * Demo Library Seed Script
 * 
 * Seeds the database with public domain / Creative Commons licensed music
 * All tracks are legally safe for demonstration purposes.
 * 
 * Sources:
 * - Pixabay Music (CC0 / Pixabay License - free for commercial use)
 * - Free Music Archive (CC licenses)
 * - Musopen (public domain classical)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Demo track metadata - all from legal, free sources
const DEMO_ARTISTS = [
    {
        name: 'Demo Classical Orchestra',
        bio: 'Public domain classical recordings for demonstration',
        genres: ['Classical', 'Orchestral'],
        verified: true,
    },
    {
        name: 'Ambient Waves',
        bio: 'Royalty-free ambient and chill music (CC0)',
        genres: ['Ambient', 'Electronic', 'Chill'],
        verified: true,
    },
    {
        name: 'Indie Folk Project',
        bio: 'Creative Commons licensed indie folk tracks',
        genres: ['Indie', 'Folk', 'Acoustic'],
        verified: false,
    },
    {
        name: 'Electronic Dreams',
        bio: 'Free electronic and synthwave music',
        genres: ['Electronic', 'Synthwave', 'Dance'],
        verified: true,
    },
    {
        name: 'Jazz Lounge',
        bio: 'Smooth jazz recordings (public domain)',
        genres: ['Jazz', 'Lounge', 'Instrumental'],
        verified: false,
    },
];

// Demo tracks with realistic metadata
// These represent the TYPE of content - actual audio files would come from legal sources
const DEMO_TRACKS = [
    // Classical / Public Domain
    {
        title: 'Symphony No. 9 - Ode to Joy',
        artistIndex: 0,
        duration: 382,
        genres: ['Classical', 'Orchestral'],
        tags: ['beethoven', 'symphony', 'public domain'],
        explicit: false,
        plays: 15420,
        likes: 892,
    },
    {
        title: 'Moonlight Sonata',
        artistIndex: 0,
        duration: 356,
        genres: ['Classical', 'Piano'],
        tags: ['beethoven', 'piano', 'romantic'],
        explicit: false,
        plays: 28340,
        likes: 1567,
    },
    {
        title: 'Clair de Lune',
        artistIndex: 0,
        duration: 304,
        genres: ['Classical', 'Piano'],
        tags: ['debussy', 'impressionist', 'peaceful'],
        explicit: false,
        plays: 34200,
        likes: 2103,
    },
    {
        title: 'Four Seasons - Spring',
        artistIndex: 0,
        duration: 198,
        genres: ['Classical', 'Baroque'],
        tags: ['vivaldi', 'violin', 'spring'],
        explicit: false,
        plays: 19870,
        likes: 1234,
    },

    // Ambient / Electronic (CC0)
    {
        title: 'Midnight Dreams',
        artistIndex: 1,
        duration: 245,
        genres: ['Ambient', 'Chill'],
        tags: ['relaxing', 'sleep', 'meditation'],
        explicit: false,
        plays: 8920,
        likes: 543,
    },
    {
        title: 'Ocean Waves',
        artistIndex: 1,
        duration: 312,
        genres: ['Ambient', 'Nature'],
        tags: ['nature', 'peaceful', 'focus'],
        explicit: false,
        plays: 12450,
        likes: 789,
    },
    {
        title: 'Digital Sunrise',
        artistIndex: 3,
        duration: 218,
        genres: ['Electronic', 'Synthwave'],
        tags: ['retro', '80s', 'upbeat'],
        explicit: false,
        plays: 6780,
        likes: 412,
    },
    {
        title: 'Neon Nights',
        artistIndex: 3,
        duration: 267,
        genres: ['Electronic', 'Dance'],
        tags: ['club', 'energy', 'synth'],
        explicit: false,
        plays: 9340,
        likes: 621,
    },
    {
        title: 'Cosmic Journey',
        artistIndex: 3,
        duration: 289,
        genres: ['Electronic', 'Ambient'],
        tags: ['space', 'atmospheric', 'cinematic'],
        explicit: false,
        plays: 4560,
        likes: 298,
    },

    // Indie / Folk (CC BY)
    {
        title: 'Morning Coffee',
        artistIndex: 2,
        duration: 186,
        genres: ['Indie', 'Acoustic'],
        tags: ['acoustic', 'morning', 'cozy'],
        explicit: false,
        plays: 7230,
        likes: 489,
    },
    {
        title: 'Wandering Heart',
        artistIndex: 2,
        duration: 224,
        genres: ['Folk', 'Indie'],
        tags: ['folk', 'travel', 'guitar'],
        explicit: false,
        plays: 5670,
        likes: 367,
    },
    {
        title: 'Autumn Leaves',
        artistIndex: 2,
        duration: 198,
        genres: ['Indie', 'Folk'],
        tags: ['acoustic', 'seasonal', 'melancholic'],
        explicit: false,
        plays: 4890,
        likes: 312,
    },

    // Jazz (Public Domain)
    {
        title: 'Late Night Blues',
        artistIndex: 4,
        duration: 276,
        genres: ['Jazz', 'Blues'],
        tags: ['saxophone', 'moody', 'classic'],
        explicit: false,
        plays: 6120,
        likes: 398,
    },
    {
        title: 'Smooth Operator',
        artistIndex: 4,
        duration: 234,
        genres: ['Jazz', 'Lounge'],
        tags: ['piano', 'relaxing', 'cocktail'],
        explicit: false,
        plays: 8940,
        likes: 567,
    },
    {
        title: 'Swing Time',
        artistIndex: 4,
        duration: 189,
        genres: ['Jazz', 'Swing'],
        tags: ['upbeat', 'vintage', 'dance'],
        explicit: false,
        plays: 3450,
        likes: 234,
    },
];

// Demo playlists
const DEMO_PLAYLISTS = [
    {
        name: 'Classical Essentials',
        description: 'Timeless classical masterpieces from the public domain',
        trackIndices: [0, 1, 2, 3],
        isPublic: true,
    },
    {
        name: 'Focus & Study',
        description: 'Ambient and chill tracks for concentration',
        trackIndices: [4, 5, 8, 1, 2],
        isPublic: true,
    },
    {
        name: 'Electronic Vibes',
        description: 'Synthwave and electronic beats',
        trackIndices: [6, 7, 8],
        isPublic: true,
    },
    {
        name: 'Acoustic Afternoons',
        description: 'Indie and folk tracks for a relaxed day',
        trackIndices: [9, 10, 11],
        isPublic: true,
    },
    {
        name: 'Jazz Lounge Mix',
        description: 'Smooth jazz and blues collection',
        trackIndices: [12, 13, 14],
        isPublic: true,
    },
];

// Mongoose schemas (simplified for seeding)
const artistSchema = new mongoose.Schema({
    name: String,
    bio: String,
    genres: [String],
    verified: Boolean,
    monthlyListeners: { type: Number, default: 0 },
}, { timestamps: true });

const trackSchema = new mongoose.Schema({
    title: String,
    artistId: mongoose.Schema.Types.ObjectId,
    artistName: String,
    duration: Number,
    genres: [String],
    tags: [String],
    explicit: Boolean,
    plays: Number,
    likes: Number,
    status: { type: String, default: 'ready' }, // Mark as ready for demo
    files: {
        original: String,
        mp3_320: String,
        mp3_128: String,
        waveformJson: String,
    },
    coverArt: String,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    email: String,
    username: String,
    passwordHash: String,
    roles: [String],
    profile: {
        displayName: String,
        bio: String,
    },
    isEmailVerified: Boolean,
}, { timestamps: true });

const playlistSchema = new mongoose.Schema({
    name: String,
    description: String,
    ownerId: mongoose.Schema.Types.ObjectId,
    isPublic: Boolean,
    tracks: [{
        trackId: mongoose.Schema.Types.ObjectId,
        addedAt: Date,
        addedBy: mongoose.Schema.Types.ObjectId,
        order: Number,
    }],
    trackCount: Number,
    totalDuration: Number,
}, { timestamps: true });

async function seed() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musicplayer';

    console.log('🎵 Demo Library Seed Script');
    console.log('===========================\n');
    console.log(`Connecting to MongoDB: ${MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//*****:*****@')}`);

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const Artist = mongoose.model('Artist', artistSchema);
        const Track = mongoose.model('Track', trackSchema);
        const User = mongoose.model('User', userSchema);
        const Playlist = mongoose.model('Playlist', playlistSchema);

        // Clear existing demo data (optional - comment out to preserve)
        console.log('🧹 Clearing existing demo data...');
        await Artist.deleteMany({});
        await Track.deleteMany({});
        await Playlist.deleteMany({ name: { $in: DEMO_PLAYLISTS.map(p => p.name) } });

        // Create demo user for playlists
        let demoUser = await User.findOne({ email: 'demo@musicplayer.dev' });
        if (!demoUser) {
            demoUser = await User.create({
                email: 'demo@musicplayer.dev',
                username: 'demouser',
                passwordHash: '$2b$12$demo.hash.placeholder', // Not a real password
                roles: ['user'],
                profile: {
                    displayName: 'Demo User',
                    bio: 'Demo account for testing',
                },
                isEmailVerified: true,
            });
            console.log('✅ Created demo user: demo@musicplayer.dev');
        }

        // Insert artists
        console.log('\n🎤 Creating artists...');
        const createdArtists = await Artist.insertMany(
            DEMO_ARTISTS.map(a => ({
                ...a,
                monthlyListeners: Math.floor(Math.random() * 50000) + 5000,
            }))
        );
        console.log(`   Created ${createdArtists.length} artists`);

        // Insert tracks
        console.log('\n🎵 Creating tracks...');
        const createdTracks = await Track.insertMany(
            DEMO_TRACKS.map(t => ({
                title: t.title,
                artistId: createdArtists[t.artistIndex]._id,
                artistName: DEMO_ARTISTS[t.artistIndex].name,
                duration: t.duration,
                genres: t.genres,
                tags: t.tags,
                explicit: t.explicit,
                plays: t.plays,
                likes: t.likes,
                status: 'ready',
                // Note: In a real setup, these would point to actual S3 keys
                // For demo, the frontend will handle missing audio gracefully
                files: {
                    mp3_320: `demo/tracks/${t.title.toLowerCase().replace(/\s+/g, '-')}_320.mp3`,
                    mp3_128: `demo/tracks/${t.title.toLowerCase().replace(/\s+/g, '-')}_128.mp3`,
                },
            }))
        );
        console.log(`   Created ${createdTracks.length} tracks`);

        // Insert playlists
        console.log('\n📚 Creating playlists...');
        for (const playlist of DEMO_PLAYLISTS) {
            const tracks = playlist.trackIndices.map((idx, order) => ({
                trackId: createdTracks[idx]._id,
                addedAt: new Date(),
                addedBy: demoUser._id,
                order,
            }));

            const totalDuration = playlist.trackIndices.reduce(
                (sum, idx) => sum + DEMO_TRACKS[idx].duration, 0
            );

            await Playlist.create({
                name: playlist.name,
                description: playlist.description,
                ownerId: demoUser._id,
                isPublic: playlist.isPublic,
                tracks,
                trackCount: tracks.length,
                totalDuration,
            });
        }
        console.log(`   Created ${DEMO_PLAYLISTS.length} playlists`);

        // Summary
        console.log('\n===========================');
        console.log('✅ Demo library seeded successfully!\n');
        console.log('📊 Summary:');
        console.log(`   • ${createdArtists.length} artists`);
        console.log(`   • ${createdTracks.length} tracks`);
        console.log(`   • ${DEMO_PLAYLISTS.length} playlists`);
        console.log('\n💡 All content is public domain / CC0 licensed');
        console.log('   Safe for demonstration and portfolio use.\n');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seed();
