import { Webhook } from "svix";
import User from "../models/user.model.js";

export const handleClerkWebhook = async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        return res.status(500).json({ error: "Webhook secret not set" });
    }

    // get headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: "Missing svix headers" });
    }

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
        evt = wh.verify(req.body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        });
    } catch (err) {
        return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const eventType = evt.type;

    // user created
    if (eventType === "user.created") {
        const { id, email_addresses, username } = evt.data;

        const email = email_addresses[0]?.email_address;

        try {
            const existingUser = await User.findOne({ clerkId: id });

            if (!existingUser) {
                await User.create({
                    clerkId: id,
                    username: username || email.split("@")[0],
                    email,
                });
            }
        } catch (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ error: "Failed to create user" });
        }
    }

    // user updated
    if (eventType === "user.updated") {
        const { id, email_addresses, username } = evt.data;
        const email = email_addresses[0]?.email_address;

        try {
            await User.findOneAndUpdate(
                { clerkId: id },
                { username, email },
                { new: true }
            );
        } catch (err) {
            console.error("Error updating user:", err);
            return res.status(500).json({ error: "Failed to update user" });
        }
    }

    // user deleted
    if (eventType === "user.deleted") {
        const { id } = evt.data;

        try {
            await User.findOneAndDelete({ clerkId: id });
        } catch (err) {
            console.error("Error deleting user:", err);
            return res.status(500).json({ error: "Failed to delete user" });
        }
    }

    return res.status(200).json({ success: true });
};