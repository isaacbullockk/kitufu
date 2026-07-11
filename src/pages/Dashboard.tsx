import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Moon,
  Bus,
  Trophy,
  Clock,
  Receipt,
  User,
  MapPin,
  Users,
  Bed,
  Check,
  X,
  Phone,
  Edit3,
  Download,
  Star,
  ChevronRight,
  Bell,
  Shield,
  Mail,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
}

const cardStagger = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */
const upcomingBookings = [
  {
    id: 'KIT-2027-78432',
    property: 'Kampala Central Hub',
    location: 'Namboole, Kampala',
    image: '/property-kampala-1.jpg',
    dates: 'Jun 15 \u2014 Jun 22, 2027',
    nights: 7,
    guests: '2 Adults',
    room: 'Twin Room',
    status: 'Confirmed' as const,
    price: 434,
    shuttles: [
      { date: 'Jun 18', match: 'Uganda vs. Nigeria', kickoff: '2:00 PM', departure: '11:30 AM' },
      { date: 'Jun 21', match: 'Ghana vs. Senegal', kickoff: '7:00 PM', departure: '4:00 PM' },
    ],
  },
  {
    id: 'KIT-2027-78433',
    property: 'Hoima Fan Village',
    location: 'Hoima City',
    image: '/property-hoima-1.jpg',
    dates: 'Jul 5 \u2014 Jul 12, 2027',
    nights: 7,
    guests: '2 Adults',
    room: 'Multi-Share',
    status: 'Confirmed' as const,
    price: 280,
    shuttles: [],
  },
]

const pastBookings = [
  {
    id: 'KIT-2026-001',
    property: 'Kampala Premium Suites',
    location: 'Kampala',
    image: '/property-kampala-2.jpg',
    dates: 'Jun 10 \u2014 Jun 14, 2026',
    nights: 4,
    guests: '2 Adults',
    room: 'Double Room',
    status: 'Completed' as const,
    price: 520,
    reviewed: false,
  },
]

const receipts = [
  { date: 'Jun 15, 2027', property: 'Kampala Central Hub', amount: 434, status: 'Paid' as const },
  { date: 'Jul 5, 2027', property: 'Hoima Fan Village', amount: 280, status: 'Paid' as const },
  { date: 'Jun 1, 2027', property: 'Shuttle Pass Add-on', amount: 56, status: 'Paid' as const },
]

const shuttleSchedule = [
  {
    date: 'Jun 18, 2027',
    match: 'Uganda vs. Nigeria',
    stadium: 'Mandela National Stadium',
    kickoff: '2:00 PM',
    departure: '11:30 AM from Kampala Central Hub',
    returnTime: 'Estimated 5:00 PM',
    status: 'Confirmed' as const,
  },
  {
    date: 'Jun 21, 2027',
    match: 'Ghana vs. Senegal',
    stadium: 'Mandela National Stadium',
    kickoff: '7:00 PM',
    departure: '4:00 PM from Kampala Central Hub',
    returnTime: 'Estimated 10:00 PM',
    status: 'Confirmed' as const,
  },
  {
    date: 'Jul 8, 2027',
    match: 'Quarter Final 1',
    stadium: 'TBD',
    kickoff: 'TBD',
    departure: 'TBD',
    returnTime: 'TBD',
    status: 'Confirmed' as const,
  },
  {
    date: 'Jul 12, 2027',
    match: 'Quarter Final 2',
    stadium: 'TBD',
    kickoff: 'TBD',
    departure: 'TBD',
    returnTime: 'TBD',
    status: 'Confirmed' as const,
  },
]

