import React, { useEffect, useState } from 'react'
import MovieCard from '../components/MovieCard'
import Blur from '../components/Blur'
import Loading from '../components/Loading'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { HeartIcon } from 'lucide-react'

const BACKEND_URL = import.meta.env.VITE_BASE_URL

const Favorite = () => {
  const [favoriteMovies, setFavoriteMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true)
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || []

        if (savedFavorites.length === 0) {
          setFavoriteMovies([])
          return
        }

        const res = await axios.get(`${BACKEND_URL}/api/movies`)
        const allMovies = res.data || []

        const filtered = allMovies.filter(movie => {
          const currentId = String(movie.id || movie.tmdb_id || movie._id)
          return savedFavorites.includes(currentId)
        })

        setFavoriteMovies(filtered)
      } catch (err) {
        console.error('Favorites fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  const handleRemoveFavorite = (movieId) => {
    const saved = JSON.parse(localStorage.getItem('favorites')) || []
    const updated = saved.filter(id => id !== String(movieId))
    localStorage.setItem('favorites', JSON.stringify(updated))
    setFavoriteMovies(prev => prev.filter(m => String(m.id) !== String(movieId)))
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <div className="relative pt-28 pb-20 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh] text-white">
      <Blur top="150px" left="0px" />
      <Blur top="50px" left="150px" />

      <div className="flex items-center gap-2 mb-8">
        <HeartIcon className="w-6 h-6 text-primary fill-primary" />
        <h1 className="text-2xl font-bold">Your Favorites</h1>
      </div>

      {favoriteMovies.length > 0 ? (
        <>
          <p className="text-gray-400 text-sm mb-6">{favoriteMovies.length} movie{favoriteMovies.length !== 1 ? 's' : ''} saved</p>
          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {favoriteMovies.map(movie => (
              <div key={movie.id} className="relative group">
                <MovieCard movie={movie} />
                {/* Remove from favorites button */}
                <button
                  onClick={() => handleRemoveFavorite(movie.id)}
                  className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition bg-red-600 hover:bg-red-500 text-white text-[10px] px-2 py-1 rounded-full cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <HeartIcon className="w-16 h-16 text-gray-700 mb-4" />
          <h2 className="text-xl font-medium text-gray-400">No favorite movies added yet.</h2>
          <p className="text-xs text-gray-600 mt-2 max-w-sm">
            Go to any movie and click the heart icon to save it here.
          </p>
          <button
            onClick={() => { navigate('/movies'); scrollTo(0, 0) }}
            className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary-dull text-white text-sm rounded-full transition cursor-pointer"
          >
            Browse Movies
          </button>
        </div>
      )}
    </div>
  )
}

export default Favorite