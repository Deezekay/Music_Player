import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import config from '../config/index.js';
import { User, IUser } from '../models/index.js';
import { ApiError } from '../middleware/errorHandler.js';

const SALT_ROUNDS = 12;
const googleClient = new OAuth2Client(config.google.clientId);

interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

interface GoogleUserInfo {
    email: string;
    name: string;
    picture?: string;
    sub: string; // Google user ID
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: IUser): string {
    return jwt.sign(
        {
            userId: user._id.toString(),
            roles: user.roles,
        },
        config.jwt.secret,
        { expiresIn: config.jwt.accessExpiry }
    );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(): string {
    return crypto.randomBytes(64).toString('hex');
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokens(user: IUser): Promise<TokenPair> {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store hashed refresh token in user document
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
        $push: {
            refreshTokens: {
                $each: [hashedRefreshToken],
                $slice: -5, // Keep only last 5 refresh tokens
            },
        },
    });

    return { accessToken, refreshToken };
}

/**
 * Verify and rotate refresh token
 */
export async function refreshTokens(refreshToken: string): Promise<TokenPair & { user: IUser }> {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const user = await User.findOne({ refreshTokens: hashedToken }).select('+refreshTokens');
    if (!user) {
        throw ApiError.unauthorized('Invalid refresh token');
    }

    // Remove old token and generate new pair
    await User.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: hashedToken },
    });

    const tokens = await generateTokens(user);
    return { ...tokens, user };
}

/**
 * Invalidate a refresh token (logout)
 */
export async function invalidateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: hashedToken },
    });
}

/**
 * Invalidate all refresh tokens (logout everywhere)
 */
export async function invalidateAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] },
    });
}

/**
 * Register a new user with email/password
 */
export async function registerUser(
    email: string,
    username: string,
    password: string
): Promise<{ user: IUser; tokens: TokenPair }> {
    // Check if user exists
    const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
            throw ApiError.conflict('Email already registered');
        }
        throw ApiError.conflict('Username already taken');
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await User.create({
        email: email.toLowerCase(),
        username,
        passwordHash,
        roles: ['user'],
        profile: { displayName: username },
    });

    const tokens = await generateTokens(user);
    return { user, tokens };
}

/**
 * Login with email/password
 */
export async function loginUser(
    email: string,
    password: string
): Promise<{ user: IUser; tokens: TokenPair }> {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

    if (!user || !user.passwordHash) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    const tokens = await generateTokens(user);
    return { user, tokens };
}

/**
 * Verify Google ID token and get user info
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: config.google.clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            throw ApiError.unauthorized('Invalid Google token');
        }

        return {
            email: payload.email,
            name: payload.name || payload.email.split('@')[0],
            picture: payload.picture,
            sub: payload.sub,
        };
    } catch (error) {
        throw ApiError.unauthorized('Failed to verify Google token');
    }
}

/**
 * Login or register with Google OAuth
 */
export async function googleAuth(idToken: string): Promise<{ user: IUser; tokens: TokenPair; isNewUser: boolean }> {
    const googleUser = await verifyGoogleToken(idToken);

    // Check if user exists with this Google ID
    let user = await User.findOne({
        'oauthProviders.provider': 'google',
        'oauthProviders.id': googleUser.sub,
    });

    let isNewUser = false;

    if (!user) {
        // Check if email exists (link accounts)
        user = await User.findOne({ email: googleUser.email.toLowerCase() });

        if (user) {
            // Link Google account to existing user
            await User.findByIdAndUpdate(user._id, {
                $push: {
                    oauthProviders: {
                        provider: 'google',
                        id: googleUser.sub,
                        email: googleUser.email,
                    },
                },
                $set: { isEmailVerified: true },
            });
        } else {
            // Create new user
            const username = await generateUniqueUsername(googleUser.name);
            user = await User.create({
                email: googleUser.email.toLowerCase(),
                username,
                roles: ['user'],
                oauthProviders: [
                    {
                        provider: 'google',
                        id: googleUser.sub,
                        email: googleUser.email,
                    },
                ],
                profile: {
                    displayName: googleUser.name,
                    avatarUrl: googleUser.picture,
                },
                isEmailVerified: true,
            });
            isNewUser = true;
        }
    }

    const tokens = await generateTokens(user!);
    return { user: user!, tokens, isNewUser };
}

/**
 * Generate a unique username from a display name
 */
async function generateUniqueUsername(name: string): Promise<string> {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    let username = base || 'user';
    let suffix = 0;

    while (await User.findOne({ username })) {
        suffix++;
        username = `${base}${suffix}`;
    }

    return username;
}

export default {
    hashPassword,
    verifyPassword,
    generateTokens,
    refreshTokens,
    invalidateRefreshToken,
    invalidateAllRefreshTokens,
    registerUser,
    loginUser,
    verifyGoogleToken,
    googleAuth,
};
