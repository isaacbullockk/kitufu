import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Tv, MapPin, Star, Music, Users, Calendar,
  Wine, Guitar, Ticket, Clock,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

type NightlifeCategory = 'All' | 'Watch Parties' | 'Clubs' | 'Live Music' | 'Lounges' | 'Cultural' | 'Rooftop' | 'Day Events'

const NIGHTLIFE_CATEGORIES: NightlifeCategory[] = [
  'All', 'Watch Parties', 'Clubs', 'Live Music', 'Lounges', 'Cultural', 'Rooftop', 'Day Events',
]

interface WatchPartyVenue {
  id: number
  name: string
  description: string
  capacity: number
  screens: number
  distance: string
}

const WATCH_PARTIES: WatchPartyVenue[] = [
  {
    id: 1, name: 'Legends Sports Bar',
    description: "Kampala's premier sports bar with 12 giant screens, stadium sound, and a massive outdoor viewing terrace. The ultimate AFCON atmosphere.",
    capacity: 800, screens: 12, distance: '5 min from Mandela Stadium',
  },
  {
    id: 2, name: 'Protea Hotel Sky Bar',
    description: 'Rooftop watch party with panoramic city views, premium cocktails, and an upscale football experience. Reservation required.',
    capacity: 200, screens: 4, distance: '10 min from Mandela Stadium',
  },
  {
    id: 3, name: 'Bubbles Lounge Hoima',
    description: "Hoima's biggest watch party venue. Multiple screens, local and international beer, and a lively crowd of travelling fans.",
    capacity: 400, screens: 6, distance: '5 min from Hoima Stadium',
  },
]

interface Venue {
  id: number
  name: string
  category: NightlifeCategory[]
  description: string
  location: string
  hours: string
  distance: string
  rating: number
  reviewCount: number
}

