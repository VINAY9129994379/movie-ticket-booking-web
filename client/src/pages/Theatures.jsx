import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Blur from '../components/Blur'
import DateFilterBar from '../components/DateFilterBar'
import { MapPinIcon, NavigationIcon, SearchIcon, ExternalLinkIcon, BuildingIcon, XIcon, ClockIcon, StarIcon, TicketIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const buildImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const formatTime = (time) => {
  if (!time) return ''
  const [h, m] = time.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

// Group shows by date
const groupShowsByDate = (shows) => {
  const grouped = {}
  shows.forEach(show => {
    const date = show.show_date.split('T')[0]
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(show)
  })
  return grouped
}

const MovieShowCard = ({ movie, navigate }) => {
  const [expanded, setExpanded] = useState(false)
  const groupedShows = groupShowsByDate(movie.shows)
  const dates = Object.keys(groupedShows).slice(0, 3)

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
      {/* Movie Header */}
      <div className="flex gap-3 p-3">
        <img
          src={buildImageUrl(movie.poster_path)}
          alt={movie.title}
          className="w-16 h-22 object-cover rounded-lg flex-shrink- bg-gray-900"
          style={{ height: '88px' }}
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE }}
        />
        <div className="flex-1 min-w-0">
          <h4
            onClick={() => { navigate(`/movies/${movie.movie_id}`); scrollTo(0, 0) }}
            className="font-semibold text-sm leading-tight cursor-pointer hover:text-primary transition truncate"
          >
            {movie.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <StarIcon className="w-3 h-3 text-primary fill-primary" />
              {Number(movie.vote_average || 0).toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">{movie.runtime} min</span>
            {movie.genres?.slice(0, 1).map(g => (
              <span key={g.name} className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">{g.name}</span>
            ))}
          </div>
          <p className="text-xs text-primary mt-1 font-medium">
            ₹{Number(movie.shows[0]?.ticket_price || 0).toFixed(0)} per ticket
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="self-start text-gray-400 hover:text-white transition"
        >
          {expanded ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
        </button>
      </div>

      {/* Shows — collapsed: show today only, expanded: show all dates */}
      <div className="border-t border-gray-700 px-3 py-2">
        {(expanded ? dates : dates.slice(0, 1)).map(date => (
          <div key={date} className="mb-2 last:mb-0">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">{formatDate(date)}</p>
            <div className="flex flex-wrap gap-2">
              {groupedShows[date].map(show => (
                <button
                  key={show.show_id}
                  onClick={() => {
                    navigate(`/movies/${movie.movie_id}/${date}`)
                    scrollTo(0, 0)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 hover:border-primary rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <ClockIcon className="w-3 h-3" />
                  {formatTime(show.show_time)}
                  <span className="text-[10px] opacity-70">₹{Number(show.ticket_price).toFixed(0)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {dates.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-primary hover:underline mt-1 cursor-pointer"
          >
            {expanded ? 'Less dates' : `+${dates.length - 1} more date${dates.length > 2 ? 's' : ''}`}
          </button>
        )}
      </div>

      {/* Book Tickets CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={() => { navigate(`/movies/${movie.movie_id}`); scrollTo(0, 0) }}
          className="w-full flex items-center justify-center gap-2 py-2 bg-primary hover:bg-primary-dull text-white text-xs font-semibold rounded-lg transition cursor-pointer"
        >
          <TicketIcon className="w-3.5 h-3.5" /> Book Tickets
        </button>
      </div>
    </div>
  )
}

const TheaterCard = ({ theater, navigate }) => {
  const [mapOpen, setMapOpen] = useState(false)

  return (
    <div className="bg-gray-900/70 border border-gray-800 hover:border-primary/30 rounded-2xl overflow-hidden transition-all">
      {/* Theater Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
        <div className="flex gap-4 items-start">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center flex-shrink-">
            <BuildingIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-base">{theater.name}</h3>
            <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
              <MapPinIcon className="w-3.5 h-3.5 text-primary flex-shrink-" />
              {theater.address}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{theater.city}</span>
              {theater.distance !== undefined && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  📍 {theater.distance} km door
                </span>
              )}
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                🎬 {theater.movies?.length || 0} movies
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-">
          <button
            onClick={() => setMapOpen(!mapOpen)}
            className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition cursor-pointer"
          >
            <MapPinIcon className="w-3.5 h-3.5" /> {mapOpen ? 'Hide Map' : 'Map'}
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${theater.latitude},${theater.longitude}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs bg-primary hover:bg-primary-dull text-white px-3 py-2 rounded-lg transition"
          >
            <NavigationIcon className="w-3.5 h-3.5" /> Directions
          </a>
        </div>
      </div>

      {/* Embedded Map */}
      {mapOpen && (
        <div className="mx-5 mb-4 rounded-xl overflow-hidden h-44 bg-gray-800">
          <iframe
            title={theater.name}
            width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
            src={`https://www.google.com/maps?q=${theater.latitude},${theater.longitude}&z=15&output=embed`}
            allowFullScreen
          />
        </div>
      )}

      {/* Movies & Shows */}
      {theater.movies && theater.movies.length > 0 ? (
        <div className="border-t border-gray-800 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
            <TicketIcon className="w-3.5 h-3.5" /> Now Showing & Upcoming
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {theater.movies.map(movie => (
              <MovieShowCard key={movie.movie_id} movie={movie} navigate={navigate} />
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-800 px-5 py-4">
          <p className="text-xs text-gray-600 italic">No shows scheduled at this theater yet.</p>
        </div>
      )}
    </div>
  )
}

const Theaters = () => {
  const navigate = useNavigate()
  const [theaters, setTheaters] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [locationLoading, setLocationLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState('Nearby')
  const [searchQuery, setSearchQuery] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/theaters/cities`)
        setCities(res.data)
      } catch (err) {
        console.error('Cities fetch error:', err)
      }
    }
    fetchCities()
    detectLocation()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 2) { setCitySuggestions([]); return }
    try {
      setSearchLoading(true)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},India&format=json&limit=6&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setCitySuggestions(data)
    } catch (err) {
      console.error('City search error:', err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleCitySearchInput = (e) => {
    const val = e.target.value
    setCitySearch(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchCitySuggestions(val), 400)
  }

  const handleCitySuggestionSelect = async (suggestion) => {
    const cityName = suggestion.address?.city || suggestion.address?.town ||
      suggestion.address?.state_district || suggestion.display_name.split(',')[0]
    setCitySearch(cityName)
    setCitySuggestions([])
    setSelectedCity(cityName)
    await fetchNearbyTheaters(parseFloat(suggestion.lat), parseFloat(suggestion.lon), cityName)
  }

  const detectLocation = () => {
    setLocationLoading(true)
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError('Browser does not support location ')
      fetchAllTheaters()
      setLocationLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        await fetchNearbyTheaters(pos.coords.latitude, pos.coords.longitude, 'Nearby')
        setLocationLoading(false)
      },
      () => {
        setLocationError('Location access denied')
        fetchAllTheaters()
        setLocationLoading(false)
      }
    )
  }

  const fetchNearbyTheaters = async (lat, lon, cityLabel = 'Nearby') => {
    try {
      setLoading(true)
      const res = await axios.get(`${BACKEND_URL}/api/theaters/nearby?lat=${lat}&lon=${lon}&radius=200`)
      setTheaters(res.data)
      setSelectedCity(cityLabel)
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error('Theaters not loaded ')
      fetchAllTheaters()
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTheaters = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${BACKEND_URL}/api/theaters`)
      setTheaters(res.data)
      setSelectedCity('All')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDBCitySelect = async (city) => {
    setSelectedCity(city)
    setCitySearch('')
    setCitySuggestions([])
    setSearchQuery('')
    if (city === 'Nearby') {
      if (userLocation) await fetchNearbyTheaters(userLocation.lat, userLocation.lon)
      else detectLocation()
      return
    }
    try {
      setLoading(true)
      const res = await axios.get(`${BACKEND_URL}/api/theaters/city/${city}`)
      setTheaters(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTheaters = theaters.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.movies?.some(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="relative pt-28 pb-20 px-6 md:px-16 lg:px-40 min-h-[80vh] text-white overflow-hidden">
      <Blur top="100px" left="50px" />
      <Blur bottom="0" right="0" />

      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BuildingIcon className="text-primary w-7 h-7" /> Theaters
        </h1>
        <p className="text-gray-400 text-sm mt-2">Find your city, discover theaters, and book tickets.</p>
      </div>

      {/* City Search */}
      <div className="relative mb-5 max-w-xl">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Type any city of India... (e.g. Ludhiana, Pune, Jaipur)"
            value={citySearch}
            onChange={handleCitySearchInput}
            className="w-full bg-gray-900/60 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
          />
          {citySearch && (
            <button onClick={() => { setCitySearch(''); setCitySuggestions([]) }} className="absolute right-3 top-1/2 -translate-y-1/2">
              <XIcon className="w-4 h-4 text-gray-500 hover:text-white" />
            </button>
          )}
        </div>
        {citySuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl">
            {citySuggestions.map((s, i) => (
              <button key={i} onClick={() => handleCitySuggestionSelect(s)}
                className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-primary/20 hover:text-white transition flex items-center gap-2 border-b border-gray-800 last:border-0">
                <MapPinIcon className="w-3.5 h-3.5 text-primary flex-shrink-" />
                <span className="truncate">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
        {searchLoading && <p className="text-xs text-gray-500 mt-2 ml-1 animate-pulse">Searching...</p>}
      </div>

      {/* Location Bar */}
      <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-8 max-w-xl">
        <NavigationIcon className="w-5 h-5 text-primary flex-shrink-" />
        <div className="flex-1 text-sm">
          {locationLoading ? <p className="text-gray-400 animate-pulse">Detecting your location......</p>
            : locationError ? <p className="text-yellow-400">{locationError}</p>
            : userLocation ? <p className="text-green-400">✓ Showing theaters near you.</p>
            : <p className="text-gray-400">Could not detect your location.</p>}
        </div>
        <button onClick={detectLocation}
          className="text-xs bg-primary hover:bg-primary-dull px-3 py-1.5 rounded-full transition cursor-pointer flex-shrink-">
          {locationLoading ? 'Detecting...' : 'Use My Location'}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-52 flex-shrink-">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Quick Select</p>
          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
            {['Nearby', 'All India'].map(label => (
              <button key={label}
                onClick={() => label === 'All India' ? fetchAllTheaters() : handleDBCitySelect('Nearby')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer whitespace-nowrap
                  ${(selectedCity === label || (label === 'All India' && selectedCity === 'All'))
                    ? 'bg-primary text-white' : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                {label === 'Nearby' ? <NavigationIcon className="w-3.5 h-3.5" /> : <BuildingIcon className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
            {cities.map(city => (
              <button key={city} onClick={() => handleDBCitySelect(city)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer whitespace-nowrap
                  ${selectedCity === city ? 'bg-primary text-white' : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:bg-gray-800'}`}>
                <MapPinIcon className="w-3.5 h-3.5" /> {city}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1">
          {/* Search filter */}
          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Theater name, address or movie name filter here..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition"
            />
          </div>

          <p className="text-xs text-gray-500 mb-4">
            {filteredTheaters.length} theater{filteredTheaters.length !== 1 ? 's' : ''} found
            {selectedCity && selectedCity !== 'All' ? ` — ${selectedCity}` : ''}
          </p>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredTheaters.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filteredTheaters.map((theater, i) => (
                <TheaterCard key={theater.id || i} theater={theater} navigate={navigate} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 bg-primary/5 border border-dashed border-primary/20 rounded-xl">
              <p className="text-gray-500 text-sm">No theaters found in this area.</p>
              <button onClick={fetchAllTheaters} className="mt-3 text-xs text-primary underline cursor-pointer">
                View all theaters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Theaters