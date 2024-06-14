// authenticateJWT.js
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from the authorization header

    if (token) {
        try {
            const decoded = jwt.verify(token, 'your_secret_key'); // Verify the token
            const user = await User.findById(decoded.userId); // Find user by ID

            if (!user) {
                console.log("user not found");
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.googleId) {
                req.user = user; 
                //console.log('user: ', user);
                //console.log('req.user: ', req.user); // Attach user to req object
                next();
            } else {
                req.user = user; 
                //console.log('req.user: ', req.user); // Attach user to req object
                next();
            } // Proceed to the next middleware or route handler
        } catch (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
    } else {
        console.log('toklen not found');
        return res.status(401).json({ message: 'Authorization header missing' });
    }
};

module.exports = authenticateJWT;
