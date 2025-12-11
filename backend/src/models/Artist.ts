import { Schema, model, Document, Types } from 'mongoose';

export interface IArtist extends Document {
    _id: Types.ObjectId;
    name: string;
    bio?: string;
    avatarUrl?: string;
    userId?: Types.ObjectId; // Link to user account if artist has one
    verified: boolean;
    genres: string[];
    socialLinks: {
        website?: string;
        spotify?: string;
        instagram?: string;
        twitter?: string;
    };
    monthlyListeners: number;
    createdAt: Date;
    updatedAt: Date;
}

const ArtistSchema = new Schema<IArtist>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            text: true, // Enable text search
        },
        bio: {
            type: String,
            maxlength: 2000,
        },
        avatarUrl: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        genres: {
            type: [String],
            default: [],
        },
        socialLinks: {
            website: String,
            spotify: String,
            instagram: String,
            twitter: String,
        },
        monthlyListeners: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Text index for search
ArtistSchema.index({ name: 'text' });

export const Artist = model<IArtist>('Artist', ArtistSchema);
export default Artist;
