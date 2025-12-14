const express = require('express');
const router = express.Router();
const passport = require('passport');
const {
  signup,
  login,
  verifyEmail,
  getMe,
  forgotPassword,
  resetPassword,
  handleOAuthCallback,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// OAuth error handler middleware
const handleOAuthError = (provider) => (req, res, next) => {
  // Check if the OAuth strategy is configured
  if (!passport._strategy(provider)) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/login?error=oauth_not_configured&provider=${provider}`);
  }
  next();
};

router.post('/signup', signup);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Google OAuth
router.get('/google', handleOAuthError('google'), passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed` 
  }),
  handleOAuthCallback
);

// GitHub OAuth
router.get('/github', handleOAuthError('github'), passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=oauth_failed` 
  }),
  handleOAuthCallback
);

module.exports = router;
