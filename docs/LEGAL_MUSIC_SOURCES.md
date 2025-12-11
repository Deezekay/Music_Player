# Legal Music Sources for Demo

This document lists **free, legal sources** for music to populate the Music Player demo.

> ⚠️ **Important**: All music in this demo should be either **public domain** or licensed under **Creative Commons** (CC0, CC BY, CC BY-SA).

---

## ✅ Recommended Sources

### 1. Public Domain Music

| Source | Type | Best For |
|--------|------|----------|
| [Musopen](https://musopen.org) | Classical recordings | Orchestral, piano, chamber music |
| [IMSLP](https://imslp.org) | Classical sheet music + recordings | Historical performances |
| [FreePD](https://freepd.com) | Various genres | General use |

### 2. Creative Commons Licensed (CC0)

| Source | License | Notes |
|--------|---------|-------|
| [Pixabay Music](https://pixabay.com/music/) | Pixabay License (free commercial) | Very easy to use |
| [Free Music Archive](https://freemusicarchive.org) | Various CC licenses | Filter by license |
| [ccMixter](http://ccmixter.org) | CC licenses | Remixes and samples |
| [YouTube Audio Library](https://studio.youtube.com/channel/audio) | Various | Free for creators |
| [Mixkit](https://mixkit.co/free-stock-music/) | Mixkit License | High quality |

### 3. AI-Generated Music (Own Rights)

| Platform | License |
|----------|---------|
| [Suno AI](https://suno.ai) | Check terms - many allow commercial |
| [AIVA](https://aiva.ai) | Free tier allows personal projects |
| [Mubert](https://mubert.com) | Royalty-free option available |

---

## 🔴 Avoid These

- ❌ Spotify/Apple Music/YouTube rips
- ❌ Commercial songs (Bollywood, Billboard, etc.)
- ❌ Songs with unclear licensing
- ❌ CC BY-NC if project may be monetized
- ❌ CC BY-ND (transcoding = derivative work)

---

## Recommended Workflow

1. Download 10-15 tracks from sources above
2. Ensure proper metadata (title, artist, genre)
3. Add cover art (use Pixabay images or AI-generated)
4. Upload to MinIO/S3 using the upload API
5. Let the transcoding worker process them

---

## Sample Download Script

```bash
# Example: Download from Pixabay (requires manual selection)
# 1. Go to https://pixabay.com/music/
# 2. Select tracks with "Pixabay License"
# 3. Download MP3 files
# 4. Upload via the API or directly to S3

# Tracks are seeded with metadata via:
cd backend
npm run seed:demo
```

---

## Legal Statement for Resume/Interview

> "The demo application uses public domain classical recordings and 
> Creative Commons Zero (CC0) licensed music for demonstration purposes. 
> All content is legally sourced from platforms like Musopen, Pixabay Music, 
> and the Free Music Archive. The application architecture supports 
> production music libraries through the same S3-based streaming pipeline."
