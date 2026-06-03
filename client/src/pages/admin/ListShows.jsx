import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading'
import Title from './Title'
import { dateFormat } from '../../lib/dateFormat'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Trash2Icon, SearchIcon } from 'lucide-react'
import { useAuth } from '@clerk/react'

const BACKEND_URL = import.meta.env.VITE_BASE_URL

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const { userId } = useAuth()
  const [shows, setShows] = useState([])
  const [filteredShows, setFilteredShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const headers = { 'x-clerk-user-id': userId }

  const getAllShows = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const response = await axios.get(`${BACKEND_URL}/api/shows/admin/all-shows-list`, { headers })

      const structuredShows = await Promise.all((response.data || []).map(async (showItem) => {
        let seatCount = 0
        try {
          const seatRes = await axios.get(`${BACKEND_URL}/api/bookings/show/${showItem.id}/booked`)
          seatCount = seatRes.data?.bookedSeats?.length || 0
        } catch (err) {
          console.error(`Bookings fetch failed for show ${showItem.id}`, err)
        }
        return {
          id: showItem.id,
          showPrice: parseFloat(showItem.ticket_price || 0),
          showDateTime: `${showItem.show_date.split('T')[0]}T${showItem.show_time}`,
          theaterName: showItem.theater_name,
          totalBookingsCount: seatCount,
          totalSeats: showItem.total_seats || 60,
          movie: { title: showItem.movie_title || 'Unknown Title' }
        }
      }))

      setShows(structuredShows)
      setFilteredShows(structuredShows)
    } catch (error) {
      console.error('Shows fetch error:', error)
      toast.error('Shows load nahi ho paaye.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (showId) => {
    if (!window.confirm('Kya aap is show ko delete karna chahte hain?')) return
    try {
      setDeletingId(showId)
      await axios.delete(`${BACKEND_URL}/api/shows/admin/${showId}`, { headers })
      toast.success('Show deleted successfully!')
      getAllShows()
    } catch (err) {
      console.error(err)
      toast.error('Delete karne me error aayi.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSearch = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredShows(shows)
    } else {
      setFilteredShows(shows.filter(s =>
        s.movie.title.toLowerCase().includes(query.toLowerCase()) ||
        s.theaterName?.toLowerCase().includes(query.toLowerCase())
      ))
    }
  }

  useEffect(() => {
    getAllShows()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return !loading ? (
    <>
      <Title text1='List' text2='Shows' />

      <div className="flex gap-4 mt-6 mb-6 flex-wrap">
        {[
          { label: 'Total Shows', value: shows.length, color: 'text-white' },
          { label: 'Total Bookings', value: shows.reduce((s, i) => s + i.totalBookingsCount, 0), color: 'text-blue-400' },
          { label: 'Total Revenue', value: `${currency}${shows.reduce((s, i) => s + i.totalBookingsCount * i.showPrice, 0).toFixed(0)}`, color: 'text-green-400' },
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
          placeholder="Movie ya theater search karo..."
          className="w-full bg-gray-900/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-primary transition"
        />
      </div>

      <div className="max-w-5xl mt-2 overflow-x-auto">
        <table className="w-full border-collapse rounded-xl overflow-hidden text-nowrap">
          <thead>
            <tr className="bg-primary/20 text-left text-white border-b border-primary/20">
              <th className="p-3 pl-5 font-medium">Movie</th>
              <th className="p-3 pl-5 font-medium">Theater</th>
              <th className="p-3 pl-5 font-medium">Show Time</th>
              <th className="p-3 pl-5 font-medium">Bookings</th>
              <th className="p-3 pl-5 font-medium">Occupancy</th>
              <th className="p-3 pl-5 font-medium">Revenue</th>
              <th className="p-3 pl-5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-300">
            {filteredShows.length > 0 ? (
              filteredShows.map((show, index) => (
                <tr key={show.id || index} className="border-b border-primary/10 bg-primary/5 even:bg-primary/10 hover:bg-primary/15 transition-all">
                  <td className="p-3 pl-5 font-medium text-white max-w-180px truncate">{show.movie.title}</td>
                  <td className="p-3 pl-5 text-gray-400 max-w-150px truncate">{show.theaterName}</td>
                  <td className="p-3 pl-5 font-mono text-xs">{dateFormat(show.showDateTime)}</td>
                  <td className="p-3 pl-5 font-mono">{show.totalBookingsCount}/{show.totalSeats}</td>
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((show.totalBookingsCount / show.totalSeats) * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round((show.totalBookingsCount / show.totalSeats) * 100)}%</span>
                    </div>
                  </td>
                  <td className="p-3 pl-5 font-semibold text-emerald-400">{currency}{(show.totalBookingsCount * show.showPrice).toFixed(0)}</td>
                  <td className="p-3 pl-5">
                    <button
                      onClick={() => handleDelete(show.id)}
                      disabled={deletingId === show.id}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      <Trash2Icon className="w-3.5 h-3.5" />
                      {deletingId === show.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500 bg-primary/5"> No shows found.</td>
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

export default ListShows