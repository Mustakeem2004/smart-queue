import rateLimit from "express-rate-limit";

export const doctorRateLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: {
        message: "Too many requests. Please try again later."
    },
    standardHeaders: true,
    legacyHeaders: false
});