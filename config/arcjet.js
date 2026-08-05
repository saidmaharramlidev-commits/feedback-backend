import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { ARCJET_KEY } from "./env.js";



const aj = arcjet({
    key: ARCJET_KEY,
    rules: [
        shield({ mode: "LIVE" }),
        tokenBucket({
            mode: "LIVE",
            characteristics: ["userId"], // ← key by this instead of IP
            refillRate: 20,
            interval: 10,
            capacity: 50,

        }),
        detectBot({
            mode: "LIVE",
            allow: [],
        }),
    ],
});
export default aj;