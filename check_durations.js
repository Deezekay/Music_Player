// Quick script to check actual SoundHelix durations in browser console
// Run this in browser console at https://www.soundhelix.com/examples/

const songs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const durations = {};

async function checkDuration(songNum) {
    return new Promise((resolve) => {
        const audio = new Audio(`https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${songNum}.mp3`);
        audio.addEventListener('loadedmetadata', () => {
            const duration = Math.round(audio.duration);
            console.log(`Song ${songNum}: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')} (${duration}s)`);
            durations[songNum] = duration;
            resolve(duration);
        });
    });
}

(async () => {
    for (const song of songs) {
        await checkDuration(song);
    }
    console.log('\n\nFinal durations object:');
    console.log(JSON.stringify(durations, null, 2));
})();
