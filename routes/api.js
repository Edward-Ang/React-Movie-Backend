// routes/api.js
const express = require("express");
const router = express.Router();

router.post("/favourite", (req, res) => {
  const { movie, user,favrating } = req.body;

  console.log('Current user: ', user.email);
  console.log("Favourite movie:", movie.title || movie.name);
  console.log('Rating: ', favrating);
  res.status(200).send({ message: "Favourite movie added successfully" });
});

module.exports = router;
