/* eslint-disable no-unused-vars */
import React, { useContext } from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'

// Admin imports
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import AddShows from './pages/admin/AddShows'
import ListShows from './pages/admin/ListShows'
import ListBookings from './pages/admin/ListBookings'
import { AppContext } from './context/AppContext'
import { SignIn } from '@clerk/react'
import Theaters from './pages/Theatures'
import Releases from './pages/Releases'
import AddMovie from './pages/admin/AddMovie'

const App = () => {

  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  const {user} = useContext(AppContext)

  return (
    <>
      <Toaster />
      
      {!isAdminRoute && <Navbar />} 

      <Routes>
        {/* User Routes */}
        <Route path='/' element={<Home/>} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/favorite' element={<Favorite />} />
        
        {/* FIXED: Registered the missing route targets linked from your layout */}
        <Route path='/theaters' element={<Theaters/>} />
        <Route path='/releases' element={<Releases />} />
        
        {/* Admin Routes */}
        <Route path='/admin' element={<Layout />} >
          <Route index element={<Dashboard/>} />
          <Route path='add-movies' element={<AddMovie/>}/>
          <Route path='add-shows' element={<AddShows/>} />
          <Route path='list-shows' element={<ListShows/>} />
          <Route path='list-bookings' element={<ListBookings/>} />
        </Route>

      </Routes>

      {!isAdminRoute && <Footer />}
    </>
  )
}

export default App
