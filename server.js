const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieSession = require('cookie-session');
const passportStrategy = require("./passport");
const cors = require('cors');

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://weihenang02:7DmqeA18poRALnhm@popwatch-cluster.glq5nzq.mongodb.net/PopWatch")
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(
  cookieSession({
    name: 'session',
    keys: ['sessionkey'],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Enable CORS
app.use(
  cors({
    origin: 'http://popwatchapp.s3-website-ap-southeast-1.amazonaws.com',
    methods: ['POST', 'GET'],
    credentials: true,
  })
);

// Health check route
app.get('/', (req, res) => {
  res.send('Application is running');
});

// Routes
const authRoute = require('./routes/auth');
const apiRoute = require('./routes/api');

app.use('/auth', authRoute);
app.use('/api', apiRoute);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});