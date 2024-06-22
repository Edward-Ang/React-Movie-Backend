// routes/api.js
const express = require('express');
const Favourite = require('../models/favourite');
const router = express.Router();

router.post("/favourite", async (req, res) => {
  const { id, movie, user, favrating } = req.body;
  const type = id;
  const email = user.email;
  const movieId = movie.id;
  const movieTitle = movie.title ? movie.title : movie.name;
  const movieDate = movie.release_date ? movie.release_date : movie.first_air_date;

  try {
    const existingfav = await Favourite.findOne({ movieId, userEmail: email });

    if (existingfav) {
      return res.status(400).json({ message: 'Already exists in favourites' });
    }

    const newFavourite = new Favourite({
      type: type,
      movieId: movieId,
      movieName: movieTitle,
      movieDate: movieDate,
      rating: favrating,
      userEmail: email,
    })

    await newFavourite.save();
    res.status(201).json({ message: 'Favourite added successfully' });
  } catch (err) {
    console.log('error: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/getFavourite', async (req, res) => {
  const userEmail = req.query.userEmail;
  console.log('Current user: ', userEmail);

  try {
    const favLists = await Favourite.find({ userEmail });
    if (!favLists.length) { // Checking if the list is empty
      return res.status(400).json({ message: 'No record found' });
    }

    res.status(200).json({ favLists });
  } catch (err) {
    console.log('error: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/deleteFavourite', async (req, res) => {
  const { movieId, email } = req.body;
  console.log('MovieId: ', movieId);
  console.log('Email: ', email);

  try {
    const deleteResult = await Favourite.deleteOne({ movieId: movieId, userEmail: email });

    if (deleteResult.deletedCount === 0) {
      return res.status(400).json({ message: 'Delete target not found' });
    }

    res.status(200).json({ message: 'Delete success' });
  } catch (err) {
    console.log('error: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/updateFavourite', async (req, res) => {
  const { movieId, email, updateRating } = req.body;
  console.log('MovieId: ', movieId);
  console.log('Email: ', email);
  console.log('Updated rating: ', updateRating);

  try {
    const updateResult = await Favourite.findOneAndUpdate(
      { movieId: movieId, userEmail: email },
      { rating: updateRating }, // Update the 'rating' field with the new value
      { new: true } // Option to return the updated document
    );

    if (!updateResult) {
      return res.status(400).json({ message: 'Update target not found' });
    }

    res.status(200).json({ message: 'Update success' });
  } catch (err) {
    console.log('error: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/checkFavourite', async (req, res) => {
  const { movieId, email } = req.query;

  try {
    const existingfav = await Favourite.findOne({ movieId: movieId, userEmail: email });

    if (existingfav) {
      return res.status(200).json({ exists: true });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.log('error: ', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
