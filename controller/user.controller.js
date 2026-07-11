import User from "../models/user.model.js";
export const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;
        const clerkId = req.auth()?.userId;

        const user = await User.findOne({ username })
            .select("-password")
            .populate("followers", "clerkId _id")
            .populate("following", "clerkId _id")

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let isFollowedByThem = false;
        let isFollowing = false;

        if (clerkId) {
            const currentUser = await User.findOne({ clerkId });
            if (currentUser) {
                isFollowedByThem = user.following.some(
                    (f) => f._id.toString() === currentUser._id.toString()
                );
                isFollowing = user.followers.some(
                    (f) => f._id.toString() === currentUser._id.toString()
                );
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                followers: user.showFollowers ? user.followers : [],
                following: user.showFollowing ? user.following : [],
                isFollowedByThem,
                isFollowing,
            }
        });

    } catch (error) {
        next(error);
    }
};


export const getMe = async (req, res, next) => {
    try {
        const clerkId = req.auth().userId;

        console.log(clerkId)

        if (!clerkId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - no Clerk user"
            });
        }

        const user = await User.findOne({ clerkId }).select("-password").populate("following", "_id");;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};



export const updateUser = async (req, res, next) => {
    try {
        const clerkId = req.auth().userId;

        const allowedUpdates = ["username", "email", "bio", "avatarUrl", "isAcceptingFeedback", "showFollowers", "showFollowing", "followersOnly", "pushToken"];
        const updates = {};

        for (let key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided"
            });
        }

        if (updates.username) {
            const existingUser = await User.findOne({ username: updates.username });
            if (existingUser && existingUser.clerkId !== clerkId) {
                return res.status(409).json({
                    success: false,
                    message: "Username already taken"
                });
            }
        }

        // ← find by clerkId not _id
        const updatedUser = await User.findOneAndUpdate(
            { clerkId },
            { $set: updates },
            { new: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });

    } catch (error) {
        next(error);
    }
};

export const searchUsers = async (req, res, next) => {
    try {
        const { q } = req.query;
        const clerkId = req.auth().userId;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const users = await User.find({
            username: { $regex: q, $options: "i" },
            clerkId: { $ne: clerkId } // ✅ exclude current user
        })
            .select("username bio avatarUrl")
            .limit(20);

        return res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        next(error);
    }
};

export const syncUser = async (req, res, next) => {
    try {
        const { clerkId, username, email } = req.body;

        if (!clerkId || !username || !email) {
            return res.status(400).json({
                success: false,
                message: "clerkId, username and email are required"
            });
        }

        const existingUser = await User.findOne({ clerkId });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                data: existingUser
            });
        }

        const user = await User.create({
            clerkId,
            username,
            email,
        });

        return res.status(201).json({
            success: true,
            data: user
        });

    } catch (error) {
        next(error);
    }
};


export const blockUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const clerkId = req.auth().userId;

        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const currentUser = await User.findOne({ clerkId });
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const targetUser = await User.findOne({ username });
        if (!targetUser) {
            return res.status(404).json({ success: false, message: "Target user not found" });
        }

        if (currentUser._id.toString() === targetUser._id.toString()) {
            return res.status(400).json({ success: false, message: "You cannot block yourself" });
        }

        const isAlreadyBlocked = currentUser.blockedUsers.includes(targetUser._id);

        if (isAlreadyBlocked) {
            // unblock
            await User.findByIdAndUpdate(currentUser._id, {
                $pull: { blockedUsers: targetUser._id }
            });
            return res.status(200).json({ success: true, message: "User unblocked" });
        } else {
            // block — also remove from followers/following
            await User.findByIdAndUpdate(currentUser._id, {
                $addToSet: { blockedUsers: targetUser._id },
                $pull: { followers: targetUser._id, following: targetUser._id }
            });
            await User.findByIdAndUpdate(targetUser._id, {
                $pull: { followers: currentUser._id, following: currentUser._id }
            });
            return res.status(200).json({ success: true, message: "User blocked" });
        }

    } catch (error) {
        next(error);
    }
};

export const reportUser = async (req, res, next) => {
    try {
        const { username } = req.params;
        const clerkId = req.auth().userId;
        const { reason } = req.body;

        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const currentUser = await User.findOne({ clerkId });
        const targetUser = await User.findOne({ username });

        if (!currentUser || !targetUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // for now just log — later can save to a reports collection
        console.log(`REPORT: ${currentUser.username} reported ${targetUser.username} — reason: ${reason || "No reason provided"}`);

        return res.status(200).json({ success: true, message: "User reported" });

    } catch (error) {
        next(error);
    }
};