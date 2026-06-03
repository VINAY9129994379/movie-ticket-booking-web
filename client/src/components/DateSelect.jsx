import React, { useState, useRef } from 'react'
import Blur from './Blur'
import { CalendarIcon, ArrowRightIcon, ChevronDownIcon, AlertCircleIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BASE_URL

// eslint-disable-next-line no-unused-vars
const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showsAvailable, setShowsAvailable] = useState(null) // null=unchecked, true=available, false=unavailable
  const [checkingShows, setCheckingShows] = useState(false)
  const bookRef = useRef(null)
  
  const dates = Array.from({ length: 30 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

  const getDateLabel = (dateStr) => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tmrw'
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' })
  }

  const handleDateSelect = async (dateStr) => {
    setSelected(dateStr)
    setIsOpen(false)
    setCheckingShows(true)
    setShowsAvailable(null)

    try {
      const res = await axios.get(`${BACKEND_URL}/api/shows/${id}/${dateStr}`)
      const hasShows = res.data && res.data.length > 0
      setShowsAvailable(hasShows)

      if (hasShows) {
        setTimeout(() => {
          bookRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 150)
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setShowsAvailable(false)
    } finally {
      setCheckingShows(false)
    }
  }

  const onBookHandler = () => {
    if (!selected) {
      setIsOpen(true)
      return toast.error('Please select a date to proceed!')
    }
    if (showsAvailable === false) {
      return toast.error('Is date pe koi show available nahi hai!')
    }
    navigate(`/movies/${id}/${selected}`)
    scrollTo(0, 0)
  }

  const selectedLabel = selected
    ? new Date(selected).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : 'Select a date'

  return (
    <div id="dateSelect" className="pt-20">
      <div className="relative bg-primary/10 border border-primary/20 rounded-2xl overflow-hidden">
        <Blur top="-100px" left="-100px" />
        <Blur bottom="0" right="0" />

        {/* Accordion Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 md:p-6 cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest">Choose Date</p>
              <p className={`text-sm font-semibold mt-0.5 ${selected ? 'text-white' : 'text-gray-400'}`}>
                {selectedLabel}
              </p>
            </div>
          </div>
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDownIcon className="w-5 h-5 text-primary" />
          </div>
        </button>

        {/* Dates Accordion Body */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48' : 'max-h-0'}`}>
          <div className="px-5 pb-5">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {dates.map((dateStr) => {
                const d = new Date(dateStr)
                const isSelected = selected === dateStr
                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateSelect(dateStr)}
                    className={`flex-shrink- flex flex-col items-center justify-center h-16 w-14 rounded-xl cursor-pointer transition-all
                      ${isSelected
                        ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/30'
                        : 'border border-primary/40 text-gray-300 hover:bg-primary/20 hover:text-white'
                      }`}
                  >
                    <span className="text-[10px] uppercase tracking-wide opacity-80">{getDateLabel(dateStr)}</span>
                    <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                    <span className="text-[10px] uppercase opacity-70">{d.toLocaleDateString('en-IN', { month: 'short' })}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-primary/20 mx-5" />

        {/* Shows availability status */}
        {selected && (
          <div className="px-5 pt-4">
            {checkingShows ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 animate-pulse">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                Checking shows...
              </div>
            ) : showsAvailable === true ? (
              <p className="text-xs text-green-400 flex items-center gap-1">
                ✓ Shows available for <span className="font-semibold">{selectedLabel}</span>
              </p>
            ) : showsAvailable === false ? (
              <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                <AlertCircleIcon className="w-4 h-4 text-yellow-400 flex-shrink- mt-0.5" />
                <div>
                  <p className="text-xs text-yellow-400 font-medium">No shows on {selectedLabel}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Koi aur date try karo ya baad me check karo</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Book Now */}
        <div className="p-5 md:p-6" ref={bookRef}>
          <button
            onClick={onBookHandler}
            disabled={checkingShows || showsAvailable === false}
            className={`w-full flex items-center justify-center gap-2 text-white py-3.5 rounded-xl font-semibold transition-all cursor-pointer shadow-lg active:scale-95
              ${checkingShows || showsAvailable === false
                ? 'bg-gray-700 cursor-not-allowed opacity-60'
                : 'bg-primary hover:bg-primary-dull'
              }`}
          >
            Book Now <ArrowRightIcon className="w-4 h-4" />
          </button>
          {selected && showsAvailable === true && (
            <p className="text-center text-xs text-gray-500 mt-2">
              Seats for <span className="text-primary">{selectedLabel}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default DateSelect