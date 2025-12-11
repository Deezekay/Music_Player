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
- **MinIO** object storage
- **FFmpeg** for audio processing
- **HLS** streaming

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- MinIO (or AWS S3)
- FFmpeg

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/music-player.git
cd music-player
```

2. **Install dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Environment Configuration**

Create `.env` file in the root directory:
```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/music-player

# JWT
JWT_SECRET=your-secret-key-here

# MinIO / S3
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=music-player
MINIO_USE_SSL=false

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

4. **Start MongoDB**
```bash
mongod
```

5. **Start MinIO**
```bash
minio server ./minio-data
```

6. **Run the application**
```bash
# Development mode (runs both frontend and backend)
npm run dev

# Or run separately:
npm run dev:backend    # Backend on port 3001
npm run dev:frontend   # Frontend on port 5173
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
│   │   └── server.ts        # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── App.tsx          # Root component
│   └── package.json
├── .gitignore
├── package.json
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
- `GET /api/stream/:id` - Get HLS stream URL
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

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and MongoDB**
