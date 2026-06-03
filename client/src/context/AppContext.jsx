/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useEffect, useState } from 'react'
import axios from 'axios'

export const AppContext = createContext()

export const AppContextProvider = ({ children }) => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  // Explicit local declaration matching port 3000
  const BACKEND_URL = import.meta.env.VITE_BASE_URL

  const fetchAllMoviesCatalog = async () => {
    try {
      setLoading(true)
      // FIX: Ensure this endpoint points exactly to '/api/movies' 
      const response = await axios.get(`${BACKEND_URL}/api/movies`)
      setMovies(response.data)
    } catch (error) {
      console.error("Context data pipeline error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllMoviesCatalog()
  }, [])

  return (
    <AppContext.Provider value={{ movies, loading, fetchAllMoviesCatalog }}>
      {children}
    </AppContext.Provider>
  )
}
