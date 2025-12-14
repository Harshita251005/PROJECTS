const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const axios = require('axios');
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

const getCallbackUrl = (envKey, defaultPath) => {
  if (process.env[envKey]) {
    return process.env[envKey];
  }

  const baseUrl = (process.env.SERVER_URL || process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');
  return `${baseUrl}${defaultPath}`;
};


if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const googleCallbackURL = getCallbackUrl('GOOGLE_CALLBACK_URL', '/api/auth/google/callback');
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: googleCallbackURL
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
       
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
        
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }

       
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          profilePicture: profile.photos[0].value,
          isEmailVerified: true
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
} else {
  console.warn('Google OAuth credentials not found. Google authentication will be disabled.');
}


if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  const githubCallbackURL = getCallbackUrl('GITHUB_CALLBACK_URL', '/api/auth/github/callback');
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: githubCallbackURL,
    scope: ['user:email']
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
       
        let user = await User.findOne({ githubId: profile.id });

        if (user) {
          return done(null, user);
        }

        let email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
          const { data: emails } = await axios.get('https://api.github.com/user/emails', {
            headers: {
              Authorization: `token ${accessToken}`,
              'User-Agent': 'HackVerse-App',
              Accept: 'application/vnd.github+json',
            },
          });

          const primaryEmail = emails.find((item) => item.primary && item.verified);
          const verifiedEmail = primaryEmail || emails.find((item) => item.verified);
          email = verifiedEmail ? verifiedEmail.email : null;
        }

        if (!email) {
       
          return done(new Error("Email is required from GitHub"), null);
        }

     
        user = await User.findOne({ email: email });

        if (user) {
         
          user.githubId = profile.id;
          await user.save();
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          profilePicture: profile.photos[0].value,
          githubLink: profile.profileUrl,
          isEmailVerified: true
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  ));
} else {
  console.warn('GitHub OAuth credentials not found. GitHub authentication will be disabled.');
}

module.exports = passport;
