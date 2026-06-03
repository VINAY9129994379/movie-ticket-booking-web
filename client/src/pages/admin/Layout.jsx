import React, { useEffect } from 'react'
import AdminNavbar from '../../components/admin/AdminNavbar'
import AdminSidebar from '../../components/admin/AdminSidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'

const ADMIN_USER_ID = import.meta.env.VITE_ADMIN_USER_ID

const Layout = () => {
  const navigate = useNavigate()
  const { userId, isLoaded, isSignedIn } = useAuth()

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn || userId !== ADMIN_USER_ID) {
      navigate('/')
      scrollTo(0, 0)
    }
  }, [isLoaded, isSignedIn, userId, navigate])

  if (!isLoaded) return null
  if (!isSignedIn || userId !== ADMIN_USER_ID) return null

  return (
    <>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 px-4 py-10 md:px-10 h-[calc(100vh-64px)] overflow-y-auto bg-gray-950 text-white">
          <Outlet />
        </div>
      </div>
    </>
  )
}

export default Layout