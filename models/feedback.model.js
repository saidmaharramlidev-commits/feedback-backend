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
        }

    }, { timestamps: true }

)

feedbackSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

const Feedback = mongoose.model('Feedback', feedbackSchema)

export default Feedback