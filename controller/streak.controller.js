import Streak from "../models/streak.model.js";

const isSameDay = (date1, date2) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return isSameDay(date, yesterday);
};

export const updateStreak = async (clerkId) => {
    try {
        const today = new Date();
        const existing = await Streak.findOne({ clerkId });

        if (!existing) {
            // first whispa ever — create streak
            await Streak.create({
                clerkId,
                currentStreak: 1,
                longestStreak: 1,
                lastSentDate: today,
            });
            return;
        }

        // already sent today — no change needed
        if (isSameDay(existing.lastSentDate, today)) {
            return;
        }

        // sent yesterday — continue streak
        if (isYesterday(existing.lastSentDate)) {
            const newStreak = existing.currentStreak + 1;
            await Streak.findOneAndUpdate(
                { clerkId },
                {
                    currentStreak: newStreak,
                    longestStreak: Math.max(newStreak, existing.longestStreak),
                    lastSentDate: today,
                }
            );
            return;
        }

        // missed a day — reset streak
        await Streak.findOneAndUpdate(
            { clerkId },
            {
                currentStreak: 1,
                lastSentDate: today,
            }
        );

    } catch (error) {
        console.error("Failed to update streak:", error);
    }
};

export const getStreak = async (req, res, next) => {
    try {
        const { clerkId } = req.params;

        const streak = await Streak.findOne({ clerkId });

        if (!streak) {
            return res.status(200).json({
                success: true,
                data: {
                    currentStreak: 0,
                    longestStreak: 0,
                }
            });
        }

        // check if streak is still active
        const today = new Date();
        const isActive = isSameDay(streak.lastSentDate, today) ||
            isYesterday(streak.lastSentDate);

        return res.status(200).json({
            success: true,
            data: {
                currentStreak: isActive ? streak.currentStreak : 0,
                longestStreak: streak.longestStreak,
            }
        });

    } catch (error) {
        next(error);
    }
};