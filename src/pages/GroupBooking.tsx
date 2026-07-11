import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Receipt, Video, Lock, Check, ChevronDown, ChevronLeft, ChevronRight,
  Users, Bus, Shield, Phone, Star, MapPin,
  Play
} from 'lucide-react'

/* ─────────────────────── easing token ─────────────────────── */
const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number]
const easeBounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─────────────────────── mock data ─────────────────────── */

const BUILDINGS = [
  {
    id: 1, name: 'Kampala Central Hub', image: '/property-kampala-1.jpg',
    capacity: 'Up to 80 fans', location: 'Namboole, Kampala • 2.1 km to Mandela Stadium',
    specs: '20 rooms • Twin/Quad • AC • WiFi • 24/7 Security',
    shuttle: 'Shuttle to Mandela Stadium — 12 min', price: 'From $20/person/night'
  },
  {
    id: 2, name: 'Hoima Fan Village', image: '/property-hoima-1.jpg',
    capacity: 'Up to 120 fans', location: 'Central Hoima • 1.5 km to Hoima Stadium',
    specs: '30 rooms • Multi-share/Twin • Fan • WiFi • Gated',
    shuttle: 'Shuttle to Hoima Stadium — 8 min', price: 'From $15/person/night'
  },
  {
    id: 3, name: 'Mandela Walk Suites', image: '/property-kampala-2.jpg',
    capacity: 'Up to 60 fans', location: 'Kireka, Kampala • 0.5 km to Mandela Stadium',
    specs: '15 rooms • Private/Twin • AC • WiFi • Safe • Security',
    shuttle: 'Walking distance — 5 min', price: 'From $25/person/night'
  },
  {
    id: 4, name: 'Hoima Hills Hub', image: '/property-hoima-2.jpg',
    capacity: 'Up to 100 fans', location: 'Hoima East • 2.0 km to Hoima Stadium',
    specs: '25 rooms • Twin/Quad • Fan • WiFi • Gated • Parking',
    shuttle: 'Shuttle to Hoima Stadium — 15 min', price: 'From $18/person/night'
  },
]

const FAQ_ITEMS = [
  { q: "What's the minimum group size for a buy-out?", a: "The minimum group size is 20 fans. This allows us to reserve an entire building exclusively for your group while maintaining affordable per-person rates." },
  { q: "How far in advance should we book?", a: "We recommend securing your building at least 3 months before AFCON 2027 (by March 2027). Popular buildings near Mandela Stadium are booking up quickly. A 25% deposit locks your reservation." },
  { q: "Can we see the building before we commit?", a: "Absolutely. Once you submit your enquiry, we'll schedule a live video walkthrough of your preferred building within 48 hours. You'll see every room, bathroom facility, and common area." },
  { q: "What if our group size changes after booking?", a: "We understand group sizes fluctuate. You can adjust your confirmed guest count up to 30 days before check-in. Increases are subject to room availability; decreases may affect your per-person rate." },
  { q: "Is the shuttle really private for our group?", a: "Yes — when you buy out a building, the shuttle service is exclusive to your group on match days. No sharing with other residences. Direct to the stadium, on your schedule." },
  { q: "What happens if CAF changes the match schedule?", a: "We monitor the official CAF schedule closely. If match dates change, we'll work with you to adjust your booking at no extra cost. Your deposit is fully refundable in case of major tournament changes." },
  { q: "Can we hang banners and decorations in the building?", a: "Yes! Supporters' clubs are encouraged to decorate the common areas with banners, flags, and team colors. We just ask that you avoid permanent fixtures or damage to walls." },
  { q: "What payment methods do you accept for group bookings?", a: "We accept bank transfer, Flutterwave, PayPal, and major credit cards. For groups over 100 fans, we can also arrange invoice-based payment with 30-day terms for the balance." },
]

