const pool = require('../config/db');

// Get All Movies
const getAllMovies = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM movies ORDER BY release_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Movie Details
const getMovieById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM movies WHERE id = $1 OR tmdb_id = $2',
      [isNaN(id) ? 0 : parseInt(id), isNaN(id) ? 0 : parseInt(id)]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Movie not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Add Movie
const addMovie = async (req, res) => {
  const { id, title, overview, poster_path, backdrop_path, genres, casts, release_date, original_language, tagline, vote_average, vote_count, runtime } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO movies (tmdb_id, title, overview, poster_path, backdrop_path, genres, casts, release_date, original_language, tagline, vote_average, vote_count, runtime) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [id, title, overview, poster_path, backdrop_path, JSON.stringify(genres), JSON.stringify(casts), release_date, original_language, tagline, vote_average, vote_count, runtime]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: err.message || 'Database Insertion Error' });
  }
};

// Get Categorized Releases
const getNewReleases = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    const result = await pool.query('SELECT * FROM movies ORDER BY release_date DESC')
    const movies = result.rows

    const categorized = movies.map(movie => {
      const releaseDate = new Date(movie.release_date)
      const todayDate = new Date(today)
      const daysDiff = Math.floor((todayDate - releaseDate) / (1000 * 60 * 60 * 24))
      const voteAvg = Number(movie.vote_average || 0)
      const voteCount = Number(movie.vote_count || 0)

      // Status: upcoming ya now showing
      const status = releaseDate > todayDate ? 'upcoming' : 'now_showing'

      // Week calculation for now showing movies
      let week = null
      if (status === 'now_showing' && daysDiff >= 0) {
        week = Math.floor(daysDiff / 7) + 1
      }

      // Badge logic
      let badge = null
      if (status === 'now_showing') {
        if (voteAvg >= 8.0 && voteCount >= 5000) badge = 'Blockbuster'
        else if (voteAvg >= 7.5 && voteCount >= 2000) badge = 'Superhit'
        else if (voteAvg >= 7.0 || voteCount >= 1000) badge = 'Trending'
        else if (week === 1) badge = 'New Release'
      } else {
        badge = 'Upcoming'
      }

      return {
        ...movie,
        status,
        week,
        badge,
        days_since_release: daysDiff
      }
    })

    res.json(categorized)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getAllMovies, getMovieById, addMovie, getNewReleases };

// Get movies by show date
const getMoviesByDate = async (req, res) => {
  const { date } = req.params
  try {
    const result = await pool.query(
      `SELECT DISTINCT m.* FROM movies m
       JOIN shows s ON s.movie_id = m.id
       WHERE s.show_date = $1
       ORDER BY m.title ASC`,
      [date]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getAllMovies, getMovieById, addMovie, getNewReleases, getMoviesByDate }