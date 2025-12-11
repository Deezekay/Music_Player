import { Schema, model, Document, Types } from 'mongoose';

export interface IListenHistory extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    trackId: Types.ObjectId;
    playedAt: Date;
    duration: number; // How long they listened (seconds)
    completed: boolean; // If they listened to > 80% of the track
}

const ListenHistorySchema = new Schema<IListenHistory>(
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
        },
        playedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        duration: {
            type: Number,
            default: 0,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: false,
    }
);

// Compound indexes for efficient queries
ListenHistorySchema.index({ userId: 1, playedAt: -1 });
ListenHistorySchema.index({ userId: 1, trackId: 1 });

export const ListenHistory = model<IListenHistory>('ListenHistory', ListenHistorySchema);
export default ListenHistory;