const TESTIMONIALS = [
  { quote: "We reserved the entire Kampala Central Hub for 85 Nigeria fans. The private shuttle got us to the stadium in 12 minutes flat. The concierge even helped us organize a pre-match braai in the common area.", name: "Chinedu Okafor", role: "Nigeria Supporters' Club, Lagos Chapter — 85 fans" },
  { quote: "As the organizer for 120 Senegal supporters, I was stressed about accommodation. Kitufu made it effortless. One email, one video call, and our building was locked in. The group rate saved us over $4,000.", name: "Amadou Diallo", role: "Senegal Fan Federation, Dakar — 120 fans" },
  { quote: "We brought 60 Morocco supporters and bought out the Hoima Hills Hub. The building was clean, secure, and the staff knew our names by day two. Our fans still talk about it.", name: "Fatima Al-Hassan", role: "Morocco Supporters' Club, Casablanca — 60 fans" },
  { quote: "The video tour before we booked was a game-changer. We saw exactly what our fans would get — no surprises. The UTB certification gave our club leadership total confidence.", name: "Kofi Asante", role: "Ghana Black Stars Fan Club, Accra — 95 fans" },
]

const COUNTRIES = [
  'Nigeria', 'Ghana', 'Senegal', 'Morocco', 'Egypt', 'Cameroon', 'Ivory Coast',
  'Algeria', 'Tunisia', 'South Africa', 'Kenya', 'Tanzania', 'Uganda', 'Rwanda',
  'Ethiopia', 'DR Congo', 'Mali', 'Burkina Faso', 'Zambia', 'Zimbabwe', 'Other'
]

const GROUP_SIZES = ['20-50', '51-120', '121-200', '200+']
const PREFERRED_BUILDINGS = ['No preference', 'Kampala Central Hub', 'Hoima Fan Village', 'Mandela Walk Suites', 'Hoima Hills Hub']
const ROOM_PREFERENCES = ['Multi-share (most affordable)', 'Twin rooms', 'Private rooms', 'Mix of types']
const SHUTTLE_OPTIONS = ['Yes — group shuttle', 'Yes — private shuttle', 'No']

/* ─────────────────────── sub-components ─────────────────────── */

function StepCard({ number, icon: Icon, title, description, index }: {
  number: string; icon: typeof Mail; title: string; description: string; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: easeSmooth }}
      className="relative"
    >
      <span className="font-mono text-5xl text-sunset/20 absolute -top-2 -left-1 select-none">{number}</span>
      <div className="w-12 h-12 rounded-xl bg-sunset/10 flex items-center justify-center mb-4">
        <Icon size={24} className="text-sunset" />
      </div>
      <h4 className="font-display font-semibold text-lg text-deep-forest mb-2">{title}</h4>
      <p className="font-body text-sm text-slate leading-relaxed">{description}</p>
    </motion.div>
  )
}

function PricingCard({ tier, featured = false, index }: {
  tier: {
    badge: string; price: string; savings: string; period: string
    features: string[]; cta: string; ctaStyle: 'primary' | 'secondary'
  }
  featured?: boolean; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: easeSmooth }}
      className={`relative rounded-xl p-8 transition-all duration-300 hover:-translate-y-1 ${
        featured
          ? 'bg-white border-2 border-sunset shadow-[0_8px_24px_rgba(255,107,53,0.15)] -mt-2 lg:-mt-4'
          : 'bg-white border border-light-grey hover:shadow-card-hover'
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sunset text-white px-4 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider">
          Most Popular
        </div>
      )}
      <span className={`font-body font-medium text-xs uppercase tracking-[0.1em] ${
        featured ? 'text-sunset' : index === 0 ? 'text-teal-depth' : 'text-deep-forest'
      }`}>
        {tier.badge}
      </span>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display font-bold text-3xl text-deep-forest">{tier.price}</span>
        <span className="font-body text-sm text-slate">{tier.period}</span>
      </div>
      <p className={`font-body text-xs mt-2 ${featured ? 'text-sunset' : index === 0 ? 'text-teal-depth' : 'text-deep-forest'}`}>
        {tier.savings}
      </p>
      <div className="h-px bg-light-grey my-5" />
      <ul className="space-y-3">
        {tier.features.map(f => (
          <li key={f} className="flex items-start gap-2.5">
            <Check size={16} className="text-teal-depth shrink-0 mt-0.5" />
            <span className="font-body text-sm text-slate">{f}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full mt-6 py-3 rounded-lg font-body font-semibold text-sm transition-all ${
        tier.ctaStyle === 'primary'
          ? 'btn-sunset-gradient animate-pulse-cta'
          : 'btn-secondary'
      }`}>
        {tier.cta}
      </button>
    </motion.div>
  )
}

function BuildingCard({ building, index }: { building: typeof BUILDINGS[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: easeSmooth }}
      className="bg-white rounded-xl border border-light-grey overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-sunset/30"
    >
      <div className="relative aspect-video overflow-hidden">
        <img src={building.image} alt={building.name} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-hoima-blue text-white px-3 py-1 rounded-full text-xs font-semibold">
          {building.capacity}
        </span>
      </div>
      <div className="p-5">
        <h3 className="font-display font-bold text-lg text-deep-forest">{building.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-slate">
          <MapPin size={14} />
          <span className="font-body text-sm">{building.location}</span>
        </div>
        <p className="font-body text-sm text-slate mt-2">{building.specs}</p>
        <div className="flex items-center gap-2 mt-2 text-teal-depth">
          <Bus size={14} className="animate-shuttle-float" />
          <span className="font-body text-sm">{building.shuttle}</span>
        </div>
        <div className="h-px bg-light-grey my-4" />
        <div className="flex items-center justify-between">
          <span className="font-body font-semibold text-sunset">{building.price}</span>
          <button className="btn-secondary text-sm px-4 py-2 rounded-lg">Enquire for This Building</button>
        </div>
      </div>
    </motion.div>
  )
}

function FAQItem({ item, isOpen, onToggle, index }: {
  item: typeof FAQ_ITEMS[0]; isOpen: boolean; onToggle: () => void; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: easeSmooth }}
      className="border-b border-light-grey"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-display font-semibold text-base text-deep-forest pr-4 group-hover:text-sunset transition-colors">
          {item.q}
        </span>
        <ChevronDown
          size={20}
          className={`text-slate shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeSmooth }}
            className="overflow-hidden"
          >
            <p className="font-body text-slate leading-relaxed pb-5 pr-8">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TestimonialCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActive(prev => (prev + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = useCallback(() => setActive(a => (a - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), [])
  const next = useCallback(() => setActive(a => (a + 1) % TESTIMONIALS.length), [])

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: easeSmooth }}
            className="bg-white rounded-xl border border-light-grey p-8 md:p-10 max-w-3xl mx-auto"
          >
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={18} className="text-savanna-gold fill-savanna-gold" />
              ))}
            </div>
            <p className="font-body text-lg text-deep-forest leading-relaxed italic mb-6">
              &ldquo;{TESTIMONIALS[active].quote}&rdquo;
            </p>
            <div>
              <p className="font-display font-semibold text-deep-forest">{TESTIMONIALS[active].name}</p>
              <p className="font-body text-sm text-slate">{TESTIMONIALS[active].role}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button onClick={prev} className="w-10 h-10 rounded-full border border-light-grey flex items-center justify-center text-slate hover:bg-cream transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === active ? 'bg-sunset w-8' : 'bg-light-grey'}`}
            />
          ))}
        </div>
        <button onClick={next} className="w-10 h-10 rounded-full border border-light-grey flex items-center justify-center text-slate hover:bg-cream transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function GroupBooking() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', club: '',
    country: '', groupSize: '', city: '', building: '',
    checkIn: '', checkOut: '', roomPref: '', shuttle: '',
    requests: '', agreeComms: false, confirmGroup: false
  })

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  /* Steps data */
  const steps = [
    { number: '01', icon: Mail, title: 'Submit Your Enquiry', description: "Fill out the group booking form with your team details, estimated group size, and preferred dates. Takes 3 minutes." },
    { number: '02', icon: Receipt, title: 'Get Your Custom Quote', description: "Our team responds within 24 hours with a tailored proposal, including building options, pricing tiers, and shuttle arrangements." },
    { number: '03', icon: Video, title: 'Virtual Building Tour', description: "Schedule a live video walkthrough of your reserved building. See every room, bathroom, and common area before you commit." },
    { number: '04', icon: Lock, title: 'Confirm & Lock Your Rate', description: "Sign the group agreement with a 25% deposit. Your building is reserved exclusively for your fans. Balance due 30 days before arrival." },
  ]

  /* Pricing tiers */
  const tiers = [
    {
      badge: 'Fan Squad', price: '$25', period: '/person/night', savings: 'Save 15% vs. individual booking',
      features: ['Entire building reserved', 'Shared shuttle to stadium', 'Group check-in (dedicated desk)', 'Building concierge', 'Common area access'],
      cta: 'Enquire Now', ctaStyle: 'secondary' as const
    },
    {
      badge: "Supporters' Club", price: '$20', period: '/person/night', savings: 'Save 25% vs. individual booking',
      features: ['Everything in Fan Squad', 'Private shuttle (direct)', 'Branded common area (banners allowed)', 'Priority room selection', 'Weekly group coordination call', 'Airport pickup coordination'],
      cta: 'Get Your Quote', ctaStyle: 'primary' as const
    },
    {
      badge: 'Mega Delegation', price: '$15', period: '/person/night', savings: 'Save 35% vs. individual booking',
      features: ['Everything in Supporters\' Club', 'Multiple adjacent buildings', 'Private security detail option', 'Dedicated Kitufu liaison', 'Custom catering coordination', 'UTB fast-track certification'],
      cta: 'Contact for Custom Quote', ctaStyle: 'secondary' as const
    },
  ]

  /* Why Kitufu features */
  const whyFeatures = [
    { icon: Users, title: 'Exclusive Buildings', desc: 'Your group gets the entire building. No strangers, no conflicts — just your fans.' },
    { icon: Bus, title: 'Private Shuttles', desc: 'Direct transport to the stadium on your schedule. No waiting, no sharing with other groups.' },
    { icon: Shield, title: 'Guaranteed Security', desc: 'Perimeter fencing, 24/7 guards, CCTV — all UTB and CAF compliant.' },
    { icon: Check, title: 'UTB Certified', desc: 'Every building is certified by Uganda Tourism Board. International standards, local warmth.' },
    { icon: Receipt, title: 'Transparent Pricing', desc: 'No hidden fees. Your quote includes everything — accommodation, shuttle, service fee, taxes.' },
    { icon: Phone, title: 'Dedicated Support', desc: 'A dedicated Kitufu liaison for your group from booking to check-out.' },
  ]

  return (
    <div className="min-h-[100dvh]">
      {/* ═══════════ Section 1: Hero ═══════════ */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: 'linear' }}
          className="absolute inset-0"
        >
          <img
            src="/supporters-club.jpg"
            alt="Supporters club"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(26,26,46,0.75) 0%, rgba(27,67,50,0.85) 100%)' }} />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 container-kitufu text-center py-20">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-body font-medium text-xs text-savanna-gold uppercase tracking-[0.15em]"
          >
            For Supporters&apos; Clubs &amp; Large Groups
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: easeSmooth }}
            className="font-display font-bold text-display-xl text-white mt-4 max-w-4xl mx-auto"
          >
            Buy Out a Building for Your Fans
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: easeSmooth }}
            className="font-body text-lg text-white/85 max-w-[650px] mx-auto mt-5 leading-relaxed"
          >
            Traveling with 50, 100, or 200+ supporters? Reserve an entire Kitufu Residence exclusively for your group. Private shuttles, dedicated staff, and group rates that make sense.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, ease: easeBounce }}
            className="flex flex-wrap items-center justify-center gap-4 mt-8"
          >
            <a href="#enquiry-form" className="btn-sunset-gradient text-base px-8 py-4">
              Get Your Group Quote
            </a>
            <button className="flex items-center gap-2 text-white font-body font-medium hover:text-savanna-gold transition-colors">
              <div className="w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center">
                <Play size={16} fill="currentColor" />
              </div>
              Watch Video
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="flex flex-wrap items-center justify-center gap-10 md:gap-16 mt-12"
          >
            {[
              { value: '200+', label: 'Max Group Size' },
              { value: '35%', label: 'Group Savings' },
              { value: '24h', label: 'Quote Response' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="font-display font-bold text-2xl md:text-3xl text-savanna-gold">{stat.value}</div>
                <div className="font-body text-xs text-white/70 mt-1 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ Section 2: How It Works ═══════════ */}
      <section className="bg-white">
        <div className="container-kitufu section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeSmooth }}
            className="text-center mb-12"
          >
            <span className="font-body font-medium text-xs text-sunset uppercase tracking-wider">The Process</span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest mt-2">Group Booking in 4 Steps</h2>
            <p className="font-body text-lg text-slate mt-3">From enquiry to check-in — we handle everything</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {steps.map((step, i) => (
              <StepCard key={step.number} {...step} index={i} />
            ))}
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-0.5 border-t-2 border-dashed border-light-grey" />
          </div>
        </div>
      </section>

      {/* ═══════════ Section 3: Pricing Tiers ═══════════ */}
      <section className="bg-warm-sand">
        <div className="container-kitufu section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeSmooth }}
            className="text-center mb-12"
          >
            <span className="font-body font-medium text-xs text-sunset uppercase tracking-wider">Pricing</span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest mt-2">Group Rates That Scale</h2>
            <p className="font-body text-lg text-slate mt-3">The more fans you bring, the less you pay per person</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {tiers.map((tier, i) => (
              <PricingCard key={tier.badge} tier={tier} featured={i === 1} index={i} />
            ))}
          </div>

          <p className="text-center font-body text-xs text-slate mt-8">
            All prices in USD. Minimum 3-night stay. Deposit: 25% to reserve, balance due 30 days before arrival.
          </p>
        </div>
      </section>

      {/* ═══════════ Section 4: Available Buildings ═══════════ */}
      <section className="bg-white">
        <div className="container-kitufu section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeSmooth }}
            className="text-center mb-12"
          >
            <span className="font-body font-medium text-xs text-sunset uppercase tracking-wider">Available Now</span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest mt-2">Buildings Ready for Group Buy-Out</h2>
            <p className="font-body text-lg text-slate mt-3">These Kitufu Residences are available for exclusive group reservations</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BUILDINGS.map((b, i) => (
              <BuildingCard key={b.id} building={b} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Section 5: Group Enquiry Form ═══════════ */}
      <section id="enquiry-form" className="bg-deep-forest">
        <div className="container-kitufu section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: easeSmooth }}
            >
              <span className="font-body font-medium text-xs text-savanna-gold uppercase tracking-wider">Get Started</span>
              <h2 className="font-display font-bold text-display-lg text-white mt-2">Request Your Group Quote</h2>
              <p className="font-body text-white/80 mt-3 mb-8">
                Fill in the details and our team will respond within 24 hours with a tailored proposal.
              </p>

              <form className="space-y-5" onSubmit={e => { e.preventDefault() }}>
                {/* Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Your Name *</label>
                    <input
                      type="text" placeholder="Chinedu Okafor"
                      value={formData.name} onChange={e => updateField('name', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-sunset focus:bg-white/[0.12] outline-none transition-colors font-body text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Email Address *</label>
                    <input
                      type="email" placeholder="chinedu@supportersclub.ng"
                      value={formData.email} onChange={e => updateField('email', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-sunset focus:bg-white/[0.12] outline-none transition-colors font-body text-sm"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Phone / WhatsApp *</label>
                    <input
                      type="tel" placeholder="+234 800 000 0000"
                      value={formData.phone} onChange={e => updateField('phone', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-sunset focus:bg-white/[0.12] outline-none transition-colors font-body text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Supporters&apos; Club or Organization</label>
                    <input
                      type="text" placeholder="Nigeria Super Eagles Fan Club"
                      value={formData.club} onChange={e => updateField('club', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-sunset focus:bg-white/[0.12] outline-none transition-colors font-body text-sm"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Your Country *</label>
                    <select
                      value={formData.country} onChange={e => updateField('country', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm appearance-none"
                    >
                      <option value="" className="bg-deep-forest">Select country</option>
                      {COUNTRIES.map(c => <option key={c} value={c} className="bg-deep-forest">{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Estimated Group Size *</label>
                    <select
                      value={formData.groupSize} onChange={e => updateField('groupSize', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm appearance-none"
                    >
                      <option value="" className="bg-deep-forest">Select size</option>
                      {GROUP_SIZES.map(s => <option key={s} value={s} className="bg-deep-forest">{s} fans</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Preferred City *</label>
                    <select
                      value={formData.city} onChange={e => updateField('city', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm appearance-none"
                    >
                      <option value="" className="bg-deep-forest">Select city</option>
                      <option value="Kampala" className="bg-deep-forest">Kampala</option>
                      <option value="Hoima" className="bg-deep-forest">Hoima</option>
                      <option value="Either" className="bg-deep-forest">Either</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Preferred Building (optional)</label>
                    <select
                      value={formData.building} onChange={e => updateField('building', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm appearance-none"
                    >
                      {PREFERRED_BUILDINGS.map(b => <option key={b} value={b} className="bg-deep-forest">{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Check-in Date *</label>
                    <input
                      type="date"
                      value={formData.checkIn} onChange={e => updateField('checkIn', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Check-out Date *</label>
                    <input
                      type="date"
                      value={formData.checkOut} onChange={e => updateField('checkOut', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm"
                    />
                  </div>
                </div>

                {/* Row 6 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Room Preference</label>
                    <select
                      value={formData.roomPref} onChange={e => updateField('roomPref', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm appearance-none"
                    >
                      {ROOM_PREFERENCES.map(r => <option key={r} value={r} className="bg-deep-forest">{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-body text-xs text-white/70 mb-1.5">Shuttle Service</label>
                    <select
                      value={formData.shuttle} onChange={e => updateField('shuttle', e.target.value)}
                      className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white focus:border-sunset outline-none transition-colors font-body text-sm appearance-none"
                    >
                      {SHUTTLE_OPTIONS.map(s => <option key={s} value={s} className="bg-deep-forest">{s}</option>)}
                    </select>
                  </div>
                </div>

                {/* Row 7 */}
                <div>
                  <label className="block font-body text-xs text-white/70 mb-1.5">Special Requests or Questions</label>
                  <textarea
                    rows={4}
                    placeholder="Dietary requirements, accessibility needs, banner hanging, etc."
                    value={formData.requests} onChange={e => updateField('requests', e.target.value)}
                    className="w-full bg-white/[0.08] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 focus:border-sunset focus:bg-white/[0.12] outline-none transition-colors font-body text-sm resize-none"
                  />
                </div>

                {/* Row 8: Checkboxes */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreeComms}
                      onChange={e => updateField('agreeComms', e.target.checked)}
                      className="mt-1 accent-sunset w-4 h-4"
                    />
                    <span className="font-body text-sm text-white/70">
                      I agree to receive communications about my group booking enquiry
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.confirmGroup}
                      onChange={e => updateField('confirmGroup', e.target.checked)}
                      className="mt-1 accent-sunset w-4 h-4"
                    />
                    <span className="font-body text-sm text-white/70">
                      I confirm this enquiry is for a group of 20 or more fans
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <button type="submit" className="btn-sunset-gradient w-full py-4 text-base">
                  Submit Group Enquiry
                </button>
                <p className="text-center font-body text-xs text-white/60 mt-3">
                  Or email us directly: <span className="text-savanna-gold">groups@kitufu.ug</span>
                </p>
              </form>
            </motion.div>

            {/* Right: Why Kitufu */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2, ease: easeSmooth }}
              className="lg:pl-8"
            >
              <h3 className="font-display font-bold text-2xl text-white mb-6">Why Groups Choose Kitufu</h3>
              <div className="space-y-0">
                {whyFeatures.map((f, i) => (
                  <div key={f.title}>
                    <div className="flex gap-4 py-5">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        <f.icon size={20} className="text-savanna-gold" />
                      </div>
                      <div>
                        <h4 className="font-body font-medium text-white">{f.title}</h4>
                        <p className="font-body text-sm text-white/70 mt-1 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                    {i < whyFeatures.length - 1 && <div className="h-px bg-white/10" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ Section 6: FAQ ═══════════ */}
      <section className="bg-white">
        <div className="container-kitufu section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeSmooth }}
            className="text-center mb-10"
          >
            <span className="font-body font-medium text-xs text-sunset uppercase tracking-wider">FAQ</span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest mt-2">Group Booking Questions</h2>
          </motion.div>

          <div className="max-w-[800px] mx-auto">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Section 7: Testimonials ═══════════ */}
      <section className="bg-warm-sand">
        <div className="container-kitufu section-padding">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: easeSmooth }}
            className="text-center mb-10"
          >
            <span className="font-body font-medium text-xs text-sunset uppercase tracking-wider">Group Stories</span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest mt-2">What Group Organizers Say</h2>
          </motion.div>

          <TestimonialCarousel />
        </div>
      </section>
    </div>
  )
}
