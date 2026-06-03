const pool = require('../config/db');

// Get Shows by Movie ID & Date
const getShowsByMovieAndDate = async (req, res) => {
  const { id, date } = req.params;
  try {
    const result = await pool.query(
      `SELECT s.*, t.address as theater_address, t.city as theater_city
       FROM shows s
       JOIN movies m ON s.movie_id = m.id
       LEFT JOIN theaters t ON LOWER(t.name) = LOWER(s.theater_name)
       WHERE (m.id = $1 OR m.tmdb_id = $2) AND s.show_date = $3`,
      [isNaN(id) ? 0 : parseInt(id), isNaN(id) ? 0 : parseInt(id), date]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Add New Show
const addShow = async (req, res) => {
  const { movie_id, theater_name, show_date, show_time, ticket_price, total_seats } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO shows (movie_id, theater_name, show_date, show_time, ticket_price, total_seats) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [movie_id, theater_name, show_date, show_time, ticket_price, total_seats || 60]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Get All Shows List for Dashboard
const getAllShowsList = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.theater_name, s.show_date, s.show_time, s.ticket_price, s.total_seats,
              m.title as movie_title, m.poster_path, m.vote_average
       FROM shows s
       JOIN movies m ON s.movie_id = m.id
       WHERE s.show_date >= CURRENT_DATE
       ORDER BY s.show_date ASC, s.show_time ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAllShowsList error:', err.message);
    res.status(500).json({ error: err.message }); 
  }
};

// Admin: Delete Show
const deleteShow = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM shows WHERE id = $1', [id]);
    res.json({ success: true, message: 'Show deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all unique theaters grouped with movies
const getAllTheatersGrouped = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.theater_name, json_agg(DISTINCT jsonb_build_object('id', m.id, 'title', m.title, 'poster_path', m.poster_path, 'runtime', m.runtime)) as playing_movies
       FROM shows s
       JOIN movies m ON s.movie_id = m.id
       GROUP BY s.theater_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getAllTheatersGrouped error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getShowsByMovieAndDate, addShow, getAllShowsList, deleteShow, getAllTheatersGrouped };