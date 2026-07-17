import type React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { trpc } from '@/providers/trpc'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, ChevronLeft, ChevronRight, Calendar, Clock, Bus,
  Shield, Users, Bed, Lock, Trophy, Star, MapPin,
  CreditCard, Lock as LockIcon, Share2, ShieldCheck,
  CheckCircle, Phone, Minus, Plus, ChevronUp, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

type RoomType = 'multi-share' | 'twin' | 'private'

interface BookingState {
  step: number
  checkIn: Date | null
  checkOut: Date | null
  adults: number
  children: number
  roomType: RoomType
  shuttle: boolean
  seasonPass: boolean
  guestNames: string[]
  termsAccepted: boolean
}

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                          */
/* ------------------------------------------------------------------ */

const PROPERTY = {
  id: 'kampala-central-hub',
  name: 'Kampala Central Hub',
  location: 'Namboole, Kampala, Uganda',
  pricePerNight: 45,
  shuttlePrice: 8,
  serviceFee: 28,
  taxRate: 0.18,
  image: '/property-kampala-1.jpg',
  rating: 4.7,
}

const SEASON_PASS = {
  duration: 30,
  nightlyPrice: 45,
  fullPrice: 1350,
  discountedPrice: 1080,
  savings: 270,
}

const ROOM_TYPES: { id: RoomType; icon: typeof Users; title: string; desc: string; price: string; badge?: string }[] = [
  { id: 'multi-share', icon: Users, title: 'Multi-Share', desc: '4-6 beds per room. Most affordable. Great for meeting other fans.', price: 'From $22/night per person' },
  { id: 'twin', icon: Bed, title: 'Twin Room', desc: '2 beds per room. Share with a friend or be paired with another fan.', price: 'From $35/night per person' },
  { id: 'private', icon: Lock, title: 'Private Room', desc: 'Your own room. Maximum privacy and comfort. Limited availability.', price: 'From $65/night', badge: 'Limited' },
]

const QUICK_DATES = [
  { label: 'Full Tournament', sub: 'Jun 15 \u2014 Jul 15', start: new Date(2027, 5, 15), end: new Date(2027, 6, 15) },
  { label: 'Group Stage', sub: 'Jun 15 \u2014 Jun 30', start: new Date(2027, 5, 15), end: new Date(2027, 5, 30) },
  { label: 'Knockout Stage', sub: 'Jul 1 \u2014 Jul 15', start: new Date(2027, 6, 1), end: new Date(2027, 6, 15) },
  { label: 'Opening Week', sub: 'Jun 15 \u2014 Jun 22', start: new Date(2027, 5, 15), end: new Date(2027, 5, 22) },
  { label: 'Finals Week', sub: 'Jul 8 \u2014 Jul 15', start: new Date(2027, 6, 8), end: new Date(2027, 6, 15) },
]

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

const stepVariants = {
  enter: (direction: number) => ({ y: direction > 0 ? 20 : -20, opacity: 0 }),
  center: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  exit: (direction: number) => ({ y: direction > 0 ? -20 : 20, opacity: 0, transition: { duration: 0.2 } }),
}

/* ------------------------------------------------------------------ */
/*  HELPER: DURATION IN DAYS                                           */
/* ------------------------------------------------------------------ */

function nightsBetween(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime()
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)))
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

/* ------------------------------------------------------------------ */
/*  PRICE CALCULATION                                                  */
/* ------------------------------------------------------------------ */

function usePriceSummary(state: BookingState) {
  return useMemo(() => {
    const nights = state.checkIn && state.checkOut ? nightsBetween(state.checkIn, state.checkOut) : 7
    const guests = state.adults + state.children

    let accommodation = 0
    if (state.seasonPass) {
      accommodation = SEASON_PASS.discountedPrice
    } else {
      const rate = state.roomType === 'multi-share' ? 22 : state.roomType === 'twin' ? 35 : 65
      accommodation = rate * guests * nights
    }

    const shuttle = state.shuttle && !state.seasonPass ? PROPERTY.shuttlePrice * state.adults * nights : 0
    const serviceFee = state.seasonPass ? 0 : PROPERTY.serviceFee
    const taxes = Math.round(accommodation * PROPERTY.taxRate)
    const total = accommodation + shuttle + serviceFee + taxes

    return { nights, guests, accommodation, shuttle, serviceFee, taxes, total }
  }, [state])
}