/* ------------------------------------------------------------------ */
/*  Status badge helper                                                */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: 'Confirmed' | 'Completed' | 'Pending' | 'Paid' }) {
  const styles = {
    Confirmed: 'bg-[#E8F5E9] text-[#27AE60]',
    Completed: 'bg-[#E3F2FD] text-[#3D5A80]',
    Pending: 'bg-[#FFF8E1] text-[#F5A623]',
    Paid: 'bg-[#E8F5E9] text-[#27AE60]',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === 'Paid' && <Check size={12} />}
      {status}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  QR Code Placeholder                                                */
/* ------------------------------------------------------------------ */
function QRPlaceholder() {
  const pattern = useMemo(() => Array.from({ length: 25 }, () => Math.random() > 0.5), [])
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-20 h-20 bg-white border-2 border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center">
        <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-14 h-14">
          {pattern.map((filled, i) => (
            <div key={i} className={`${filled ? 'bg-deep-forest' : 'bg-white'} rounded-[1px]`} />
          ))}
        </div>
      </div>
      <span className="text-[10px] text-slate">Show at boarding</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Star Rating                                                        */
/* ------------------------------------------------------------------ */
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={star <= value ? 'text-savanna-gold fill-savanna-gold' : 'text-light-grey'}
          />
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 1: Dashboard Header                                        */
/* ------------------------------------------------------------------ */
function DashboardHeader() {
  const stats = [
    { icon: Calendar, value: '2', label: 'Active Bookings' },
    { icon: Moon, value: '14', label: 'Total Nights' },
    { icon: Bus, value: '4 scheduled', label: 'Shuttle Rides' },
    { icon: Trophy, value: '142 days', label: 'AFCON Countdown' },
  ]

  return (
    <section className="w-full" style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2A9D8F 100%)' }}>
      <div className="container-kitufu pt-12 pb-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-display font-bold text-3xl md:text-[2.5rem] text-white mb-2"
        >
          Welcome back, Sarah
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-white/80 mb-8"
        >
          Manage your AFCON 2027 bookings, shuttle schedules, and account.
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl px-5 py-4"
              style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
            >
              <s.icon size={20} className="text-white mb-2" />
              <div className="font-display font-bold text-xl text-white">{s.value}</div>
              <div className="text-white/70 text-xs">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 1: Upcoming Stays                                              */
/* ------------------------------------------------------------------ */
function UpcomingStays() {
  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Your Upcoming Stays</h2>
      {upcomingBookings.length === 0 ? (
        <EmptyState icon={Calendar} title="No Upcoming Stays" description="You don't have any upcoming bookings. Start exploring Kitufu Residences for AFCON 2027." action={{ label: 'Browse Residences', href: '/listings' }} />
      ) : (
        <div className="flex flex-col gap-6">
          {upcomingBookings.map((b, i) => (
            <motion.div
              key={b.id}
              custom={i}
              variants={cardStagger}
              initial="hidden"
              animate="visible"
              className="bg-white border border-light-grey rounded-xl overflow-hidden"
            >
              {/* Top section */}
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
                <img
                  src={b.image}
                  alt={b.property}
                  className="w-full md:w-40 h-28 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-deep-forest">{b.property}</h3>
                      <div className="flex items-center gap-1 text-slate text-sm mt-1">
                        <MapPin size={14} className="shrink-0" />
                        <span>{b.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-deep-forest text-sm mt-2">
                        <Calendar size={14} className="shrink-0 text-teal-depth" />
                        <span>{b.dates} ({b.nights} nights)</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-slate text-sm">
                        <span className="flex items-center gap-1"><Users size={14} /> {b.guests}</span>
                        <span className="flex items-center gap-1"><Bed size={14} /> {b.room}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <StatusBadge status={b.status} />
                      <span className="font-mono text-xs text-slate">{b.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shuttle section */}
              {b.shuttles.length > 0 && (
                <>
                  <Separator />
                  <div className="px-4 md:px-5 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus size={14} className="text-teal-depth" />
                      <span className="text-sm font-medium text-teal-depth">Shuttle Schedule</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {b.shuttles.map((s) => (
                        <motion.div
                          key={s.date}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-sm text-slate pl-6"
                        >
                          <span className="font-medium text-deep-forest">{s.date}</span> &mdash; {s.match} &bull; {s.kickoff} &bull; Bus departs {s.departure}
                        </motion.div>
                      ))}
                    </div>
                    <button className="text-teal-depth text-sm font-medium underline underline-offset-4 mt-2 pl-6 hover:text-deep-forest transition-colors">
                      View Full Schedule &rarr;
                    </button>
                  </div>
                </>
              )}

              <Separator />

              {/* Actions */}
              <div className="px-4 md:px-5 py-3 flex flex-wrap gap-4">
                <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                  <Receipt size={14} /> Download Receipt
                </button>
                <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                  <Edit3 size={14} /> Modify Booking
                </button>
                <button className="flex items-center gap-1.5 text-sm text-earth-red hover:text-[#a33218] transition-colors">
                  <X size={14} /> Cancel Booking
                </button>
                <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                  <Phone size={14} /> Contact Host
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 2: Past Bookings                                               */
/* ------------------------------------------------------------------ */
function PastBookings() {
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittedReview, setSubmittedReview] = useState(false)

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Past Bookings</h2>
      {pastBookings.length === 0 ? (
        <EmptyState icon={Clock} title="No Past Bookings" description="Your completed stays will appear here." />
      ) : (
        <div className="flex flex-col gap-6">
          {pastBookings.map((b, i) => (
            <motion.div
              key={b.id}
              custom={i}
              variants={cardStagger}
              initial="hidden"
              animate="visible"
              className="bg-white border border-light-grey rounded-xl overflow-hidden opacity-90"
            >
              <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
                <img
                  src={b.image}
                  alt={b.property}
                  className="w-full md:w-40 h-28 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                    <div>
                      <h3 className="font-display font-semibold text-lg text-deep-forest">{b.property}</h3>
                      <div className="flex items-center gap-1 text-slate text-sm mt-1">
                        <MapPin size={14} className="shrink-0" />
                        <span>{b.location}</span>
                      </div>
                      <div className="flex items-center gap-1 text-deep-forest text-sm mt-2">
                        <Calendar size={14} className="shrink-0 text-teal-depth" />
                        <span>{b.dates} ({b.nights} nights)</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-slate text-sm">
                        <span className="flex items-center gap-1"><Users size={14} /> {b.guests}</span>
                        <span className="flex items-center gap-1"><Bed size={14} /> {b.room}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1">
                      <StatusBadge status="Completed" />
                      <span className="font-mono text-xs text-slate">{b.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!b.reviewed && !submittedReview && (
                <>
                  <Separator />
                  <div className="px-4 md:px-5 py-4 bg-warm-sand/50">
                    <h4 className="font-display font-semibold text-sm text-deep-forest mb-2">Leave a Review</h4>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="mt-3 w-full border border-light-grey rounded-lg px-4 py-3 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none resize-none h-24 bg-white"
                    />
                    <button
                      onClick={() => setSubmittedReview(true)}
                      className="mt-3 bg-sunset hover:bg-[#E55A2B] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>
                </>
              )}

              {submittedReview && (
                <>
                  <Separator />
                  <div className="px-4 md:px-5 py-3 bg-[#E8F5E9]">
                    <div className="flex items-center gap-2 text-[#27AE60] text-sm font-medium">
                      <Check size={16} /> Thank you for your review!
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="px-4 md:px-5 py-3 flex flex-wrap gap-4">
                <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                  <Star size={14} /> Leave Review
                </button>
                <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                  <Receipt size={14} /> Download Receipt
                </button>
                <Link
                  to="/listings"
                  className="flex items-center gap-1.5 text-sm text-sunset hover:text-deep-forest transition-colors font-medium"
                >
                  <Bed size={14} /> Book Again
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 3: Receipts & Invoices                                         */
/* ------------------------------------------------------------------ */
function ReceiptsInvoices() {
  const totalSpent = receipts.reduce((acc, r) => acc + r.amount, 0)

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Receipts &amp; Invoices</h2>

      <div className="bg-white border border-light-grey rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-warm-sand font-body font-semibold text-sm text-deep-forest">
          <span>Date</span>
          <span>Property</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* Table Rows */}
        {receipts.map((r, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 border-t border-light-grey items-center"
          >
            <span className="text-sm text-deep-forest">{r.date}</span>
            <span className="text-sm text-deep-forest font-medium">{r.property}</span>
            <span className="text-sm font-body font-semibold text-deep-forest">${r.amount}</span>
            <StatusBadge status={r.status} />
            <button className="flex items-center gap-1.5 text-sm text-teal-depth hover:text-deep-forest transition-colors w-fit">
              <Download size={14} /> PDF
            </button>
          </motion.div>
        ))}
      </div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-6 bg-warm-sand rounded-xl p-6"
      >
        <h3 className="font-display font-bold text-xl text-deep-forest mb-4">Total Spent: ${totalSpent}</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate">Total Nights</span>
            <span className="text-deep-forest font-medium">14</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate">Service Fee</span>
            <span className="text-deep-forest font-medium">$48</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate">Taxes</span>
            <span className="text-deep-forest font-medium">$92</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 4: Shuttle Schedule                                            */
/* ------------------------------------------------------------------ */
function ShuttleSchedule() {
  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Your Shuttle Schedule</h2>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-light-grey rounded-xl p-4 text-center">
          <Bus size={24} className="text-teal-depth mx-auto mb-2" />
          <div className="font-display font-bold text-2xl text-deep-forest">4</div>
          <div className="text-xs text-slate">Rides Scheduled</div>
        </div>
        <div className="bg-white border border-light-grey rounded-xl p-4 text-center">
          <Calendar size={24} className="text-sunset mx-auto mb-2" />
          <div className="font-display font-bold text-2xl text-deep-forest">Jun 18</div>
          <div className="text-xs text-slate">Next Ride</div>
        </div>
        <div className="bg-white border border-light-grey rounded-xl p-4 text-center">
          <Check size={24} className="text-[#27AE60] mx-auto mb-2" />
          <div className="font-display font-bold text-2xl text-deep-forest">All</div>
          <div className="text-xs text-slate">Confirmed</div>
        </div>
      </div>

      {shuttleSchedule.length === 0 ? (
        <EmptyState
          icon={Bus}
          title="No Shuttle Booked"
          description="Add shuttle service to your booking for direct transport to the stadium."
          action={{ label: 'Add Shuttle to Booking', href: '/listings' }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {shuttleSchedule.map((s, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardStagger}
              initial="hidden"
              animate="visible"
              className="bg-white border border-light-grey rounded-xl p-4 md:p-5"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate bg-warm-sand px-2 py-0.5 rounded">{s.date}</span>
                    <StatusBadge status="Confirmed" />
                  </div>
                  <h4 className="font-display font-semibold text-lg text-deep-forest">{s.match}</h4>
                  <div className="flex items-center gap-1 text-slate text-sm mt-1">
                    <MapPin size={14} className="shrink-0" />
                    <span>{s.stadium}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-sunset" />
                      <span className="text-deep-forest">Kickoff: {s.kickoff}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bus size={14} className="text-teal-depth" />
                      <span className="text-teal-depth font-medium">Departure: {s.departure}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-slate" />
                      <span className="text-slate">Return: {s.returnTime}</span>
                    </div>
                  </div>
                </div>
                <QRPlaceholder />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 5: Profile Settings                                            */
/* ------------------------------------------------------------------ */
function ProfileSettings() {
  const [notifications, setNotifications] = useState({
    emailBooking: true,
    smsShuttle: true,
    afconUpdates: false,
    promotions: false,
    groupNotifications: true,
  })

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Profile Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column — Personal Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-sunset text-white text-2xl font-display font-bold">
                SM
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-display font-semibold text-lg text-deep-forest">Sarah Mensah</h3>
              <p className="text-sm text-slate">Guest since 2026</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-deep-forest mb-1">First Name</label>
                <input
                  type="text"
                  defaultValue="Sarah"
                  className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-forest mb-1">Last Name</label>
                <input
                  type="text"
                  defaultValue="Mensah"
                  className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-1">Email</label>
              <input
                type="email"
                defaultValue="sarah.mensah@email.com"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-1">Phone</label>
              <input
                type="tel"
                defaultValue="+233 20 123 4567"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-deep-forest mb-1">Nationality</label>
                <select className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none bg-white">
                  <option>Ghanaian</option>
                  <option>Nigerian</option>
                  <option>Ugandan</option>
                  <option>Kenyan</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-deep-forest mb-1">Preferred Language</label>
                <select className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none bg-white">
                  <option>English</option>
                  <option>French</option>
                  <option>Swahili</option>
                  <option>Arabic</option>
                </select>
              </div>
            </div>
            <button className="btn-primary mt-2">Save Changes</button>
          </div>
        </motion.div>

        {/* Right Column — Account & Security */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Password */}
          <div className="bg-white border border-light-grey rounded-xl p-5">
            <h4 className="font-display font-semibold text-deep-forest mb-4 flex items-center gap-2">
              <Shield size={18} className="text-teal-depth" /> Password
            </h4>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
              <input
                type="password"
                placeholder="New Password"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
              <button className="btn-secondary">Update Password</button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white border border-light-grey rounded-xl p-5">
            <h4 className="font-display font-semibold text-deep-forest mb-4 flex items-center gap-2">
              <Bell size={18} className="text-sunset" /> Notification Preferences
            </h4>
            <div className="space-y-4">
              {[
                { key: 'emailBooking' as const, label: 'Email booking confirmations' },
                { key: 'smsShuttle' as const, label: 'SMS shuttle reminders' },
                { key: 'afconUpdates' as const, label: 'AFCON schedule updates' },
                { key: 'promotions' as const, label: 'Promotional offers' },
                { key: 'groupNotifications' as const, label: 'Group booking notifications' },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <span className="text-sm text-deep-forest">{n.label}</span>
                  <Switch
                    checked={notifications[n.key]}
                    onCheckedChange={() => toggle(n.key)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Connected Accounts */}
          <div className="bg-white border border-light-grey rounded-xl p-5">
            <h4 className="font-display font-semibold text-deep-forest mb-4 flex items-center gap-2">
              <Mail size={18} className="text-hoima-blue" /> Connected Accounts
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="text-sm text-deep-forest">Google</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-[#27AE60] font-medium">
                  <Check size={12} /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="text-sm text-deep-forest">WhatsApp</span>
                </div>
                <span className="text-xs text-slate">+233 20 123 4567</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty State helper                                                 */
/* ------------------------------------------------------------------ */
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Calendar
  title: string
  description: string
  action?: { label: string; href: string }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center py-16"
    >
      <Icon size={64} className="text-light-grey mb-4" />
      <h3 className="font-display font-semibold text-xl text-slate mb-2">{title}</h3>
      <p className="text-slate max-w-md mb-6">{description}</p>
      {action && (
        <Link to={action.href} className="btn-primary">
          {action.label}
        </Link>
      )}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard Page                                                */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upcoming')

  return (
    <div className="min-h-[100dvh] bg-warm-sand">
      <DashboardHeader />

      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b border-light-grey">
        <div className="container-kitufu">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-0 overflow-x-auto scrollbar-hide">
              {[
                { value: 'upcoming', label: 'Upcoming Stays', icon: Calendar, badge: '2' },
                { value: 'past', label: 'Past Bookings', icon: Clock },
                { value: 'receipts', label: 'Receipts', icon: Receipt },
                { value: 'shuttle', label: 'Shuttle Schedule', icon: Bus, badge: '4' },
                { value: 'profile', label: 'Profile', icon: User },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="relative flex items-center gap-2 px-4 md:px-5 py-4 rounded-none border-b-2 border-transparent data-[state=active]:border-sunset data-[state=active]:text-sunset data-[state=active]:shadow-none data-[state=active]:bg-transparent text-slate hover:text-sunset hover:bg-warm-sand/50 transition-colors text-sm font-medium shrink-0"
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge && (
                    <Badge className="bg-sunset text-white text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="upcoming" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
                  <UpcomingStays />
                </TabsContent>
                <TabsContent value="past" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
                  <PastBookings />
                </TabsContent>
                <TabsContent value="receipts" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
                  <ReceiptsInvoices />
                </TabsContent>
                <TabsContent value="shuttle" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
                  <ShuttleSchedule />
                </TabsContent>
                <TabsContent value="profile" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
                  <ProfileSettings />
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
