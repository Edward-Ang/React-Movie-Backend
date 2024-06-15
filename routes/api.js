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
  console.log('email: ', userEmail);

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


module.exports = router;
