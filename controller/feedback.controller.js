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



export const toggleLikeFeedback = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { clerkId } = req.body; // who is liking

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: "clerkId is required"
            });
        }

        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const feedback = await Feedback.findById(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        // only the receiver can like their own feedbacks
        if (feedback.receiverId.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            });
        }

        const isAlreadyLiked = feedback.isLiked;

        if (isAlreadyLiked) {
            // unlike — restore TTL so it expires normally
            await Feedback.findByIdAndUpdate(id, {
                isLiked: false,
                expiresAt: new Date(Date.now() + 86400 * 1000)
            });

            await User.findByIdAndUpdate(user._id, {
                $pull: { favoriteFeedbacks: feedback._id }
            });

            return res.status(200).json({
                success: true,
                message: "Feedback unliked"
            });

        } else {
            // like — remove TTL so it never expires
            await Feedback.findByIdAndUpdate(id, {
                isLiked: true,
                expiresAt: null
            });

            await User.findByIdAndUpdate(user._id, {
                $push: { favoriteFeedbacks: feedback._id }
            });

            return res.status(200).json({
                success: true,
                message: "Feedback liked and saved permanently"
            });
        }

    } catch (error) {
        next(error);
    }
};