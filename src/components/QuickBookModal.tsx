import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Users, Bed, Lock, Minus, Plus, X,
  Check, Phone, Mail, User
} from 'lucide-react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  calculateBookingQuote,
  getStayNights,
  MAX_STAY_NIGHTS,
} from '@contracts/booking-pricing'

type RoomType = 'multi_share' | 'twin' | 'private'

interface QuickBookModalProps {
  propertyId: number
  capacity: number
  price: number
  title: string
  image: string
  isOpen: boolean
  onClose: () => void
}

const ROOM_TYPES: { id: RoomType; icon: typeof Users; title: string; desc: string }[] = [
  { id: 'multi_share', icon: Users, title: 'Multi-Share', desc: '4-6 beds per room' },
  { id: 'twin', icon: Bed, title: 'Twin Room', desc: '2 beds per room' },
  { id: 'private', icon: Lock, title: 'Private Room', desc: 'Your own room' },
]

export default function QuickBookModal({ propertyId, capacity, price, title, image, isOpen, onClose }: QuickBookModalProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [roomType, setRoomType] = useState<RoomType>('twin')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      navigate('/payment?ref=' + data.bookingRef)
    },
  })

  const nights = useMemo(() => getStayNights(checkIn, checkOut), [checkIn, checkOut])
  const quote = nights > 0 && nights <= MAX_STAY_NIGHTS
    ? calculateBookingQuote(price, nights, roomType)
    : null
  const today = new Date().toISOString().slice(0, 10)
  const guestLimit = Math.min(capacity, 20)

  const handleSubmit = () => {
    if (!checkIn || !checkOut || !termsAccepted || !quote || adults + children > capacity) return
    if (!user) {
      navigate('/login?returnTo=' + encodeURIComponent('/booking/' + propertyId), {
        state: {
          bookingForm: {
            checkIn,
            checkOut,
            adults,
            children,
            roomType,
            contactName,
            contactPhone,
            contactEmail,
            termsAccepted,
          },
        },
      })
      return
    }
    createBooking.mutate({
      propertyId,
      checkIn,
      checkOut,
      adults,
      children,
      roomType,
      addShuttle: 0,
      seasonPass: 0,
      contactName,
      contactPhone,
      contactEmail: contactEmail.trim() || undefined,
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-light-grey">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-warm-sand transition-colors"
              >
                <X size={20} className="text-slate" />
              </button>
              <div className="flex items-center gap-3 pr-8">
                <img src={image} alt={title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div>
                  <h2 className="font-display font-bold text-deep-forest text-lg leading-tight">{title}</h2>
                  <p className="text-slate text-sm">USh {price.toLocaleString()} / night</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-5">
              {/* Dates */}
              <div>
                <label className="text-xs text-slate font-medium uppercase tracking-wide mb-2 block">Dates</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-slate text-xs mb-1">
                      <Calendar size={12} /> Check-in
                    </div>
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => {
                        const nextCheckIn = e.target.value
                        setCheckIn(nextCheckIn)
                        if (checkOut && nextCheckIn >= checkOut) setCheckOut('')
                      }}
                      className="w-full border border-light-grey rounded-lg px-3 py-2.5 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-slate text-xs mb-1">
                      <Calendar size={12} /> Check-out
                    </div>
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-light-grey rounded-lg px-3 py-2.5 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                </div>
                {nights > 0 && (
                  <p className="text-xs text-sunset font-medium mt-1.5">{nights} nights selected</p>
                )}
                {checkIn && checkOut && nights === 0 && (
                  <p role="alert" className="text-xs text-red-600 mt-1.5">Check-out must be a valid date after check-in.</p>
                )}
                {nights > MAX_STAY_NIGHTS && (
                  <p role="alert" className="text-xs text-red-600 mt-1.5">Stays are limited to {MAX_STAY_NIGHTS} nights.</p>
                )}
              </div>

              {/* Guests */}
              <div>
                <label className="text-xs text-slate font-medium uppercase tracking-wide mb-2 block">Guests</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-warm-sand rounded-lg">
                    <div>
                      <p className="font-medium text-deep-forest text-sm">Adults</p>
                      <p className="text-xs text-slate">Ages 13+</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                        disabled={adults <= 1}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-semibold text-deep-forest w-6 text-center">{adults}</span>
                      <button
                        onClick={() => setAdults(Math.min(guestLimit, adults + 1))}
                        className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                        disabled={adults + children >= guestLimit}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-warm-sand rounded-lg">
                    <div>
                      <p className="font-medium text-deep-forest text-sm">Children</p>
                      <p className="text-xs text-slate">Ages 2-12</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                        disabled={children <= 0}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-semibold text-deep-forest w-6 text-center">{children}</span>
                      <button
                        onClick={() => setChildren(Math.max(0, Math.min(10, guestLimit - adults, children + 1)))}
                        className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
                        disabled={children >= 10 || adults + children >= guestLimit}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Type */}
              <div>
                <label className="text-xs text-slate font-medium uppercase tracking-wide mb-2 block">Room Type</label>
                <div className="space-y-2">
                  {ROOM_TYPES.map((room) => {
                    const Icon = room.icon
                    const isSelected = roomType === room.id
                    return (
                      <button
                        key={room.id}
                        onClick={() => setRoomType(room.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                          isSelected
                            ? 'border-sunset bg-sunset/5'
                            : 'border-light-grey hover:border-sunset/50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-sunset text-white' : 'bg-warm-sand text-slate'}`}>
                          <Icon size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-deep-forest text-sm">{room.title}</p>
                          <p className="text-xs text-slate">{room.desc}</p>
                        </div>
                        {isSelected && <Check size={18} className="text-sunset shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label className="text-xs text-slate font-medium uppercase tracking-wide mb-2 block">Contact Info</label>
                <div className="space-y-2">
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full border border-light-grey rounded-lg pl-9 pr-3 py-2.5 text-sm text-deep-foreground focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full border border-light-grey rounded-lg pl-9 pr-3 py-2.5 text-sm text-deep-foreground focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full border border-light-grey rounded-lg pl-9 pr-3 py-2.5 text-sm text-deep-foreground focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Price Preview */}
              {nights > 0 && nights <= MAX_STAY_NIGHTS && quote && (
                <div className="bg-warm-sand rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate">USh {quote.perNight.toLocaleString()} × {nights} nights</span>
                    <span className="text-deep-forest font-medium">USh {quote.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate">Service fee</span>
                    <span className="text-deep-forest font-medium">USh {quote.serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate">Taxes (18%)</span>
                    <span className="text-deep-forest font-medium">USh {quote.tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-light-grey pt-2 flex justify-between items-center">
                    <span className="font-display font-bold text-deep-forest">Total</span>
                    <span className="font-display text-xl font-bold text-deep-forest">USh {(quote?.total ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-light-grey text-sunset focus:ring-sunset"
                />
                <span className="text-xs text-slate leading-relaxed">
                  I agree to the Booking Terms, Cancellation Policy, and House Rules
                </span>
              </label>

              {/* CTA */}
              <Button
                className="w-full btn-sunset-gradient py-4 text-base"
                disabled={!checkIn || !checkOut || !termsAccepted || createBooking.isPending || !contactName || !contactPhone || !quote || adults + children > capacity}
                onClick={handleSubmit}
              >
                {createBooking.isPending ? 'Processing...' : 'Reserve Now'}
              </Button>

              {createBooking.error && <p role="alert" className="text-sm text-red-600 text-center">{createBooking.error.message}</p>}
              {quote === null && nights > 0 && nights <= MAX_STAY_NIGHTS && <p role="alert" className="text-sm text-red-600 text-center">We can&apos;t calculate this booking total. Please contact support.</p>}

              <p className="text-xs text-slate text-center">You won&apos;t be charged yet</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
