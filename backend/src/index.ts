import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

import config from './config/index.js';
import { connectDatabase } from './config/database.js';
import { getRedisClient } from './config/redis.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler, apiLimiter } from './middleware/index.js';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (config.env !== 'test') {
    app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
}

// Rate limiting
app.use('/api', apiLimiter);

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
    try {
        // Connect to MongoDB
        await connectDatabase();

        // Initialize Redis
        getRedisClient();

        // Start listening
        app.listen(config.port, () => {
            console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🎵 MERN Music Player API                                 ║
║                                                            ║
║   Environment: ${config.env.padEnd(40)}║
║   Server:      http://localhost:${config.port}                       ║
║   Health:      http://localhost:${config.port}/api/health            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

export default app;
