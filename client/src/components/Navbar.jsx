import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { Menu, X, Search, TicketPlus } from 'lucide-react';
import { useClerk, UserButton, useUser } from '@clerk/react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const buildImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [allMovies, setAllMovies] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const { user } = useUser()
  const { openSignIn } = useClerk()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/movies`)
        setAllMovies(res.data || [])
      } catch (err) {
        console.error('Movies fetch error:', err)
      }
    }
    fetchMovies()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchQuery('')
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchInput = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    clearTimeout(debounceRef.current)
    if (!query.trim()) { setSearchResults([]); return }
    setSearchLoading(true)
    debounceRef.current = setTimeout(() => {
      const filtered = allMovies.filter(m =>
        m.title.toLowerCase().includes(query.toLowerCase()) ||
        m.genres?.some(g => g.name.toLowerCase().includes(query.toLowerCase()))
      )
      setSearchResults(filtered.slice(0, 6))
      setSearchLoading(false)
    }, 300)
  }

  const handleMovieSelect = (movie) => {
    navigate(`/movies/${movie.id}`)
    scrollTo(0, 0)
    setSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
      setSearchResults([])
    }
  }

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5 bg-transparent">

      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo} alt="Logo" className="w-36 h-auto" />
      </Link>

      <div className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:font-medium max-md:text-lg z-50 flex flex-col md:flex-row items-center max-md:justify-center gap-8 md:px-8 py-3 max-md:h-screen md:rounded-full backdrop-blur bg-black/70 md:bg-white/10 md:border border-gray-300/20 overflow-hidden transition-all duration-300 ${isOpen ? 'max-md:w-full' : 'max-md:w-0'}`}>
        <X className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer" onClick={() => setIsOpen(false)} />
        {[
          { to: '/', label: 'Home' },
          { to: '/movies', label: 'Movies' },
          { to: '/theaters', label: 'Theaters' },
          { to: '/releases', label: 'Releases' },
          { to: '/favorite', label: 'Favorites' },
        ].map(({ to, label }) => (
          <Link key={to} onClick={() => { window.scrollTo(0, 0); setIsOpen(false) }} to={to}>{label}</Link>
        ))}
      </div>

      <div className="flex items-center gap-4 md:gap-6">

        {/* Search */}
        <div ref={searchRef} className="relative">
          {!searchOpen ? (
            <Search
              className="w-5 h-5 cursor-pointer text-gray-300 hover:text-white transition"
              onClick={() => setSearchOpen(true)}
            />
          ) : (
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <div className="flex items-center bg-black/80 border border-gray-600 rounded-full px-3 py-1.5 gap-2 w-48 md:w-64">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInput}
                  placeholder="Movie search karo..."
                  className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-full"
                />
                {searchQuery && (
                  <X
                    className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-white flex-shrink-"
                    onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                  />
                )}
              </div>
            </form>
          )}

          {/* Dropdown Results */}
          {searchOpen && (searchResults.length > 0 || searchLoading) && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl z-50">
              {searchLoading ? (
                <div className="p-4 text-center text-xs text-gray-500 animate-pulse">Searching...</div>
              ) : (
                <>
                  {searchResults.map(movie => (
                    <button
                      key={movie.id}
                      onClick={() => handleMovieSelect(movie)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/20 transition text-left border-b border-gray-800 last:border-0"
                    >
                      <img
                        src={buildImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="w-8 h-11 object-cover rounded flex-shrink- bg-gray-800"
                        onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{movie.title}</p>
                        <p className="text-xs text-gray-500">
                          {movie.release_date?.split('-')[0]} · {movie.genres?.slice(0, 1).map(g => g.name).join('')}
                        </p>
                      </div>
                    </button>
                  ))}
                  {searchQuery && (
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full px-4 py-2.5 text-xs text-primary hover:bg-primary/10 transition text-center"
                    >
                      "{searchQuery}" see all the result →
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* No results */}
          {searchOpen && searchQuery && !searchLoading && searchResults.length === 0 && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl z-50">
              <p className="text-xs text-gray-500 text-center">"{searchQuery}" not found</p>
            </div>
          )}
        </div>

        {!user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer text-sm"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My Bookings"
                labelIcon={<TicketPlus width={15} />}
                onClick={() => navigate('/my-bookings')}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      <Menu className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer" onClick={() => setIsOpen(true)} />
    </div>
  )
}

export default Navbar