import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY } from "./env.js";



const aj = arcjet({
    key: ARCJET_KEY,
    rules: [
        shield({ mode: "DRY_RUN" }), // ← won't block, just logs
        tokenBucket({
            mode: "LIVE",
            refillRate: 20, // ← increase from 5
            interval: 10,
            capacity: 50, // ← increase from 10
        }),
    ],
});
export default aj;