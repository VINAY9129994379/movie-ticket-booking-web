const express = require('express');
const router = express.Router();
const checkClerkUser = require('../middleware/auth.js');
const adminAuth = require('../middleware/auth.js');
const { createBooking, getMyBookings, getBookedSeats, getAllBookings } = require('../controllers/bookingController.js');

router.post('/', checkClerkUser, createBooking);
router.get('/my-bookings', checkClerkUser, getMyBookings);
router.get('/show/:showId/booked', getBookedSeats);
router.get('/admin/all', adminAuth, getAllBookings); // Admin only

module.exports = router;