const VENUES: Venue[] = [
  {
    id: 4, name: 'Club Guvnor', category: ['Clubs'],
    description: "Uganda's most iconic nightclub. Three rooms with different music styles — commercial, Afrobeat, and VIP lounge. World-class sound and lighting.",
    location: 'Industrial Area, Kampala', hours: 'Fri/Sat', distance: '20 min from Mandela Stadium',
    rating: 4.5, reviewCount: 678,
  },
  {
    id: 5, name: 'Illusion', category: ['Clubs'],
    description: "Underground electronic and Afro-house club. Cutting-edge DJs, immersive visuals, and Kampala's most passionate dance floor.",
    location: 'Acacia Avenue', hours: 'Thu-Sat', distance: '15 min from Mandela Stadium',
    rating: 4.4, reviewCount: 234,
  },
  {
    id: 6, name: 'Zone 7', category: ['Clubs'],
    description: 'Massive open-air club in a converted industrial space. Live bands, DJ sets, and themed party nights under the stars.',
    location: 'Mbuya, Kampala', hours: 'Wed-Sun', distance: '25 min from Mandela Stadium',
    rating: 4.3, reviewCount: 445,
  },
  {
    id: 7, name: 'Redd B Bar', category: ['Clubs'],
    description: "Hoima's hottest nightclub. Afrobeats, dancehall, and East African bongo flava. The place to celebrate after a match.",
    location: 'Hoima Town Centre', hours: 'Fri/Sat', distance: '3 min from Hoima Stadium',
    rating: 4.2, reviewCount: 98,
  },
  {
    id: 8, name: 'Jazzville', category: ['Live Music'],
    description: "Kampala's home of live jazz, Afro-fusion, and soul. Intimate setting with performances every evening. Great cocktails.",
    location: 'Bugolobi', hours: 'Nightly', distance: '20 min from Mandela Stadium',
    rating: 4.6, reviewCount: 156,
  },
  {
    id: 9, name: 'Ndere Cultural Centre', category: ['Live Music', 'Cultural'],
    description: 'Spectacular traditional music and dance performances from across Uganda. A must-visit cultural experience with dinner option.',
    location: 'Kisasi', hours: 'Wed/Fri/Sun', distance: '25 min from Mandela Stadium',
    rating: 4.7, reviewCount: 312,
  },
  {
    id: 10, name: 'The Jazz Garden', category: ['Live Music'],
    description: 'Open-air live music venue in beautiful botanical surroundings. Jazz, reggae, and Afrobeat nights with food stalls.',
    location: 'Entebbe Road', hours: 'Fri/Sat', distance: '30 min from Mandela Stadium',
    rating: 4.5, reviewCount: 189,
  },
  {
    id: 11, name: 'Sky Lounge at The Pearl', category: ['Lounges', 'Rooftop'],
    description: "Kampala's highest rooftop bar. 360° views, craft cocktails, sushi bar, and a sophisticated crowd.",
    location: 'Nakasero', hours: 'Daily 5pm-2am', distance: '10 min from Mandela Stadium',
    rating: 4.6, reviewCount: 267,
  },
  {
    id: 12, name: 'Cayenne', category: ['Lounges'],
    description: 'Trendy lounge and restaurant with a beautiful terrace. Signature cocktails, shisha, and DJ sets on weekends.',
    location: 'Bukoto', hours: 'Tue-Sun', distance: '15 min from Mandela Stadium',
    rating: 4.4, reviewCount: 198,
  },
  {
    id: 13, name: 'Throne Room', category: ['Lounges'],
    description: "Exclusive VIP lounge with bottle service, private booths, and Kampala's elite. Dress code enforced.",
    location: 'Kololo', hours: 'Wed-Sat', distance: '15 min from Mandela Stadium',
    rating: 4.5, reviewCount: 145,
  },
  {
    id: 14, name: 'Nakasero Market Food Walk', category: ['Cultural', 'Day Events'],
    description: "Guided culinary walking tour through Kampala's largest market. Taste exotic fruits, spices, and street food with a local guide.",
    location: 'Nakasero', hours: 'Tue/Thu/Sat mornings', distance: '10 min from Mandela Stadium',
    rating: 4.8, reviewCount: 89,
  },
  {
    id: 15, name: 'Boda Boda City Tour', category: ['Day Events', 'Cultural'],
    description: "See Kampala from the back of a motorbike taxi — the authentic local way. Guided tours covering markets, landmarks, and hidden gems.",
    location: 'Citywide', hours: 'Daily', distance: 'varies',
    rating: 4.6, reviewCount: 234,
  },
]

const TIMELINE_EVENTS = [
  { date: 'June 15', title: 'Opening Ceremony', description: 'AFCON 2027 Opening Ceremony at Mandela National Stadium', type: 'Ceremony' },
  { date: 'June 16', title: 'Fan Zone Opening', description: 'Official AFCON Fan Zone opens at Kampala Rugby Grounds', type: 'Festival' },
  { date: 'June 20', title: 'Cultural Night', description: 'East African Cultural Showcase at Ndere Centre', type: 'Cultural' },
  { date: 'July 25', title: 'Semi-Final Watch Party', description: 'Giant Screen Viewing at Constitutional Square', type: 'Watch Party' },
  { date: 'August 2', title: 'Final Screening', description: 'Public Screening of the AFCON 2027 Final', type: 'Watch Party' },
  { date: 'August 3', title: 'Closing Festival', description: 'AFCON Closing Festival at Kampala Waterfront', type: 'Festival' },
]

const TYPE_COLORS: Record<string, string> = {
  Ceremony: 'bg-[#F5A623] text-white',
  Festival: 'bg-[#2A9D8F] text-white',
  Cultural: 'bg-[#E07A5F] text-white',
  'Watch Party': 'bg-[#FF6B35] text-white',
}

const VENUE_GRADIENTS = [
  'from-[#1A1A2E] to-[#3D5A80]',
  'from-[#FF6B35] to-[#F5A623]',
  'from-[#3D5A80] to-[#2A9D8F]',
  'from-[#2A9D8F] to-[#1B4332]',
  'from-[#C73E1D] to-[#FF6B35]',
  'from-[#1B4332] to-[#3D5A80]',
  'from-[#E07A5F] to-[#C73E1D]',
  'from-[#1A1A2E] to-[#C73E1D]',
  'from-[#F5A623] to-[#E07A5F]',
  'from-[#2A9D8F] to-[#27AE60]',
  'from-[#6B4F4B] to-[#E07A5F]',
  'from-[#3D5A80] to-[#1A1A2E]',
]

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

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
/*  SECTION 1 — HERO                                                   */
/* ------------------------------------------------------------------ */

