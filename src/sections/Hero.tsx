import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Search, MapPin, Calendar, Users, ChevronDown } from 'lucide-react'

/* ─── Countdown Timer ─── */
function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const target = new Date('2027-06-15T00:00:00').getTime()
    const update = () => {
      const now = Date.now()
      const diff = Math.max(0, target - now)
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const boxes = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Minutes' },
    { value: timeLeft.seconds, label: 'Seconds' },
  ]

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <span className="text-white/70 text-sm font-body mr-1 hidden sm:inline">Kickoff in</span>
      {boxes.map((box) => (
        <div
          key={box.label}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 text-center min-w-[56px] sm:min-w-[68px]"
        >
          <div className="font-display font-bold text-xl sm:text-[28px] text-white leading-none">
            {String(box.value).padStart(2, '0')}
          </div>
          <div className="text-white/60 text-[10px] sm:text-xs font-body mt-1">{box.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── Search Bar ─── */
const locations = [
  { label: 'Kampala', sub: 'Mandela Stadium', value: 'kampala' },
  { label: 'Hoima', sub: 'Hoima Stadium', value: 'hoima' },
  { label: 'All Uganda', sub: 'Both host cities', value: 'all' },
]

function SearchBar() {
  const navigate = useNavigate()
  const [locOpen, setLocOpen] = useState(false)
  const [guestsOpen, setGuestsOpen] = useState(false)
  const [selectedLoc, setSelectedLoc] = useState(locations[0])
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const locRef = useRef<HTMLDivElement>(null)
  const guestsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (locRef.current && !locRef.current.contains(e.target as Node)) setLocOpen(false)
      if (guestsRef.current && !guestsRef.current.contains(e.target as Node)) setGuestsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = () => {
    navigate('/listings')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.0, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
      className="bg-white rounded-xl shadow-search p-2 w-full max-w-4xl"
    >
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Location */}
        <div ref={locRef} className="relative flex-1">
          <button
            onClick={() => setLocOpen(!locOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:border-sunset/30 hover:bg-warm-sand transition-all text-left"
          >
            <MapPin size={18} className="text-sunset shrink-0" />
            <div>
              <div className="text-xs text-slate font-body">Location</div>
              <div className="text-sm font-body font-medium text-charcoal">
                {selectedLoc.label} <span className="text-slate font-normal">({selectedLoc.sub})</span>
              </div>
            </div>
            <ChevronDown size={14} className="text-slate ml-auto" />
          </button>
          {locOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-card-hover border border-light-grey z-30 py-2">
              {locations.map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => { setSelectedLoc(loc); setLocOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-warm-sand transition-colors text-left"
                >
                  <MapPin size={16} className="text-sunset" />
                  <div>
                    <div className="text-sm font-body font-medium text-charcoal">{loc.label}</div>
                    <div className="text-xs text-slate">{loc.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Range (Static display) */}
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:border-sunset/30 hover:bg-warm-sand transition-all">
          <Calendar size={18} className="text-sunset shrink-0" />
          <div>
            <div className="text-xs text-slate font-body">Dates</div>
            <div className="text-sm font-body font-medium text-charcoal">Jun 15 — Jul 15, 2027</div>
          </div>
        </div>

        {/* Guests */}
        <div ref={guestsRef} className="relative flex-1">
          <button
            onClick={() => setGuestsOpen(!guestsOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:border-sunset/30 hover:bg-warm-sand transition-all text-left"
          >
            <Users size={18} className="text-sunset shrink-0" />
            <div>
              <div className="text-xs text-slate font-body">Guests</div>
              <div className="text-sm font-body font-medium text-charcoal">
                {adults} adult{adults !== 1 ? 's' : ''}{children > 0 ? `, ${children} child${children !== 1 ? 'ren' : ''}` : ''}
              </div>
            </div>
            <ChevronDown size={14} className="text-slate ml-auto" />
          </button>
          {guestsOpen && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-card-hover border border-light-grey z-30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-body text-charcoal">Adults</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center text-slate hover:border-sunset hover:text-sunset transition-colors">-</button>
                  <span className="text-sm font-body font-medium w-4 text-center">{adults}</span>
                  <button onClick={() => setAdults(Math.min(10, adults + 1))} className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center text-slate hover:border-sunset hover:text-sunset transition-colors">+</button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-body text-charcoal">Children</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center text-slate hover:border-sunset hover:text-sunset transition-colors">-</button>
                  <span className="text-sm font-body font-medium w-4 text-center">{children}</span>
                  <button onClick={() => setChildren(Math.min(6, children + 1))} className="w-8 h-8 rounded-full border border-light-grey flex items-center justify-center text-slate hover:border-sunset hover:text-sunset transition-colors">+</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="btn-primary flex items-center justify-center gap-2 lg:w-auto w-full"
        >
          <Search size={18} />
          <span className="hidden sm:inline">Search Residences</span>
          <span className="sm:hidden">Search</span>
        </button>
      </div>
    </motion.div>
  )
}

/* ─── Hero Section ─── */
export default function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden -mt-16">
      {/* Background Image */}
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/hero-bg.jpg"
          alt="Kampala at golden hour"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Gradient Overlay */}
      <div className="hero-gradient-overlay absolute inset-0 z-[1]" />

      {/* Animated grain overlay */}
      <div
        className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="container-kitufu relative z-10 pt-24 pb-16">
        <div className="max-w-[700px]">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="mb-4"
          >
            <span className="text-kampala-sky text-xs font-body font-medium tracking-[0.15em] uppercase">
              AFCON 2027 &bull; UGANDA
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="font-display font-bold text-display-xl text-white mb-6"
            style={{ textShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
          >
            Your Home for
            <br />
            AFCON 2027
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="text-white/90 text-body-large font-body leading-relaxed max-w-[550px] mb-8"
          >
            Pop-up fan residences in Kampala & Hoima. Secure, affordable, and minutes from the stadium. Book your spot for the biggest football tournament in Africa.
          </motion.p>

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
            className="mb-10"
          >
            <CountdownTimer />
          </motion.div>

          {/* Search Bar */}
          <SearchBar />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-6 flex items-center justify-center"
        >
          <ChevronDown size={24} className="text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  )
}
