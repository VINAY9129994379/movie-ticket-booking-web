import { ArrowRight } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Blur from './Blur'
import MovieCard from './MovieCard'
import Loading from './Loading' 
import axios from 'axios' 
import { toast } from 'react-hot-toast'

const Featured = () => {
    const navigate = useNavigate()
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)

    // Local declaration matching your backend port 3000
    const BACKEND_URL = import.meta.env.VITE_BASE_URL

    const fetchFeaturedMovies = async () => {
        try {
            setLoading(true)
            // Calling live PostgreSQL dynamic movies endpoint on port 3000
            const response = await axios.get(`${BACKEND_URL}/api/movies`)
            setMovies(response.data)
        } catch (error) {
            console.error("Network synchronization tracking failure:", error)
            toast.error("Failed to load live catalog from database.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFeaturedMovies()
    }, [])

    if (loading) {
        return (
            <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 flex justify-center items-center'>
                <Loading />
            </div>
        )
    }

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>

            <div className='relative flex items-center justify-between pt-20 pb-10'>
                <Blur top='0' right='-80px'/>
                <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
                <button onClick={() => navigate('/movies')} className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>View All
                    <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5' />
                </button>
            </div>

            <div className='flex flex-wrap max-sm:justify-center gap-8 mt-8'>
                {movies.length > 0 ? (
                    movies.slice(0, 4).map((show) => {
                        // FIXED: Re-mapping and sanitizing data properties to enforce strict alignment with MovieCard expectations
                        const sanitizedShow = {
                            ...show,
                            _id: show.id || show.tmdb_id || show._id, // Enforcing ID structural consistency
                            backdrop_path: show.backdrop_path || show.poster_path || '' // Safeguarding empty strings
                        }
                        
                        return (
                            <MovieCard key={sanitizedShow._id} movie={sanitizedShow} />
                        )
                    })
                ) : (
                    <p className='text-gray-500 text-sm py-4 w-full text-center'>No movies currently active in the database.</p>
                )}
            </div>

            <div className='flex justify-center mt-20'>
                <button onClick={() => { navigate('/movies'); scrollTo(0, 0) }} className='px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium cursor-pointer'>Show more</button>
            </div>
          
        </div>
    )
}

export default Featured
