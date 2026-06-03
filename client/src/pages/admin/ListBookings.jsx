import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from './Title'
import { dateFormat } from '../../lib/dateFormat'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { SearchIcon } from 'lucide-react'
import { useAuth } from '@clerk/react'

const BACKEND_URL = import.meta.env.VITE_BASE_URL

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const { userId } = useAuth()
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const getAllBookings = async () => {
    if (!userId) return
    try {
      setIsLoading(true)
      const response = await axios.get(`${BACKEND_URL}/api/bookings/admin/all`, {
        headers: { 'x-clerk-user-id': userId }
      })

      const formattedBookings = (response.data || []).map(ticket => ({
        id: ticket.id,
        amount: Number(ticket.total_price).toFixed(0),
        bookedSeats: ticket.seats_booked || [],
        status: ticket.booking_status || 'pending',
        createdAt: ticket.created_at,
        user: {
          name: ticket.user_name || 'Guest',
          email: ticket.user_email || ''
        },
        show: {
          showDateTime: `${ticket.show_date.split('T')[0]}T${ticket.show_time}`,
          theaterName: ticket.theater_name,
          movie: { title: ticket.movie_title }
        }
      }))

      setBookings(formattedBookings)
      setFilteredBookings(formattedBookings)
    } catch (error) {
      console.error('Bookings fetch error:', error)
      toast.error('Bookings load nahi ho paaye.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter(b =>
        b.user.name.toLowerCase().includes(query.toLowerCase()) ||
        b.show.movie.title.toLowerCase().includes(query.toLowerCase()) ||
        b.show.theaterName?.toLowerCase().includes(query.toLowerCase()) ||
        b.user.email.toLowerCase().includes(query.toLowerCase())
      ))
    }
  }

  useEffect(() => {
    getAllBookings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.amount), 0)
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length
  const pendingCount = bookings.filter(b => b.status === 'pending').length

  return !isLoading ? (
    <>
      <Title text1='List' text2='Bookings' />

      <div className="flex gap-4 mt-6 mb-6 flex-wrap">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'text-white' },
          { label: 'Confirmed', value: confirmedCount, color: 'text-green-400' },
          { label: 'Pending Payment', value: pendingCount, color: 'text-yellow-400' },
          { label: 'Total Revenue', value: `${currency}${totalRevenue.toFixed(0)}`, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-primary/10 border border-primary/20 rounded-xl px-5 py-3">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm mb-4">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="User, movie ya theater search karo..."
          className="w-full bg-gray-900/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition"
        />
      </div>

      <div className="max-w-6xl mt-2 overflow-x-auto">
        <table className="w-full border-collapse rounded-xl overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white border-b border-primary/20">
              <th className="p-3 pl-5 font-medium">#</th>
              <th className="p-3 pl-5 font-medium">User</th>
              <th className="p-3 pl-5 font-medium">Movie</th>
              <th className="p-3 pl-5 font-medium">Theater</th>
              <th className="p-3 pl-5 font-medium">Show Time</th>
              <th className="p-3 pl-5 font-medium">Seats</th>
              <th className="p-3 pl-5 font-medium">Amount</th>
              <th className="p-3 pl-5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-300">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((item, index) => (
                <tr key={item.id || index} className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/15 transition-all">
                  <td className="p-3 pl-5 text-gray-500 text-xs">{index + 1}</td>
                  <td className="p-3 pl-5">
                    <p className="font-medium text-white">{item.user.name}</p>
                    <p className="text-xs text-gray-500">{item.user.email}</p>
                  </td>
                  <td className="p-3 pl-5 max-w-150px truncate">{item.show.movie.title}</td>
                  <td className="p-3 pl-5 text-gray-400 max-w-130px truncate">{item.show.theaterName}</td>
                  <td className="p-3 pl-5 font-mono text-xs">{dateFormat(item.show.showDateTime)}</td>
                  <td className="p-3 pl-5 font-mono text-primary font-bold text-xs">
                    {Array.isArray(item.bookedSeats) ? item.bookedSeats.join(', ') : ''}
                    <span className="text-gray-500 ml-1">({item.bookedSeats.length})</span>
                  </td>
                  <td className="p-3 pl-5 font-semibold text-emerald-400">{currency}{item.amount}</td>
                  <td className="p-3 pl-5">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === 'confirmed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {item.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-8 text-center text-gray-500 bg-primary/5">
                  Not any booking found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  )
}

export default ListBookings