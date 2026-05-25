import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Receiver user id is required'],
        },
        text: {
            type: String,
            required: [true, 'Feedback text is required'],
            minlength: 2,
            maxlength: 500,
            trim: true,
        },
        isLiked: {
            type: Boolean,
            default: false
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 86400 * 1000)
        }
    }, { timestamps: true }
)

feedbackSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true })
const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback