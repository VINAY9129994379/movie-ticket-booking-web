import React, { useState } from 'react'
import Feautred from '../components/Featured'
import DateFilterBar from '../components/DateFilterBar'
import { useNavigate } from 'react-router-dom'
import { MapPinIcon, TicketIcon, CalendarIcon, ArrowRightIcon } from 'lucide-react'

const TheaterBookingSection = () => {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState(null)

  const handleDateSelect = (date) => {
    setSelectedDate(date)
  }

  const handleBookNow = () => {
    if (selectedDate) {
      navigate(`/theaters?date=${selectedDate}`)
    } else {
      navigate('/theaters')
    }
    scrollTo(0, 0)
  }

  const handleMoviesFilter = () => {
    if (selectedDate) {
      navigate(`/movies?date=${selectedDate}`)
    } else {
      navigate('/movies')
    }
    scrollTo(0, 0)
  }

  return (
    <div className="px-6 md:px-16 lg:px-36 py-20 text-white">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-2">Book Your Experience</p>
          <h2 className="text-3xl md:text-4xl font-bold">Find Shows Near You</h2>
          <p className="text-gray-400 text-sm mt-2">Select a date and discover what's playing at theaters near you</p>
        </div>
        <button
          onClick={() => { navigate('/theaters'); scrollTo(0, 0) }}
          className="flex items-center gap-2 text-sm text-primary hover:text-white transition cursor-pointer"
        >
          <MapPinIcon className="w-4 h-4" /> View All Theaters
        </button>
      </div>

      {/* Date Picker */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <CalendarIcon className="w-3.5 h-3.5" /> Select Date
        </p>
        <DateFilterBar onDateSelect={handleDateSelect} selectedDate={selectedDate} />

        {/* Selected date info */}
        {selectedDate && (
          <p className="text-xs text-green-400 mt-3">
            ✓ Showing movies & shows for <span className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Find Theaters */}
        <button
          onClick={handleBookNow}
          className="group flex items-center justify-between gap-4 bg-primary hover:bg-primary-dull p-5 rounded-2xl transition cursor-pointer text-left"
        >
          <div>
            <p className="font-bold text-lg">Find Theaters</p>
            <p className="text-white/70 text-sm mt-0.5">
              {selectedDate ? `Shows on ${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'Nearby cinemas with shows'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-6 h-6 opacity-80" />
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition" />
          </div>
        </button>

        {/* Browse Movies */}
        <button
          onClick={handleMoviesFilter}
          className="group flex items-center justify-between gap-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 p-5 rounded-2xl transition cursor-pointer text-left"
        >
          <div>
            <p className="font-bold text-lg">Browse Movies</p>
            <p className="text-gray-400 text-sm mt-0.5">
              {selectedDate ? `Movies showing on ${new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : 'All now showing & upcoming'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TicketIcon className="w-6 h-6 opacity-80" />
            <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition" />
          </div>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[
          { label: 'Cities', value: '12+', icon: '🏙️' },
          { label: 'Theaters', value: '50+', icon: '🎭' },
          { label: 'Movies', value: '100+', icon: '🎬' },
        ].map((stat, i) => (
          <div key={i} className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-xl font-bold text-primary">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const Home = () => {
  return (
    <>
      <TheaterBookingSection />
            <Feautred />
    </>
  )
}

export default Home