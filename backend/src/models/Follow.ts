import { Schema, model, Document, Types } from 'mongoose';

export interface IFollow extends Document {
    _id: Types.ObjectId;
    followerId: Types.ObjectId; // User who is following
    followingId: Types.ObjectId; // User/Artist being followed
    followingType: 'user' | 'artist';
    createdAt: Date;
}

const FollowSchema = new Schema<IFollow>(
    {
        followerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        followingId: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: 'followingType',
        },
        followingType: {
            type: String,
            enum: ['user', 'artist'],
            default: 'user',
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Ensure unique follows
FollowSchema.index({ followerId: 1, followingId: 1, followingType: 1 }, { unique: true });
FollowSchema.index({ followingId: 1, followingType: 1 });

export const Follow = model<IFollow>('Follow', FollowSchema);
export default Follow;
