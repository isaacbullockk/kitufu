import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'
import Hero from '../sections/Hero'
import TrustBar from '../sections/TrustBar'
import FeaturedResidences from '../sections/FeaturedResidences'
import HowItWorks from '../sections/HowItWorks'
import Locations from '../sections/Locations'
import GroupBookingCTA from '../sections/GroupBookingCTA'
import SeasonPass from '../sections/SeasonPass'
import Testimonials from '../sections/Testimonials'

/* ------------------------------------------------------------------ */
/*  EVENTS DATA                                                        */
/* ------------------------------------------------------------------ */

const UPCOMING_EVENTS = [
  {
    title: 'Opening Ceremony',
    date: 'June 15, 2027',
    description: 'The grandest opening in AFCON history',
    type: 'Ceremony',
    location: 'Mandela National Stadium',
    gradient: 'from-[#1B4332] to-[#2A9D8F]',
  },
  {
    title: 'Fan Zone Festival',
    date: 'June 16 - Aug 2',
    description: 'Live music, food, and football culture daily',
    type: 'Festival',
    location: 'Kampala Rugby Grounds',
    gradient: 'from-[#FF6B35] to-[#F5A623]',
  },
  {
    title: 'Cultural Night',
    date: 'June 20, 2027',
    description: 'East African music, dance, and cuisine',
    type: 'Cultural',
    location: 'Ndere Centre',
    gradient: 'from-[#E07A5F] to-[#C73E1D]',
  },
  {
    title: 'Final Screening',
    date: 'August 2, 2027',
    description: 'Giant public screening of the final',
    type: 'Watch Party',
    location: 'Constitutional Square',
    gradient: 'from-[#3D5A80] to-[#1A1A2E]',
  },
]

const EVENT_TYPE_COLORS: Record<string, string> = {
  Ceremony: 'bg-savanna-gold text-white',
  Festival: 'bg-teal-depth text-white',
  Cultural: 'bg-[#E07A5F] text-white',
  'Watch Party': 'bg-sunset text-white',
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  }),
}

/* ------------------------------------------------------------------ */
/*  UPCOMING EVENTS SECTION                                            */
/* ------------------------------------------------------------------ */

function UpcomingEventsSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">AFCON 2027</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">AFCON 2027 Events Calendar</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Don&apos;t miss the biggest moments beyond the pitch
            </p>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {UPCOMING_EVENTS.map((event, i) => (
              <motion.div
                key={event.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="min-w-[280px] sm:min-w-0 sm:flex-1 snap-start"
              >
                <div className="bg-warm-sand border border-light-grey rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card h-full flex flex-col">
                  <div className={`h-24 bg-gradient-to-r ${event.gradient} flex items-center justify-center`}>
                    <Calendar size={36} className="text-white/40" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${EVENT_TYPE_COLORS[event.type] || 'bg-slate text-white'}`}>
                        {event.type}
                      </span>
                    </div>
                    <p className="text-sunset font-display font-bold text-sm mb-1">{event.date}</p>
                    <h3 className="font-display font-semibold text-deep-forest text-lg mb-2">{event.title}</h3>
                    <p className="text-slate text-sm leading-relaxed mb-3 flex-1">{event.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate">
                      <MapPin size={12} className="text-teal-depth shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={staggerItem} className="text-center mt-8">
            <Link
              to="/nightlife"
              className="btn-sunset-gradient inline-flex items-center gap-2"
            >
              View Full Calendar
              <Calendar size={16} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div>
      <Hero />
      <TrustBar />
      <FeaturedResidences />
      <HowItWorks />
      <Locations />
      <UpcomingEventsSection />
      <GroupBookingCTA />
      <SeasonPass />
      <Testimonials />
    </div>
  )
}
