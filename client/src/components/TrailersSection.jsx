import React, { useEffect, useState } from 'react'
import Blur from './Blur'
import ReactPlayer from 'react-player'
import { dummyTrailers } from '../assets/assets'
import { PlayCircleIcon } from 'lucide-react'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BASE_URL

const TrailersSection = () => {
    const [trailersList, setTrailersList] = useState(dummyTrailers)
    const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])


    useEffect(() => {
        const fetchLiveTrailers = async () => {
            try {
                const response = await axios.get(`${BACKEND_URL}/api/movies`)
                if (response.data && response.data.length > 0) {
                    const mappedTrailers = response.data.map((movie, index) => {
                        const rawImage = movie.backdrop_path || movie.poster_path
                        const finalImage = rawImage
                            ? rawImage.startsWith('http')
                                ? rawImage
                                : `https://image.tmdb.org/t/p/w500${rawImage}`
                            : dummyTrailers[index % dummyTrailers.length]?.image

                        const finalVideo =
                            movie.trailer_url ||
                            movie.videoUrl ||
                            dummyTrailers[index % dummyTrailers.length]?.videoUrl

                        return { image: finalImage, videoUrl: finalVideo }
                    })

                    if (mappedTrailers.length > 0) {
                        setTrailersList(mappedTrailers)
                        setCurrentTrailer(mappedTrailers[0])
                    }
                }
            } catch (error) {
                console.error('Failed to fetch trailers:', error)
            }
        }
        fetchLiveTrailers()
    }, [])

    const handleTrailerClick = (trailer) => {
        setCurrentTrailer(trailer)
        // eslint-disable-next-line no-undef
        setPlaying(true)
    }

    return (
        <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden">
            <p className="text-gray-300 font-medium text-lg mx-auto">Trailers</p>

            <div className="relative mt-6 flex justify-center">
                <Blur top="-100px" right="-100px" />
                <div className="rounded-xl overflow-hidden shadow-2xl w-full max-w-960px aspect-video bg-black">
                    {currentTrailer?.videoUrl ? (
                        <ReactPlayer
                            key={currentTrailer.videoUrl}
                            url={currentTrailer.videoUrl}
                            controls={true}
                            width="100%"
                            height="100%"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
                            No trailer available
                        </div>
                    )}
                </div>
            </div>

            <div className="group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
                {trailersList.map((trailer, index) => (
                    <div
                        key={index}
                        className={`relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition aspect-video cursor-pointer ${currentTrailer?.videoUrl === trailer.videoUrl ? 'ring-2 ring-primary rounded-lg' : ''}`}
                        onClick={() => handleTrailerClick(trailer)}
                    >
                        <img
                            src={trailer.image}
                            alt="trailer thumbnail"
                            className="rounded-lg w-full h-full object-cover brightness-75 border border-gray-800"
                        />
                        <PlayCircleIcon
                            strokeWidth={1.6}
                            className="absolute top-1/2 left-1/2 w-6 md:w-10 h-6 md:h-10 transform -translate-x-1/2 -translate-y-1/2 text-white fill-black/40 hover:scale-110 transition"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrailersSection