import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import Blur from '../components/Blur'
import { StarIcon, Heart, PlayCircleIcon } from 'lucide-react'
import timeFormat from '../lib/timeFormat'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { toast } from 'react-hot-toast'

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

const buildImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const MovieDetails = () => {
  const { id } = useParams()
  const [show, setShow] = useState(null)
  const [allMovies, setAllMovies] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const navigate = useNavigate()

  const getShow = async () => {
    try {
      const movieRes = await axios.get(`${BACKEND_URL}/api/movies/${id}`)

      // ✅ Correct — local date use karo
const dynamicDates = []
for (let i = 0; i < 30; i++) {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  dynamicDates.push(`${year}-${month}-${day}`)
}

      const movieData = Array.isArray(movieRes.data) ? movieRes.data[0] : movieRes.data

      if (movieData) {
        setShow({ movie: movieData, dateTime: dynamicDates })
      } else {
        toast.error('Movie details nahi mili')
      }

      const allMoviesRes = await axios.get(`${BACKEND_URL}/api/movies`)
      setAllMovies(allMoviesRes.data)

    } catch (error) {
      console.error('Backend Connectivity Error:', error)
      toast.error('Database se movie load karne me error aayi')
    }
  }

  useEffect(() => {
    if (id) {
      const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || []
      setIsFavorite(savedFavorites.includes(String(id)))
    }
  }, [id])

  useEffect(() => {
    getShow()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleToggleFavorite = () => {
    let savedFavorites = JSON.parse(localStorage.getItem('favorites')) || []
    const movieIdStr = String(id)

    if (savedFavorites.includes(movieIdStr)) {
      savedFavorites = savedFavorites.filter(item => item !== movieIdStr)
      setIsFavorite(false)
      toast.success('Removed from favorites')
    } else {
      savedFavorites.push(movieIdStr)
      setIsFavorite(true)
      toast.success('Added to favorites! ❤️')
    }

    localStorage.setItem('favorites', JSON.stringify(savedFavorites))
  }

  return show ? (
    <div className="px-6 md:px-16 lg:px-40 pt-30 md:pt-50">
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* ✅ Fixed: was `https://tmdb.org{show.movie.poster_path}` */}
        <img
          src={buildImageUrl(show.movie.poster_path)}
          alt=""
          className="max-md:mx-auto rounded-xl h-104 max-w-70 object-cover shadow-2xl border border-gray-800"
        />
        <div className="relative flex flex-col gap-3">
          <Blur top="-100px" left="-100px" />
          <p className="text-primary">{show.movie.original_language?.toUpperCase() || 'ENGLISH'}</p>
          <h1 className="text-4xl font-semibold max-w-96 text-balance">{show.movie.title}</h1>
          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {Number(show.movie.vote_average || 0).toFixed(1)} User Rating
          </div>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-xl text-justify">
            {show.movie.overview}
          </p>
          <p>
            {timeFormat(show.movie.runtime)} · {show.movie.genres?.map(g => g.name).join(', ')} · {show.movie.release_date?.split('-')[0]}
          </p>
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-gray-800 hover:bg-gray-900 transition rounded-md font-medium cursor-pointer active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>
            <a
              href="#dateSelect"
              className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer active:scale-95 text-white text-center"
            >
              Buy Tickets
            </a>
            <button
              onClick={handleToggleFavorite}
              className={`p-2.5 rounded-full transition cursor-pointer active:scale-95 border border-transparent ${
                isFavorite
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                  : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <p className="text-lg font-medium mt-20">Your Favorite Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-4 w-max px-4">
          {show.movie.casts?.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              {/* ✅ Fixed: was `https://tmdb.org{cast.profile_path}` */}
              <img
                src={buildImageUrl(cast.profile_path)}
                alt=""
                className="rounded-full h-20 md:h-20 aspect-square object-cover border border-gray-800 shadow-md"
              />
              <p className="font-medium text-xs mt-3 w-24 truncate">{cast.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="dateSelect">
        <DateSelect dateTime={show.dateTime} id={id} />
      </div>

      <p className="text-lg font-medium mt-20 mb-8">You may also like</p>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {allMovies
          .filter(m => m.id !== show.movie.id && m.tmdb_id !== show.movie.tmdb_id)
          .slice(0, 4)
          .map((movie, index) => (
            <MovieCard key={index} movie={movie} />
          ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => { navigate('/movies'); scrollTo(0, 0) }}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer"
        >
          Show More
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default MovieDetails