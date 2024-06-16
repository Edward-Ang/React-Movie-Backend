// /routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../authenticateJWT');

router.get("/login/success", authenticateJWT, async (req, res) => {
    console.log('Incoming request:', req.user); // Log the req.user object

    if (req.user) {
        try {
            let userData;
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            userData = {
                id: user._id,
                name: user.username,
                email: user.email,
                provider: 'email/password',
                picture: user.picture,
            };

            res.status(200).json({
                error: false,
                message: "Successfully Logged In",
                user: userData,
            });
        } catch (err) {
            console.error('Error getting user data:', err);
            res.status(500).json({ error: true, message: "Internal server error" });
        }
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
    const { id, displayName, emails, photos } = req.user;
    console.log(photos);

    try {
        let user = await User.findOne({ googleId: id });

        if (!user) {
            const newUser = new User({
                username: displayName,
                email: emails[0].value,
                googleId: id,
                picture: photos[0].value,
            });

            user = await newUser.save();
            const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
            res.redirect(`http://popwatchapp.s3-website-ap-southeast-1.amazonaws.com?token=${token}`);
        } else {
            const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
            res.redirect(`http://popwatchapp.s3-website-ap-southeast-1.amazonaws.com?token=${token}`);
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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Login with email and password
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Attach the user object to the request
        req.user = user;

        // If the user object is attached to the request, proceed with sending the token
        const token = jwt.sign({ userId: req.user._id }, 'your_secret_key', { expiresIn: '1h' });
        res.status(200).json({ message: 'Login success', token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get("/logout", (req, res) => {
    req.logout();
    res.redirect('http://popwatchapp.s3-website-ap-southeast-1.amazonaws.com');
});

module.exports = router;