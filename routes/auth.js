//auth.js
const router = require("express").Router();
const passport = require("passport");
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.get("/login/success", (req, res) => {
    if (req.user) {
        res.status(200).json({
            error: false,
            message: "Successfully Loged In",
            user: req.user,
        });
    } else {
        res.status(403).json({ error: true, message: "Not Authorized" });
    }
});

router.get("/login/failed", (req, res) => {
    res.status(401).json({
        error: true,
        message: "Log in failure",
    });
});

router.get("/google", passport.authenticate("google", ["profile", "email"]));

// Google authentication callback
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login/failed' }), async (req, res) => {
    const { id, displayName, emails } = req.user;

    try {
        let user = await User.findOne({ googleId: id });

        if (!user) {
            const newUser = new User({
                username: displayName,
                email: emails[0].value,
                googleId: id,
            });

            user = await newUser.save();
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
        } else {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
        }
    } catch (err) {
        console.error('Error in /google/callback route:', err);
        if (err.name === 'MongoError' && err.code === 11000) {
            // Handle duplicate key error (e.g., user already exists)
            res.status(409).json({ message: 'User already exists' });
        } else {
            // Handle other errors
            res.status(500).json({ message: 'Internal server error', error: err.message });
        }
    }
});


// Signup with username/email/password
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect(process.env.CLIENT_URL);
});

module.exports = router;