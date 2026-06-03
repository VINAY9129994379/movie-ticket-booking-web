import React, { useEffect, useState } from 'react'
import Title from './Title'
import { CheckIcon, Trash2Icon, StarIcon, PlusCircleIcon, SearchIcon } from 'lucide-react'
import { kConverter } from '../../lib/isConverter'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import Loading from '../../components/Loading'
import { useAuth } from '@clerk/react'

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const buildImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const AddShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const { userId } = useAuth()

  const [movies, setMovies] = useState([])
  const [theaters, setTheaters] = useState([])
  const [filteredMovies, setFilteredMovies] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [theaterName, setTheaterName] = useState('')
  const [showPrice, setShowPrice] = useState('')
  const [dateTimeInput, setDateTimeInput] = useState('')
  const [dateTimeSelection, setDateTimeSelection] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const headers = { 'x-clerk-user-id': userId }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [moviesRes, theatersRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/movies`),
          axios.get(`${BACKEND_URL}/api/theaters`)
        ])
        setMovies(moviesRes.data || [])
        setFilteredMovies(moviesRes.data || [])
        setTheaters(theatersRes.data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredMovies(movies)
    } else {
      setFilteredMovies(movies.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase())
      ))
    }
  }

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return toast.error('Date aur time select karo!')
    const [date, time] = dateTimeInput.split('T')
    setDateTimeSelection(prev => ({
      ...prev,
      [date]: prev[date] ? [...prev[date], time] : [time]
    }))
    setDateTimeInput('')
  }

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection(prev => {
      const updatedTimes = prev[date].filter(t => t !== time)
      if (updatedTimes.length === 0) {
        const newObj = { ...prev }
        delete newObj[date]
        return newObj
      }
      return { ...prev, [date]: updatedTimes }
    })
  }

  const handleCreateShowsSubmit = async () => {
    if (!selectedMovie) return toast.error('Select movie!')
    if (!theaterName.trim()) return toast.error('Theater select !')
    if (!showPrice) return toast.error('Ticket price !')
    if (Object.keys(dateTimeSelection).length === 0) return toast.error('Kam se kam ek show time add karo!')

    try {
      setSubmitting(true)
      let count = 0
      for (const [showDate, timeSlots] of Object.entries(dateTimeSelection)) {
        for (const showTime of timeSlots) {
          await axios.post(`${BACKEND_URL}/api/shows/admin/add`, {
            movie_id: parseInt(selectedMovie),
            theater_name: theaterName,
            show_date: showDate,
            show_time: `${showTime}:00`,
            ticket_price: parseFloat(showPrice)
          }, { headers })
          count++
        }
      }
      toast.success(`${count} show${count > 1 ? 's' : ''} successfully add ho gaye! 🎬`)
      setSelectedMovie(null)
      setTheaterName('')
      setShowPrice('')
      setDateTimeSelection({})
      setSearchQuery('')
      setFilteredMovies(movies)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Shows add karne me error aayi.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedMovieData = movies.find(m => m.id === selectedMovie)

  if (loading) return <div className="py-20 text-center"><Loading /></div>

  return (
    <>
      <Title text1='Add' text2='Shows' />

      {/* Step 1 — Movie Select */}
      <div className="mt-8">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Step 1 — select movie</p>
        <div className="relative max-w-sm mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Movie search karo..."
            className="w-full bg-gray-900/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition"
          />
        </div>

        {selectedMovieData && (
          <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-4 max-w-sm">
            <img src={buildImageUrl(selectedMovieData.poster_path)} alt={selectedMovieData.title} className="w-10 h-14 object-cover rounded" />
            <div>
              <p className="text-sm font-semibold text-white">{selectedMovieData.title}</p>
              <p className="text-xs text-green-400 mt-0.5">✓ Selected</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto pb-4">
          <div className="group flex gap-4 w-max px-1">
            {filteredMovies.map(movie => (
              <div key={movie.id} onClick={() => setSelectedMovie(movie.id)} className="relative cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300">
                <div className="relative rounded-xl overflow-hidden h-56 w-36 border border-gray-800 bg-gray-900">
                  <img
                    src={buildImageUrl(movie.poster_path)}
                    alt={movie.title}
                    className="w-full h-full object-cover brightness-90"
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE }}
                  />
                  <div className="text-[10px] flex items-center justify-between p-2 bg-black/80 w-full absolute bottom-0 left-0">
                    <p className="flex items-center gap-0.5 text-gray-400 font-semibold">
                      <StarIcon className="w-3 h-3 text-primary fill-primary" />
                      {Number(movie.vote_average || 0).toFixed(1)}
                    </p>
                    <p className="text-gray-300">{kConverter(movie.vote_count || 0)} Votes</p>
                  </div>
                </div>
                {selectedMovie === movie.id && (
                  <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded-full shadow-lg z-10">
                    <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                )}
                <p className="font-semibold truncate mt-2 text-sm text-gray-200 w-36">{movie.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{movie.release_date?.split('T')[0] || '2026'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step 2 — Theater Select */}
      <div className="mt-8 max-w-md">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Step 2 —  Select Theater</p>
        <select
          value={theaterName}
          onChange={(e) => setTheaterName(e.target.value)}
          className="w-full bg-gray-900 border border-gray-600 px-4 py-3 rounded-lg text-sm outline-none focus:border-primary transition text-white cursor-pointer"
        >
          <option value="">-- Select Theater --</option>
          {theaters.map(t => (
            <option key={t.id} value={t.name}>{t.name} — {t.city}</option>
          ))}
          <option value="custom">+ Custom theater name</option>
        </select>
        {theaterName === 'custom' && (
          <input
            type="text"
            placeholder="Theater name type karo..."
            onChange={(e) => setTheaterName(e.target.value)}
            className="w-full mt-3 bg-transparent border border-gray-600 px-4 py-3 rounded-lg text-sm outline-none focus:border-primary transition text-white"
          />
        )}
      </div>

      {/* Step 3 — Ticket Price */}
      <div className="mt-6 max-w-md">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Step 3 — Ticket Price</p>
        <div className="inline-flex items-center gap-2 border border-gray-600 px-4 py-2.5 rounded-lg w-full">
          <p className="text-gray-400 text-sm font-bold">{currency}</p>
          <input
            min={0}
            type="number"
            value={showPrice}
            onChange={(e) => setShowPrice(e.target.value)}
            placeholder="Ticket price daalo"
            className="outline-none bg-transparent w-full text-sm text-white"
          />
        </div>
      </div>

      {/* Step 4 — Date & Time */}
      <div className="mt-6 max-w-md">
        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Step 4 — Add Show Date & Time </p>
        <div className="flex gap-3 items-center bg-gray-900/40 border border-gray-700 p-3 rounded-xl">
          <input
            type="datetime-local"
            value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)}
            className="outline-none rounded-md bg-transparent text-sm text-white px-2 cursor-pointer flex-1"
          />
          <button onClick={handleDateTimeAdd} className="bg-primary hover:bg-primary-dull text-white px-4 py-2 text-xs font-semibold rounded-lg transition cursor-pointer active:scale-95 whitespace-nowrap">
            + Add Slot
          </button>
        </div>
      </div>

      {/* Selected Slots */}
      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6 max-w-md bg-gray-900/40 p-5 rounded-xl border border-gray-800">
          <h2 className="mb-3 font-semibold text-sm text-gray-400 uppercase tracking-wider">Selected Show Slots</h2>
          <ul className="space-y-4">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date} className="border-b border-gray-800 pb-3 last:border-0 last:pb-0">
                <p className="font-bold text-sm text-primary">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {times.map(time => (
                    <div key={time} className="flex items-center gap-1.5 border border-primary/40 bg-primary/5 px-3 py-1.5 rounded-full text-xs text-gray-200 font-mono">
                      <span>{time}</span>
                      <Trash2Icon onClick={() => handleRemoveTime(date, time)} width={12} className="text-red-400 hover:text-red-500 cursor-pointer transition" />
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleCreateShowsSubmit}
        disabled={submitting}
        className="flex items-center gap-2 bg-primary text-white font-bold px-10 py-3.5 mt-8 rounded-xl hover:bg-primary-dull transition-all cursor-pointer shadow-lg active:scale-95 disabled:opacity-50 text-sm"
      >
        <PlusCircleIcon className="w-5 h-5" />
        {submitting ? 'Adding Shows...' : 'Add Shows'}
      </button>
    </>
  )
}

export default AddShows