import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'
import { MapPinIcon, PhoneIcon, MailIcon } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="px-6 md:px-16 lg:px-36 mt-20 w-full text-gray-400 bg-gray-950 border-t border-gray-800">
      <div className="flex flex-col md:flex-row justify-between gap-12 py-14 border-b border-gray-800">

        {/* Brand */}
        <div className="md:max-w-80">
          <img src={assets.logo} alt="YourShow" className="h-9 w-auto" />
          <p className="mt-4 text-sm leading-relaxed">
           YourShow — India's fastest movie ticket booking platform. Book tickets for your favorite movies in seconds, in any city across India.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <img src={assets.googlePlay} alt="Google Play" className="h-9 w-auto cursor-pointer hover:opacity-80 transition" />
            <img src={assets.appStore} alt="App Store" className="h-9 w-auto cursor-pointer hover:opacity-80 transition" />
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-1 items-start md:justify-end gap-16 md:gap-24">

          {/* Quick Links */}
          <div>
            <h2 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Quick Links</h2>
            <ul className="text-sm space-y-3">
              {[
                { label: 'Home', to: '/' },
                { label: 'Movies', to: '/movies' },
                { label: 'Theaters', to: '/theaters' },
                { label: 'Releases', to: '/releases' },
                { label: 'My Bookings', to: '/my-bookings' },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link to={to} onClick={() => scrollTo(0, 0)} className="hover:text-primary transition">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h2 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Company</h2>
            <ul className="text-sm space-y-3">
              {[
                { label: 'About Us', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Help & Support', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="hover:text-primary transition">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h2 className="font-semibold text-white mb-5 text-sm uppercase tracking-wider">Contact</h2>
            <div className="text-sm space-y-3">
              <p className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-primary flex-shrink-" />
                +91-9129994379
              </p>
              <p className="flex items-center gap-2">
                <MailIcon className="w-4 h-4 text-primary flex-shrink-" />
                support@yourkshow.in
              </p>
              <p className="flex items-start gap-2">
                <MapPinIcon className="w-4 h-4 text-primary flex-shrink- mt-0.5" />
                new delhi, India
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-5">
              {[
                { label: 'X', href: '#', icon: '𝕏' },
                { label: 'Instagram', href: '#', icon: '📸' },
                { label: 'Facebook', href: '#', icon: '📘' },
                { label: 'YouTube', href: '#', icon: '▶️' },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  title={label}
                  className="w-8 h-8 bg-gray-800 hover:bg-primary/20 hover:border-primary border border-gray-700 rounded-lg flex items-center justify-center text-sm transition"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-5 text-xs text-gray-600">
        <p>Copyright {new Date().getFullYear()} © YourShow. All Rights Reserved.</p>
        <p>Made with ❤️ in India</p>
      </div>
    </footer>
  )
}

export default Footer