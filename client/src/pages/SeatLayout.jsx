import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import Blur from '../components/Blur'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/react'
import '../lib/isoTimeFormat'

const BACKEND_URL = import.meta.env.VITE_BASE_URL

const groupRows = [['A', 'B', 'C'], ['D', 'E','F'], ['G', 'H', 'I'], ['j', 'K','L'], ['M', 'N','O'],['P', 'Q','R'],['T', 'U', 'V']]

const SeatLayout = () => {
  const { id, date } = useParams()
  const navigate = useNavigate()
  const { userId, isSignedIn } = useAuth()
  const { user } = useUser()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [availableShows, setAvailableShows] = useState([])
  const [selectedShow, setSelectedShow] = useState(null)
  const [bookedSeats, setBookedSeats] = useState([])
  const [movieData, setMovieData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch movie details and available shows for the selected date
  useEffect(() => {
    const fetchLayoutData = async () => {
      try {
        setLoading(true)
        const [movieRes, showsRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/movies/${id}`),
          axios.get(`${BACKEND_URL}/api/shows/${id}/${date}`)
        ])
        setMovieData(movieRes.data)
        setAvailableShows(showsRes.data)
        if (showsRes.data.length > 0) {
          setSelectedShow(showsRes.data[0])
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to load show data. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchLayoutData()
  }, [id, date])

  // Fetch booked seats whenever the selected show changes
  useEffect(() => {
    if (!selectedShow) return
    const fetchBookedSeats = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/bookings/show/${selectedShow.id}/booked`)
        setBookedSeats(res.data.bookedSeats || [])
        setSelectedSeats([])
      } catch (err) {
        console.error('Failed to fetch booked seats:', err)
      }
    }
    fetchBookedSeats()
  }, [selectedShow])

  const handleSeatClick = (seatId) => {
    if (!selectedShow) {
      return toast.error('Please select a show timing first.')
    }
    if (bookedSeats.includes(seatId)) return
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast('Maximum 5 seats can be selected at once.')
    }
    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    )
  }

  const handleProceedToCheckout = async () => {
    if (!isSignedIn) {
      return toast.error('Please sign in to book tickets.')
    }
    if (selectedSeats.length === 0) {
      return toast.error('Please select at least one seat.')
    }
    if (!selectedShow) {
      return toast.error('Please select a show timing.')
    }

    const bookingPayload = {
      show_id: selectedShow.id,
      seats_booked: selectedSeats,
      total_price: selectedSeats.length * Number(selectedShow.ticket_price),
      user_name: user?.fullName || 'Guest',
      user_email: user?.primaryEmailAddress?.emailAddress
    }

    try {
      const response = await axios.post(`${BACKEND_URL}/api/bookings`, bookingPayload, {
        headers: { 'x-clerk-user-id': userId }
      })
      if (response.data.success) {
        toast.success('Booking confirmed! 🎉')
        navigate('/my-bookings')
        scrollTo(0, 0)
      }
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Booking failed. Please try again.')
    }
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`
          const isBooked = bookedSeats.includes(seatId)
          const isSelected = selectedSeats.includes(seatId)
          return (
            <button
              key={seatId}
              disabled={isBooked}
              onClick={() => handleSeatClick(seatId)}
              className={`h-8 w-8 rounded text-xs border cursor-pointer transition-all flex items-center justify-center font-bold
                ${isBooked
                  ? 'bg-gray-800 border-gray-900 text-gray-600 cursor-not-allowed line-through'
                  : isSelected
                  ? 'bg-primary text-white shadow-md border-primary scale-105'
                  : 'border-primary/40 hover:bg-primary/20 text-gray-200'
                }`}
            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  if (loading || !movieData) return <Loading />

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 py-30 md:pt-50">
      {/* Timings Sidebar */}
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <p className="text-xs text-gray-500 px-6 mt-1 mb-4">Select a theater slot</p>

        <div className="mt-5 space-y-3 px-3">
          {availableShows.length > 0 ? (
            availableShows.map(show => (
              <div
                key={show.id}
                onClick={() => setSelectedShow(show)}
                className={`flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all
                  ${selectedShow?.id === show.id
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:bg-primary/10'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <p className="text-xs font-semibold">{show.show_time.slice(0, 5)}</p>
                </div>
                <p className="text-[10px] opacity-80 truncate">{show.theater_name}</p>
                <p className="text-[10px] font-bold text-yellow-400">₹{Number(show.ticket_price).toFixed(0)}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 px-3 py-4 text-center">
              No shows available for this date.
            </p>
          )}
        </div>
      </div>

      {/* Seat Grid */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <Blur top="-100px" left="-100px" />
        <Blur bottom="0" left="-100px" />

        <h1 className="text-2xl font-semibold mb-1">{movieData.title}</h1>
        <p className="text-xs text-primary tracking-widest uppercase mb-4">{date}</p>

        <img src={assets.screenImage} alt="screen" className="w-full max-w-2xl mx-auto" />
        <p className="text-gray-400 text-sm mb-6 tracking-widest">SCREEN SIDE</p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300 w-full max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map(row => renderSeats(row))}
          </div>
          <div className="grid grid-cols-2 gap-11 w-full">
            {groupRows.slice(1).map((group, idx) => (
              <div key={idx} className="flex flex-col gap-4">
                {group.map(row => renderSeats(row))}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        {selectedShow && (
          <div className="mt-8 text-center bg-gray-900/60 p-4 border border-gray-800 rounded-lg min-w-280px">
            <p className="text-xs text-gray-400">
              Cinema: <span className="text-white font-medium">{selectedShow.theater_name}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Amount Payable:{' '}
              <span className="text-primary font-bold text-sm">
                ₹{selectedSeats.length * Number(selectedShow.ticket_price)}
              </span>
            </p>
          </div>
        )}

        <button
          onClick={handleProceedToCheckout}
          className="mt-8 px-8 py-3.5 rounded-full font-semibold flex items-center gap-2 transition-all bg-primary text-white hover:bg-primary-dull shadow-lg active:scale-95 cursor-pointer"
        >
          Proceed to Checkout <ArrowRightIcon className="w-5 h-5" />
        </button>

        {selectedSeats.length > 0 && (
          <p className="mt-3 text-sm text-primary font-medium">
            Selected: {selectedSeats.join(', ')} ({selectedSeats.length}/5)
          </p>
        )}
      </div>
    </div>
  )
}

export default SeatLayout 