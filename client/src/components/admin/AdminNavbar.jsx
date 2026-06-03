import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { UserButton } from '@clerk/react'

const AdminNavbar = () => {
  return (
    <div className="flex items-center justify-between px-6 md:px-10 py-4 bg-gray-950 border-b border-gray-800 sticky top-0 z-40">
      {/* Logo */}
      <Link to="/">
        <img src={assets.logo} alt="QuickShow" className="h-8 w-auto" />
      </Link>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-500 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
          Admin Panel
        </span>
        <UserButton />
      </div>
    </div>
  )
}

export default AdminNavbar