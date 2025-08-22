const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

console.log('GOOGLE_CLIENT_ID in passport.js:', process.env.GOOGLE_CLIENT_ID);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ email: profile.emails[0].value });
    if (!user) {
      // Always generate a password with at least 12 characters
      const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id,
        profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        password: randomPassword
      });
    } else if (!user.googleId) {
      user.googleId = profile.id;
      user.profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : '';
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    console.error('GoogleStrategy error:', err);
    return done(err, null);
  }
}));

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

module.exports = passport;
