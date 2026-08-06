import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { motion } from 'framer-motion'
import {
  Calendar, Users, Bed, Lock, Minus, Plus, MapPin, Star,
  CreditCard, Phone, Mail, User, Check, ChevronLeft, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

type RoomType = 'multi_share' | 'twin' | 'private'

const ROOM_TYPES: { id: RoomType; icon: typeof Users; title: string; desc: string; priceFactor: number }[] = [
  { id: 'multi_share', icon: Users, title: 'Multi-Share', desc: '4-6 beds per room', priceFactor: 0.5 },
  { id: 'twin', icon: Bed, title: 'Twin Room', desc: '2 beds per room', priceFactor: 0.78 },
  { id: 'private', icon: Lock, title: 'Private Room', desc: 'Your own room', priceFactor: 1.44 },
]

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 0
  const ms = new Date(b).getTime() - new Date(a).getTime()
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

export default function Booking() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: property } = trpc.property.byId.useQuery(
    { id: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) }
  )

  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [roomType, setRoomType] = useState<RoomType>('twin')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile'>('card')
  const [termsAccepted, setTermsAccepted] = useState(false)

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      navigate('/payment?ref=' + data.bookingRef)
    },
  })

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut])
  const roomInfo = ROOM_TYPES.find(r => r.id === roomType) || ROOM_TYPES[1]
  const pricePerNight = property ? Math.round(property.pricePerNight * roomInfo.priceFactor) : 0
  const subtotal = pricePerNight * nights
  const serviceFee = property ? 28 : 0
  const taxes = Math.round(subtotal * 0.18)
  const total = subtotal + serviceFee + taxes

  const handleSubmit = () => {
    if (!checkIn || !checkOut || !termsAccepted || !property) return
    createBooking.mutate({
      propertyId: property.id,
      userId: 1,
      checkIn,
      checkOut,
      adults,
      children,
      roomType,
      totalPrice: total,
      addShuttle: 0,
      seasonPass: 0,
    })
  }

  const propertyImage = property?.images ? (() => { try { return JSON.parse(property.images)[0] } catch { return '/property-kampala-1.jpg' } })() : '/property-kampala-1.jpg'

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
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full border border-light-grey rounded-lg px-4 py-3 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate font-medium uppercase tracking-wide mb-1.5 block">Check-out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full border border-light-grey rounded-lg px-4 py-3 text-sm text-deep-forest focus:outline-none focus:border-sunset focus:ring-2 focus:ring-sunset/20 transition-all"
                    />
                  </div>
                </div>
                {nights > 0 && (
                  <p className="text-sm text-sunset font-medium mt-2">{nights} nights</p>
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
                      <button onClick={() => setAdults(Math.min(20, adults + 1))} disabled={adults >= 20} className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30">
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
                      <button onClick={() => setChildren(Math.min(10, children + 1))} disabled={children >= 10} className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
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

              {/* Payment Method */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 className="font-display font-bold text-deep-forest text-xl mb-4">Payment method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setPaymentMethod('card')} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-sunset bg-sunset/5 text-deep-forest' : 'border-light-grey text-slate hover:border-sunset/50'}`}>
                    <CreditCard size={18} />
                    <span className="font-medium">Card</span>
                  </button>
                  <button onClick={() => setPaymentMethod('mobile')} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'mobile' ? 'border-sunset bg-sunset/5 text-deep-forest' : 'border-light-grey text-slate hover:border-sunset/50'}`}>
                    <Phone size={18} />
                    <span className="font-medium">Mobile Money</span>
                  </button>
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

                {nights > 0 && (
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate">USh {pricePerNight.toLocaleString()} × {nights} nights</span>
                      <span className="text-deep-forest">USh {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate">Service fee</span>
                      <span className="text-deep-forest">USh {serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate">Taxes (18%)</span>
                      <span className="text-deep-forest">USh {taxes.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <Separator className="mb-4" />

                <div className="flex justify-between items-center mb-4">
                  <span className="font-display font-bold text-deep-forest text-lg">Total</span>
                  <span className="font-display text-price-display text-deep-forest">USh {total.toLocaleString()}</span>
                </div>

                <Button
                  className="w-full btn-sunset-gradient py-4 text-base mb-3"
                  disabled={!checkIn || !checkOut || !termsAccepted || createBooking.isPending || !contactName || !contactPhone || !property}
                  onClick={handleSubmit}
                >
                  {createBooking.isPending ? 'Processing...' : 'Confirm & Pay'}
                </Button>
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
