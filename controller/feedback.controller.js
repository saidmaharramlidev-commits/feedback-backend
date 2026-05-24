import User from "../models/user.model.js";
import Feedback from "../models/feedback.model.js";

export const sendFeedback = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Feedback text is required"
            });
        }

        const receiver = await User.findOne({ username });

        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const feedback = await Feedback.create({
            receiverId: receiver._id,
            text
        });

        return res.status(201).json({
            success: true,
            message: "Feedback sent successfully",
            data: feedback
        });

    } catch (error) {
        next(error);
    }
};



export const getMyFeedbacks = async (req, res, next) => {
    try {
        const userId = req.auth.userId;

        const feedbacks = await Feedback.find({
            receiverId: userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: feedbacks
        });

    } catch (error) {
        next(error);
    }
};



export const deleteFeedback = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const { id } = req.params;

        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        // only receiver can delete
        if (feedback.receiverId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            });
        }

        await Feedback.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Feedback deleted"
        });

    } catch (error) {
        next(error);
    }
};