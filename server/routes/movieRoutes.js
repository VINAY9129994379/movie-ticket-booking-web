const express = require('express');
const router = express.Router();
const { getAllMovies, getMovieById, addMovie, getNewReleases, getMoviesByDate } = require('../controllers/movieController.js');

router.get('/', getAllMovies);
router.get('/releases/upcoming', getNewReleases);
router.get('/date/:date', getMoviesByDate);   // Date filter route
router.post('/admin/add-movie', addMovie);
router.get('/:id', getMovieById);             // Dynamic route — sabse neeche

module.exports = router;