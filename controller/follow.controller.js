import User from "../models/user.model.js";

export const toggleFollow = async (req, res, next) => {
    try {
        const { username } = req.params;
        const clerkId = req.auth().userId;

        if (!clerkId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const currentUser = await User.findOne({ clerkId });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "Follower user not found" });
        }

        if (targetUser._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }



        const isFollowing = currentUser.following.includes(targetUser._id);

        if (isFollowing) {
            // unfollow
            await User.findByIdAndUpdate(userId, {
                $pull: { following: targetUser._id }
            });
            await User.findByIdAndUpdate(targetUser._id, {
                $pull: { followers: userId }
            });

            return res.status(200).json({
                success: true,
                message: "Unfollowed successfully"
            });
        } else {
            // follow
            await User.findByIdAndUpdate(userId, {
                $push: { following: targetUser._id }
            });
            await User.findByIdAndUpdate(targetUser._id, {
                $push: { followers: userId }
            });

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