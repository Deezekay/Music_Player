/**
 * Seed Demo Tracks with External Stream URLs
 * 
 * Updates the demo tracks to use external URLs from free sources.
 * This allows the demo to work immediately without needing S3/MinIO.
 * 
 * All URLs are from royalty-free, legal sources.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Free music from various royalty-free sources (Pixabay API, etc.)
// These are sample URLs - Pixabay provides an API for fetching tracks
const EXTERNAL_DEMO_TRACKS = [
    {
        title: 'Ambient Relaxation',
        artistName: 'Ambient Waves',
        duration: 373, // Actual: 6:13
        genres: ['Ambient', 'Chill'],
        // Using a freely available sample audio for demo
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        coverArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
    },
    {
        title: 'Electronic Dreams',
        artistName: 'Electronic Dreams',
        duration: 426, // Actual: 7:06
        genres: ['Electronic', 'Synthwave'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        coverArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop',
    },
    {
        title: 'Acoustic Morning',
        artistName: 'Indie Folk Project',
        duration: 344, // Actual: 5:44
        genres: ['Acoustic', 'Folk'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop',
    },
    {
        title: 'Jazz Night',
        artistName: 'Jazz Lounge',
        duration: 303, // Actual: 5:03
        genres: ['Jazz', 'Lounge'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        coverArt: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop',
    },
    {
        title: 'Piano Serenity',
        artistName: 'Demo Classical Orchestra',
        duration: 354, // Actual: 5:54
        genres: ['Classical', 'Piano'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
        coverArt: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=300&h=300&fit=crop',
    },
    {
        title: 'Chill Vibes',
        artistName: 'Ambient Waves',
        duration: 280, // Actual: 4:40
        genres: ['Chill', 'Electronic'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
        coverArt: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop',
    },
    {
        title: 'Upbeat Energy',
        artistName: 'Electronic Dreams',
        duration: 421, // Actual: 7:01
        genres: ['Electronic', 'Dance'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
        coverArt: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop',
    },
    {
        title: 'Sunset Boulevard',
        artistName: 'Jazz Lounge',
        duration: 325, // Actual: 5:25
        genres: ['Jazz', 'Smooth'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        coverArt: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=300&h=300&fit=crop',
    },
    {
        title: 'Forest Walk',
        artistName: 'Indie Folk Project',
        duration: 389, // Actual: 6:29
        genres: ['Folk', 'Nature'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
        coverArt: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop',
    },
    {
        title: 'Symphony Dreams',
        artistName: 'Demo Classical Orchestra',
        duration: 527, // Actual: 8:47
        genres: ['Classical', 'Orchestral'],
        streamUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
        coverArt: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&h=300&fit=crop',
    },
];

// Schemas
const artistSchema = new mongoose.Schema({
    name: String,
    bio: String,
    genres: [String],
    verified: Boolean,
    monthlyListeners: Number,
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
    status: String,
    files: Object,
    coverArt: String,
    externalStreamUrl: String, // New field for external URLs
}, { timestamps: true });

async function seed() {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/musicplayer';

    console.log('🎵 Seeding External Demo Tracks\n');

    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const Artist = mongoose.model('Artist', artistSchema);
        const Track = mongoose.model('Track', trackSchema);

        // Clear existing tracks
        await Track.deleteMany({});
        console.log('🧹 Cleared existing tracks');

        // Get or create artists
        const artistMap = new Map<string, mongoose.Types.ObjectId>();

        for (const track of EXTERNAL_DEMO_TRACKS) {
            if (!artistMap.has(track.artistName)) {
                let artist = await Artist.findOne({ name: track.artistName });
                if (!artist) {
                    artist = await Artist.create({
                        name: track.artistName,
                        bio: `Demo artist - ${track.artistName}`,
                        genres: track.genres,
                        verified: true,
                        monthlyListeners: 0, // Start at 0, will grow with real plays
                    });
                }
                artistMap.set(track.artistName, artist._id);
            }
        }
        console.log(`✅ Created/found ${artistMap.size} artists`);

        // Create tracks with external URLs
        const tracks = EXTERNAL_DEMO_TRACKS.map((t, index) => ({
            title: t.title,
            artistId: artistMap.get(t.artistName),
            artistName: t.artistName,
            duration: t.duration,
            genres: t.genres,
            tags: t.genres.map(g => g.toLowerCase()),
            explicit: false,
            plays: 0, // Start at 0, will increment with real plays
            likes: 0, // Start at 0, will increment when users like tracks
            status: 'ready',
            coverArt: t.coverArt,
            externalStreamUrl: t.streamUrl, // External URL for streaming
            files: {
                mp3_320: t.streamUrl, // Use external URL as file path
            },
        }));

        await Track.insertMany(tracks);
        console.log(`✅ Created ${tracks.length} tracks with external stream URLs`);

        console.log('\n===========================');
        console.log('✅ Demo tracks seeded successfully!\n');
        console.log('🎧 Tracks now have working stream URLs');
        console.log('🖼️ Cover art from Unsplash (free to use)\n');
        console.log('📝 Note: Using SoundHelix demo tracks for audio');
        console.log('   For production, replace with actual Pixabay/CC0 music.\n');

    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
