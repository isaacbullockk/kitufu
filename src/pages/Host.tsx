import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Building,
  Calendar,
  DollarSign,
  Shield,
  User,
  MapPin,
  TrendingUp,
  BarChart3,
  Check,
  Clock,
  X,
  Phone,
  Edit3,
  Pause,
  ChevronDown,
  ChevronRight,
  Banknote,
  Bell,
  Download,
  Plus,
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

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
const properties = [
  {
    id: 1,
    name: 'Kampala Central Hub',
    location: 'Namboole, Kampala',
    type: 'Converted Office Building',
    image: '/property-kampala-1.jpg',
    status: 'Active' as const,
    upcomingBookings: 8,
    occupancy: 78,
    earned: 4200,
    monthlyBookings: [5, 12, 8],
    peakMonth: 'July (12 bookings)',
  },
  {
    id: 2,
    name: 'Hoima Fan Village',
    location: 'Hoima City',
    type: 'Converted Warehouse',
    image: '/property-hoima-1.jpg',
    status: 'Active' as const,
    upcomingBookings: 4,
    occupancy: 65,
    earned: 1800,
    monthlyBookings: [3, 8, 4],
    peakMonth: 'July (8 bookings)',
  },
  {
    id: 3,
    name: 'Kireka Residence',
    location: 'Kireka, Kampala',
    type: 'Residential Conversion',
    image: '/property-kampala-2.jpg',
    status: 'Pending' as const,
    upcomingBookings: 0,
    occupancy: 0,
    earned: 0,
    monthlyBookings: [0, 0, 0],
    peakMonth: 'N/A',
  },
]

const calendarBookings = [
  { guest: 'Sarah Mensah', dates: 'Jun 15-22', room: 'Twin', status: 'Confirmed' as const, avatar: 'SM' },
  { guest: 'Chinedu Okafor', dates: 'Jun 16-23', room: 'Quad', status: 'Confirmed' as const, avatar: 'CO' },
  { guest: 'Amadou Diallo', dates: 'Jun 18-25', room: 'Twin', status: 'Pending' as const, avatar: 'AD' },
  { guest: 'Fatou Ndiaye', dates: 'Jun 20-27', room: 'Double', status: 'Confirmed' as const, avatar: 'FN' },
  { guest: 'Kofi Asante', dates: 'Jun 22-29', room: 'Twin', status: 'Confirmed' as const, avatar: 'KA' },
]

const earningsData = [
  { period: 'June 2027', bookings: 8, nightlyRevenue: 2800, shuttleRevenue: 320, serviceFee: 168, total: 3288 },
  { period: 'July 2027', bookings: 12, nightlyRevenue: 4200, shuttleRevenue: 480, serviceFee: 252, total: 4932 },
  { period: 'August 2027', bookings: 4, nightlyRevenue: 1400, shuttleRevenue: 160, serviceFee: 84, total: 1644 },
]

const occupancyData = [
  { week: 'W1', value: 45 },
  { week: 'W2', value: 52 },
  { week: 'W3', value: 58 },
  { week: 'W4', value: 65 },
  { week: 'W5', value: 70 },
  { week: 'W6', value: 78 },
  { week: 'W7', value: 85 },
  { week: 'W8', value: 82 },
  { week: 'W9', value: 88 },
  { week: 'W10', value: 90 },
  { week: 'W11', value: 75 },
  { week: 'W12', value: 60 },
]

