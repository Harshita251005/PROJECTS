const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 100, // Limit each IP to 100 requests per windowMs (10000 in dev)
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 5, // Limit each IP to 5 login/register requests per windowMs (1000 in dev)
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Create event limiter (prevent spam)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDev ? 1000 : 10, // Limit each IP to 10 creates per hour (1000 in dev)
  message: {
    success: false,
    message: 'Too many create requests, please try again later.',
  },
});

// File upload limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 20, // Limit each IP to 20 uploads per 15 minutes (1000 in dev)
  message: {
    success: false,
    message: 'Too many upload requests, please try again later.',
  },
});

// Message sending limiter
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 1000 : 30, // Limit each IP to 30 messages per minute (1000 in dev)
  message: {
    success: false,
    message: 'You are sending messages too quickly. Please slow down.',
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  createLimiter,
  uploadLimiter,
  messageLimiter,
};
