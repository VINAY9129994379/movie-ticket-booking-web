const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/auth.js');
const { getShowsByMovieAndDate, addShow, getAllShowsList, deleteShow, getAllTheatersGrouped } = require('../controllers/showController.js');

router.get('/theaters/all', getAllTheatersGrouped);
router.get('/admin/all-shows-list', adminAuth, getAllShowsList);
router.post('/admin/add', adminAuth, addShow);
router.delete('/admin/:id', adminAuth, deleteShow);
router.get('/:id/:date', getShowsByMovieAndDate);

module.exports = router;