import React from 'react'
import { CalendarIcon } from 'lucide-react'

const DateFilterBar = ({ onDateSelect, selectedDate }) => {
  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
  const d = new Date()
  d.setDate(d.getDate() + i)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return {
    full: `${year}-${month}-${day}`,
    day: d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date: d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' })
  }
})
  

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
      {/* All dates option */}
      <button
        onClick={() => onDateSelect(null)}
        className={`flex-shrink- flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer
          ${!selectedDate
            ? 'bg-primary text-white'
            : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:bg-gray-800'
          }`}
      >
        <CalendarIcon className="w-3.5 h-3.5" />
        All
      </button>

      {dates.map((d, i) => (
        <button
          key={d.full}
          onClick={() => onDateSelect(d.full)}
          className={`flex-shrink- flex flex-col items-center px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer min-w-60px]
            ${selectedDate === d.full
              ? 'bg-primary text-white'
              : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:bg-gray-800'
            }`}
        >
          <span className="text-[10px] uppercase">{i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.day}</span>
          <span className="text-base font-bold leading-tight">{d.date}</span>
          <span className="text-[10px]">{d.month}</span>
        </button>
      ))}
    </div>
  )
}

export default DateFilterBar