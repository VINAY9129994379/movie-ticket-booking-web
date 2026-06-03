/* eslint-disable react-hooks/refs */
import React, { useRef, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { DownloadIcon } from 'lucide-react'

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const buildImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  const [year, month, day] = dateStr.split('T')[0].split('-')
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const formatTime = (timeStr) => {
  if (!timeStr) return 'N/A'
  const timePart = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr
  const [hour, minute] = timePart.split(':')
  const h = parseInt(hour)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${minute} ${ampm}`
}

// Booking code generator — outside component, pure function
const generateCode = (id) => {
  const suffix = String(id || '000').padStart(3, '0')
  const timestamp = String(performance.now()).replace('.', '').slice(0, 6)
  return `QS-${suffix}-${timestamp}`
}

const BARS = [3,1,2,1,3,1,1,2,3,1,2,1,3,2,1,3,1,2,1,3,2,1,3,1,2,3,1,1,2,3,1,2,1,3,2,1]

const TicketPDF = ({ booking }) => {
  const ticketRef = useRef(null)
  const codeRef = useRef(null)

  useEffect(() => {
    if (!codeRef.current) {
      codeRef.current = generateCode(booking.id)
    }
  }, [booking.id])

  const showDateRaw = booking.show?.showDateTime?.split('T')[0]
  const showTimePart = booking.show?.showDateTime?.split('T')[1] || ''

  const handleDownload = async () => {
    const element = ticketRef.current
    if (!element) return

    element.style.position = 'absolute'
    element.style.left = '0'
    element.style.top = '0'
    element.style.zIndex = '9999'
    element.style.opacity = '1'

    await new Promise(r => setTimeout(r, 300))

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f0f1a',
        useCORS: true,
        allowTaint: true,
        logging: false,
        windowWidth: 420,
      })

      element.style.position = 'fixed'
      element.style.left = '-9999px'
      element.style.zIndex = ''
      element.style.opacity = '0'

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [105, 200] })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`QuickShow-Ticket-${booking.id || 'ticket'}.pdf`)
    } catch (err) {
      console.error('PDF error:', err)
      element.style.position = 'fixed'
      element.style.left = '-9999px'
      element.style.opacity = '0'
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition cursor-pointer"
      >
        <DownloadIcon className="w-3.5 h-3.5" /> Download Ticket
      </button>

      <div
        ref={ticketRef}
        style={{
          position: 'fixed', left: '-9999px', top: '0', opacity: '0',
          width: '420px',
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%)',
          color: 'white', fontFamily: 'Arial, sans-serif',
          borderRadius: '16px', overflow: 'hidden',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7)', padding: '18px 24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '24px' }}>🎬</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>QuickShow</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>Movie Ticket</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>Booking ID</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>#{booking.id || 'N/A'}</div>
          </div>
        </div>

        {/* Movie Info */}
        <div style={{ display: 'flex', gap: '16px', padding: '20px 24px' }}>
          <img
            src={buildImageUrl(booking.show?.movie?.poster_path)}
            alt={booking.show?.movie?.title || 'Movie'}
            crossOrigin="anonymous"
            style={{ width: '80px', height: '110px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }}
            onError={(e) => { e.target.src = FALLBACK_IMAGE }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', lineHeight: 1.3 }}>
              {booking.show?.movie?.title || 'Movie'}
            </div>
            <div style={{ marginTop: '10px', fontSize: '11px', background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', padding: '3px 10px', borderRadius: '20px', color: '#4ade80', display: 'inline-block' }}>
              ✓ Confirmed
            </div>
            <div style={{ marginTop: '10px', fontSize: '22px', fontWeight: 'bold', color: '#a78bfa' }}>
              ₹{booking.amount}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '2px dashed rgba(124,58,237,0.4)', margin: '0 24px' }} />

        {/* Details Grid */}
        <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: '📅 Date', value: formatDate(showDateRaw) },
            { label: '🕐 Time', value: formatTime(showTimePart) },
            { label: '🏛️ Theater', value: booking.show?.theater_name || 'N/A' },
            { label: '📍 Address', value: booking.show?.theater_address || booking.show?.theater_city || 'N/A' },
            { label: '💺 Seats', value: booking.bookedSeats?.join(', ') || 'N/A' },
            { label: '🎟️ Tickets', value: `${booking.bookedSeats?.length || 0} Seat(s)` },
            { label: '💳 Payment', value: 'Paid Online' },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '2px dashed rgba(124,58,237,0.4)', margin: '0 24px' }} />

        {/* Barcode */}
        <div style={{ padding: '20px 24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', marginBottom: '10px' }}>
            {BARS.map((w, i) => (
              <div key={i} style={{
                width: `${w}px`, height: '48px',
                background: i % 5 === 0 ? '#7c3aed' : i % 3 === 0 ? '#a855f7' : 'white',
                borderRadius: '1px'
              }} />
            ))}
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280', letterSpacing: '2px' }}>
            {codeRef.current || `QS-${booking.id || '000'}`}
          </div>
        </div>

        <div style={{ background: 'rgba(124,58,237,0.15)', padding: '12px 24px', textAlign: 'center', fontSize: '10px', color: '#6b7280' }}>
          QuickShow • Valid only for selected show • Non-transferable
        </div>
      </div>
    </div>
  )
}

export default TicketPDF