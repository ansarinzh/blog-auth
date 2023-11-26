const express = require('express');
const router = express.Router();
const passport = require('passport');


const AuthController = require('./controllers/AuthController');

// Define routes
router.get('/auth/google', AuthController.login);
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), AuthController.loginCallback);
// router.get("/login/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/failure", failureMessage: true }), OAuthController.googleLoginCallback)
// router.get('/callback', AuthController.loginCallback)


module.exports = router;