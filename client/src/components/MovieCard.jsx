import { StarIcon } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import timeFormat from '../lib/timeFormat';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const MovieCard = ({ movie }) => {
    const navigate = useNavigate()

    const rawImage = movie.backdrop_path || movie.poster_path || movie.poster_url || movie.image || ''

    let finalImageUrl = FALLBACK_IMAGE

    if (rawImage) {
        if (String(rawImage).startsWith('http')) {
            finalImageUrl = rawImage
        } else {
            const cleanPath = String(rawImage).startsWith('/') ? rawImage : `/${rawImage}`
            finalImageUrl = `https://image.tmdb.org/t/p/w500${cleanPath}`
        }
    }

    const targetMovieId = movie.id || movie.tmdb_id || movie._id
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '2026'

    const genresString = movie.genres && Array.isArray(movie.genres)
        ? movie.genres.slice(0, 2).map(genre => genre.name).join(' | ')
        : 'Featured'

    const handleNavigate = () => {
        navigate(`/movies/${targetMovieId}`)
        scrollTo(0, 0)
    }

    return (
        <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:translate-y-1 transition duration-300 w-60 text-white shadow-xl">
            <img
                onClick={handleNavigate}
                src={finalImageUrl}
                alt={movie.title || 'Movie Poster'}
                className="rounded-lg h-52 w-full object-cover object-center cursor-pointer bg-gray-900"
                onError={(e) => {
                    e.target.onerror = null
                    e.target.src = FALLBACK_IMAGE
                }}
            />
            <p className="font-semibold mt-2 truncate">{movie.title}</p>
            <p className="text-sm text-gray-400 mt-2">
                {releaseYear} · {genresString} · {timeFormat(movie.runtime || 120)}
            </p>

            <div className="flex items-center justify-between mt-4 pb-3">
                <button
                    onClick={handleNavigate}
                    className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer text-white"
                >
                    Buy Tickets
                </button>
                <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {Number(movie.vote_average || 0).toFixed(1)}
                </p>
            </div>
        </div>
    )
}

export default MovieCard