/* ------------------------------------------------------------------ */
/*  CALENDAR COMPONENT                                                 */
/* ------------------------------------------------------------------ */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function CalendarComponent({
  selectedStart, selectedEnd, onSelect
}: {
  selectedStart: Date | null
  selectedEnd: Date | null
  onSelect: (date: Date) => void
}) {
  const [baseYear, setBaseYear] = useState(2027)
  const [baseMonth, setBaseMonth] = useState(5) // June

  const prevMonth = () => {
    if (baseMonth === 0) { setBaseYear(y => y - 1); setBaseMonth(11) }
    else setBaseMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (baseMonth === 11) { setBaseYear(y => y + 1); setBaseMonth(0) }
    else setBaseMonth(m => m + 1)
  }

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

  const inRange = (d: Date) => {
    if (!selectedStart || !selectedEnd) return false
    return d > selectedStart && d < selectedEnd
  }

  const renderMonth = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const today = new Date()
    const cells: React.ReactElement[] = []

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} className="w-[44px] h-[44px]" />)
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const isStart = selectedStart && isSameDay(date, selectedStart)
      const isEnd = selectedEnd && isSameDay(date, selectedEnd)
      const isRange = inRange(date)
      const isToday = isSameDay(date, today)
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate())

      cells.push(
        <button
          key={d}
          disabled={isPast}
          onClick={() => onSelect(date)}
          className={`w-[44px] h-[44px] rounded-lg text-sm font-medium transition-all relative
            ${isPast ? 'text-light-grey cursor-not-allowed' : 'text-charcoal hover:bg-cream'}
            ${isStart || isEnd ? 'bg-sunset text-white hover:bg-sunset' : ''}
            ${isRange ? 'bg-sunset/15 text-sunset' : ''}
            ${isToday && !isStart && !isEnd ? 'border border-sunset' : ''}
          `}
        >
          {d}
        </button>
      )
    }

    return (
      <div className="flex-1">
        <div className="text-center mb-3 font-display font-semibold text-deep-forest">
          {MONTHS[month]} {year}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map(d => <div key={d} className="w-[44px] h-8 flex items-center justify-center text-xs text-slate font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {cells}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-warm-sand transition-colors">
          <ChevronLeft size={20} className="text-deep-forest" />
        </button>
        <div className="flex gap-8 flex-1 justify-center">
          {renderMonth(baseYear, baseMonth)}
          <div className="hidden md:block">
            {renderMonth(baseMonth === 11 ? baseYear + 1 : baseYear, baseMonth === 11 ? 0 : baseMonth + 1)}
          </div>
        </div>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-warm-sand transition-colors">
          <ChevronRight size={20} className="text-deep-forest" />
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  PROGRESS INDICATOR                                                 */
/* ------------------------------------------------------------------ */

const STEPS = ['Dates', 'Guests', 'Add-ons', 'Review']

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/20 -z-0">
          <motion.div
            className="h-full bg-teal-depth"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (currentStep - 1) / 3 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            style={{ transformOrigin: 'left' }}
          />
        </div>

        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={label} className="flex flex-col items-center gap-2 z-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${isCompleted ? 'bg-teal-depth text-white' : ''}
                  ${isCurrent ? 'bg-sunset text-white shadow-[0_0_0_4px_rgba(255,107,53,0.2)]' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-white/15 text-white/50' : ''}
                `}
              >
                {isCompleted ? <Check size={18} /> : stepNum}
              </motion.div>
              <span className={`text-xs font-medium ${isCurrent ? 'text-white' : 'text-white/60'}`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  STEP 1: DATES                                                      */
/* ------------------------------------------------------------------ */

function StepDates({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  const handleDateSelect = (date: Date) => {
    if (!state.checkIn || (state.checkIn && state.checkOut)) {
      update({ checkIn: date, checkOut: null })
    } else if (date < state.checkIn) {
      update({ checkIn: date })
    } else {
      update({ checkOut: date })
    }
  }

  const canContinue = state.checkIn && state.checkOut
  const nights = state.checkIn && state.checkOut ? nightsBetween(state.checkIn, state.checkOut) : 0

  return (
    <motion.div custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-deep-forest mb-2">
        When Are You Staying?
      </h1>
      <p className="text-slate text-lg mb-8">
        Select your check-in and check-out dates for AFCON 2027.
      </p>

      {/* Quick Select Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {QUICK_DATES.map((q) => {
          const isActive = state.checkIn && state.checkOut &&
            isSameDayRef(state.checkIn, q.start) && isSameDayRef(state.checkOut, q.end)
          return (
            <button
              key={q.label}
              onClick={() => update({ checkIn: q.start, checkOut: q.end })}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all
                ${isActive
                  ? 'bg-sunset text-white border-sunset'
                  : 'border-light-grey text-deep-forest hover:border-sunset hover:text-sunset'
                }`}
            >
              {q.label} <span className="opacity-70">({q.sub})</span>
            </button>
          )
        })}
      </div>

      {/* Calendar */}
      <div className="bg-white border border-light-grey rounded-xl p-4 md:p-6 mb-6">
        <CalendarComponent
          selectedStart={state.checkIn}
          selectedEnd={state.checkOut}
          onSelect={handleDateSelect}
        />
      </div>

      {/* Selected Dates */}
      {state.checkIn && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 bg-warm-sand rounded-lg p-4 flex items-center gap-3">
            <Calendar size={20} className="text-sunset" />
            <div>
              <p className="text-xs text-slate uppercase tracking-wide">Check-in</p>
              <p className="font-display font-semibold text-deep-forest">{fmtDate(state.checkIn)}</p>
              <p className="text-xs text-slate">{fmtDay(state.checkIn)}</p>
            </div>
          </div>
          {state.checkOut && (
            <div className="flex-1 bg-warm-sand rounded-lg p-4 flex items-center gap-3">
              <Calendar size={20} className="text-sunset" />
              <div>
                <p className="text-xs text-slate uppercase tracking-wide">Check-out</p>
                <p className="font-display font-semibold text-deep-forest">{fmtDate(state.checkOut)}</p>
                <p className="text-xs text-slate">{fmtDay(state.checkOut)}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {nights > 0 && (
        <p className="font-display text-2xl font-bold text-deep-forest mb-6">{nights} nights</p>
      )}

      {/* Season Pass Prompt */}
      {nights >= 20 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warm-sand border border-savanna-gold rounded-xl p-5 mb-6"
        >
          <h4 className="font-display font-semibold text-savanna-gold mb-1">Season Pass Available</h4>
          <p className="text-slate text-sm mb-2">
            Book for the entire group stage and save up to 20%. Lock in your rate today.
          </p>
          <button className="text-sunset underline underline-offset-4 text-sm font-medium hover:text-deep-forest transition-colors">
            Explore Season Pass &rarr;
          </button>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button
          className="btn-primary"
          disabled={!canContinue}
          onClick={() => update({ step: 2 })}
        >
          Continue to Guests &rarr;
        </Button>
      </div>
    </motion.div>
  )
}

function isSameDayRef(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/* ------------------------------------------------------------------ */
/*  STEP 2: GUESTS                                                     */
/* ------------------------------------------------------------------ */

function StepGuests({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  const [showNames, setShowNames] = useState(false)

  return (
    <motion.div custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-deep-forest mb-2">Who&apos;s Staying?</h1>
      <p className="text-slate text-lg mb-8">Add guests and choose your room preference.</p>

      {/* Guest Counters */}
      <div className="space-y-6 mb-8">
        {/* Adults */}
        <div className="flex items-center justify-between p-4 bg-white border border-light-grey rounded-xl">
          <div>
            <h4 className="font-display font-semibold text-deep-forest">Adults</h4>
            <p className="text-sm text-slate">Ages 13+</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => update({ adults: Math.max(1, state.adults - 1) })}
              className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-warm-sand transition-colors disabled:opacity-30"
              disabled={state.adults <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="font-display font-semibold text-2xl text-deep-forest w-8 text-center">{state.adults}</span>
            <button
              onClick={() => update({ adults: Math.min(10, state.adults + 1) })}
              className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-warm-sand transition-colors disabled:opacity-30"
              disabled={state.adults >= 10}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between p-4 bg-white border border-light-grey rounded-xl">
          <div>
            <h4 className="font-display font-semibold text-deep-forest">Children</h4>
            <p className="text-sm text-slate">Ages 2-12</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => update({ children: Math.max(0, state.children - 1) })}
              className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-warm-sand transition-colors disabled:opacity-30"
              disabled={state.children <= 0}
            >
              <Minus size={16} />
            </button>
            <span className="font-display font-semibold text-2xl text-deep-forest w-8 text-center">{state.children}</span>
            <button
              onClick={() => update({ children: Math.min(6, state.children + 1) })}
              className="w-9 h-9 rounded-full border border-light-grey flex items-center justify-center hover:bg-warm-sand transition-colors disabled:opacity-30"
              disabled={state.children >= 6}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Room Type Selection */}
      <h3 className="font-display font-semibold text-deep-forest mb-4">Room Preference</h3>
      <div className="space-y-3 mb-8">
        {ROOM_TYPES.map((room) => {
          const Icon = room.icon
          const isSelected = state.roomType === room.id
          return (
            <button
              key={room.id}
              onClick={() => update({ roomType: room.id })}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all
                ${isSelected ? 'border-sunset bg-sunset/5 shadow-[0_0_12px_rgba(255,107,53,0.1)]' : 'border-light-grey hover:border-sunset/50'}
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-sunset text-white' : 'bg-warm-sand text-slate'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-display font-semibold text-deep-forest">{room.title}</h4>
                    {room.badge && (
                      <Badge className="bg-earth-red text-white text-[10px]">{room.badge}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate mb-1">{room.desc}</p>
                  <p className="text-sunset font-medium text-sm">{room.price}</p>
                </div>
                {isSelected && <Check size={20} className="text-sunset shrink-0" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Guest Names (optional) */}
      <button
        onClick={() => setShowNames(!showNames)}
        className="flex items-center gap-2 text-sunset underline underline-offset-4 text-sm font-medium hover:text-deep-forest transition-colors mb-4"
      >
        {showNames ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        Add guest names (optional)
      </button>

      <AnimatePresence>
        {showNames && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="space-y-3 p-4 bg-warm-sand rounded-xl">
              {Array.from({ length: state.adults }).map((_, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={`Guest ${i + 1} Full Name`}
                  className="w-full bg-white border border-light-grey rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-sunset focus:shadow-[0_0_0_3px_rgba(255,107,53,0.15)] transition-all"
                  value={state.guestNames[i] || ''}
                  onChange={(e) => {
                    const names = [...state.guestNames]
                    names[i] = e.target.value
                    update({ guestNames: names })
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => update({ step: 1 })} className="text-slate hover:text-deep-forest">
          &larr; Back to Dates
        </Button>
        <Button className="btn-primary" onClick={() => update({ step: 3 })}>
          Continue to Add-ons &rarr;
        </Button>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  STEP 3: ADD-ONS                                                    */
/* ------------------------------------------------------------------ */

function StepAddons({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <motion.div custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-deep-forest mb-2">Enhance Your Stay</h1>
      <p className="text-slate text-lg mb-8">Add shuttle service and explore our Season Pass option.</p>

      {/* Shuttle Card */}
      <div className={`bg-white border rounded-xl p-6 mb-6 transition-all ${state.shuttle ? 'border-teal-depth' : 'border-light-grey'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-teal-depth/10 flex items-center justify-center">
              <Bus size={24} className="text-teal-depth" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-deep-forest">Stadium Shuttle</h3>
              <p className="text-teal-depth font-semibold">+${PROPERTY.shuttlePrice} per person, per day</p>
            </div>
          </div>
          <Switch
            checked={state.shuttle}
            onCheckedChange={(v) => update({ shuttle: v })}
            className="data-[state=checked]:bg-teal-depth"
          />
        </div>

        <img src="/shuttle-route.jpg" alt="Shuttle route" className="w-full h-40 object-cover rounded-lg mb-4" />

        <div className="space-y-2">
          {[
            { icon: MapPin, text: 'Direct to Mandela National Stadium' },
            { icon: Clock, text: '~12 minutes travel time' },
            { icon: Calendar, text: 'Match day service: every 30 min from 3h before kickoff' },
            { icon: Bus, text: 'Return service for 2h after match' },
            { icon: Shield, text: 'Guaranteed seat with booking' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-sm text-slate">
              <Icon size={16} className="text-teal-depth shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Season Pass Card */}
      <div className={`rounded-xl p-6 mb-8 transition-all ${state.seasonPass ? 'border-2 border-savanna-gold bg-green-50' : 'border-2 border-savanna-gold bg-gradient-to-br from-warm-sand to-cream'}`}>
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-savanna-gold text-white text-[10px]">POPULAR</Badge>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={28} className="text-savanna-gold" />
          <h3 className="font-display font-semibold text-deep-forest text-xl">Season Pass</h3>
        </div>
        <p className="text-slate mb-4">
          Book this room for the entire AFCON group stage (June 15 &mdash; July 15, 2027).
          Never worry about switching rooms or rebooking.
        </p>

        <div className="space-y-2 mb-5">
          {[
            'Same room for all 30 nights',
            'Lock in today\'s rate &mdash; no price increases',
            'Priority shuttle access (guaranteed seat)',
            'Save up to 20% vs. nightly rate',
            'Free room cleaning service (weekly)',
            'Dedicated concierge support',
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2 text-sm text-slate">
              <Check size={16} className="text-savanna-gold shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: benefit }} />
            </div>
          ))}
        </div>

        <div className="bg-white/60 rounded-lg p-4 mb-5">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm text-slate line-through">
              ${SEASON_PASS.nightlyPrice} &times; {SEASON_PASS.duration} = ${SEASON_PASS.fullPrice}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-2xl font-bold text-deep-forest">${SEASON_PASS.discountedPrice}</span>
            <span className="text-sm text-slate">Season Pass</span>
          </div>
          <p className="font-display font-semibold text-savanna-gold">
            You save: ${SEASON_PASS.savings}
          </p>
        </div>

        <Button
          className={`w-full font-display font-bold transition-all ${state.seasonPass
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'btn-sunset-gradient animate-pulse-cta'
            }`}
          onClick={() => update({ seasonPass: !state.seasonPass })}
        >
          {state.seasonPass ? 'Season Pass Selected \u2713' : 'Select Season Pass'}
        </Button>
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={() => update({ step: 2 })} className="text-slate hover:text-deep-forest">
          &larr; Back to Guests
        </Button>
        <Button className="btn-primary" onClick={() => update({ step: 4 })}>
          Continue to Review &rarr;
        </Button>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  STEP 4: REVIEW                                                     */
/* ------------------------------------------------------------------ */

function StepReview({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  const prices = usePriceSummary(state)
  const roomLabel = ROOM_TYPES.find(r => r.id === state.roomType)?.title || 'Twin Room'

  return (
    <motion.div custom={1} variants={stepVariants} initial="enter" animate="center" exit="exit">
      <h1 className="font-display text-3xl md:text-4xl font-bold text-deep-forest mb-2">Review Your Booking</h1>
      <p className="text-slate text-lg mb-8">Double-check your details before confirming.</p>

      {/* Booking Summary Card */}
      <div className="bg-white border border-light-grey rounded-xl p-6 mb-6">
        {/* Property */}
        <div className="flex gap-4 mb-5">
          <img src={PROPERTY.image} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
          <div>
            <h3 className="font-display font-semibold text-deep-forest">{PROPERTY.name}</h3>
            <p className="text-sm text-slate flex items-center gap-1">
              <MapPin size={14} /> {PROPERTY.location}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={14} className="text-savanna-gold fill-savanna-gold" />
              <span className="text-sm text-savanna-gold font-medium">{PROPERTY.rating}</span>
            </div>
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Details */}
        <div className="space-y-3 mb-5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate">Dates</p>
              <p className="text-deep-forest">
                {state.checkIn ? fmtDate(state.checkIn) : 'Jun 15'} &mdash; {state.checkOut ? fmtDate(state.checkOut) : 'Jul 2'} ({prices.nights} nights)
              </p>
            </div>
            <button onClick={() => update({ step: 1 })} className="text-sunset text-sm underline underline-offset-4">Edit</button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate">Guests</p>
              <p className="text-deep-forest">{state.adults} Adults{state.children > 0 ? `, ${state.children} Children` : ''}</p>
            </div>
            <button onClick={() => update({ step: 2 })} className="text-sunset text-sm underline underline-offset-4">Edit</button>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate">Room</p>
              <p className="text-deep-forest">{roomLabel}</p>
            </div>
            <button onClick={() => update({ step: 2 })} className="text-sunset text-sm underline underline-offset-4">Edit</button>
          </div>
        </div>

        <Separator className="mb-5" />

        {/* Add-ons */}
        <div className="space-y-2 mb-5">
          {state.seasonPass ? (
            <div className="flex justify-between text-sm">
              <span className="text-slate">Season Pass (30 nights)</span>
              <span className="text-deep-forest font-medium">${SEASON_PASS.discountedPrice}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-slate">Accommodation ({prices.nights} nights)</span>
                <span className="text-deep-forest">${prices.accommodation}</span>
              </div>
              {state.shuttle && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Stadium Shuttle &mdash; ${PROPERTY.shuttlePrice} &times; {state.adults} guests &times; {prices.nights} days</span>
                  <span className="text-deep-forest">${prices.shuttle}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate">Service fee</span>
                <span className="text-deep-forest">${prices.serviceFee}</span>
              </div>
            </>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate">Taxes (VAT 18%)</span>
            <span className="text-deep-forest">${prices.taxes}</span>
          </div>
        </div>

        <Separator className="mb-5" />

        <div className="flex justify-between items-center mb-4">
          <span className="font-display font-bold text-deep-forest text-lg">Total</span>
          <span className="font-display text-price-display text-deep-forest">${prices.total}</span>
        </div>
        <p className="text-xs text-slate text-center">Price in USD. Charged in UGX at current rate.</p>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-[#F0FAF8] rounded-lg p-4 mb-6">
        <p className="text-teal-depth text-sm font-medium mb-1">Free cancellation until June 1, 2027</p>
        <p className="text-slate text-xs">
          After June 1, 50% refund until June 8. No refund after June 8.
        </p>
      </div>

      {/* Terms */}
      <div className="flex items-start gap-3 mb-6">
        <Checkbox
          id="terms"
          checked={state.termsAccepted}
          onCheckedChange={(v) => update({ termsAccepted: v as boolean })}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-slate leading-relaxed cursor-pointer">
          I agree to the{' '}
          <button className="text-sunset underline underline-offset-4">Booking Terms</button>,{' '}
          <button className="text-sunset underline underline-offset-4">Cancellation Policy</button>, and{' '}
          <button className="text-sunset underline underline-offset-4">House Rules</button>
        </label>
      </div>

      {/* CTA */}
      <Button
        className="w-full btn-sunset-gradient animate-pulse-cta text-lg py-5 mb-3"
        disabled={!state.termsAccepted || createBooking.isPending}
        onClick={() => {
          createBooking.mutate({
            propertyId: parseInt(id || '0'),
            userId: 1,
            checkIn: state.checkIn?.toISOString().split('T')[0] || '',
            checkOut: state.checkOut?.toISOString().split('T')[0] || '',
            adults: state.adults,
            children: state.children,
            roomType: state.roomType === 'multi-share' ? 'multi_share' : state.roomType,
            totalPrice: Math.round(parseFloat(prices.total) * 1000) || 50000,
            addShuttle: state.shuttle ? 1 : 0,
            seasonPass: state.seasonPass ? 1 : 0,
          })
        }}
      >
        <LockIcon size={18} className="mr-2" />
        {createBooking.isPending ? 'Processing...' : 'Confirm & Pay'}
      </Button>
      <p className="text-xs text-slate text-center mb-2">You will be charged ${prices.total}</p>
      <div className="flex items-center justify-center gap-1 text-xs text-slate">
        <LockIcon size={12} />
        <span>Secure SSL Encryption</span>
      </div>

      {/* Alternative Payment */}
      <div className="mt-6 space-y-3">
        <Button variant="outline" className="w-full btn-secondary">
          <CreditCard size={16} className="mr-2" />
          Pay in installments with Flutterwave
        </Button>
        <button className="w-full text-center text-sm text-teal-depth underline underline-offset-4 hover:text-deep-forest transition-colors">
          Corporate/Group? Request invoice &rarr;
        </button>
      </div>

      <div className="flex justify-start mt-6">
        <Button variant="ghost" onClick={() => update({ step: 3 })} className="text-slate hover:text-deep-forest">
          &larr; Back to Add-ons
        </Button>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  BOOKING SUMMARY SIDEBAR                                            */
/* ------------------------------------------------------------------ */

function BookingSummarySidebar({ state }: { state: BookingState }) {
  const prices = usePriceSummary(state)
  const roomLabel = ROOM_TYPES.find(r => r.id === state.roomType)?.title || 'Twin Room'

  return (
    <div className="bg-white border border-light-grey rounded-xl p-6 shadow-card sticky top-[120px]">
      <div className="flex gap-3 mb-4">
        <img src={PROPERTY.image} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
        <div>
          <h4 className="font-display font-semibold text-deep-forest text-sm">{PROPERTY.name}</h4>
          <p className="text-xs text-slate">{PROPERTY.location}</p>
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-slate">Dates</span>
          <span className="text-deep-forest">
            {state.checkIn ? fmtDate(state.checkIn) : 'Jun 15'} &mdash; {state.checkOut ? fmtDate(state.checkOut) : 'Jul 2'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Guests</span>
          <span className="text-deep-forest">{state.adults + state.children}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Room</span>
          <span className="text-deep-forest">{roomLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Shuttle</span>
          <span className={state.shuttle ? 'text-teal-depth' : 'text-slate'}>{state.shuttle ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate">Season Pass</span>
          <span className={state.seasonPass ? 'text-savanna-gold' : 'text-slate'}>{state.seasonPass ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="flex justify-between items-center mb-4">
        <span className="font-display font-bold text-deep-forest">Total</span>
        <motion.span
          key={prices.total}
          initial={{ scale: 1.1, color: '#FF6B35' }}
          animate={{ scale: 1, color: '#1B4332' }}
          className="font-display text-price-display"
        >
          ${prices.total}
        </motion.span>
      </div>

      <Badge className="bg-teal-depth/10 text-teal-depth hover:bg-teal-depth/20 text-xs w-full justify-center py-1.5">
        <CheckCircle size={12} className="mr-1" /> Free cancellation
      </Badge>

      {/* Urgency elements */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-1.5 text-xs text-slate">
          <Users size={12} />
          <span>3 people booked this property today</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-earth-red animate-pulse">
          <Clock size={12} />
          <span>Only 5 rooms left for these dates</span>
        </div>
        <UrgencyTimer />
      </div>
    </div>
  )
}

function UrgencyTimer() {
  const [time, setTime] = useState({ h: 14, m: 32, s: 8 })

  useEffect(() => {
    const iv = setInterval(() => {
      setTime(prev => {
        let { h, m, s } = prev
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 text-xs text-sunset">
      <Clock size={12} />
      <span>Prices may increase in: {pad(time.h)}:{pad(time.m)}:{pad(time.s)}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  CONFIRMATION SCREEN                                                */
/* ------------------------------------------------------------------ */

function BookingConfirmation() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[80dvh] flex items-center justify-center py-16"
    >
      <div className="max-w-lg mx-auto text-center px-6">
        {/* Checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          className="w-[120px] h-[120px] bg-green-600 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Check size={60} className="text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-display-lg text-deep-forest mb-3"
        >
          Booking Confirmed!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-slate text-lg mb-6"
        >
          Your AFCON 2027 accommodation is secured.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white border border-light-grey rounded-lg px-6 py-3 inline-block mb-8"
        >
          <span className="font-mono text-h3 text-deep-forest font-bold">KIT-2027-78432</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white border border-light-grey rounded-xl p-6 text-left mb-8"
        >
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate">Property</span>
              <span className="text-deep-forest font-medium">{PROPERTY.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Dates</span>
              <span className="text-deep-forest">Jun 15 &mdash; Jul 2, 2027</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Guests</span>
              <span className="text-deep-forest">2 Adults</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Total Paid</span>
              <span className="font-display font-bold text-deep-forest">$434</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-left mb-8"
        >
          <h3 className="font-display font-semibold text-deep-forest mb-3 text-center">Next Steps</h3>
          <div className="space-y-3">
            {[
              'Check your email for confirmation details',
              'Download the Kitufu app for check-in',
              'Add your shuttle schedule to your calendar',
              'Join the Kampala Central Hub fan group',
            ].map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm text-slate">
                <CheckCircle size={16} className="text-teal-depth shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <Link to="/dashboard">
            <Button className="w-full btn-sunset-gradient">View My Bookings</Button>
          </Link>
          <Button variant="outline" className="w-full btn-secondary">Download Receipt</Button>
          <button className="flex items-center justify-center gap-2 w-full text-sm text-slate hover:text-deep-forest transition-colors py-2">
            <Share2 size={16} />
            Share With Friends
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-8 text-sm text-teal-depth"
        >
          Need help? Contact us on WhatsApp: +256 700 000 000
        </motion.p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  TRUST SECTION                                                      */
/* ------------------------------------------------------------------ */

function TrustSection() {
  const items = [
    { icon: ShieldCheck, title: 'UTB Certified', desc: 'All Kitufu Residences are certified by Uganda Tourism Board as Temporary Tourism Accommodation.' },
    { icon: LockIcon, title: 'Secure Payment', desc: 'Your payment is processed securely with bank-level SSL encryption.' },
    { icon: CheckCircle, title: 'Free Cancellation', desc: 'Cancel for free up to 48 hours before check-in. Full refund, no questions asked.' },
    { icon: Phone, title: '24/7 Support', desc: 'Our team is available around the clock during AFCON 2027. WhatsApp, phone, or email.' },
  ]

  return (
    <section className="bg-warm-sand py-12">
      <div className="container-kitufu">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-depth/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={24} className="text-teal-depth" />
              </div>
              <h4 className="font-medium text-deep-forest text-sm mb-1">{title}</h4>
              <p className="text-xs text-slate">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function Booking() {
  const { id } = useParams<{ id: string }>()
  void id

  const [state, setState] = useState<BookingState>({
    step: 1,
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    roomType: 'twin',
    shuttle: true,
    seasonPass: false,
    guestNames: [],
    termsAccepted: false,
  })

  const navigate = useNavigate()

  const createBooking = trpc.booking.create.useMutation({
    onSuccess: (data) => {
      navigate('/payment?ref=' + data.bookingRef)
    },
  })

  const update = (partial: Partial<BookingState>) => setState(s => ({ ...s, ...partial }))

  // After booking creation, redirect to payment
  // (handled by createBooking onSuccess, but safety fallback here)
  if (state.step === 5) {
    return (
      <div className="min-h-[100dvh] bg-deep-forest flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-2">Booking created!</p>
          <p className="text-gray-400 text-sm mb-4">Redirecting to payment...</p>
          <button onClick={() => window.location.reload()} className="text-savanna-gold hover:underline text-sm">
            Click here if not redirected
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh]">
      {/* Section 1: Booking Header */}
      <section className="bg-deep-forest pt-6 pb-8">
        <div className="container-kitufu">
          <ProgressIndicator currentStep={state.step} />

          {/* Mini Property Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4 mt-6 max-w-[800px] mx-auto"
          >
            <img src={PROPERTY.image} alt="" className="w-[60px] h-[60px] rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{PROPERTY.name}</p>
              <p className="text-white/60 text-xs">{PROPERTY.location}</p>
            </div>
            <Link to={`/property/${PROPERTY.id}`} className="text-savanna-gold text-xs hover:underline underline-offset-4 shrink-0">
              Change
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section 2: Step Wizard + Summary */}
      <section className="py-12 pb-20">
        <div className="container-kitufu">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-[5%]">
            {/* Left: Step Form */}
            <div className="lg:w-[55%]">
              <AnimatePresence mode="wait" custom={1}>
                {state.step === 1 && <StepDates key="dates" state={state} update={update} />}
                {state.step === 2 && <StepGuests key="guests" state={state} update={update} />}
                {state.step === 3 && <StepAddons key="addons" state={state} update={update} />}
                {state.step === 4 && <StepReview key="review" state={state} update={update} />}
              </AnimatePresence>
            </div>

            {/* Right: Booking Summary */}
            <div className="lg:w-[40%] hidden lg:block">
              <BookingSummarySidebar state={state} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Trust */}
      <TrustSection />
    </div>
  )
}
