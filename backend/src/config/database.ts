import mongoose from 'mongoose';
import config from './index.js';

export async function connectDatabase(): Promise<typeof mongoose | null> {
    try {
        const connection = await mongoose.connect(config.mongoUri, {
            // Connection options
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB connected: ${connection.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected. Attempting to reconnect...');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        return connection;
    } catch (error: any) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('');
        console.error('💡 To fix this, you have these options:');
        console.error('   1. Install Docker Desktop and run: npm run docker:up');
        console.error('   2. Install MongoDB locally: https://www.mongodb.com/try/download/community');
        console.error('   3. Use MongoDB Atlas (cloud): Update MONGO_URI in .env');
        console.error('');
        // Don't exit - allow API to respond with proper errors
        return null;
    }
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
}

export default { connectDatabase, disconnectDatabase };
