import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
    {
        feedbackId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Feedback",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderId: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
            maxlength: 200,
            trim: true,
        },
    },
    { timestamps: true }
);

const Reply = mongoose.model("Reply", replySchema);
export default Reply;