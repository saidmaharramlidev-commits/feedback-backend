import mongoose from "mongoose";
import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import { sendPushNotification } from "../config/expo.js";



export const sendFeedback = async (req, res, next) => {
    try {
        const { username } = req.params;
        const { text, senderUsername } = req.body;
        const clerkId = req.auth?.()?.userId;
        const senderClerkId = clerkId || null;

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

        if (!receiver.isAcceptingFeedback) {
            return res.status(403).json({
                success: false,
                message: "This user is not accepting feedback"
            });
        }

        if (clerkId) {
            const sender = await User.findOne({ clerkId });
            if (sender && receiver.blockedUsers.includes(sender._id)) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot send a whispa to this user"
                });
            }
        }

        const feedback = await Feedback.create({
            receiverId: receiver._id,
            text,
            senderUsername: senderUsername || null,
            senderId: senderClerkId,
        });

        await sendPushNotification(
            receiver.pushToken,
            "New Whispa 💬",
            "Someone sent you an anonymous feedback!"
        );

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
        const clerkId = req.auth().userId;

        // ← find user by clerkId first to get MongoDB _id
        const user = await User.findOne({ clerkId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const feedbacks = await Feedback.find({
            receiverId: user._id,
            isLiked: false
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
        const clerkId = req.auth().userId;
        const { id } = req.params;

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

        if (feedback.receiverId.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            });
        }

        await Feedback.findByIdAndDelete(id);

        await User.findByIdAndUpdate(user._id, {
            $pull: { favoriteFeedbacks: new mongoose.Types.ObjectId(id) }
        });

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
        const clerkId = req.auth()?.userId;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized"
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

        if (feedback.receiverId.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            });
        }

        const isAlreadyLiked = feedback.isLiked;

        if (isAlreadyLiked) {
            await Feedback.findByIdAndUpdate(id, {
                isLiked: false,
                expiresAt: new Date(Date.now() + 86400 * 1000)
            });


            await User.findByIdAndUpdate(user._id, {
                $pull: { favoriteFeedbacks: new mongoose.Types.ObjectId(id) }
            });

            return res.status(200).json({
                success: true,
                message: "Feedback unliked"
            });
        } else {
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

export const getLikedFeedbacks = async (req, res, next) => {
    try {
        const clerkId = req.auth().userId;

        const user = await User.findOne({ clerkId }).populate("favoriteFeedbacks");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user.favoriteFeedbacks
        });

    } catch (error) {
        next(error);
    }
};