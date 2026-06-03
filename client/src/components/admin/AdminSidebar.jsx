import React from 'react'
import { assets } from '../../assets/assets'
import { LayoutDashboardIcon, ListCollapseIcon, PlusSquareIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const AdminSidebar = () => {
  const user = {
    firstName: 'Admin',
    lastName : 'User',
    imageUrl: assets.profile, // FIXED: Corrected spelling from 'imsgeUrl' to avoid broken rendering
  }

  const adminNavLinks = [
    {name: 'Dashboard', path: '/admin', icon: LayoutDashboardIcon},
    {name: 'add movies', path:'/admin/add-movies', icon:PlusSquareIcon},
    {name: 'Add Shows', path: '/admin/add-shows', icon: PlusSquareIcon},
    {name: 'List Shows', path: '/admin/list-shows', icon: PlusSquareIcon},
    {name: 'List Booking', path: '/admin/list-bookings', icon: ListCollapseIcon},
  ]

  return (
    <div className='h-[calc(100vh-60px)] md:flex flex-col items-center pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm'>
      
      <img className='h-9 md:h-14 w-9 md:w-14 rounded-full mx-auto object-cover' src={user.imageUrl} alt='sidebar profile' />
      <p className='mt-2 text-base max-md:hidden text-gray-200'>{user.firstName} {user.lastName}</p>

      <div className='w-full'>
        {
          adminNavLinks.map((link, index) => (
            <NavLink 
              key={index} 
              to={link.path} 
              end 
              className={({ isActive }) => `relative flex items-center max-md:justify-center gap-2 w-full py-2.5 md:pl-10 first:mt-6 text-gray-400 transition-all hover:text-white ${isActive ? 'bg-primary/15 text-primary group font-medium' : ''}`}
            >
              {({ isActive }) => (
                <>
                  <link.icon className='w-5 h-5' />
                  <p className='max-md:hidden'>{link.name}</p>
                  <span className={`w-1.5 h-10 rounded-l right-0 absolute transition-all ${isActive ? 'bg-primary' : 'bg-transparent'}`} />
                </>
              )}
            </NavLink>
          ))
        }
      </div>
    </div>
  )
}

export default AdminSidebar
