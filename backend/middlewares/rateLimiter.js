import rateLimit from "express-rate-limit";

// Rate limiter for login endpoints
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for certain conditions if needed
    return false;
  },
});

// Rate limiter for registration endpoints
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: "Too many registration attempts. Please try again after 1 hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: "Too many file uploads. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
