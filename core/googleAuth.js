const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Set up Google OAuth strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_AUTH_CLIENT_ID, //'154833709792-chg8vmihb5c51ato46r5r4ra6j3hjnma.apps.googleusercontent.com',
    clientSecret: process.env.GOOGLE_AUTH_SECRET_KEY, //'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',
    callbackURL: 'http://localhost:5000/auth/google/callback',
    passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
    // You can store user information in the database here.
    const url = req.query.state;
    return done(null, profile);
}));


// Serialize user to store in session
passport.serializeUser((user, done) => {
    done(null, user);
});


// Deserialize user from session
passport.deserializeUser((obj, done) => {
    done(null, obj);
});


