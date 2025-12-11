import { Schema, model, Document, Types } from 'mongoose';

export interface ITrackFiles {
    original?: string;
    mp3_320?: string;
    mp3_128?: string;
    hlsMaster?: string;
    waveformJson?: string;
}

export interface ITrack extends Document {
    _id: Types.ObjectId;
    title: string;
    artistId: Types.ObjectId;
    artistName: string; // Denormalized for search
    albumId?: Types.ObjectId;
    albumName?: string;
    duration: number; // seconds
    files: ITrackFiles;
    genres: string[];
    tags: string[];
    releaseDate?: Date;
    explicit: boolean;
    coverArt?: string;
    bitrate?: number;
    sampleRate?: number;
    mimeType?: string;
    plays: number;
    likes: number;
    status: 'pending' | 'processing' | 'ready' | 'rejected';
    processingError?: string;
    createdByUserId: Types.ObjectId;
    approvedByUserId?: Types.ObjectId;
    externalStreamUrl?: string; // For demo tracks with external URLs
    createdAt: Date;
    updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            text: true,
        },
        artistId: {
            type: Schema.Types.ObjectId,
            ref: 'Artist',
            required: true,
            index: true,
        },
        artistName: {
            type: String,
            required: true,
            text: true,
        },
        albumId: {
            type: Schema.Types.ObjectId,
            ref: 'Album',
            index: true,
        },
        albumName: String,
        duration: {
            type: Number,
            default: 0,
        },
        files: {
            original: String,
            mp3_320: String,
            mp3_128: String,
            hlsMaster: String,
            waveformJson: String,
        },
        genres: {
            type: [String],
            default: [],
            index: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        releaseDate: Date,
        explicit: {
            type: Boolean,
            default: false,
        },
        coverArt: String,
        bitrate: Number,
        sampleRate: Number,
        mimeType: String,
        plays: {
            type: Number,
            default: 0,
            index: true,
        },
        likes: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'ready', 'rejected'],
            default: 'pending',
            index: true,
        },
        processingError: String,
        createdByUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        approvedByUserId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        externalStreamUrl: String, // For demo tracks with external URLs
    },
    {
        timestamps: true,
    }
);

// Compound indexes for common queries
TrackSchema.index({ artistId: 1, releaseDate: -1 });
TrackSchema.index({ status: 1, createdAt: -1 });
TrackSchema.index({ genres: 1, plays: -1 });

// Text search index
TrackSchema.index(
    { title: 'text', artistName: 'text', tags: 'text' },
    { weights: { title: 10, artistName: 5, tags: 2 } }
);

// Virtual for formatted duration
TrackSchema.virtual('formattedDuration').get(function () {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

export const Track = model<ITrack>('Track', TrackSchema);
export default Track;
