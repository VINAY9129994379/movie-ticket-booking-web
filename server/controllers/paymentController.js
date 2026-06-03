const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const pool = require('../config/db');

const createPaymentIntent = async (req, res) => {
  const { booking_id } = req.body;
  try {
    const result = await pool.query(
      `SELECT b.*, m.title FROM bookings b
       JOIN shows s ON b.show_id = s.id
       JOIN movies m ON s.movie_id = m.id
       WHERE b.id = $1`,
      [booking_id]
    );
    const booking = result.rows[0];
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.booking_status === 'confirmed') {
      return res.status(400).json({ error: 'Booking already paid' });
    }
    const amount = Math.round(Number(booking.total_price) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      metadata: {
        booking_id: String(booking_id),
        movie_title: booking.title
      }
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

const confirmPayment = async (req, res) => {
  const { booking_id, payment_intent_id } = req.body;
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    await pool.query(
      "UPDATE bookings SET booking_status = 'confirmed' WHERE id = $1",
      [booking_id]
    );
    res.json({ success: true, message: 'Booking confirmed!' });
  } catch (err) {
    console.error('Confirm payment error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createPaymentIntent, confirmPayment };