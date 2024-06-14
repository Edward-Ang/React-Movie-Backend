//passport.js
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

passport.use(
	new GoogleStrategy(
		{
			clientID: "1071506161796-6amc8ielf322i9984rlj9rjn8vapu4qm.apps.googleusercontent.com",
			clientSecret: "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",
			callbackURL: "/auth/google/callback",
			scope: ["profile", "email"],
		},
		function (accessToken, refreshToken, profile, callback) {
			callback(null, profile);
		}
	)
);

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});