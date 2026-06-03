import React, { useEffect, useState } from 'react'
import MovieCard from '../components/MovieCard'
import Blur from '../components/Blur'
import Loading from '../components/Loading'
import DateFilterBar from '../components/DatefilterBar'

import axios from 'axios'
import { toast } from 'react-hot-toast'

const BACKEND_URL = import.meta.env.VITE_BASE_URL

const Movies = () => {
  const [movies, setMovies] = useState([])
  const [allMovies, setAllMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [activeTab, setActiveTab] = useState('All')

  const tabs = ['All', 'Now Showing', 'Upcoming']

  useEffect(() => {
    fetchAllMovies()
  }, [])

  const fetchAllMovies = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${BACKEND_URL}/api/movies`)
      setAllMovies(response.data || [])
      setMovies(response.data || [])
    } catch (error) {
      console.error('Catalog fetch error:', error)
      toast.error('Failed to load movies.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = async (date) => {
    setSelectedDate(date)
    setActiveTab('All')

    if (!date) {
      setMovies(allMovies)
      return
    }

    try {
      setLoading(true)
      const res = await axios.get(`${BACKEND_URL}/api/movies/date/${date}`)
      setMovies(res.data)
    } catch (err) {
      console.error(err)
      toast.error('Date filter failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleTabSelect = (tab) => {
    setActiveTab(tab)
    setSelectedDate(null)
    const today = new Date().toISOString().split('T')[0]

    if (tab === 'All') {
      setMovies(allMovies)
    } else if (tab === 'Now Showing') {
      setMovies(allMovies.filter(m => m.release_date && m.release_date.split('T')[0] <= today))
    } else if (tab === 'Upcoming') {
      setMovies(allMovies.filter(m => m.release_date && m.release_date.split('T')[0] > today))
    }
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

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Movies</h1>
        <p className="text-gray-400 text-sm mt-1">Book tickets for latest movies</p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-5">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabSelect(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition cursor-pointer
              ${activeTab === tab && !selectedDate
                ? 'bg-primary text-white'
                : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:bg-gray-800'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Date Filter */}
      <div className="mb-8">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Filter by Date</p>
        <DateFilterBar onDateSelect={handleDateSelect} selectedDate={selectedDate} />
      </div>

      {/* Results */}
      {selectedDate && (
        <p className="text-sm text-gray-400 mb-4">
          Showing movies with shows on <span className="text-primary font-medium">{selectedDate}</span>
          <button onClick={() => handleDateSelect(null)} className="ml-2 text-xs text-gray-500 underline cursor-pointer">
            Clear
          </button>
        </p>
      )}

      {movies.length > 0 ? (
        <>
          <h2 className="text-sm font-medium text-gray-400 mb-4">
            {movies.length} movie{movies.length !== 1 ? 's' : ''} found
          </h2>
          <div className="flex flex-wrap max-sm:justify-center gap-8">
            {movies.map(movie => (
              <MovieCard movie={movie} key={movie.id || movie.tmdb_id} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-[40vh] bg-primary/5 border border-dashed border-primary/20 rounded-xl">
          <p className="text-gray-500 text-sm">
            {selectedDate ? `${selectedDate} ko koi show nahi hai.` : 'Koi movie available nahi hai.'}
          </p>
          {selectedDate && (
            <button onClick={() => handleDateSelect(null)} className="mt-3 text-xs text-primary underline cursor-pointer">
              See all the movies
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default Movies