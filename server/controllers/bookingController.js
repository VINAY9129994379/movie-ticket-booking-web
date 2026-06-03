const pool = require('../config/db');

// Create Booking
const createBooking = async (req, res) => {
  const { show_id, seats_booked, total_price, user_name, user_email } = req.body;
  const clerk_user_id = req.clerkUserId;

  console.log('--- Booking Request ---')
  console.log('clerk_user_id:', clerk_user_id)
  console.log('show_id:', show_id)
  console.log('seats_booked:', seats_booked)
  console.log('total_price:', total_price)

  try {
    const checkSeats = await pool.query(
      "SELECT seats_booked FROM bookings WHERE show_id = $1 AND booking_status = 'confirmed'",
      [show_id]
    );
    let currentBooked = [];
    checkSeats.rows.forEach(r => currentBooked = currentBooked.concat(r.seats_booked));

    const conflict = seats_booked.some(seat => currentBooked.includes(seat));
    if (conflict) return res.status(400).json({ error: "One or more seats already booked." });

    const newBooking = await pool.query(
      'INSERT INTO bookings (clerk_user_id, user_name, user_email, show_id, seats_booked, total_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [clerk_user_id, user_name, user_email, show_id, seats_booked, total_price]
    );
    res.status(201).json({ success: true, booking: newBooking.rows[0] });
  } catch (err) {
    console.error('--- Booking DB Error ---')
    console.error(err.message)
    res.status(500).json({ error: err.message });
  }
};

// Get Booked Seats for SeatLayout Component
const getBookedSeats = async (req, res) => {
  const { showId } = req.params;
  try {
    const result = await pool.query(
      "SELECT seats_booked FROM bookings WHERE show_id = $1 AND booking_status = 'confirmed'",
      [showId]
    );
    let bookedSeats = [];
    result.rows.forEach(row => bookedSeats = bookedSeats.concat(row.seats_booked));
    res.json({ bookedSeats });
  } catch (err) {
    console.error('getBookedSeats error:', err.message)
    res.status(500).json({ error: err.message });
  }
};

// Get User Specific Booking History
const getMyBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.id as booking_id, b.seats_booked, b.total_price, b.booking_status, b.created_at,
              s.theater_name, s.show_date, s.show_time,
              m.title, m.poster_path, m.runtime, m.genres,
              t.address as theater_address, t.city as theater_city
       FROM bookings b
       JOIN shows s ON b.show_id = s.id
       JOIN movies m ON s.movie_id = m.id
       LEFT JOIN theaters t ON LOWER(t.name) = LOWER(s.theater_name)
       WHERE b.clerk_user_id = $1 ORDER BY b.created_at DESC`,
      [req.clerkUserId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getMyBookings error:', err.message)
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get All Global Bookings
const getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, m.title as movie_title, s.theater_name, s.show_date, s.show_time
       FROM bookings b
       JOIN shows s ON b.show_id = s.id
       JOIN movies m ON s.movie_id = m.id ORDER BY b.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAllBookings error:', err.message)
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createBooking, getBookedSeats, getMyBookings, getAllBookings };