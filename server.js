//server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoute = require("./routes/auth");
const apiRoute = require("./routes/api");
const mongoose = require('mongoose');
const cookieSession = require("cookie-session");
const passportStrategy = require("./passport");
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());
app.use(
  cookieSession({
    name: "session",
    keys: ["sessionkey"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Enable CORS
app.use(
  cors({
    origin: "http://popwatchapp.s3-website-ap-southeast-1.amazonaws.com",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);
app.use("/api", apiRoute);

// Start the server
app.listen(5000, () => {
  console.log('Server started on http://localhost:5000');
});
