import rateLimit from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 
    standardHeaders: true,
    legacyHeaders: false,
})

export default apiLimiter
