// middlewares/rateLimiter.js
import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    message: "Too many login attempts. Try again later.",
    error: true,
    success: false,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
