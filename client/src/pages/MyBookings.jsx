import React, { useState, useEffect } from 'react'
import Loading from '../components/Loading'
import Blur from '../components/Blur'
import timeFormat from '../lib/timeFormat'
import { dateFormat } from '../lib/dateFormat'
import axios from 'axios'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import TicketPDF from '../components/TicketPDF'

const BACKEND_URL = import.meta.env.VITE_BASE_URL
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

const buildImageUrl = (path) => {
  if (!path) return FALLBACK_IMAGE
  if (path.startsWith('http')) return path
  return `${TMDB_IMAGE_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

const PaymentForm = ({ booking, userId, onSuccess, onClose }) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    try {
      setProcessing(true)
      const intentRes = await axios.post(
        `${BACKEND_URL}/api/payment/create-intent`,
        { booking_id: booking.id },
        { headers: { 'x-clerk-user-id': userId } }
      )
      const { clientSecret } = intentRes.data
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: booking.show.movie.title }
        }
      })
      if (result.error) { toast.error(result.error.message); return }
      if (result.paymentIntent.status === 'succeeded') {
        await axios.post(
          `${BACKEND_URL}/api/payment/confirm`,
          { booking_id: booking.id, payment_intent_id: result.paymentIntent.id },
          { headers: { 'x-clerk-user-id': userId } }
        )
        toast.success('Payment successful! Booking confirmed 🎉')
        onSuccess()
      }
    } catch (err) {
      console.error('Payment error:', err)
      toast.error(err.response?.data?.error || 'Payment failed. Try again.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="bg-gray-800/60 rounded-xl p-4 text-sm">
        <p className="font-semibold text-white">{booking.show.movie.title}</p>
        <p className="text-gray-400 text-xs mt-1">{booking.show.theater_name}</p>
        <p className="text-gray-400 text-xs">{dateFormat(booking.show.showDateTime)}</p>
        <p className="text-gray-400 text-xs">Seats: {booking.bookedSeats.join(', ')}</p>
        <p className="text-primary font-bold text-lg mt-2">₹{booking.amount}</p>
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Card Details</p>
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-4 focus-within:border-primary transition">
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#ffffff', '::placeholder': { color: '#6b7280' }, iconColor: '#ffffff' }, invalid: { color: '#ef4444' } } }} />
        </div>
        <p className="text-xs text-gray-600 mt-2">Test card: 4242 4242 4242 4242 | Any future date | Any CVC</p>
      </div>
      <div className="flex gap-3 mt-2">
        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition cursor-pointer">Cancel</button>
        <button type="submit" disabled={!stripe || processing} className="flex-1 py-3 bg-primary hover:bg-primary-dull text-white rounded-xl text-sm font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {processing ? 'Processing...' : `Pay ₹${booking.amount}`}
        </button>
      </div>
    </form>
  )
}

const PaymentModal = ({ booking, userId, onSuccess, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <h2 className="text-lg font-bold text-white mb-4">Complete Payment</h2>
      <Elements stripe={stripePromise}>
        <PaymentForm booking={booking} userId={userId} onSuccess={onSuccess} onClose={onClose} />
      </Elements>
    </div>
  </div>
)

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || '₹'
  const { userId, isSignedIn } = useAuth()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [payingBooking, setPayingBooking] = useState(null)

  const getMyBookings = async () => {
    if (!isSignedIn || !userId) { setIsLoading(false); return }
    try {
      setIsLoading(true)
      const response = await axios.get(`${BACKEND_URL}/api/bookings/my-bookings`, {
        headers: { 'x-clerk-user-id': userId }
      })
      const structuralBookings = response.data.map(ticket => ({
        id: ticket.booking_id || ticket.id,
        amount: Number(ticket.total_price).toFixed(0),
        bookedSeats: ticket.seats_booked || [],
        isPaid: ticket.booking_status === 'confirmed',
        show: {
          showDateTime: `${ticket.show_date.split('T')[0]}T${ticket.show_time}`,
          theater_name: ticket.theater_name,
          theater_address: ticket.theater_address || '',
          theater_city: ticket.theater_city || '',
          movie: {
            title: ticket.title,
            poster_path: ticket.poster_path,
            runtime: ticket.runtime || 120
          }
        }
      }))
      setBookings(structuralBookings)
    } catch (error) {
      console.error('Bookings fetch error:', error)
      toast.error('Bookings load nahi ho paaye.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getMyBookings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, isSignedIn])

  const handlePaymentSuccess = () => {
    setPayingBooking(null)
    getMyBookings()
  }

  if (!isSignedIn) {
    return (
      <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh] flex flex-col items-center justify-center text-center">
        <Blur top="100px" left="100px" />
        <h2 className="text-xl font-semibold mb-2">You are not logged in!</h2>
        <p className="text-gray-400 text-sm max-w-sm">Please login to view your booking history.</p>
      </div>
    )
  }

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-30 md:pt-40 min-h-[80vh]">
      <Blur top="100px" left="100px" />
      <Blur bottom="0px" left="600px" />
      <h1 className="text-lg font-semibold mb-6">My Bookings</h1>

      {bookings.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-3xl">
          {bookings.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row justify-between bg-primary/8 border border-primary/20 rounded-xl overflow-hidden">
              <div className="flex gap-4 p-3">
                <img
                  src={buildImageUrl(item.show.movie.poster_path)}
                  alt={item.show.movie.title}
                  className="w-24 h-32 object-cover rounded-lg flex-shrink- bg-gray-900"
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE }}
                />
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <p className="text-base font-semibold leading-tight">{item.show.movie.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{timeFormat(item.show.movie.runtime)}</p>
                    <p className="text-gray-400 text-xs mt-1">{item.show.theater_name}</p>
                    {item.show.theater_address && (
                      <p className="text-gray-500 text-xs mt-0.5">{item.show.theater_address}</p>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">{dateFormat(item.show.showDateTime)}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between items-end p-4 border-t sm:border-t-0 sm:border-l border-primary/20 min-w-160px">
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{currency}{item.amount}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${item.isPaid ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {item.isPaid ? '✓ Confirmed' : '⏳ Pending'}
                  </span>
                </div>
                <div className="text-xs text-right mt-3">
                  <p><span className="text-gray-400">Tickets: </span><span className="font-medium">{item.bookedSeats.length}</span></p>
                  <p className="mt-0.5"><span className="text-gray-400">Seats: </span><span className="font-medium text-primary">{item.bookedSeats.join(', ')}</span></p>
                </div>
                {!item.isPaid && (
                  <button onClick={() => setPayingBooking(item)} className="mt-3 bg-primary hover:bg-primary-dull px-4 py-1.5 text-xs rounded-full font-medium cursor-pointer transition text-white">
                    Pay Now
                  </button>
                )}
                {item.isPaid && <TicketPDF booking={item} />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-primary/5 border border-dashed border-primary/20 rounded-lg max-w-3xl">
          <p className="text-gray-500 text-sm">You haven't booked any tickets yet!</p>
        </div>
      )}

      {payingBooking && (
        <PaymentModal booking={payingBooking} userId={userId} onSuccess={handlePaymentSuccess} onClose={() => setPayingBooking(null)} />
      )}
    </div>
  ) : (
    <Loading />
  )
}

export default MyBookings