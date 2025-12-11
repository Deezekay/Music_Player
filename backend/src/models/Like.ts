import { Schema, model, Document, Types } from 'mongoose';

export interface ILike extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    trackId: Types.ObjectId;
    createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        trackId: {
            type: Schema.Types.ObjectId,
            ref: 'Track',
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound unique index to prevent duplicate likes
LikeSchema.index({ userId: 1, trackId: 1 }, { unique: true });
LikeSchema.index({ userId: 1, createdAt: -1 });

export const Like = model<ILike>('Like', LikeSchema);
export default Like;
