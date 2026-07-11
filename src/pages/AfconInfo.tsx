import { useRef, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import type { Variants } from 'framer-motion'
import {
  Globe,
  Trophy,
  MapPin,
  Users,
  Check,
  Bus,
  Clock,
  ShieldCheck,
  Star,
  Download,
  Calendar,
  Shield,
  CreditCard,
  Navigation,
  Heart,
  Sun,
  UtensilsCrossed,
  AlertCircle,
} from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

/* ─────────────────────── easing / animation tokens ─────────────────────── */
const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number]
const easeBounce = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: easeSmooth },
  }),
}



/* ─────────────────────── reusable scroll-reveal wrapper ────────────────── */
function ScrollReveal({
  children,
  className = '',
  variants = fadeUp,
  custom = 0,
}: {
  children: React.ReactNode
  className?: string
  variants?: Variants
  custom?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      custom={custom}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─────────────────────── animated counter hook ─────────────────────────── */
function useAnimatedCounter(target: number, duration = 2, inView = false) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, target, { duration, ease: 'easeOut' })
    const unsub = rounded.on('change', (v) => setDisplay(String(v)))
    return () => {
      controls.stop()
      unsub()
    }
  }, [inView, target, duration, count, rounded])

  return display
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background image with Ken Burns */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'linear' }}
        className="absolute inset-0"
      >
        <img
          src="/hero-bg.jpg"
          alt="Uganda landscape"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(26,26,46,0.6) 0%, rgba(27,67,50,0.8) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-kitufu text-center py-24">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-body font-medium text-xs tracking-[0.15em] uppercase text-savanna-gold mb-4"
        >
          AFRICA CUP OF NATIONS
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: easeSmooth }}
          className="font-display font-bold text-display-xl text-white mb-6"
        >
          AFCON 2027 Comes to Uganda
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: easeSmooth }}
          className="font-body text-lg text-white/85 max-w-[600px] mx-auto mb-8 leading-relaxed"
        >
          The biggest football tournament in Africa. 24 nations. One trophy. An
          unforgettable summer in the Pearl of Africa.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: easeBounce }}
          className="inline-block mb-8"
          style={{
            background: 'rgba(255,107,53,0.9)',
            borderRadius: '8px',
            padding: '12px 24px',
          }}
        >
          <span className="font-display font-semibold text-white">
            June 15 — August 2, 2027
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5, ease: easeSmooth }}
          className="flex flex-wrap items-center justify-center gap-4 mb-10"
        >
          <Link to="/listings" className="btn-sunset-gradient inline-block">
            Find Accommodation
          </Link>
          <a
            href="#schedule"
            className="font-body font-medium text-white underline underline-offset-4 hover:text-savanna-gold transition-colors"
          >
            View Match Schedule
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="font-body text-xs text-white/60"
        >
          Official Accommodation Partner of AFCON 2027
        </motion.p>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 2 — TOURNAMENT OVERVIEW (4 stat cards + format text)
   ═══════════════════════════════════════════════════════════════════════════ */
const stats = [
  { icon: Globe, number: 24, suffix: '', label: 'African Nations' },
  { icon: Trophy, number: 52, suffix: '', label: 'Total Matches' },
  { icon: MapPin, number: 2, suffix: '', label: 'Venues in Uganda' },
  { icon: Users, number: 50, suffix: 'K+', label: 'Expected Visitors' },
]

function StatCard({
  icon: Icon,
  number,
  suffix,
  label,
  index,
}: {
  icon: typeof Globe
  number: number
  suffix: string
  label: string
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const display = useAnimatedCounter(number, 2, inView)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: easeSmooth }}
      className="bg-warm-sand rounded-xl p-6 text-center"
    >
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-depth/10 mb-4">
        <Icon size={20} className="text-teal-depth" />
      </div>
      <div className="font-display font-bold text-[2.5rem] text-sunset mb-1 leading-none">
        {display}
        {suffix}
      </div>
      <div className="font-body text-slate">{label}</div>
    </motion.div>
  )
}