const complianceCategories = [
  {
    name: 'Security',
    items: [
      { text: 'Perimeter fencing installed and secure', status: 'completed' as const },
      { text: '24/7 security guards contracted', status: 'completed' as const },
      { text: 'CCTV system operational (all common areas)', status: 'completed' as const },
    ],
  },
  {
    name: 'Sanitation',
    items: [
      { text: 'Containerized bathroom facilities installed', status: 'completed' as const },
      { text: 'Running water verified (hot + cold)', status: 'completed' as const },
      { text: 'Waste management plan submitted to UTB', status: 'pending' as const, due: 'Due by May 15, 2027', action: 'Submit Document' },
    ],
  },
  {
    name: 'Safety',
    items: [
      { text: 'Fire extinguishers installed (all floors)', status: 'completed' as const },
      { text: 'Fire escape routes marked and accessible', status: 'completed' as const },
    ],
  },
  {
    name: 'Service',
    items: [
      { text: 'Concierge desk staffed and operational', status: 'completed' as const },
      { text: 'Check-in/check-out procedures documented', status: 'completed' as const },
      { text: 'Staff training completed (hospitality + safety)', status: 'pending' as const, due: 'Due by May 30, 2027', action: 'Schedule Training' },
      { text: 'UTB inspection scheduled', status: 'not-started' as const, info: 'Contact UTB at least 60 days before opening', action: 'Schedule Inspection' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Status Badge                                                       */
/* ------------------------------------------------------------------ */
function PropertyStatusBadge({ status }: { status: 'Active' | 'Pending' }) {
  const styles = {
    Active: 'bg-[#E8F5E9] text-[#27AE60]',
    Pending: 'bg-[#FFF8E1] text-[#F5A623]',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === 'Active' ? <Check size={10} /> : <Clock size={10} />}
      {status === 'Pending' ? 'Pending UTB Approval' : status}
    </span>
  )
}

function BookingStatusBadge({ status }: { status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked-in' | 'Checked-out' }) {
  const styles = {
    Confirmed: 'bg-[#E8F5E9] text-[#27AE60]',
    Pending: 'bg-[#FFF8E1] text-[#F5A623]',
    Cancelled: 'bg-[#FFEBEE] text-[#C73E1D]',
    'Checked-in': 'bg-[#E3F2FD] text-[#3D5A80]',
    'Checked-out': 'bg-[#F3E5F5] text-[#7B1FA2]',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Mini Bar Chart (SVG based)                                         */
/* ------------------------------------------------------------------ */
function MiniBarChart({ data, color = '#FF6B35' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1)
  const labels = ['Jun', 'Jul', 'Aug']
  return (
    <div className="flex items-end gap-3 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04 + 0.3, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="w-full rounded-t-md origin-bottom"
            style={{ height: `${(v / max) * 48}px`, backgroundColor: color }}
          />
          <span className="text-[10px] text-slate">{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Earnings Bar Chart (div-based)                                */
/* ------------------------------------------------------------------ */
function EarningsBarChart() {
  const data = [
    { month: 'June', value: 3288 },
    { month: 'July', value: 4932 },
    { month: 'August', value: 1644 },
  ]
  const max = Math.max(...data.map((d) => d.value))

  return (
    <div className="flex items-end gap-6 h-48 px-2">
      {data.map((d, i) => (
        <div key={d.month} className="flex flex-col items-center gap-2 flex-1">
          <motion.div
            custom={i}
            variants={cardStagger}
            initial="hidden"
            animate="visible"
            className="w-full max-w-[80px] rounded-t-md bg-sunset relative group cursor-pointer"
            style={{ height: `${(d.value / max) * 100}%` }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-charcoal text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              ${d.value.toLocaleString()}
            </div>
          </motion.div>
          <span className="text-xs text-slate font-medium">{d.month}</span>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Occupancy Line Chart (SVG)                                         */
/* ------------------------------------------------------------------ */
function OccupancyLineChart() {
  const w = 400
  const h = 150
  const pad = 20
  const chartW = w - pad * 2
  const chartH = h - pad * 2
  const maxVal = 100

  const points = occupancyData.map((d, i) => {
    const x = pad + (i / (occupancyData.length - 1)) * chartW
    const y = pad + chartH - (d.value / maxVal) * chartH
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${points} ${pad + chartW},${pad + chartH} ${pad},${pad + chartH}`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" preserveAspectRatio="none">
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((pct) => {
        const y = pad + chartH - (pct / 100) * chartH
        return (
          <line key={pct} x1={pad} y1={y} x2={w - pad} y2={y} stroke="#E2E8F0" strokeWidth="1" strokeDasharray={pct === 85 ? '4 4' : '0'} />
        )
      })}
      {/* Target line label */}
      <text x={pad + 2} y={pad + chartH - (85 / 100) * chartH - 4} fill="#F5A623" fontSize="8" fontWeight="500">Target: 85%</text>
      {/* Area fill */}
      <polygon points={areaPoints} fill="rgba(42,157,143,0.1)" />
      {/* Line */}
      <polyline points={points} fill="none" stroke="#2A9D8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {occupancyData.map((d, i) => {
        const x = pad + (i / (occupancyData.length - 1)) * chartW
        const y = pad + chartH - (d.value / maxVal) * chartH
        return <circle key={i} cx={x} cy={y} r="3" fill="#2A9D8F" />
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Calendar Component                                                 */
/* ------------------------------------------------------------------ */
function BookingsCalendarView() {
  const daysInMonth = 30
  const startOffset = 2 // June 2027 starts on Tuesday
  const bookedDates = [15, 16, 18, 20, 22, 23, 25, 27]
  const pendingDates = [18]

  const days = []
  for (let i = 0; i < startOffset; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return (
    <div className="bg-white border border-light-grey rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-lg text-deep-forest">June 2027</h3>
        <div className="flex items-center gap-1 text-slate">
          <button className="p-1 hover:bg-warm-sand rounded transition-colors"><ChevronDown size={16} className="rotate-90" /></button>
          <button className="p-1 hover:bg-warm-sand rounded transition-colors"><ChevronDown size={16} className="-rotate-90" /></button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs text-slate font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const isBooked = bookedDates.includes(day)
          const isPending = pendingDates.includes(day)
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005, duration: 0.2 }}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-sm cursor-default transition-colors ${
                isBooked ? 'bg-sunset/10 text-sunset font-semibold' : 'hover:bg-warm-sand text-deep-forest'
              }`}
            >
              {day}
              {isBooked && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-sunset" />
              )}
              {isPending && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-savanna-gold" />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-light-grey text-xs text-slate">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sunset" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-savanna-gold" /> Pending</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Checklist Item                                                     */
/* ------------------------------------------------------------------ */
function ChecklistItem({
  text,
  status,
  due,
  action,
  info,
}: {
  text: string
  status: 'completed' | 'pending' | 'not-started'
  due?: string
  action?: string
  info?: string
}) {
  if (status === 'completed') {
    return (
      <div className="flex items-start gap-3 py-2">
        <div className="w-6 h-6 rounded-full bg-teal-depth/10 flex items-center justify-center shrink-0 mt-0.5">
          <Check size={14} className="text-teal-depth" />
        </div>
        <span className="text-sm text-slate line-through">{text}</span>
      </div>
    )
  }

  if (status === 'pending') {
    return (
      <div className="flex items-start gap-3 py-2">
        <div className="w-6 h-6 rounded-full bg-savanna-gold/10 flex items-center justify-center shrink-0 mt-0.5">
          <Clock size={14} className="text-savanna-gold" />
        </div>
        <div className="flex-1">
          <span className="text-sm text-deep-forest font-medium">{text}</span>
          {due && <div className="text-xs text-earth-red mt-1">{due}</div>}
          {action && (
            <button className="mt-2 bg-sunset hover:bg-[#E55A2B] text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
              {action}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-6 h-6 rounded-full border-2 border-light-grey shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="text-sm text-deep-forest">{text}</span>
        {info && <div className="text-xs text-slate mt-1">{info}</div>}
        {action && (
          <button className="mt-2 bg-transparent border-2 border-sunset text-sunset hover:bg-sunset hover:text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-colors">
            {action}
          </button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section 1: Host Header                                             */
/* ------------------------------------------------------------------ */
function HostHeader() {
  const stats = [
    { icon: DollarSign, value: '$12,450', label: 'Total Earnings', change: '+23% vs. last month' },
    { icon: TrendingUp, value: '$3,200', label: 'This Month', change: '8 bookings' },
    { icon: BarChart3, value: '78%', label: 'Occupancy Rate', change: 'Target: 85%' },
    { icon: Calendar, value: '142', label: 'Days to AFCON', change: 'Jun 15, 2027' },
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
          Good afternoon, Robert
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-white/80 mb-8"
        >
          Manage your properties, track bookings, and stay compliant for AFCON 2027.
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
              <s.icon size={24} className="text-savanna-gold mb-2" />
              <div className="font-display font-bold text-2xl text-white">{s.value}</div>
              <div className="text-white/60 text-xs">{s.label}</div>
              <div className="text-savanna-gold text-xs mt-1">{s.change}</div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-wrap gap-3 mt-6"
        >
          <button className="bg-white text-deep-forest hover:bg-warm-sand px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <Plus size={16} /> Add New Property
          </button>
          <button className="bg-transparent text-white border-2 border-white/60 hover:bg-white/10 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
            <Download size={16} /> Download Earnings Report
          </button>
          <button className="text-white/80 hover:text-white px-3 py-2.5 text-sm font-medium transition-colors flex items-center gap-2">
            <Phone size={16} /> Contact Kitufu Support
          </button>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 1: My Properties                                               */
/* ------------------------------------------------------------------ */
function MyProperties() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-deep-forest">Your Properties</h2>
        <p className="text-slate text-sm mt-1">3 properties listed &bull; 2 active &bull; 1 pending approval</p>
      </div>

      <div className="flex flex-col gap-6">
        {properties.map((p, i) => (
          <motion.div
            key={p.id}
            custom={i}
            variants={cardStagger}
            initial="hidden"
            animate="visible"
            className={`bg-white border rounded-xl overflow-hidden ${
              p.status === 'Pending' ? 'border-l-4 border-l-savanna-gold border-light-grey' : 'border-light-grey'
            }`}
          >
            {/* Top row */}
            <div className="p-4 md:p-5 flex flex-col md:flex-row gap-4">
              <img
                src={p.image}
                alt={p.name}
                className="w-full md:w-[120px] h-[90px] object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-deep-forest">{p.name}</h3>
                    <div className="flex items-center gap-1 text-slate text-sm mt-1">
                      <MapPin size={14} className="shrink-0" />
                      <span>{p.location}</span>
                    </div>
                    <div className="text-xs text-slate mt-1">{p.type}</div>
                    <div className="mt-2">
                      <PropertyStatusBadge status={p.status} />
                    </div>
                  </div>
                  {p.status === 'Active' && (
                    <div className="text-sm space-y-1 md:text-right">
                      <div className="text-slate">{p.upcomingBookings} upcoming bookings</div>
                      <div className="text-slate">{p.occupancy}% occupancy (Jun-Aug)</div>
                      <div className="text-sunset font-semibold">${p.earned.toLocaleString()} earned</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance mini-chart for active properties */}
            {p.status === 'Active' && (
              <>
                <Separator />
                <div className="px-4 md:px-5 py-3 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-40">
                    <MiniBarChart data={p.monthlyBookings} />
                  </div>
                  <span className="text-xs text-slate">Peak: {p.peakMonth}</span>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="px-4 md:px-5 py-3 flex flex-wrap gap-4">
              <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                <ChevronRight size={14} /> View Details
              </button>
              <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                <Edit3 size={14} /> Edit Listing
              </button>
              {p.status === 'Active' ? (
                <button className="flex items-center gap-1.5 text-sm text-earth-red hover:text-[#a33218] transition-colors">
                  <Pause size={14} /> Pause Bookings
                </button>
              ) : (
                <>
                  <button className="flex items-center gap-1.5 text-sm text-sunset hover:text-deep-forest transition-colors font-medium">
                    <Shield size={14} /> Complete Compliance
                  </button>
                  <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                    <Phone size={14} /> Contact Support
                  </button>
                </>
              )}
              <button className="flex items-center gap-1.5 text-sm text-slate hover:text-sunset transition-colors">
                <Calendar size={14} /> View Calendar
              </button>
            </div>
          </motion.div>
        ))}

        {/* Add Property Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="border-2 border-dashed border-light-grey rounded-xl p-8 flex flex-col items-center text-center hover:border-sunset transition-colors cursor-pointer group"
        >
          <Plus size={32} className="text-light-grey group-hover:text-sunset transition-colors mb-3" />
          <h4 className="font-display font-semibold text-slate group-hover:text-sunset transition-colors">List a New Property</h4>
          <p className="text-sm text-slate mt-1">Convert your empty building into AFCON revenue</p>
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 2: Bookings Calendar                                           */
/* ------------------------------------------------------------------ */
function BookingsCalendarTab() {
  const [statusFilter, setStatusFilter] = useState('All')

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Bookings Calendar</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <BookingsCalendarView />
        </div>

        {/* Filters */}
        <div className="bg-white border border-light-grey rounded-xl p-5">
          <h4 className="font-display font-semibold text-deep-forest mb-4">Filters</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate mb-1">Property</label>
              <select className="w-full border border-light-grey rounded-lg px-3 py-2 text-sm focus:border-sunset outline-none bg-white">
                <option>All Properties</option>
                <option>Kampala Central Hub</option>
                <option>Hoima Fan Village</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-light-grey rounded-lg px-3 py-2 text-sm focus:border-sunset outline-none bg-white"
              >
                <option>All</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
                <option>Checked-in</option>
                <option>Checked-out</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Check-ins */}
      <div className="mt-8">
        <h3 className="font-display font-semibold text-lg text-deep-forest mb-4">Upcoming Check-ins</h3>
        <div className="bg-white border border-light-grey rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_0.8fr_1fr_1fr] gap-4 px-5 py-3 bg-warm-sand font-body font-semibold text-sm text-deep-forest">
            <span>Guest</span>
            <span>Dates</span>
            <span>Room</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {calendarBookings.map((b, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_0.8fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 border-t border-light-grey items-center"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-teal-depth text-white text-xs font-bold">
                    {b.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-deep-forest font-medium">{b.guest}</span>
              </div>
              <span className="text-sm text-slate">{b.dates}</span>
              <span className="text-sm text-slate">{b.room}</span>
              <BookingStatusBadge status={b.status} />
              <div className="flex gap-3">
                <button className="text-sm text-teal-depth hover:text-deep-forest transition-colors">View</button>
                <button className="text-sm text-slate hover:text-sunset transition-colors">Contact</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 3: Earnings                                                    */
/* ------------------------------------------------------------------ */
function EarningsTab() {
  const totals = {
    bookings: earningsData.reduce((a, e) => a + e.bookings, 0),
    nightlyRevenue: earningsData.reduce((a, e) => a + e.nightlyRevenue, 0),
    shuttleRevenue: earningsData.reduce((a, e) => a + e.shuttleRevenue, 0),
    serviceFee: earningsData.reduce((a, e) => a + e.serviceFee, 0),
    total: earningsData.reduce((a, e) => a + e.total, 0),
  }

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Earnings Overview</h2>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="bg-white border border-light-grey rounded-xl p-5">
          <h3 className="font-display font-semibold text-deep-forest mb-4">Monthly Earnings</h3>
          <EarningsBarChart />
          <p className="text-xs text-slate mt-3 text-center">Revenue in USD (June - August 2027)</p>
        </div>

        {/* Line Chart */}
        <div className="bg-white border border-light-grey rounded-xl p-5">
          <h3 className="font-display font-semibold text-deep-forest mb-4">Occupancy Trend</h3>
          <OccupancyLineChart />
          <p className="text-xs text-slate mt-3 text-center">Weekly occupancy % (Week 1-12)</p>
        </div>
      </div>

      {/* Earnings Table */}
      <div className="bg-white border border-light-grey rounded-xl overflow-hidden mb-6">
        <div className="hidden md:grid md:grid-cols-[1.2fr_0.8fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-warm-sand font-body font-semibold text-sm text-deep-forest">
          <span>Period</span>
          <span>Bookings</span>
          <span>Nightly Revenue</span>
          <span>Shuttle Revenue</span>
          <span>Service Fee</span>
          <span>Total</span>
        </div>
        {earningsData.map((e, i) => (
          <motion.div
            key={e.period}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-[1.2fr_0.8fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 border-t border-light-grey items-center"
          >
            <span className="text-sm text-deep-forest font-medium">{e.period}</span>
            <span className="text-sm text-slate">{e.bookings}</span>
            <span className="text-sm text-deep-forest">${e.nightlyRevenue.toLocaleString()}</span>
            <span className="text-sm text-teal-depth">${e.shuttleRevenue}</span>
            <span className="text-sm text-slate">${e.serviceFee}</span>
            <span className="text-sm font-body font-semibold text-deep-forest">${e.total.toLocaleString()}</span>
          </motion.div>
        ))}
        {/* Total row */}
        <div className="grid grid-cols-2 md:grid-cols-[1.2fr_0.8fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 border-t border-light-grey bg-warm-sand font-semibold">
          <span className="text-sm text-deep-forest">Total</span>
          <span className="text-sm text-deep-forest">{totals.bookings}</span>
          <span className="text-sm text-deep-forest">${totals.nightlyRevenue.toLocaleString()}</span>
          <span className="text-sm text-deep-forest">${totals.shuttleRevenue}</span>
          <span className="text-sm text-deep-forest">${totals.serviceFee}</span>
          <span className="text-sm text-sunset">${totals.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Payout Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="rounded-xl p-6"
        style={{ background: '#F0FAF8' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Banknote size={20} className="text-teal-depth" />
          <h3 className="font-display font-semibold text-lg text-teal-depth">Next Payout: $3,200</h3>
        </div>
        <p className="text-sm text-deep-forest mb-1">Scheduled: July 5, 2027</p>
        <p className="text-sm text-slate mb-3">Bank Account: **** **** **** 4532</p>
        <button className="text-teal-depth text-sm font-medium underline underline-offset-4 hover:text-deep-forest transition-colors">
          Edit Payout Method &rarr;
        </button>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 4: Compliance Checklist                                        */
/* ------------------------------------------------------------------ */
function ComplianceChecklist() {
  const totalItems = complianceCategories.reduce((a, c) => a + c.items.length, 0)
  const completedItems = complianceCategories.reduce(
    (a, c) => a + c.items.filter((i) => i.status === 'completed').length,
    0
  )
  const progressPercent = Math.round((completedItems / totalItems) * 100)

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-1">UTB Compliance Checklist</h2>
      <p className="text-slate text-sm mb-6">Complete these requirements to maintain your Temporary Tourism Accommodation certification</p>

      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-light-grey rounded-xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-deep-forest font-medium">Overall Progress</span>
          <span className="text-sm text-slate">{completedItems} of {totalItems} requirements complete</span>
        </div>
        <div className="w-full h-2 bg-light-grey rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #FF6B35, #F5A623)' }}
          />
        </div>
        <div className="text-right text-xs text-slate mt-1">{progressPercent}%</div>
      </motion.div>

      {/* Status Banner */}
      <div className={`rounded-xl p-4 mb-6 ${
        progressPercent === 100
          ? 'bg-[#E8F5E9] text-[#27AE60]'
          : progressPercent >= 75
          ? 'bg-[#FFF8E1] text-[#F5A623]'
          : 'bg-[#FFEBEE] text-[#C73E1D]'
      }`}>
        <div className="flex items-center gap-2 font-medium text-sm">
          {progressPercent === 100 ? (
            <><Check size={16} /> Fully Compliant</>
          ) : progressPercent >= 75 ? (
            <><Clock size={16} /> {totalItems - completedItems} items pending &mdash; complete before May 30</>
          ) : (
            <><X size={16} /> {totalItems - completedItems} items overdue &mdash; immediate action required</>
          )}
        </div>
      </div>

      {/* Four S's Accordion */}
      <Accordion type="multiple" defaultValue={['Security', 'Sanitation']} className="space-y-4">
        {complianceCategories.map((cat) => {
          const catCompleted = cat.items.filter((i) => i.status === 'completed').length
          return (
            <AccordionItem key={cat.name} value={cat.name} className="bg-white border border-light-grey rounded-xl overflow-hidden">
              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-warm-sand/30 transition-colors [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    catCompleted === cat.items.length ? 'bg-[#E8F5E9]' : 'bg-[#FFF8E1]'
                  }`}>
                    {catCompleted === cat.items.length ? (
                      <Check size={16} className="text-[#27AE60]" />
                    ) : (
                      <Shield size={16} className="text-[#F5A623]" />
                    )}
                  </div>
                  <div className="text-left">
                    <span className="font-display font-semibold text-deep-forest">{cat.name}</span>
                    <span className="text-xs text-slate ml-2">({catCompleted}/{cat.items.length})</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4">
                <div className="pl-11 space-y-1">
                  {cat.items.map((item, i) => (
                    <ChecklistItem
                      key={i}
                      text={item.text}
                      status={item.status}
                      due={item.due}
                      action={item.action}
                      info={item.info}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tab 5: Host Profile                                                */
/* ------------------------------------------------------------------ */
function HostProfile() {
  const [notifications, setNotifications] = useState({
    newBooking: true,
    guestMessage: true,
    complianceDeadline: true,
    monthlyReport: false,
    afconUpdates: false,
  })

  const toggle = (key: keyof typeof notifications) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div>
      <h2 className="font-display font-bold text-2xl text-deep-forest mb-6">Host Profile</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column — Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-deep-forest text-white text-2xl font-display font-bold">
                <Building size={32} />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-display font-semibold text-lg text-deep-forest">Robert Mugisha</h3>
              <p className="text-sm text-slate">Host since 2025</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-1">Company / Name</label>
              <input
                type="text"
                defaultValue="Mugisha Properties Ltd"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-1">Email</label>
              <input
                type="email"
                defaultValue="robert@mpug.ug"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-1">Phone</label>
              <input
                type="tel"
                defaultValue="+256 700 987 654"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-1">Business Registration (UTB)</label>
              <input
                type="text"
                defaultValue="UTB-TTA-2025-004321"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-deep-forest mb-1">Tax ID</label>
              <input
                type="text"
                defaultValue="TIN-0987654321"
                className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
              />
            </div>
            <button className="btn-primary mt-2">Save Changes</button>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-8"
        >
          {/* Payout Settings */}
          <div className="bg-white border border-light-grey rounded-xl p-5">
            <h4 className="font-display font-semibold text-deep-forest mb-4 flex items-center gap-2">
              <Banknote size={18} className="text-teal-depth" /> Payout Settings
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate mb-1">Bank</label>
                <select className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset outline-none bg-white">
                  <option>Stanbic Bank Uganda</option>
                  <option>Centenary Bank</option>
                  <option>Equity Bank</option>
                  <option>DFCU Bank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate mb-1">Account Number</label>
                <input
                  type="text"
                  defaultValue="9030001234567"
                  className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate mb-1">Account Name</label>
                <input
                  type="text"
                  defaultValue="Mugisha Properties Ltd"
                  className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
                />
              </div>
              <button className="btn-secondary">Update Payout Method</button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white border border-light-grey rounded-xl p-5">
            <h4 className="font-display font-semibold text-deep-forest mb-4 flex items-center gap-2">
              <Bell size={18} className="text-sunset" /> Notification Preferences
            </h4>
            <div className="space-y-4">
              {[
                { key: 'newBooking' as const, label: 'New booking alerts' },
                { key: 'guestMessage' as const, label: 'Guest message notifications' },
                { key: 'complianceDeadline' as const, label: 'Compliance deadline reminders' },
                { key: 'monthlyReport' as const, label: 'Monthly earnings reports' },
                { key: 'afconUpdates' as const, label: 'AFCON schedule updates' },
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

          {/* Support */}
          <div className="bg-white border border-light-grey rounded-xl p-5">
            <h4 className="font-display font-semibold text-deep-forest mb-4">Support</h4>
            <div className="flex flex-col gap-3">
              <button className="btn-secondary w-fit flex items-center gap-2">
                <Phone size={16} /> Contact Kitufu Support
              </button>
              <Link to="#" className="text-sm text-teal-depth hover:text-deep-forest transition-colors underline underline-offset-4">
                Host Resources &rarr;
              </Link>
              <Link to="#" className="text-sm text-teal-depth hover:text-deep-forest transition-colors underline underline-offset-4">
                Community Forum &rarr;
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Host Dashboard Page                                           */
/* ------------------------------------------------------------------ */
export default function Host() {
  const [activeTab, setActiveTab] = useState('properties')

  return (
    <div className="min-h-[100dvh] bg-warm-sand">
      <HostHeader />

      {/* Tab Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b border-light-grey">
        <div className="container-kitufu">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-0 overflow-x-auto scrollbar-hide">
              {[
                { value: 'properties', label: 'My Properties', icon: Building, badge: '3' },
                { value: 'bookings', label: 'Bookings', icon: Calendar, badge: '12' },
                { value: 'earnings', label: 'Earnings', icon: DollarSign },
                { value: 'compliance', label: 'Compliance', icon: Shield, badge: '2' },
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
                    <span className={`text-[10px] px-1.5 py-0 min-w-[18px] h-[18px] flex items-center justify-center rounded-full font-medium ${
                      tab.value === 'compliance' ? 'bg-earth-red text-white' : 'bg-sunset text-white'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="properties" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
              <MyProperties />
            </TabsContent>
            <TabsContent value="bookings" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
              <BookingsCalendarTab />
            </TabsContent>
            <TabsContent value="earnings" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
              <EarningsTab />
            </TabsContent>
            <TabsContent value="compliance" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
              <ComplianceChecklist />
            </TabsContent>
            <TabsContent value="profile" className="mt-0 pt-8 pb-12 container-kitufu mx-auto">
              <HostProfile />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
