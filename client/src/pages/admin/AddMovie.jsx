import React, { useState } from 'react'
import Title from './Title'
import { SearchIcon, PlusCircleIcon, CheckCircleIcon, StarIcon, CalendarIcon } from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { useAuth } from '@clerk/react'

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const buildImageUrl = (path) => {
  if (!path) return FALLBACK
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE}${path.startsWith('/') ? path : `/${path}`}`
}

const AddMovie = () => {
  const { userId } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addingId, setAddingId] = useState(null)
  const [addedIds, setAddedIds] = useState([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return toast.error('Type movie name here..!')
    try {
      setSearching(true)
      const res = await axios.get(
        `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}&language=en-US&page=1`
      )
      const results = res.data.results.filter(m => m.poster_path)
      setSearchResults(results.slice(0, 8))
      if (results.length === 0) toast.error('not found any movie!')
    } catch (err) {
      console.error(err)
      toast.error('TMDB search failed.')
    } finally {
      setSearching(false)
    }
  }

  const handleAddMovie = async (movie) => {
    try {
      setAddingId(movie.id)

      // Fetch full movie details + credits
      const [detailsRes, creditsRes] = await Promise.all([
        axios.get(`${TMDB_BASE}/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=en-US`),
        axios.get(`${TMDB_BASE}/movie/${movie.id}/credits?api_key=${TMDB_API_KEY}`)
      ])

      const details = detailsRes.data
      const credits = creditsRes.data

      const casts = credits.cast.slice(0, 10).map(c => ({
        name: c.name,
        profile_path: c.profile_path || ''
      }))

      const payload = {
        id: details.id,
        title: details.title,
        overview: details.overview,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        genres: details.genres,
        casts,
        release_date: details.release_date,
        original_language: details.original_language,
        tagline: details.tagline || '',
        vote_average: details.vote_average,
        vote_count: details.vote_count,
        runtime: details.runtime || 120
      }

      await axios.post(`${BACKEND_URL}/api/movies/admin/add-movie`, payload, {
        headers: { 'x-clerk-user-id': userId }
      })

      setAddedIds(prev => [...prev, movie.id])
      toast.success(`"${details.title}" successfully added! 🎬`)
    } catch (err) {
      console.error(err)
      if (err.response?.status === 409 || err.response?.data?.error?.includes('duplicate')) {
        toast.error('Yeh movie already DB me hai!')
        setAddedIds(prev => [...prev, movie.id])
      } else {
        toast.error(err.response?.data?.error || 'error detect during movie addition.')
      }
    } finally {
      setAddingId(null)
    }
  }

  return (
    <>
      <Title text1='Add' text2='Movie' />

      <div className="mt-8 max-w-2xl">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
          Search Movie from TMDB
        </p>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Movie name search here... (e.g. Pathaan, RRR, Avatar)"
              className="w-full bg-gray-900/60 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dull text-white px-5 py-3 rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results */}
        {searchResults.length > 0 && (
          <div className="mt-6 flex flex-col gap-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{searchResults.length} results found</p>
            {searchResults.map(movie => {
              const isAdded = addedIds.includes(movie.id)
              const isAdding = addingId === movie.id
              return (
                <div key={movie.id} className="flex items-center gap-4 bg-gray-900/60 border border-gray-800 hover:border-primary/30 rounded-xl p-3 transition">
                  <img
                    src={buildImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-12 h-16 object-cover rounded-lg flex-shrink- bg-gray-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">{movie.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <CalendarIcon className="w-3 h-3" />
                        {movie.release_date?.split('-')[0] || 'TBA'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <StarIcon className="w-3 h-3 text-primary fill-primary" />
                        {Number(movie.vote_average || 0).toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">{movie.original_language}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">{movie.overview}</p>
                  </div>
                  <button
                    onClick={() => !isAdded && handleAddMovie(movie)}
                    disabled={isAdding || isAdded}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-
                      ${isAdded
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : 'bg-primary hover:bg-primary-dull text-white disabled:opacity-50'
                      }`}
                  >
                    {isAdded ? (
                      <><CheckCircleIcon className="w-3.5 h-3.5" /> Added</>
                    ) : isAdding ? (
                      'Adding...'
                    ) : (
                      <><PlusCircleIcon className="w-3.5 h-3.5" /> Add</>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default AddMovie