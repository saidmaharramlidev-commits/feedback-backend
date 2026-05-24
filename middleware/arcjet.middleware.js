import aj from "../config/arcjet.js";

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1 });

        if (decision.isDenied()) {

            if (decision.reason.isRateLimit()) {

                res.status(429).json({ error: "Too Many Requests" });
            } else if (decision.reason.isBot()) {
                res.status(403).json({ error: "No bots allowed" });
            }
            res.status(403).json({ error: "Forbidden" });
        }


        next();

    } catch (error) {
        console.error("Arcjet error:", error);
        next(error);

    }
}

export default arcjetMiddleware;