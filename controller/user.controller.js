import User from "../models/user.model.js";

export const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select("-password")

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({
            success: true,
            data: {
                ...user.toObject(),
                followers: user.showFollowers ? user.followers : [],
                following: user.showFollowing ? user.following : [],
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

        const user = await User.findOne({ clerkId }).select("-password");
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

        const allowedUpdates = ["username", "email", "bio", "avatarUrl", "isAcceptingFeedback", "showFollowers", "showFollowing"];
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

        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const users = await User.find({
            username: { $regex: q, $options: "i" } // case insensitive
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