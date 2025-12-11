# 🎵 Music Player - Full-Stack Streaming Platform

A modern, feature-rich music streaming platform built with the MERN stack, featuring real-time audio streaming, waveform visualization, and a beautiful glassmorphic UI.

![Music Player](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 🎧 Core Features
- **Audio Streaming** - HLS-based adaptive streaming with waveform visualization
- **Search & Discovery** - Global search with genre filtering
- **Queue Management** - Full queue control with drag-to-reorder
- **Recently Played** - Track your listening history
- **Playlists** - Create and manage custom playlists
- **Artist Pages** - Dedicated artist profiles with top tracks
- **User Profiles** - Personalized user accounts and preferences

### 🎨 UI/UX
- Modern glassmorphic design with purple/fuchsia gradient theme
- Smooth animations and micro-interactions
- Responsive design for all screen sizes
- Real-time waveform visualization
- Elegant hover effects and transitions

### 🔧 Technical Features
- JWT-based authentication
- Real-time audio streaming with HLS
- MongoDB database with Mongoose ODM
- MinIO object storage for media files
- FFmpeg audio processing
- TypeScript throughout

## 🚀 Tech Stack

### Frontend
- **React** 18 with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls

### Backend
- **Node.js** with Express
- **TypeScript**
- **MongoDB** with Mongoose
- **JWT** authentication
- **MinIO / S3** object storage (S3-compatible)
- **FFmpeg** for audio processing (worker uses `fluent-ffmpeg`)
- **HLS** streaming (server exposes streaming endpoints)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- MinIO (or AWS S3)
- FFmpeg

### Setup

1. **Clone the repository**
```powershell
git clone https://github.com/Deezekay/Music_Player.git
cd Music_Player
```

2. **Install dependencies (monorepo workspaces)**
Run from the repository root — this installs `backend`, `frontend`, and `worker` packages:
```powershell
npm install
```

3. **Environment Configuration**

Create a `.env` file in the repository root. The backend reads configuration from this file (see `backend/src/config/index.ts`). Example variables used by this project:
```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/musicplayer

# JWT
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# S3 / MinIO (S3-compatible)
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=music-player
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin123
S3_USE_PATH_STYLE=true

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Optional: Redis / BullMQ
REDIS_URL=redis://localhost:6379
```

Notes:
- The config file expects `MONGO_URI`, `S3_*` and `AWS_*` environment variables (see `backend/src/config/index.ts`).
- In production you must set `JWT_SECRET`, `JWT_REFRESH_SECRET` and a production `MONGO_URI`.

4. **Start services**

- Start MongoDB (example):
```powershell
mongod
```

- Start MinIO (example):
```powershell
minio server ./minio-data
```

You can also use `docker compose` defined in `docker-compose.yml` for a local stack (MongoDB, MinIO, Redis):
```powershell
npm run docker:up
# stop
npm run docker:down
```

5. **Run the application**

Run both backend and frontend from the repo root:
```powershell
npm run dev
```

Or run a single workspace:
```powershell
npm run dev:backend   # runs backend (uses tsx watch on src/index.ts)
npm run dev:frontend  # runs frontend (Vite)
npm run dev:worker    # runs worker (transcoding queue)
```

7. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 📁 Project Structure

```
Music_Player/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── index.ts         # Entry point (dev uses tsx watch src/index.ts)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── App.tsx          # Root component
│   └── package.json
├── worker/                  # Transcoding / async workers
├── .gitignore
├── .gitattributes           # Git LFS settings for audio files
├── package.json             # Workspace scripts (dev/build/test)
└── README.md
```

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tracks
- `GET /api/tracks` - Get all tracks (with search/filter)
- `GET /api/tracks/:id` - Get track by ID
- `POST /api/tracks` - Upload new track
- `DELETE /api/tracks/:id` - Delete track
- `POST /api/tracks/:id/like` - Like track
- `DELETE /api/tracks/:id/like` - Unlike track

### Playlists
- `GET /api/playlists` - Get user playlists
- `POST /api/playlists` - Create playlist
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/tracks` - Add track to playlist
- `DELETE /api/playlists/:id/tracks/:trackId` - Remove track

### Artists
- `GET /api/artists/:id` - Get artist details
- `GET /api/artists/:id/tracks` - Get artist tracks
- `GET /api/artists/:id/top` - Get top tracks
- `POST /api/artists/:id/follow` - Follow artist

### Streaming
- `GET /api/stream/:id` - Get HLS stream URL (proxy/manifest)
- `GET /api/stream/:id/waveform` - Get waveform data

## 🎨 UI Components

- **Player** - Bottom audio player with controls
- **Sidebar** - Navigation and quick access
- **SearchBar** - Global search with live results
- **TrackCard** - Track display with actions
- **QueuePanel** - View and manage queue
- **Waveform** - Visual audio representation

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Protected API routes
- CORS configuration
- Input validation
- Secure file uploads

## 📝 License

MIT License — feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and MongoDB**
