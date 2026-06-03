import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loading from '../components/Loading'
import Blur from '../components/Blur'
import { CalendarIcon, StarIcon, TicketIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const buildImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const BADGE_CONFIG = {
  Blockbuster:   { color: 'bg-yellow-500 text-black', icon: '🏆' },
  Superhit:      { color: 'bg-orange-500 text-white', icon: '🔥' },
  Trending:      { color: 'bg-blue-500 text-white',   icon: '📈' },
  'New Release': { color: 'bg-green-500 text-white',  icon: '✨' },
  Upcoming:      { color: 'bg-purple-500 text-white', icon: '🎬' },
}

const FILTERS = ['All', 'Now Showing', 'Upcoming', 'Trending', 'Superhit', 'Blockbuster']

const MovieReleaseCard = ({ movie }) => {
  const navigate = useNavigate()
  const badge = BADGE_CONFIG[movie.badge]
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : ''
  const releaseFormatted = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`)
    scrollTo(0, 0)
  }

  const handleBookNow = (e) => {
    e.stopPropagation()
    navigate(`/movies/${movie.id}#dateSelect`)
    scrollTo(0, 0)
  }

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 w-48 shadow-xl"
    >
      {/* Poster */}
      <div className="relative">
        <img
          src={buildImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-64 object-cover brightness-90 group-hover:brightness-100 transition"
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE }}
        />

        {/* Badge */}
        {movie.badge && badge && (
          <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
            {badge.icon} {movie.badge}
          </span>
        )}

        {/* Week tag */}
        {movie.status === 'now_showing' && movie.week && (
          <span className="absolute top-2 right-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-full">
            Week {movie.week}
          </span>
        )}

        {/* Upcoming release date */}
        {movie.status === 'upcoming' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to- from-black/90 to-transparent px-3 py-2">
            <p className="text-[10px] text-gray-300 flex items-center gap-1">
              <CalendarIcon className="w-3 h-3 text-primary" />
              {releaseFormatted}
            </p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="font-semibold text-sm leading-tight line-clamp-2">{movie.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-xs">{releaseYear}</span>
          <span className="flex items-center gap-0.5 text-xs text-gray-400">
            <StarIcon className="w-3 h-3 text-primary fill-primary" />
            {Number(movie.vote_average || 0).toFixed(1)}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 truncate">
          {movie.genres?.slice(0, 2).map(g => g.name).join(' · ')}
        </p>

        {/* Book Now — only for now showing */}
        {movie.status === 'now_showing' && (
          <button
            onClick={handleBookNow}
            className="mt-2 w-full flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dull text-white text-[11px] font-semibold py-2 rounded-lg transition cursor-pointer active:scale-95"
          >
            <TicketIcon className="w-3 h-3" /> Book Now
          </button>
        )}

        {/* Upcoming — notify badge */}
        {movie.status === 'upcoming' && (
          <div className="mt-2 w-full text-center text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 py-1.5 rounded-lg">
            🎬 Coming {releaseFormatted}
          </div>
        )}
      </div>
    </div>
  )
}

const Releases = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/movies/releases/upcoming`)
        setMovies(res.data)
      } catch (err) {
        console.error('Error loading releases:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReleases()
  }, [])

  const filteredMovies = movies.filter(movie => {
    if (activeFilter === 'All') return true
    if (activeFilter === 'Now Showing') return movie.status === 'now_showing'
    if (activeFilter === 'Upcoming') return movie.status === 'upcoming'
    return movie.badge === activeFilter
  })

  const nowShowing = movies.filter(m => m.status === 'now_showing')
  const upcoming = movies.filter(m => m.status === 'upcoming')
  const blockbusters = movies.filter(m => m.badge === 'Blockbuster')
  const superhits = movies.filter(m => m.badge === 'Superhit')

  if (loading) return <Loading />

  return (
    <div className="relative pt-28 pb-20 px-6 md:px-16 lg:px-40 overflow-hidden min-h-[80vh] text-white">
      <Blur top="150px" left="50px" />
      <Blur bottom="0" right="0" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="text-primary w-7 h-7" /> Releases
        </h1>
        <p className="text-gray-400 text-sm mt-2">Now showing, upcoming, trending aur blockbuster movies</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Now Showing', value: nowShowing.length, icon: '🎬', color: 'text-green-400' },
          { label: 'Upcoming',    value: upcoming.length,   icon: '📅', color: 'text-purple-400' },
          { label: 'Blockbusters',value: blockbusters.length,icon: '🏆', color: 'text-yellow-400' },
          { label: 'Superhits',   value: superhits.length,  icon: '🔥', color: 'text-orange-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer ${
              activeFilter === filter
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {filter}
            <span className="ml-1.5 text-xs opacity-70">
              ({filter === 'All' ? movies.length : movies.filter(m => {
                if (filter === 'Now Showing') return m.status === 'now_showing'
                if (filter === 'Upcoming') return m.status === 'upcoming'
                return m.badge === filter
              }).length})
            </span>
          </button>
        ))}
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="flex flex-wrap max-sm:justify-center gap-6">
          {filteredMovies.map(movie => (
            <MovieReleaseCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[30vh] bg-primary/5 border border-dashed border-primary/20 rounded-xl">
          <p className="text-gray-500 text-sm">No movies found in this category.</p>
        </div>
      )}
    </div>
  )
}

export default Releases