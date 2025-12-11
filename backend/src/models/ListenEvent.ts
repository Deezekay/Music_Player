import { Schema, model, Document, Types } from 'mongoose';

export interface IListenEvent extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    trackId: Types.ObjectId;
    startedAt: Date;
    endedAt?: Date;
    duration: number; // seconds listened
    completed: boolean; // listened > 30 seconds or > 50%
    deviceInfo: {
        platform?: string;
        browser?: string;
        version?: string;
    };
    source: 'web' | 'mobile' | 'api';
    context: {
        type: 'playlist' | 'album' | 'search' | 'recommendation' | 'direct';
        id?: Types.ObjectId;
    };
    createdAt: Date;
}

const ListenEventSchema = new Schema<IListenEvent>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        trackId: {
            type: Schema.Types.ObjectId,
            ref: 'Track',
            required: true,
            index: true,
        },
        startedAt: {
            type: Date,
            required: true,
            default: Date.now,
        },
        endedAt: Date,
        duration: {
            type: Number,
            default: 0,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        deviceInfo: {
            platform: String,
            browser: String,
            version: String,
        },
        source: {
            type: String,
            enum: ['web', 'mobile', 'api'],
            default: 'web',
        },
        context: {
            type: {
                type: String,
                enum: ['playlist', 'album', 'search', 'recommendation', 'direct'],
                default: 'direct',
            },
            id: Schema.Types.ObjectId,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Indexes for analytics queries
ListenEventSchema.index({ userId: 1, startedAt: -1 });
ListenEventSchema.index({ trackId: 1, startedAt: -1 });
ListenEventSchema.index({ startedAt: -1 });

// TTL index to clean up old events (optional - keep 90 days)
// ListenEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const ListenEvent = model<IListenEvent>('ListenEvent', ListenEventSchema);
export default ListenEvent;
