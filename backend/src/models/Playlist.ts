import { Schema, model, Document, Types } from 'mongoose';

export interface IPlaylistTrack {
    trackId: Types.ObjectId;
    addedAt: Date;
    addedBy: Types.ObjectId;
    order: number;
}

export interface IPlaylist extends Document {
    _id: Types.ObjectId;
    name: string;
    description?: string;
    coverArt?: string;
    ownerId: Types.ObjectId;
    isPublic: boolean;
    collaborative: boolean;
    collaborators: Types.ObjectId[];
    tracks: IPlaylistTrack[];
    totalDuration: number; // seconds
    trackCount: number;
    followers: number;
    createdAt: Date;
    updatedAt: Date;
}

const PlaylistSchema = new Schema<IPlaylist>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        coverArt: String,
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        collaborative: {
            type: Boolean,
            default: false,
        },
        collaborators: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        tracks: [
            {
                trackId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Track',
                    required: true,
                },
                addedAt: {
                    type: Date,
                    default: Date.now,
                },
                addedBy: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                order: {
                    type: Number,
                    required: true,
                },
            },
        ],
        totalDuration: {
            type: Number,
            default: 0,
        },
        trackCount: {
            type: Number,
            default: 0,
        },
        followers: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
PlaylistSchema.index({ ownerId: 1, createdAt: -1 });
PlaylistSchema.index({ isPublic: 1, followers: -1 });
PlaylistSchema.index({ 'tracks.trackId': 1 });

// Update track count and duration on save
PlaylistSchema.pre('save', function (next) {
    this.trackCount = this.tracks.length;
    next();
});

export const Playlist = model<IPlaylist>('Playlist', PlaylistSchema);
export default Playlist;
