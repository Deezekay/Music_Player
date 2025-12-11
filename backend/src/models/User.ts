import { Schema, model, Document, Types } from 'mongoose';

// Interfaces
export interface IOAuthProvider {
    provider: 'google' | 'apple';
    id: string;
    email?: string;
}

export interface IUserProfile {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
}

export interface ISubscription {
    tier: 'free' | 'premium' | 'artist';
    expiresAt?: Date;
}

export interface IUser extends Document {
    _id: Types.ObjectId;
    email: string;
    username: string;
    passwordHash?: string;
    roles: ('user' | 'artist' | 'admin')[];
    oauthProviders: IOAuthProvider[];
    profile: IUserProfile;
    subscription: ISubscription;
    refreshTokens: string[];
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Schema
const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 30,
            index: true,
        },
        passwordHash: {
            type: String,
            select: false, // Don't include in queries by default
        },
        roles: {
            type: [String],
            enum: ['user', 'artist', 'admin'],
            default: ['user'],
        },
        oauthProviders: [
            {
                provider: {
                    type: String,
                    enum: ['google', 'apple'],
                    required: true,
                },
                id: {
                    type: String,
                    required: true,
                },
                email: String,
            },
        ],
        profile: {
            displayName: String,
            bio: {
                type: String,
                maxlength: 500,
            },
            avatarUrl: String,
        },
        subscription: {
            tier: {
                type: String,
                enum: ['free', 'premium', 'artist'],
                default: 'free',
            },
            expiresAt: Date,
        },
        refreshTokens: {
            type: [String],
            select: false,
            default: [],
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.passwordHash;
                delete ret.refreshTokens;
                delete ret.__v;
                return ret;
            },
        },
    }
);

// Indexes
UserSchema.index({ 'oauthProviders.provider': 1, 'oauthProviders.id': 1 });

// Methods
UserSchema.methods.hasRole = function (role: string): boolean {
    return this.roles.includes(role);
};

UserSchema.methods.isArtist = function (): boolean {
    return this.roles.includes('artist');
};

UserSchema.methods.isAdmin = function (): boolean {
    return this.roles.includes('admin');
};

export const User = model<IUser>('User', UserSchema);
export default User;