function TournamentOverviewSection() {
  return (
    <section className="bg-white section-padding">
      <div className="container-kitufu">
        {/* Section header */}
        <ScrollReveal className="text-center mb-12">
          <p className="font-body font-medium text-xs tracking-[0.1em] uppercase text-sunset mb-3">
            THE TOURNAMENT
          </p>
          <h2 className="font-display font-bold text-display-lg text-deep-forest">
            Everything You Need to Know
          </h2>
        </ScrollReveal>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>

        {/* Tournament Format text */}
        <ScrollReveal>
          <h3 className="font-display font-bold text-2xl text-deep-forest mb-6">
            Tournament Format
          </h3>
        </ScrollReveal>

        <div className="max-w-4xl space-y-4 mb-10">
          <ScrollReveal custom={0}>
            <p className="font-body text-lg text-slate leading-relaxed">
              AFCON 2027 will feature 24 national teams competing across 52
              matches over seven weeks. The tournament begins with a group stage
              where teams are divided into six groups of four. The top two teams
              from each group, plus the four best third-placed teams, advance to
              the Round of 16.
            </p>
          </ScrollReveal>
          <ScrollReveal custom={1}>
            <p className="font-body text-lg text-slate leading-relaxed">
              The knockout stage is single-elimination: Round of 16,
              Quarter-Finals, Semi-Finals, and the Final on August 2, 2027.
              Uganda, as co-host with Tanzania, qualifies automatically and will
              play its group stage matches at Mandela National Stadium in
              Kampala.
            </p>
          </ScrollReveal>
          <ScrollReveal custom={2}>
            <p className="font-body text-lg text-slate leading-relaxed">
              Uganda will host Group A matches, two Round of 16 fixtures, one
              Quarter-Final, and potentially a Semi-Final if the national team
              progresses. Hoima City Stadium will host Group C matches and one
              Round of 16 game.
            </p>
          </ScrollReveal>
        </div>

        {/* Co-host note card */}
        <ScrollReveal>
          <div className="bg-[#F0FAF8] rounded-xl p-5 max-w-4xl">
            <h4 className="font-display font-semibold text-hoima-blue mb-2">
              Uganda is co-hosting with Tanzania
            </h4>
            <p className="font-body text-slate mb-3">
              Tanzania will host matches in Dar es Salaam and Arusha. If
              you&apos;re following your team across both countries, check out
              our partner accommodations in Tanzania.
            </p>
            <span className="font-body font-medium text-sm text-teal-depth underline underline-offset-4 cursor-pointer hover:text-deep-forest transition-colors">
              Learn about Tanzania →
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 3 — HOST CITIES (Split showcase)
   ═══════════════════════════════════════════════════════════════════════════ */
function HostCitiesSection() {
  return (
    <section className="flex flex-col lg:flex-row min-h-[550px]">
      {/* Kampala */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: easeSmooth }}
        className="relative lg:w-1/2 min-h-[400px] lg:min-h-[550px] flex items-end overflow-hidden group"
      >
        <img
          src="/stadium-mandela.jpg"
          alt="Mandela National Stadium in Kampala"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 dark-overlay" />
        <div className="relative z-10 p-8 lg:p-12 w-full">
          <span
            className="inline-block font-body font-medium text-xs tracking-[0.1em] uppercase px-3 py-1 rounded mb-4"
            style={{ background: '#E07A5F', color: '#fff' }}
          >
            KAMPALA
          </span>
          <h3 className="font-display font-bold text-[2.5rem] text-white mb-4 leading-tight">
            Kampala
          </h3>
          <p className="font-body text-white/80 mb-6 max-w-md leading-relaxed">
            Uganda&apos;s vibrant capital city. Home to Mandela National
            Stadium, the country&apos;s largest venue. Kampala offers nightlife,
            markets, restaurants, and the energy of a city ready to host Africa.
          </p>
          <ul className="space-y-2 mb-6 text-white/80 font-body text-sm">
            <li className="flex items-center gap-2">
              <Users size={14} className="text-savanna-gold" /> Population: 1.7
              million
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-savanna-gold" /> Mandela
              Stadium capacity: 45,000
            </li>
            <li className="flex items-center gap-2">
              <Navigation size={14} className="text-savanna-gold" /> Distance
              from airport: 35 km
            </li>
            <li className="flex items-center gap-2">
              <Star size={14} className="text-savanna-gold" /> Known as: &quot;The
              City That Never Sleeps&quot;
            </li>
          </ul>
          <Link
            to="/listings"
            className="inline-block bg-white text-deep-forest font-body font-semibold text-sm px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
          >
            Explore Kampala Residences
          </Link>
        </div>
      </motion.div>

      {/* Hoima */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: 0.15, ease: easeSmooth }}
        className="relative lg:w-1/2 min-h-[400px] lg:min-h-[550px] flex items-end overflow-hidden group"
      >
        <img
          src="/stadium-hoima.jpg"
          alt="Hoima City Stadium"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 dark-overlay" />
        <div className="relative z-10 p-8 lg:p-12 w-full">
          <span
            className="inline-block font-body font-medium text-xs tracking-[0.1em] uppercase px-3 py-1 rounded mb-4"
            style={{ background: '#3D5A80', color: '#fff' }}
          >
            HOIMA
          </span>
          <h3 className="font-display font-bold text-[2.5rem] text-white mb-4 leading-tight">
            Hoima
          </h3>
          <p className="font-body text-white/80 mb-6 max-w-md leading-relaxed">
            The oil city of Uganda and a rising star in Ugandan football. Hoima
            City Stadium is brand new, and the city offers a more relaxed,
            authentic Ugandan experience away from the capital&apos;s bustle.
          </p>
          <ul className="space-y-2 mb-6 text-white/80 font-body text-sm">
            <li className="flex items-center gap-2">
              <Users size={14} className="text-savanna-gold" /> Population:
              120,000
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-savanna-gold" /> Hoima Stadium
              capacity: 20,000
            </li>
            <li className="flex items-center gap-2">
              <Star size={14} className="text-savanna-gold" /> Known for: Oil
              industry, Bunyoro culture
            </li>
            <li className="flex items-center gap-2">
              <Heart size={14} className="text-savanna-gold" /> Vibe:
              Authentic, welcoming, less crowded
            </li>
          </ul>
          <Link
            to="/listings"
            className="inline-block bg-white text-deep-forest font-body font-semibold text-sm px-6 py-3 rounded-lg hover:bg-white/90 transition-colors"
          >
            Explore Hoima Residences
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 4 — STADIUMS
   ═══════════════════════════════════════════════════════════════════════════ */
const stadiums = [
  {
    image: '/stadium-mandela.jpg',
    name: 'Mandela National Stadium',
    location: 'Namboole, Kampala',
    capacity: '45,000 seats',
    matches: [
      'Group A matches (Uganda\'s group)',
      '2x Round of 16',
      '1x Quarter-Final',
      '1x Semi-Final (if Uganda progresses)',
    ],
    shuttle: 'Shuttle from all Kampala Kitufu Residences',
  },
  {
    image: '/stadium-hoima.jpg',
    name: 'Hoima City Stadium',
    location: 'Hoima City Center',
    capacity: '20,000 seats',
    matches: ['Group C matches', '1x Round of 16'],
    shuttle: 'Shuttle from all Hoima Kitufu Residences',
  },
]

function StadiumsSection() {
  return (
    <section className="bg-white section-padding">
      <div className="container-kitufu">
        <ScrollReveal className="text-center mb-12">
          <p className="font-body font-medium text-xs tracking-[0.1em] uppercase text-sunset mb-3">
            THE VENUES
          </p>
          <h2 className="font-display font-bold text-display-lg text-deep-forest">
            Where the Magic Happens
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8">
          {stadiums.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: easeSmooth }}
              className="bg-white border border-light-grey rounded-xl overflow-hidden group"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-6">
                <h3 className="font-display font-bold text-2xl text-deep-forest mb-1">
                  {s.name}
                </h3>
                <div className="flex items-center gap-1 text-slate font-body text-sm mb-3">
                  <MapPin size={14} className="text-teal-depth" />
                  {s.location}
                </div>
                <span
                  className="inline-block font-body font-medium text-xs px-3 py-1 rounded-full mb-4"
                  style={{ background: '#FF6B35', color: '#fff' }}
                >
                  {s.capacity}
                </span>

                <div className="space-y-2 mb-4">
                  {s.matches.map((m) => (
                    <div
                      key={m}
                      className="flex items-center gap-2 font-body text-sm text-slate"
                    >
                      <Check size={14} className="text-teal-depth shrink-0" />
                      {m}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 font-body text-sm text-teal-depth mb-3">
                  <Bus size={14} />
                  {s.shuttle}
                </div>

                <span className="font-body font-medium text-sm text-teal-depth underline underline-offset-4 cursor-pointer hover:text-deep-forest transition-colors">
                  View on Map →
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 5 — KITUFU CONCEPT
   ═══════════════════════════════════════════════════════════════════════════ */
const conceptCards = [
  {
    icon: Globe,
    title: 'Inspired by Qatar 2022',
    description:
      "Qatar converted 10,000+ empty apartments into fan housing. We learned from their successes and failures to create a better experience for African fans.",
  },
  {
    icon: Clock,
    title: 'Furnished in 72 Hours',
    description:
      "Our standardized 'Room Kit' — bed, linens, side table, portable AC, safe — allows us to transform an empty building in just three days. Clean, fast, reversible.",
  },
  {
    icon: ShieldCheck,
    title: 'UTB Certified Standards',
    description:
      'Security (fencing, guards, CCTV). Sanitation (containerized bathrooms). Safety (fire escapes, extinguishers). Service (concierge desk, check-in). Every box checked.',
  },
]

function KitufuConceptSection() {
  return (
    <section className="bg-deep-forest section-padding">
      <div className="container-kitufu">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left column — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: easeSmooth }}
          >
            <p className="font-body font-medium text-xs tracking-[0.1em] uppercase text-savanna-gold mb-3">
              THE KITUFU STORY
            </p>
            <h2 className="font-display font-bold text-display-lg text-white mb-8">
              Built for Fans, by People Who Care
            </h2>

            <div className="space-y-5 mb-8">
              <p className="font-body text-lg text-white/85 leading-relaxed">
                Kitufu means &quot;Together&quot; in Swahili. And that&apos;s exactly what
                AFCON 2027 is about — Africa coming together through football.
              </p>
              <p className="font-body text-lg text-white/85 leading-relaxed">
                We created Kitufu Residences because we saw a problem: Uganda
                needs 25,000+ additional rooms during AFCON, and traditional
                hotels can&apos;t meet that demand. Our solution? Convert empty
                buildings into clean, secure, affordable fan accommodation —
                fully certified by the Uganda Tourism Board.
              </p>
              <p className="font-body text-lg text-white/85 leading-relaxed">
                Inspired by Qatar&apos;s 2022 World Cup model, we work with building
                owners to &quot;kit&quot; their properties in just 72 hours — beds, linens,
                AC, WiFi, security. After the tournament, we &quot;de-kit&quot; and the
                building returns to its original use.
              </p>
              <p className="font-body text-lg text-white/85 leading-relaxed">
                Every Kitufu Residence meets the Four S&apos;s: Security, Sanitation,
                Safety, and Service. Because African fans deserve world-class
                accommodation.
              </p>
            </div>

            <Link to="/listings" className="btn-sunset-gradient inline-block">
              Browse All Residences
            </Link>
          </motion.div>

          {/* Right column — concept cards */}
          <div className="space-y-6">
            {conceptCards.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.12,
                  ease: easeSmooth,
                }}
                className="rounded-xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <card.icon
                  size={32}
                  className="text-savanna-gold mb-4"
                />
                <h4 className="font-display font-semibold text-h4 text-white mb-2">
                  {card.title}
                </h4>
                <p className="font-body text-sm text-white/70 leading-relaxed">
                  {card.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 6 — UGANDA TOURISM GUIDE
   ═══════════════════════════════════════════════════════════════════════════ */
const tourismCards = [
  {
    title: 'Wildlife Safaris',
    description:
      'One of Africa\'s most powerful waterfalls, just 3 hours from Kampala. Spot lions, elephants, and giraffes on a safari between match days.',
    tag: '3h from Kampala',
    color: 'from-amber-600 to-orange-700',
    icon: Globe,
    bgImage: '/hero-bg.jpg',
  },
  {
    title: 'Source of the Nile',
    description:
      "The world's largest tropical lake. Take a boat trip, visit the Ssese Islands, or enjoy fresh tilapia at a lakeside restaurant in Entebbe.",
    tag: '1h from Kampala',
    color: 'from-blue-500 to-cyan-600',
    icon: Navigation,
    bgImage: '/property-kampala-1.jpg',
  },
  {
    title: 'Mountain Gorillas',
    description:
      'Come face-to-face with endangered mountain gorillas in their natural habitat. A once-in-a-lifetime experience that makes your AFCON trip unforgettable.',
    tag: '8h from Kampala',
    color: 'from-emerald-600 to-green-700',
    icon: Heart,
    bgImage: '/football-fans.jpg',
  },
  {
    title: 'Cultural Heritage',
    description:
      "From Kabalagala's street food to Kololo's rooftop bars, Kampala's nightlife is legendary. Safe, vibrant, and full of character. Perfect for post-match celebrations.",
    tag: 'In Kampala',
    color: 'from-purple-600 to-violet-700',
    icon: Star,
    bgImage: '/supporters-club.jpg',
  },
]

function TourismSection() {
  return (
    <section className="bg-white section-padding">
      <div className="container-kitufu">
        <ScrollReveal className="text-center mb-12">
          <p className="font-body font-medium text-xs tracking-[0.1em] uppercase text-sunset mb-3">
            DISCOVER UGANDA
          </p>
          <h2 className="font-display font-bold text-display-lg text-deep-forest mb-4">
            The Pearl of Africa Awaits
          </h2>
          <p className="font-body text-lg text-slate max-w-2xl mx-auto">
            Make the most of your AFCON trip. Explore Uganda&apos;s incredible
            attractions between matches.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 gap-6">
          {tourismCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: easeSmooth,
              }}
              className="bg-white border border-light-grey rounded-xl overflow-hidden group hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={card.bgImage}
                  alt={card.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-30`} />
                <div className="absolute top-3 left-3">
                  <span className="inline-block font-body font-medium text-xs px-2.5 py-1 rounded bg-white/90 text-teal-depth">
                    {card.tag}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-h3 text-deep-forest mb-2">
                  {card.title}
                </h3>
                <p className="font-body text-sm text-slate leading-relaxed">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 7 — MATCH SCHEDULE PREVIEW
   ═══════════════════════════════════════════════════════════════════════════ */
const scheduleData = [
  {
    date: 'Jun 15, 2027',
    match: 'Opening Ceremony + Uganda vs. TBD',
    venue: 'Mandela Stadium',
    time: '7:00 PM',
    uganda: true,
    knockout: false,
  },
  {
    date: 'Jun 18, 2027',
    match: 'Group A Match 2',
    venue: 'Mandela Stadium',
    time: '2:00 PM',
    uganda: false,
    knockout: false,
  },
  {
    date: 'Jun 18, 2027',
    match: 'Group A Match 3',
    venue: 'Mandela Stadium',
    time: '7:00 PM',
    uganda: false,
    knockout: false,
  },
  {
    date: 'Jun 21, 2027',
    match: 'Group A Match 4',
    venue: 'Mandela Stadium',
    time: '2:00 PM',
    uganda: false,
    knockout: false,
  },
  {
    date: 'Jun 24, 2027',
    match: 'Group C Match 2',
    venue: 'Hoima Stadium',
    time: '4:00 PM',
    uganda: false,
    knockout: false,
  },
  {
    date: 'Jun 27, 2027',
    match: 'Group A Match 6',
    venue: 'Mandela Stadium',
    time: '7:00 PM',
    uganda: false,
    knockout: false,
  },
  {
    date: 'Jul 2, 2027',
    match: 'Round of 16 — Match 1',
    venue: 'Mandela Stadium',
    time: '7:00 PM',
    uganda: false,
    knockout: true,
  },
  {
    date: 'Jul 5, 2027',
    match: 'Round of 16 — Match 4',
    venue: 'Hoima Stadium',
    time: '4:00 PM',
    uganda: false,
    knockout: true,
  },
  {
    date: 'Jul 9, 2027',
    match: 'Quarter-Final 1',
    venue: 'Mandela Stadium',
    time: '7:00 PM',
    uganda: false,
    knockout: true,
  },
  {
    date: 'Jul 16, 2027',
    match: 'Semi-Final 1',
    venue: 'Mandela Stadium',
    time: '7:00 PM',
    uganda: false,
    knockout: true,
  },
]

function ScheduleSection() {
  return (
    <section id="schedule" className="bg-warm-sand section-padding">
      <div className="container-kitufu">
        <ScrollReveal className="text-center mb-12">
          <p className="font-body font-medium text-xs tracking-[0.1em] uppercase text-sunset mb-3">
            MATCH SCHEDULE
          </p>
          <h2 className="font-display font-bold text-display-lg text-deep-forest mb-3">
            Key Matches in Uganda
          </h2>
          <p className="font-body text-sm text-slate">
            Subject to final CAF draw — updated as fixtures are confirmed
          </p>
        </ScrollReveal>

        {/* Desktop table */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-light-grey mb-8">
          <Table>
            <TableHeader>
              <TableRow className="bg-deep-forest hover:bg-deep-forest">
                <TableHead className="text-white font-body font-semibold">
                  Date
                </TableHead>
                <TableHead className="text-white font-body font-semibold">
                  Match
                </TableHead>
                <TableHead className="text-white font-body font-semibold">
                  Venue
                </TableHead>
                <TableHead className="text-white font-body font-semibold">
                  Time
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduleData.map((row, i) => (
                <motion.tr
                  key={`${row.date}-${row.match}`}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: i * 0.04,
                    ease: easeSmooth,
                  }}
                  className={`border-b border-light-grey transition-colors hover:bg-white/50 ${
                    row.uganda
                      ? 'bg-[rgba(255,107,53,0.05)] border-l-[3px] border-l-sunset'
                      : ''
                  }`}
                >
                  <TableCell className="font-body text-deep-forest font-medium">
                    {row.date}
                  </TableCell>
                  <TableCell className="font-body text-deep-forest">
                    <div className="flex items-center gap-2">
                      {row.knockout && (
                        <Star
                          size={14}
                          className="text-savanna-gold shrink-0"
                          fill="currentColor"
                        />
                      )}
                      {row.match}
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-slate">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-teal-depth" />
                      {row.venue}
                    </div>
                  </TableCell>
                  <TableCell className="font-body text-deep-forest">
                    {row.time}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3 mb-8">
          {scheduleData.map((row, i) => (
            <motion.div
              key={`${row.date}-${row.match}`}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.04,
                ease: easeSmooth,
              }}
              className={`bg-white rounded-lg p-4 border border-light-grey ${
                row.uganda ? 'border-l-[3px] border-l-sunset' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-body font-medium text-sm text-deep-forest">
                  {row.date}
                </span>
                <span className="font-body text-xs text-deep-forest">
                  {row.time}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                {row.knockout && (
                  <Star
                    size={12}
                    className="text-savanna-gold shrink-0"
                    fill="currentColor"
                  />
                )}
                <span className="font-body text-sm text-deep-forest">
                  {row.match}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate">
                <MapPin size={12} className="text-teal-depth" />
                {row.venue}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA buttons */}
        <ScrollReveal className="flex flex-wrap justify-center gap-4">
          <button className="btn-secondary inline-flex items-center gap-2">
            <Download size={16} />
            Download Full Schedule (PDF)
          </button>
          <button className="inline-flex items-center gap-2 font-body font-medium text-sm text-teal-depth underline underline-offset-4 hover:text-deep-forest transition-colors">
            <Calendar size={16} />
            Add to Google Calendar
          </button>
        </ScrollReveal>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 8 — TRAVEL TIPS
   ═══════════════════════════════════════════════════════════════════════════ */
const travelTips = [
  {
    icon: Globe,
    title: 'Visa Requirements',
    content:
      'Most African nationals can obtain a visa on arrival in Uganda ($50 USD). Apply for an East African Tourist Visa ($100) if you plan to visit Tanzania too. Ensure your passport is valid for at least 6 months beyond your travel dates.',
  },
  {
    icon: CreditCard,
    title: 'Currency & Payments',
    content:
      'The Ugandan Shilling (UGX) is the local currency. USD is widely accepted at Kitufu Residences and major venues. Mobile money (MTN Mobile Money, Airtel Money) is extremely popular — download the apps before you arrive. Credit cards are accepted at most restaurants in Kampala.',
  },
  {
    icon: Navigation,
    title: 'Getting Around',
    content:
      "Boda bodas (motorcycle taxis) are everywhere but use ride-hailing apps like SafeBoda or Bolt for safety. Matatus (shared vans) are the cheapest option. For AFCON, we strongly recommend using Kitufu's shuttle service or Uber/Bolt.",
  },
  {
    icon: Shield,
    title: 'Health & Safety',
    content:
      'Yellow fever vaccination is required. Malaria prophylaxis is recommended. Drink bottled water. Kampala is generally safe for tourists, but use common sense — avoid displaying valuables, stick to well-lit areas at night.',
  },
  {
    icon: Globe,
    title: 'Language',
    content:
      "English is the official language and widely spoken. Swahili is also common. Learning a few Luganda phrases ('Wasuze otya?' for 'How are you?') will earn you smiles everywhere.",
  },
  {
    icon: Sun,
    title: 'Weather',
    content:
      'June-August is dry season in Uganda. Expect 25-30°C (77-86°F) during the day, cooler evenings. Pack light clothing, a light jacket for evenings, sunscreen, and a hat. Rain is unlikely but possible.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Food & Drink',
    content:
      'Try local dishes: matoke (steamed plantain), rolex (chapati + egg roll), luwombo (stew in banana leaves), and fresh tilapia from Lake Victoria. Street food is delicious and safe at busy stalls. Avoid tap water — stick to bottled.',
  },
  {
    icon: AlertCircle,
    title: 'Emergency Contacts',
    content:
      'Police: 999 • Ambulance: 911 • Kitufu Support: +256 700 000 000 (WhatsApp). Save these numbers before you arrive. Each Kitufu Residence also has 24/7 security staff.',
  },
]

function TravelTipsSection() {
  return (
    <section className="bg-white section-padding">
      <div className="container-kitufu">
        <ScrollReveal className="text-center mb-12">
          <p className="font-body font-medium text-xs tracking-[0.1em] uppercase text-sunset mb-3">
            TRAVEL SMART
          </p>
          <h2 className="font-display font-bold text-display-lg text-deep-forest">
            Essential Tips for AFCON Visitors
          </h2>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {travelTips.map((tip, i) => (
              <motion.div
                key={tip.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.05,
                  ease: easeSmooth,
                }}
              >
                <AccordionItem
                  value={`tip-${i}`}
                  className="border border-light-grey rounded-lg px-5 data-[state=open]:border-sunset/30 transition-colors"
                >
                  <AccordionTrigger className="py-4 hover:no-underline cursor-pointer">
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-depth/10 shrink-0">
                        <tip.icon size={16} className="text-teal-depth" />
                      </div>
                      <span className="font-display font-semibold text-base text-deep-forest">
                        {tip.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pl-11">
                    <p className="font-body text-sm text-slate leading-relaxed">
                      {tip.content}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION 9 — FAQ
   ═══════════════════════════════════════════════════════════════════════════ */
const faqItems = [
  {
    question: 'When is AFCON 2027?',
    answer:
      'AFCON 2027 runs from June 15 to August 2, 2027. The opening match is on June 15, and the final is on August 2.',
  },
  {
    question: 'Which cities in Uganda are hosting matches?',
    answer:
      'Uganda is hosting matches in Kampala (Mandela National Stadium) and Hoima (Hoima City Stadium). Tanzania co-hosts in Dar es Salaam and Arusha.',
  },
  {
    question: 'How do I get tickets for AFCON 2027?',
    answer:
      "Tickets will be sold through the official CAF website and authorized vendors. Kitufu Residences does not sell match tickets — we provide accommodation only. We recommend signing up for CAF's ticket alert newsletter.",
  },
  {
    question: 'Is Uganda safe for international visitors?',
    answer:
      'Yes. Uganda is one of Africa\'s safest countries for tourists. Kampala is a welcoming, cosmopolitan city. All Kitufu Residences have 24/7 security, CCTV, and perimeter fencing as required by UTB and CAF.',
  },
  {
    question: 'What is a Kitufu Residence?',
    answer:
      'A Kitufu Residence is a converted building — empty apartments, offices, or warehouses — that we\'ve temporarily transformed into clean, secure fan accommodation for AFCON 2027. Each residence is UTB-certified and includes beds, linens, AC/fans, WiFi, security, and optional shuttle service.',
  },
  {
    question: 'How far are Kitufu Residences from the stadiums?',
    answer:
      'Most Kampala residences are within 5 km of Mandela National Stadium, with shuttle service provided. Hoima residences are within 3 km of Hoima City Stadium. Travel time ranges from 5 minutes (walking distance) to 20 minutes by shuttle.',
  },
  {
    question:
      'Can I book for my entire national team\'s group stage matches?',
    answer:
      'Absolutely! Our Season Pass allows you to book a room for the entire group stage (approximately 30 nights) at a discounted rate. You\'ll keep the same room throughout, with priority shuttle access.',
  },
  {
    question: 'What if I need to cancel my booking?',
    answer:
      'We offer free cancellation up to 48 hours before check-in for full refund. For Season Passes, free cancellation until April 1, 2027. After that, 50% refund until 30 days before arrival. See our full cancellation policy for details.',
  },
]

function FAQSection() {
  return (
    <section className="bg-warm-sand section-padding">
      <div className="container-kitufu max-w-[800px]">
        <ScrollReveal className="text-center mb-12">
          <p className="font-body font-medium text-xs tracking-[0.1em] uppercase text-sunset mb-3">
            FAQ
          </p>
          <h2 className="font-display font-bold text-display-lg text-deep-forest">
            AFCON 2027 Questions
          </h2>
        </ScrollReveal>

        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: i * 0.05,
                ease: easeSmooth,
              }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="bg-white border border-light-grey rounded-lg px-5 data-[state=open]:border-sunset/30 transition-colors"
              >
                <AccordionTrigger className="py-4 hover:no-underline cursor-pointer text-left">
                  <span className="font-display font-semibold text-base text-deep-forest pr-4">
                    {item.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="font-body text-sm text-slate leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function AfconInfo() {
  return (
    <div>
      <HeroSection />
      <TournamentOverviewSection />
      <HostCitiesSection />
      <StadiumsSection />
      <KitufuConceptSection />
      <TourismSection />
      <ScheduleSection />
      <TravelTipsSection />
      <FAQSection />
    </div>
  )
}
