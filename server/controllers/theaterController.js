const pool = require('../config/db');

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const getTheatersWithShows = async (theaters) => {
  const today = new Date().toISOString().split('T')[0]
  const enriched = await Promise.all(theaters.map(async (theater) => {
    try {
      const showsRes = await pool.query(
        `SELECT s.id as show_id, s.show_time, s.show_date, s.ticket_price, s.total_seats,
                m.id as movie_id, m.title, m.poster_path, m.runtime, m.genres, m.vote_average
         FROM shows s
         JOIN movies m ON s.movie_id = m.id
         WHERE LOWER(s.theater_name) = LOWER($1) AND s.show_date >= $2
         ORDER BY s.show_date ASC, s.show_time ASC`,
        [theater.name, today]
      )
      const moviesMap = {}
      showsRes.rows.forEach(row => {
        if (!moviesMap[row.movie_id]) {
          moviesMap[row.movie_id] = {
            movie_id: row.movie_id,
            title: row.title,
            poster_path: row.poster_path,
            runtime: row.runtime,
            genres: row.genres,
            vote_average: row.vote_average,
            shows: []
          }
        }
        moviesMap[row.movie_id].shows.push({
          show_id: row.show_id,
          show_time: row.show_time,
          show_date: row.show_date,
          ticket_price: row.ticket_price,
          total_seats: row.total_seats
        })
      })
      return { ...theater, movies: Object.values(moviesMap) }
    } catch (err) {
      return { ...theater, movies: [] }
    }
  }))
  return enriched
}

const getAllTheaters = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM theaters ORDER BY city ASC')
    const theaters = await getTheatersWithShows(result.rows)
    res.json(theaters)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getNearbyTheaters = async (req, res) => {
  const { lat, lon, radius = 200 } = req.query
  if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required ' })
  try {
    const result = await pool.query('SELECT * FROM theaters')
    const nearby = result.rows
      .map(t => ({
        ...t,
        distance: parseFloat(getDistance(
          parseFloat(lat), parseFloat(lon),
          parseFloat(t.latitude), parseFloat(t.longitude)
        ).toFixed(1))
      }))
      .filter(t => t.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance)
    const enriched = await getTheatersWithShows(nearby)
    res.json(enriched)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getCities = async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT city FROM theaters ORDER BY city ASC')
    res.json(result.rows.map(r => r.city))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getTheatersByCity = async (req, res) => {
  const { city } = req.params
  try {
    const result = await pool.query(
      'SELECT * FROM theaters WHERE LOWER(city) = LOWER($1) ORDER BY name ASC',
      [city]
    )
    const enriched = await getTheatersWithShows(result.rows)
    res.json(enriched)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const getAllTheatersGrouped = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.theater_name, json_agg(DISTINCT jsonb_build_object('id', m.id, 'title', m.title, 'poster_path', m.poster_path, 'runtime', m.runtime)) as playing_movies
       FROM shows s JOIN movies m ON s.movie_id = m.id
       GROUP BY s.theater_name`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = { getAllTheaters, getNearbyTheaters, getCities, getTheatersByCity, getAllTheatersGrouped }