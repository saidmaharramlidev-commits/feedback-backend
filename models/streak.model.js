import mongoose from "mongoose";

const streakSchema = new mongoose.Schema(
    {
        clerkId: {
            type: String,
            required: true,
            unique: true, // one streak doc per user
        },
        currentStreak: {
            type: Number,
            default: 1,
        },
        longestStreak: {
            type: Number,
            default: 1,
        },
        lastSentDate: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

const Streak = mongoose.model("Streak", streakSchema);
export default Streak;