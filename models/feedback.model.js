import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Receiver user id is required'],
        },
        senderUsername: {
            type: String,
            default: null
        },
        senderId: {
            type: String,
            default: null
        },
        text: {
            type: String,
            trim: true,
            maxLength: [200, 'Feedback cannot exceed 200 characters'],
            default: null
        },
        isLiked: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 86400 * 1000)
        },
        type: {
            type: String,
            enum: ["text", "voice"],
            default: "text"
        },
        audioUrl: {
            type: String,
            default: null
        },
    }, { timestamps: true }
)

feedbackSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true })
const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback