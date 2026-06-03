const express = require('express');
const router = express.Router();
const {
  getAllTheaters,
  getNearbyTheaters,
  getCities,
  getTheatersByCity,
  getAllTheatersGrouped
} = require('../controllers/theaterController.js');

router.get('/nearby', getNearbyTheaters);         // ?lat=xx&lon=xx&radius=50
router.get('/cities', getCities);                  // All unique cities
router.get('/city/:city', getTheatersByCity);      // Theaters by city
router.get('/theaters/all', getAllTheatersGrouped); // Shows grouped
router.get('/', getAllTheaters);                    // All theaters

module.exports = router;