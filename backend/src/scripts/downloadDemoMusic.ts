/**
 * Download Demo Music Script
 * 
 * Downloads free, licensed music from Pixabay for demo purposes.
 * All tracks are under Pixabay License - free for commercial use.
 * 
 * Run: npx tsx backend/src/scripts/downloadDemoMusic.ts
 */

import https from 'https';
import fs from 'fs';
import path from 'path';

// Create music directory
const MUSIC_DIR = path.resolve(__dirname, '../../../demo-music');

// Free music sources (direct download links from royalty-free sources)
// These are example placeholder URLs - we'll use actual Pixabay tracks
const DEMO_TRACKS = [
    {
        name: 'ambient-piano',
        // Pixabay doesn't allow direct hotlinking, so we'll provide instructions
        source: 'pixabay',
        searchUrl: 'https://pixabay.com/music/search/piano%20ambient/',
    },
    {
        name: 'electronic-chill',
        source: 'pixabay',
        searchUrl: 'https://pixabay.com/music/search/electronic%20chill/',
    },
    {
        name: 'acoustic-guitar',
        source: 'pixabay',
        searchUrl: 'https://pixabay.com/music/search/acoustic%20guitar/',
    },
];

async function main() {
    console.log('🎵 Demo Music Setup\n');

    // Create directory
    if (!fs.existsSync(MUSIC_DIR)) {
        fs.mkdirSync(MUSIC_DIR, { recursive: true });
        console.log(`Created directory: ${MUSIC_DIR}\n`);
    }

    console.log('📋 To add demo music to your app:\n');
    console.log('1. Go to https://pixabay.com/music/');
    console.log('2. Download 5-10 tracks you like (all are free for commercial use)');
    console.log(`3. Save them to: ${MUSIC_DIR}`);
    console.log('4. Run the upload script to add them to S3/MinIO\n');

    console.log('🔗 Recommended search queries:');
    console.log('   - "ambient piano" - for chill/study music');
    console.log('   - "electronic" - for upbeat tracks');
    console.log('   - "acoustic" - for indie/folk vibes');
    console.log('   - "jazz" - for lounge music');
    console.log('   - "classical" - for orchestral pieces\n');

    console.log('📝 After downloading, rename files to match this pattern:');
    console.log('   artist-name_track-title.mp3\n');

    console.log('Example files:');
    console.log('   ambient-waves_midnight-dreams.mp3');
    console.log('   electronic-dreams_neon-nights.mp3');
    console.log('   jazz-lounge_smooth-operator.mp3\n');

    // Create a README in the music directory
    const readmeContent = `# Demo Music Directory

Place your downloaded demo music files here.

## Where to get free music:

1. **Pixabay Music** (Recommended): https://pixabay.com/music/
   - All tracks are free for commercial use
   - No attribution required
   - High quality MP3 files

2. **Free Music Archive**: https://freemusicarchive.org/
   - Filter by Creative Commons license
   - Various genres available

3. **Mixkit**: https://mixkit.co/free-stock-music/
   - Free to use
   - Good variety

## File naming convention:

\`artist-name_track-title.mp3\`

Example:
- ambient-waves_ocean-breeze.mp3
- electronic-dreams_digital-sunrise.mp3

## After downloading:

Run the upload script to add tracks to your app:
\`\`\`bash
npx tsx backend/src/scripts/uploadDemoMusic.ts
\`\`\`
`;

    fs.writeFileSync(path.join(MUSIC_DIR, 'README.md'), readmeContent);
    console.log(`✅ Created README at ${MUSIC_DIR}/README.md`);
    console.log(`\n📂 Music directory ready at: ${MUSIC_DIR}`);
}

main().catch(console.error);
