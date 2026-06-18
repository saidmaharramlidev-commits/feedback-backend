import User from "../models/user.model.js";

import { sendPushNotification } from "../config/expo.js";

export const toggleFollow = async (req, res, next) => {
    try {
        const { username } = req.params;
        const clerkId = req.auth().userId;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // find current user by clerkId
        const currentUser = await User.findOne({ clerkId });
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "Current user not found"
            });
        }

        if (targetUser._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        const isFollowing = currentUser.following.includes(targetUser._id);

        if (isFollowing) {
            await User.findByIdAndUpdate(currentUser._id, {
                $pull: { following: targetUser._id }
            });
            await User.findByIdAndUpdate(targetUser._id, {
                $pull: { followers: currentUser._id }
            });

            return res.status(200).json({
                success: true,
                message: "Unfollowed successfully"
            });
        } else {
            await User.findByIdAndUpdate(currentUser._id, {
                $push: { following: targetUser._id }
            });
            await User.findByIdAndUpdate(targetUser._id, {
                $push: { followers: currentUser._id }
            });

            await sendPushNotification(
                targetUser.pushToken,
                "New Follower 🎉",
                `${currentUser.username} started following you!`
            );

            return res.status(200).json({
                success: true,
                message: "Followed successfully"
            });
        }

    } catch (error) {
        next(error);
    }
};

export const getFollowers = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })
            .populate("followers", "username bio avatarUrl");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user.followers
        });

    } catch (error) {
        next(error);
    }
};

export const getFollowing = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username })
            .populate("following", "username bio avatarUrl");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user.following
        });

    } catch (error) {
        next(error);
    }
};


export const removeFollower = async (req, res, next) => {
    try {
        const { username } = req.params;
        const clerkId = req.auth().userId;

        if (!clerkId) {
            return res.status(400).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // current user (the one removing)
        const currentUser = await User.findOne({ clerkId });
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // follower to remove
        const followerUser = await User.findOne({ username });
        if (!followerUser) {
            return res.status(404).json({
                success: false,
                message: "Follower not found"
            });
        }

        // remove follower from current user's followers
        await User.findByIdAndUpdate(currentUser._id, {
            $pull: { followers: followerUser._id }
        });

        // remove current user from follower's following
        await User.findByIdAndUpdate(followerUser._id, {
            $pull: { following: currentUser._id }
        });

        return res.status(200).json({
            success: true,
            message: "Follower removed"
        });

    } catch (error) {
        next(error);
    }
};