import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
    // skip arcjet for sync route
    if (req.path === '/users/sync') return next()

    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({ error: "Too Many Requests" });
            } else if (decision.reason.isBot()) {
                return res.status(403).json({ error: "No bots allowed" });
            }
            return res.status(403).json({ error: "Forbidden" });
        }

        next();

    } catch (error) {
        console.error("Arcjet error:", error);
        next(error);
    }
}

export default arcjetMiddleware;