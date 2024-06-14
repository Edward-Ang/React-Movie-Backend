// models/favourite.js
const mongoose = require('mongoose');

// Define the Favourite schema
const favouriteSchema = new mongoose.Schema({
    movieId: { type: String, required: true },
    movieName: { type: String, required: true },
    movieDate: { type: Date, required: true },
    rating: { type: Number, required: true, min: 0, max: 10 },
    userEmail: { type: String, required: true },
});

// Create the Favourite model
const Favourite = mongoose.model('Favourite', favouriteSchema);

module.exports = Favourite;
