import Reply from "../models/reply.model.js";
import Feedback from "../models/feedback.model.js";
import User from "../models/user.model.js";
import { sendPushNotification } from "../config/expo.js";

// premium receiver sends reply to whispa sender
export const sendReply = async (req, res, next) => {
    try {
        const { feedbackId } = req.params;
        const { text } = req.body;
        const clerkId = req.auth().userId;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Reply text is required"
            });
        }

        const currentUser = await User.findOne({ clerkId });
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // check if premium
        if (!currentUser.isPremium) {
            return res.status(403).json({
                success: false,
                message: "Premium required to reply to whispas"
            });
        }

        const feedback = await Feedback.findById(feedbackId);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Whispa not found"
            });
        }

        // make sure current user is the receiver of this feedback
        if (feedback.receiverId.toString() !== currentUser._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            });
        }

        // make sure there is a sender to reply to
        if (!feedback.senderId) {
            return res.status(400).json({
                success: false,
                message: "This whispa was sent anonymously and cannot be replied to"
            });
        }

        const reply = await Reply.create({
            feedbackId: feedback._id,
            receiverId: currentUser._id,
            senderId: feedback.senderId,
            text,
        });

        // send push notification to original sender
        const sender = await User.findOne({ clerkId: feedback.senderId });
        if (sender?.pushToken) {
            await sendPushNotification(
                sender.pushToken,
                "New Reply 💌",
                `${currentUser.username} replied to your whispa!`
            );
        }

        return res.status(201).json({
            success: true,
            message: "Reply sent",
            data: reply
        });

    } catch (error) {
        next(error);
    }
};

// sender gets their inbox
export const getMyReplies = async (req, res, next) => {
    try {
        const clerkId = req.auth().userId;

        const replies = await Reply.find({ senderId: clerkId })
            .populate("receiverId", "username avatarUrl")
            .populate("feedbackId", "text")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: replies
        });

    } catch (error) {
        next(error);
    }
};


// delete reply from inbox — sender deletes from their inbox
export const deleteReply = async (req, res, next) => {
    try {
        const { replyId } = req.params;
        const clerkId = req.auth().userId;

        const reply = await Reply.findById(replyId);
        if (!reply) {
            return res.status(404).json({
                success: false,
                message: "Reply not found"
            });
        }

        // only sender (inbox owner) can delete from their inbox
        if (reply.senderId !== clerkId) {
            return res.status(403).json({
                success: false,
                message: "Not allowed"
            });
        }

        await Reply.findByIdAndDelete(replyId);

        return res.status(200).json({
            success: true,
            message: "Reply deleted from inbox"
        });

    } catch (error) {
        next(error);
    }
};