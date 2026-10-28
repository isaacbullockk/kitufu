import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import {
  Users, Bed, Lock, Minus, Plus, MapPin,
  Phone, Mail, User, Check, ChevronLeft, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getCountryByCode } from '@/config/countries'
import {
  calculateBookingQuote,
  getBookingCurrency,
  getStayNights,
  MAX_STAY_NIGHTS,
} from '@contracts/booking-pricing'

type RoomType = 'multi_share' | 'twin' | 'private'

const ROOM_TYPES: { id: RoomType; icon: typeof Users; title: string; desc: string }[] = [
  { id: 'multi_share', icon: Users, title: 'Multi-Share', desc: '4-6 beds per room' },
  { id: 'twin', icon: Bed, title: 'Twin Room', desc: '2 beds per room' },
  { id: 'private', icon: Lock, title: 'Private Room', desc: 'Your own room' },
]

export default function Booking() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const bookingForm = (location.state as { bookingForm?: {
    checkIn?: string
    checkOut?: string
    adults?: number
    children?: number
    roomType?: RoomType
    contactName?: string
    contactPhone?: string
    contactEmail?: string
    termsAccepted?: boolean
  } } | null)?.bookingForm

  const { data: property } = trpc.property.byId.useQuery(
    { id: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) }
  )

  const [checkIn, setCheckIn] = useState(bookingForm?.checkIn ?? '')
  const [checkOut, setCheckOut] = useState(bookingForm?.checkOut ?? '')
  const [adults, setAdults] = useState(bookingForm?.adults ?? 1)
  const [children, setChildren] = useState(bookingForm?.children ?? 0)
  const [roomType, setRoomType] = useState<RoomType>(bookingForm?.roomType ?? 'twin')
  const [contactName, setContactName] = useState(bookingForm?.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(bookingForm?.contactPhone ?? '')
  const [contactEmail, setContactEmail] = useState(bookingForm?.contactEmail ?? '')
  const [termsAccepted, setTermsAccepted] = useState(bookingForm?.termsAccepted ?? false)

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      navigate('/payment?ref=' + data.bookingRef)
    },
  })

  const nights = useMemo(() => getStayNights(checkIn, checkOut), [checkIn, checkOut])
  const quote = property && nights > 0 && nights <= MAX_STAY_NIGHTS
    ? calculateBookingQuote(
        property.pricePerNight,
        nights,
        roomType,
        getBookingCurrency(property.countryCode) || "UGX",
      )
    : null
  const today = new Date().toISOString().slice(0, 10)
  const guestLimit = Math.min(property?.capacity ?? 20, 20)

  const handleSubmit = () => {
    if (!checkIn || !checkOut || !termsAccepted || !property || !quote) return
    if (!user) {
      navigate('/login?returnTo=' + encodeURIComponent(location.pathname + location.search), {
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
      propertyId: property.id,
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

  const propertyImage = property?.images ? (() => { try { return JSON.parse(property.images)[0] } catch { return '/property-kampala-1.jpg' } })() : '/property-kampala-1.jpg'

  const country = property ? getCountryByCode(property.countryCode || "UG") : null
  const currencySymbol = country?.currency.symbol || "USh"
  return (
    <div className="min-h-[100dvh] bg-white">
      {/* Header */}
      <section className="bg-deep-forest pt-6 pb-8">
        <div className="container-kitufu">
          <Link to={`/property/${id}`} className="inline-flex items-center gap-1 text-savanna-gold text-sm hover:underline mb-4">
            <ChevronLeft size={16} /> Back to property
          </Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white">Complete Your Booking</h1>
        </div>
      </section>

      {/* Form + Summary */}
      <section className="py-10 pb-20">
        <div className="container-kitufu">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-[5%]">
            {/* Left: Form */}
            <div className="lg:w-[55%] space-y-8">
              {/* Property Summary */}
              {property && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 items-center"
                >
                  <img src={propertyImage} alt={property.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div>
                    <h2 className="font-display font-bold text-deep-forest">{property.title}</h2>
                    <p className="text-slate text-sm flex items-center gap-1">
                      <MapPin size={14} /> {property.location}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Dates */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h3 className="font-display font-bold text-deep-forest text-xl mb-4">When are you staying?</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate font-medium uppercase tracking-wide mb-1.5 block">Check-in</label>
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => {
                        const nextCheckIn = e.target.value
                        setCheckIn(nextCheckIn)
                        if (checkOut && nextCheckIn >= checkOut) setCheckOut('')
                      }}
                      className="w-full border border-light-grey rounded-lg px-4 py-3 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate font-medium uppercase tracking-wide mb-1.5 block">Check-out</label>
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-light-grey rounded-lg px-4 py-3 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                </div>
                {nights > 0 && (
                  <p className="text-sm text-sunset font-medium mt-2">{nights} nights</p>
                )}
                {checkIn && checkOut && nights === 0 && (
                  <p role="alert" className="text-sm text-red-600 mt-2">Check-out must be a valid date after check-in.</p>
                )}
                {nights > MAX_STAY_NIGHTS && (
                  <p role="alert" className="text-sm text-red-600 mt-2">Stays are limited to {MAX_STAY_NIGHTS} nights.</p>
                )}
              </motion.div>

              {/* Guests */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h3 className="font-display font-bold text-deep-forest text-xl mb-4">Who&apos;s staying?</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-warm-sand rounded-xl">
                    <div>
                      <p className="font-medium text-deep-forest">Adults</p>
                      <p className="text-xs text-slate">Ages 13+</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setAdults(Math.max(1, adults - 1))} disabled={adults <= 1} className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30">
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-deep-forest w-6 text-center">{adults}</span>
                      <button onClick={() => setAdults(Math.min(guestLimit, adults + 1))} disabled={adults + children >= guestLimit} className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-warm-sand rounded-xl">
                    <div>
                      <p className="font-medium text-deep-forest">Children</p>
                      <p className="text-xs text-slate">Ages 2-12</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setChildren(Math.max(0, children - 1))} disabled={children <= 0} className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30">
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold text-deep-forest w-6 text-center">{children}</span>
                      <button onClick={() => setChildren(Math.max(0, Math.min(10, guestLimit - adults, children + 1)))} disabled={children >= 10 || adults + children >= guestLimit} className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                {property && adults + children > property.capacity && (
                  <p role="alert" className="text-sm text-red-600 mt-2">This stay allows up to {property.capacity} guests.</p>
                )}
              </motion.div>

              {/* Room Type */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 className="font-display font-bold text-deep-forest text-xl mb-4">Room preference</h3>
                <div className="space-y-3">
                  {ROOM_TYPES.map((room) => {
                    const Icon = room.icon
                    const isSelected = roomType === room.id
                    return (
                      <button
                        key={room.id}
                        onClick={() => setRoomType(room.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected ? 'border-sunset bg-sunset/5' : 'border-light-grey hover:border-sunset/50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-sunset text-white' : 'bg-warm-sand text-slate'}`}>
                            <Icon size={20} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-deep-forest">{room.title}</h4>
                            <p className="text-sm text-slate">{room.desc}</p>
                          </div>
                          {isSelected && <Check size={20} className="text-sunset shrink-0" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h3 className="font-display font-bold text-deep-forest text-xl mb-4">Contact information</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input type="text" placeholder="Full Name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full border border-light-grey rounded-lg pl-10 pr-4 py-3 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all" />
                  </div>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input type="tel" placeholder="Phone Number" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full border border-light-grey rounded-lg pl-10 pr-4 py-3 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all" />
                  </div>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input type="email" placeholder="Email Address" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full border border-light-grey rounded-lg pl-10 pr-4 py-3 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all" />
                  </div>
                </div>
              </motion.div>

              {/* Terms */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-light-grey text-sunset focus:ring-sunset" />
                  <span className="text-sm text-slate leading-relaxed">
                    I agree to the <span className="text-sunset underline underline-offset-4">Booking Terms</span>, <span className="text-sunset underline underline-offset-4">Cancellation Policy</span>, and <span className="text-sunset underline underline-offset-4">House Rules</span>
                  </span>
                </label>
              </motion.div>
            </div>

            {/* Right: Summary */}
            <div className="lg:w-[40%]">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border border-light-grey rounded-xl p-6 shadow-card sticky top-[120px]"
              >
                {property && (
                  <div className="flex gap-3 mb-4">
                    <img src={propertyImage} alt={property.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div>
                      <h4 className="font-display font-semibold text-deep-forest text-sm">{property.title}</h4>
                      <p className="text-xs text-slate">{property.location}</p>
                    </div>
                  </div>
                )}

                <Separator className="mb-4" />

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate">Dates</span>
                    <span className="text-deep-forest">{checkIn || '—'} → {checkOut || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate">Guests</span>
                    <span className="text-deep-forest">{adults} adults{children > 0 ? `, ${children} children` : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate">Room</span>
                    <span className="text-deep-forest">{ROOM_TYPES.find(r => r.id === roomType)?.title}</span>
                  </div>
                </div>

                <Separator className="mb-4" />

                {nights > 0 && nights <= MAX_STAY_NIGHTS && quote && (
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate">{currencySymbol} {quote.perNight.toLocaleString()} × {nights} nights</span>
                      <span className="text-deep-forest">{currencySymbol} {quote.subtotal.toLocaleString()}</span>
                    </div>
                    {quote.serviceFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate">Service fee</span>
                        <span className="text-deep-forest">{currencySymbol} {quote.serviceFee.toLocaleString()}</span>
                      </div>
                    )}
                    {quote.tax > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate">Taxes (18%)</span>
                        <span className="text-deep-forest">{currencySymbol} {quote.tax.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}

                <Separator className="mb-4" />

                <div className="flex justify-between items-center mb-4">
                  <span className="font-display font-bold text-deep-forest text-lg">Total</span>
                  <span className="font-display text-price-display text-deep-forest">{currencySymbol} {(quote?.total ?? 0).toLocaleString()}</span>
                </div>
                {property?.currencyCode !== "UGX" && (
                  <p className="text-xs text-slate mb-4">
                    This quote is in {property?.currencyCode}. Kitufu does not add a local tax or service fee to this amount.
                  </p>
                )}

                <Button
                  className="w-full btn-sunset-gradient py-4 text-base mb-3"
                  disabled={!checkIn || !checkOut || !termsAccepted || createBooking.isPending || !contactName || !contactPhone || !property || !quote || adults + children > property.capacity}
                  onClick={handleSubmit}
                >
                  {createBooking.isPending ? 'Processing...' : 'Confirm & Pay'}
                </Button>
                {createBooking.error && <p role="alert" className="text-sm text-red-600 mb-3">{createBooking.error.message}</p>}
                {quote === null && nights > 0 && nights <= MAX_STAY_NIGHTS && property && <p role="alert" className="text-sm text-red-600 mb-3">We can&apos;t calculate this booking total. Please contact support.</p>}
                <p className="text-xs text-slate text-center mb-4">You won&apos;t be charged yet</p>

                <div className="flex justify-center gap-4 text-xs text-slate">
                  <div className="flex items-center gap-1">
                    <Shield size={12} className="text-teal-depth" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check size={12} className="text-teal-depth" />
                    <span>Free Cancellation</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
