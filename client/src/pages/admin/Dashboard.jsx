import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from './Title';
import Blur from '../../components/Blur';
import { dateFormat } from '../../lib/dateFormat';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '@clerk/react';

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const buildImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const { userId } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeShows: [],
    totalUser: 0
  })
  const [loading, setLoading] = useState(true)

  const dashboardCards = [
    { title: 'Total Bookings', value: dashboardData.totalBookings || '0', icon: ChartLineIcon },
    { title: 'Total Revenue', value: `${currency}${dashboardData.totalRevenue || '0'}`, icon: CircleDollarSignIcon },
    { title: 'Active Shows', value: dashboardData.activeShows?.length || '0', icon: PlayCircleIcon },
    { title: 'Total Users', value: dashboardData.totalUser || '0', icon: UsersIcon },
  ]

  const fetchDashboardData = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const headers = { 'x-clerk-user-id': userId }

      const bookingsRes = await axios.get(`${BACKEND_URL}/api/bookings/admin/all`, { headers })
      const bookingsList = bookingsRes.data || []

      const aggregatedRevenue = bookingsList.reduce((sum, item) => sum + Number(item.total_price || 0), 0)
      const dynamicSeatsBookedCount = bookingsList.reduce((sum, item) => sum + (item.seats_booked?.length || 0), 0)
      const uniqueClerkUsers = new Set(bookingsList.map(item => item.clerk_user_id)).size

      const showsRes = await axios.get(`${BACKEND_URL}/api/shows/admin/all-shows-list`, { headers })
      const rawShowsList = showsRes.data || []

      const structuredShows = rawShowsList.map(showItem => ({
        _id: showItem.id,
        showPrice: parseFloat(showItem.ticket_price || 0),
        showDateTime: `${showItem.show_date.split('T')[0]}T${showItem.show_time}`,
        movie: {
          title: showItem.movie_title || 'Unknown Film',
          poster_path: buildImageUrl(showItem.poster_path),
          vote_average: Number(showItem.vote_average || 0)
        }
      }))

      setDashboardData({
        totalBookings: dynamicSeatsBookedCount,
        totalRevenue: aggregatedRevenue.toFixed(0),
        activeShows: structuredShows,
        totalUser: uniqueClerkUsers || 1
      })
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      toast.error('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  return !loading ? (
    <>
      <Title text1='admin' text2='dashboard' />

      <div className="relative flex flex-wrap gap-4 mt-6">
        <Blur top="-100px" left="0" />
        <div className="flex flex-wrap gap-4 w-full">
          {dashboardCards.map((card, index) => (
            <div key={index} className="flex items-center justify-between px-4 py-3 bg-primary/10 border border-primary/20 rounded-md max-w-50 w-full">
              <div>
                <h1 className="text-sm text-gray-400">{card.title}</h1>
                <p className="text-xl font-medium mt-1 text-white">{card.value}</p>
              </div>
              <card.icon className="w-6 h-6 text-primary" />
            </div>
          ))}
        </div>
      </div>

      <p className="mt-10 text-lg font-medium text-gray-200">Active Shows</p>
      <div className="relative flex flex-wrap gap-6 mt-4 max-w-5xl">
        <Blur top="100px" left="-10%" />
        {dashboardData.activeShows.length > 0 ? (
          dashboardData.activeShows.map(show => (
            <div key={show._id} className="w-55 rounded-lg overflow-hidden h-full pb-3 bg-primary/10 border border-primary/20 hover:-translate-y-1 transition duration-300">
              <img
                src={show.movie.poster_path}
                alt=""
                className="h-60 w-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE }}
              />
              <p className="font-medium p-2 truncate text-gray-100">{show.movie.title}</p>
              <div className="flex items-center justify-between px-2">
                <p className="text-lg font-medium text-white">{currency} {show.showPrice}</p>
                <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                  <StarIcon className="w-4 h-4 text-primary fill-primary" />
                  {Number(show.movie.vote_average || 0).toFixed(1)}
                </p>
              </div>
              <p className="px-2 pt-2 text-sm text-gray-500 font-mono">{dateFormat(show.showDateTime)}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm py-4 w-full pl-2">No active shows yet.</p>
        )}
      </div>
    </>
  ) : (
    <Loading />
  )
}

export default Dashboard