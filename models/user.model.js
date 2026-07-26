import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        clerkId: { type: String, required: true, unique: true },
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            minLength: [2, 'Username must be at least 2 characters'],
            maxLength: [30, 'Username cannot exceed 30 characters'],
            unique: true,
            lowercase: true,
            match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens']
        },
        favoriteFeedbacks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }],
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            maxLength: [100, 'Email cannot exceed 100 characters'],
            match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
        },
        blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
        following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isPremium: { type: Boolean, default: false },

        bio: {
            type: String,
            trim: true,
            maxLength: [160, 'Bio cannot exceed 160 characters'],
            default: ''
        },
        avatarUrl: {
            type: String,
            default: ''
        },

        isAcceptingFeedback: {
            type: Boolean,
            default: true
        },
        pushToken: {
            type: String,
            default: null
        },
        followersOnly: {
            type: Boolean,
            default: false
        },
        showFollowers: { type: Boolean, default: true },
        showFollowing: { type: Boolean, default: true },

    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;