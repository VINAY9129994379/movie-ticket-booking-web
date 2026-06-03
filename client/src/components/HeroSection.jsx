import React, { useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, Calendar1Icon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import timeFormat from '../lib/timeFormat'

const HeroSection = () => {
  const navigate = useNavigate()
  const [bannerMovie, setBannerMovie] = useState(null)
  const BACKEND_URL = import.meta.env.VITE_BASE_URL

  useEffect(() => {
    const fetchHeroMovie = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/movies`)
        if (response.data && response.data.length > 0) {
          setBannerMovie(response.data[0])
        }
      } catch (error) {
        console.error("Hero Section fetch failure:", error)
      }
    }
    fetchHeroMovie()
  }, [])

  if (bannerMovie) {
    const genreString = bannerMovie.genres
      ? bannerMovie.genres.map(g => g.name).join(' | ')
      : 'Featured'

    const releaseYear = bannerMovie.release_date
      ? new Date(bannerMovie.release_date).getFullYear()
      : '2026'

    const rawBackdrop = bannerMovie.backdrop_path || bannerMovie.poster_path || bannerMovie.poster_url || ''
    let finalBackdropUrl = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba'

    if (rawBackdrop) {
      if (rawBackdrop.startsWith('http')) {
        finalBackdropUrl = rawBackdrop
      } else {
        const cleanPath = rawBackdrop.startsWith('/') ? rawBackdrop : `/${rawBackdrop}`
        finalBackdropUrl = `https://image.tmdb.org/t/p/original${cleanPath}`
      }
    }

    return (
      <div
        className="flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center bg-no-repeat h-screen relative w-full text-white"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(3, 7, 18, 0.95) 35%, rgba(3, 7, 18, 0.3)), url(${finalBackdropUrl})`
        }}
      >
        <img
          src={assets.logo || assets.marvelLogo}
          alt=""
          className="max-h-11 lg:h-11 mt-20 opacity-85"
        />

        <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-2xl text-balance mt-4">
          {bannerMovie.title}
        </h1>

        <div className="flex items-center gap-4 text-gray-300 text-sm my-1">
          <span>{genreString}</span>
          <div className="flex items-center gap-1">
            <Calendar1Icon className="w-4.5 h-4.5 text-primary" />
            {releaseYear}
          </div>
          <div className="flex items-center gap-1">
            <ClockIcon className="w-4.5 h-4.5 text-primary" />
            {timeFormat(bannerMovie.runtime || 120)}
          </div>
        </div>

        <p className="max-w-xl text-gray-400 text-sm md:text-base leading-relaxed text-justify line-clamp-3 mb-4">
          {bannerMovie.overview}
        </p>

        <button
          onClick={() => {
            navigate(`/movies/${bannerMovie.id || bannerMovie.tmdb_id}`)
            scrollTo(0, 0)
          }}
          className="flex items-center gap-2 px-8 py-3.5 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-semibold cursor-pointer shadow-lg active:scale-95 text-white"
        >
          Book Tickets Now
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  // Fallback UI while loading or if no movie is returned
  return (
    <div
      className="flex flex-col items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center bg-no-repeat h-screen text-white"
      style={{ backgroundImage: `url('/backgroundImage.png')` }}
    >
      <img src={assets.marvelLogo} alt="" className="max-h-11 lg:h-11 mt-20" />
      <h1 className="text-5xl md:text-[70px] font-semibold max-w-110">
        Guardians of the Galaxy
      </h1>
      <button
        onClick={() => navigate('/movies')}
        className="flex items-center gap-1 px-6 py-3 text-sm bg-primary rounded-full font-medium cursor-pointer text-white hover:bg-primary-dull transition"
      >
        Explore Movies <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default HeroSection