function HeroSection({ activeCategory, setActiveCategory }: {
  activeCategory: NightlifeCategory; setActiveCategory: (c: NightlifeCategory) => void
}) {
  return (
    <section className="relative min-h-[70vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/football-fans.jpg" alt="Football fans celebrating" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1A1A2E]/85" />
      </div>

      <div className="relative z-10 container-kitufu text-center pt-16 pb-8">
        <motion.div
          initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl mx-auto"
        >
          <motion.p
            variants={staggerItem}
            className="text-savanna-gold text-xs md:text-sm font-medium uppercase tracking-[0.15em] mb-4"
          >
            AFTER THE FINAL WHISTLE
          </motion.p>
          <motion.h1 variants={staggerItem} className="font-display text-display-lg text-white mb-4">
            Nightlife &amp; Events in Uganda
          </motion.h1>
          <motion.p variants={staggerItem} className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8">
            Watch parties, live music, rooftop bars, and cultural shows — the night is just getting started
          </motion.p>

          <motion.div variants={staggerItem} className="flex flex-wrap justify-center gap-2">
            {NIGHTLIFE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-sunset text-white shadow-sunset-glow'
                    : 'bg-white/15 text-white/90 hover:bg-white/25 backdrop-blur-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 2 — AFCON WATCH PARTIES                                    */
/* ------------------------------------------------------------------ */

function WatchPartiesSection() {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-12">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Official Venues</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">AFCON Watch Parties</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Experience every match on giant screens with fellow fans — the ultimate football atmosphere.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {WATCH_PARTIES.map((venue, i) => (
              <motion.div
                key={venue.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="bg-white border border-light-grey rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <div className={`w-full h-full bg-gradient-to-br ${VENUE_GRADIENTS[venue.id - 1]} flex items-center justify-center`}>
                      <Tv size={40} className="text-white/60" />
                    </div>
                    <span className="absolute top-3 left-3 sunset-gradient text-white text-[10px] px-3 py-1 rounded-full font-medium uppercase tracking-wide">
                      Official Watch Party
                    </span>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-lg text-deep-forest mb-2">{venue.name}</h3>
                    <p className="text-slate text-sm leading-relaxed mb-4 flex-1">{venue.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-warm-sand rounded-lg p-2.5 text-center">
                        <Users size={16} className="text-sunset mx-auto mb-1" />
                        <span className="text-xs text-slate">Capacity</span>
                        <p className="font-display font-semibold text-deep-forest text-sm">{venue.capacity}</p>
                      </div>
                      <div className="bg-warm-sand rounded-lg p-2.5 text-center">
                        <Tv size={16} className="text-teal-depth mx-auto mb-1" />
                        <span className="text-xs text-slate">Screens</span>
                        <p className="font-display font-semibold text-deep-forest text-sm">{venue.screens}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate mb-3">
                      <MapPin size={12} className="text-teal-depth shrink-0" />
                      <span>{venue.distance}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 bg-sunset/10 text-sunset text-xs font-medium px-2.5 py-1 rounded-full self-start">
                      <Calendar size={12} />
                      All Match Days
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 3 — CLUBS & DANCE HALLS                                    */
/* ------------------------------------------------------------------ */

function ClubsSection({ venues }: { venues: Venue[] }) {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Dance Until Dawn</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Clubs &amp; Dance Halls</h2>
            <p className="text-slate max-w-2xl mx-auto">
              From iconic nightclubs to underground dance floors — Kampala and Hoima know how to party.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {venues.map((venue, i) => (
              <motion.div
                key={venue.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="bg-warm-sand border border-light-grey rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card flex flex-col sm:flex-row h-full">
                  <div className="sm:w-40 shrink-0">
                    <div className={`w-full h-full min-h-[140px] bg-gradient-to-br ${VENUE_GRADIENTS[venue.id - 1]} flex items-center justify-center`}>
                      <Music size={32} className="text-white/60" />
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      {venue.category.slice(0, 1).map((c) => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-sunset text-white">
                          {c}
                        </span>
                      ))}
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Star size={12} className="text-savanna-gold fill-savanna-gold" />
                        <span className="text-xs font-medium text-slate">{venue.rating}</span>
                      </div>
                    </div>
                    <h4 className="font-display font-semibold text-deep-forest text-base mb-1">{venue.name}</h4>
                    <p className="text-slate text-xs leading-relaxed line-clamp-2 mb-2 flex-1">{venue.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} className="text-teal-depth" />
                        {venue.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} className="text-sunset" />
                        {venue.hours}
                      </span>
                    </div>
                    <span className="text-sunset text-xs mt-1">{venue.distance}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 4 — LIVE MUSIC VENUES                                      */
/* ------------------------------------------------------------------ */

function LiveMusicSection({ venues }: { venues: Venue[] }) {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Feel the Rhythm</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Live Music Venues</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Jazz, Afro-fusion, traditional dance, and soul — Uganda&apos;s music scene is electric.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((venue, i) => (
              <motion.div
                key={venue.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="bg-white border border-light-grey rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <div className={`w-full h-full bg-gradient-to-br ${VENUE_GRADIENTS[venue.id - 1]} flex items-center justify-center`}>
                      <Guitar size={36} className="text-white/60" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-depth text-white">{venue.category[0]}</span>
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Star size={12} className="text-savanna-gold fill-savanna-gold" />
                        <span className="text-xs font-medium text-slate">{venue.rating} ({venue.reviewCount})</span>
                      </div>
                    </div>
                    <h4 className="font-display font-semibold text-deep-forest text-base mb-1">{venue.name}</h4>
                    <p className="text-slate text-sm leading-relaxed mb-3 flex-1">{venue.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} className="text-teal-depth" />
                        {venue.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} className="text-sunset" />
                        {venue.hours}
                      </span>
                    </div>
                    <span className="text-sunset text-xs mt-1">{venue.distance}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 5 — LOUNGES & ROOFTOP BARS                                 */
/* ------------------------------------------------------------------ */

function LoungesSection({ venues }: { venues: Venue[] }) {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Sip &amp; Socialize</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Lounges &amp; Rooftop Bars</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Sophisticated spots for cocktails, conversations, and stunning city views.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {venues.map((venue, i) => (
              <motion.div
                key={venue.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="bg-warm-sand border border-light-grey rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <div className={`w-full h-full bg-gradient-to-br ${VENUE_GRADIENTS[venue.id - 1]} flex items-center justify-center`}>
                      <Wine size={36} className="text-white/60" />
                    </div>
                    <span className="absolute top-3 right-3 bg-white/95 rounded-md px-2 py-1 flex items-center gap-1">
                      <Star size={12} className="text-savanna-gold fill-savanna-gold" />
                      <span className="text-xs font-medium text-charcoal">{venue.rating}</span>
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h4 className="font-display font-semibold text-deep-forest text-base mb-1">{venue.name}</h4>
                    <p className="text-slate text-sm leading-relaxed mb-3 flex-1">{venue.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} className="text-teal-depth" />
                        {venue.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} className="text-sunset" />
                        {venue.hours}
                      </span>
                    </div>
                    <span className="text-sunset text-xs mt-1">{venue.distance}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 6 — CULTURAL EVENTS & DAYTIME                              */
/* ------------------------------------------------------------------ */

function CulturalSection({ venues }: { venues: Venue[] }) {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Discover Uganda</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Cultural Events &amp; Daytime</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Immerse yourself in local culture, markets, and authentic experiences.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {venues.map((venue, i) => (
              <motion.div
                key={venue.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="bg-white border border-light-grey rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <div className={`w-full h-full bg-gradient-to-br ${VENUE_GRADIENTS[venue.id - 1]} flex items-center justify-center`}>
                      <Ticket size={36} className="text-white/60" />
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {venue.category.slice(0, 1).map((c) => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-teal-depth text-white">{c}</span>
                      ))}
                      <div className="flex items-center gap-0.5 ml-auto">
                        <Star size={12} className="text-savanna-gold fill-savanna-gold" />
                        <span className="text-xs font-medium text-slate">{venue.rating} ({venue.reviewCount})</span>
                      </div>
                    </div>
                    <h4 className="font-display font-semibold text-deep-forest text-base mb-1">{venue.name}</h4>
                    <p className="text-slate text-sm leading-relaxed mb-3 flex-1">{venue.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate">
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} className="text-teal-depth" />
                        {venue.location}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock size={10} className="text-sunset" />
                        {venue.hours}
                      </span>
                    </div>
                    <span className="text-sunset text-xs mt-1">{venue.distance}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 7 — AFCON EVENTS TIMELINE                                  */
/* ------------------------------------------------------------------ */

function TimelineSection() {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu max-w-3xl">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-12">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Mark Your Calendar</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">AFCON 2027 Events</h2>
            <p className="text-slate">
              Key events and experiences throughout the tournament.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-light-grey" />

            <div className="space-y-8">
              {TIMELINE_EVENTS.map((event, i) => (
                <motion.div
                  key={event.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className="relative pl-12 md:pl-16"
                >
                  {/* Dot */}
                  <div className="absolute left-2 md:left-4 top-1 w-4 h-4 rounded-full bg-sunset border-4 border-white shadow-sm" />

                  <div className="bg-warm-sand border border-light-grey rounded-xl p-5 transition-all duration-300 hover:shadow-card">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-display font-bold text-sunset text-sm">{event.date}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[event.type] || 'bg-slate text-white'}`}>
                        {event.type}
                      </span>
                    </div>
                    <h4 className="font-display font-semibold text-deep-forest text-base mb-1">{event.title}</h4>
                    <p className="text-slate text-sm">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function Nightlife() {
  const [activeCategory, setActiveCategory] = useState<NightlifeCategory>('All')

  const filteredVenues = useMemo(() => {
    if (activeCategory === 'All') return VENUES
    return VENUES.filter((v) => v.category.includes(activeCategory))
  }, [activeCategory])

  const clubs = filteredVenues.filter((v) => v.category.includes('Clubs'))
  const liveMusic = filteredVenues.filter((v) => v.category.includes('Live Music'))
  const lounges = filteredVenues.filter((v) => v.category.includes('Lounges') || v.category.includes('Rooftop'))
  const cultural = filteredVenues.filter((v) => v.category.includes('Cultural') || v.category.includes('Day Events'))

  return (
    <div className="min-h-[100dvh] bg-warm-sand">
      <HeroSection activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {activeCategory === 'All' || activeCategory === 'Watch Parties' ? (
        <WatchPartiesSection />
      ) : null}

      {clubs.length > 0 && (activeCategory === 'All' || activeCategory === 'Clubs') && (
        <ClubsSection venues={clubs} />
      )}

      {liveMusic.length > 0 && (activeCategory === 'All' || activeCategory === 'Live Music') && (
        <LiveMusicSection venues={liveMusic} />
      )}

      {lounges.length > 0 && (activeCategory === 'All' || activeCategory === 'Lounges' || activeCategory === 'Rooftop') && (
        <LoungesSection venues={lounges} />
      )}

      {cultural.length > 0 && (activeCategory === 'All' || activeCategory === 'Cultural' || activeCategory === 'Day Events') && (
        <CulturalSection venues={cultural} />
      )}

      {filteredVenues.length === 0 && activeCategory !== 'Watch Parties' && (
        <section className="section-padding bg-white">
          <div className="container-kitufu text-center">
            <Music size={48} className="text-light-grey mx-auto mb-4" />
            <h3 className="font-display text-xl text-deep-forest mb-2">No venues found</h3>
            <p className="text-slate">Try a different category.</p>
          </div>
        </section>
      )}

      <TimelineSection />
    </div>
  )
}
