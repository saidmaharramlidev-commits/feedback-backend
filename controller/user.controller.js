import User from "../models/user.model.js";

export const getUserByUsername = async (req, res, next) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username }).select("-password");

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


export const getMe = async (req, res, next) => {
    try {
        const userId = req.auth.userId;

        const user = await User.findById(userId).select("-password");

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
        const userId = req.auth.userId;

        const allowedUpdates = ["username", "email", "bio", "avatarUrl", "isAcceptingFeedback"]; // whitelist

        const updates = {};

        // pick only allowed fields from req.body
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

        // check username uniqueness (only if username is being updated)
        if (updates.username) {
            const existingUser = await User.findOne({ username: updates.username });

            if (existingUser && existingUser._id.toString() !== userId) {
                return res.status(409).json({
                    success: false,
                    message: "Username already taken"
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
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