import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import {
  Camera, MapPin, Star, Search, Compass,
  Trees, Mountain, Waves, Building2, Palmtree,
  ChevronRight, Bus, Users, Ticket,
  Binoculars, UtensilsCrossed, Music,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

type Category = 'All' | 'Wildlife' | 'Adventure' | 'Culture' | 'Nature' | 'City Life'

const CATEGORIES: Category[] = ['All', 'Wildlife', 'Adventure', 'Culture', 'Nature', 'City Life']

const CATEGORY_COLORS: Record<string, string> = {
  Wildlife: 'bg-[#1B4332] text-white',
  Adventure: 'bg-[#E07A5F] text-white',
  Culture: 'bg-[#F5A623] text-white',
  Nature: 'bg-[#2A9D8F] text-white',
  'City Life': 'bg-[#3D5A80] text-white',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Wildlife: 'from-[#1B4332] to-[#2A9D8F]',
  Adventure: 'from-[#E07A5F] to-[#FF6B35]',
  Culture: 'from-[#F5A623] to-[#E07A5F]',
  Nature: 'from-[#2A9D8F] to-[#1B4332]',
  'City Life': 'from-[#3D5A80] to-[#2A9D8F]',
}

interface Attraction {
  id: number
  name: string
  category: Exclude<Category, 'All'>
  description: string
  location: string
  distance: string
  rating: number
  featured?: boolean
}

const ATTRACTIONS: Attraction[] = [
  {
    id: 1,
    name: 'Murchison Falls National Park',
    category: 'Wildlife',
    description: "Witness the world's most powerful waterfall on the Nile. Spot lions, elephants, giraffes, and over 450 bird species.",
    location: 'Northwestern Uganda',
    distance: '2.5h from Hoima',
    rating: 4.9,
    featured: true,
  },
  {
    id: 2,
    name: 'Bwindi Impenetrable Forest',
    category: 'Wildlife',
    description: "Home to half the world's mountain gorillas. A once-in-a-lifetime trekking experience through ancient rainforest.",
    location: 'Southwestern Uganda',
    distance: '4h from Kampala',
    rating: 5.0,
    featured: true,
  },
  {
    id: 3,
    name: 'Source of the Nile',
    category: 'Adventure',
    description: "Stand where the world's longest river begins its 6,650km journey to the Mediterranean. White-water rafting available.",
    location: 'Jinja',
    distance: '1.5h from Kampala',
    rating: 4.7,
    featured: true,
  },
  {
    id: 4,
    name: 'Kasubi Royal Tombs',
    category: 'Culture',
    description: 'UNESCO World Heritage Site and burial ground of Buganda kings. A masterpiece of traditional Ganda architecture.',
    location: 'Kampala',
    distance: '20 min from Mandela Stadium',
    rating: 4.6,
    featured: true,
  },
  {
    id: 5,
    name: 'Sipi Falls',
    category: 'Nature',
    description: 'A series of three stunning waterfalls on the slopes of Mount Elgon. Perfect for hiking, abseiling, and coffee tours.',
    location: 'Eastern Uganda',
    distance: '4h from Kampala',
    rating: 4.8,
    featured: true,
  },
  {
    id: 6,
    name: 'Queen Elizabeth National Park',
    category: 'Wildlife',
    description: "Uganda's most popular savannah reserve. Tree-climbing lions, boat safaris on the Kazinga Channel, and incredible biodiversity.",
    location: 'Western Uganda',
    distance: '3h from Hoima',
    rating: 4.8,
    featured: true,
  },
  {
    id: 7,
    name: 'Rwenzori Mountains',
    category: 'Adventure',
    description: 'The legendary Mountains of the Moon. Multi-day treks through alpine landscapes to Margherita Peak.',
    location: 'Western Uganda',
    distance: '5h from Hoima',
    rating: 4.7,
  },
  {
    id: 8,
    name: 'Lake Victoria',
    category: 'Nature',
    description: "Africa's largest lake and the world's second-largest freshwater lake. Sunset cruises, fishing, and island hopping.",
    location: 'Kampala shoreline',
    distance: 'Within Kampala',
    rating: 4.5,
  },
  {
    id: 9,
    name: 'Bahai Temple',
    category: 'Culture',
    description: 'The only Bahai House of Worship in Africa. Stunning architecture set among beautiful gardens on Kikaya Hill.',
    location: 'Kampala',
    distance: '30 min from Kampala center',
    rating: 4.6,
  },
  {
    id: 10,
    name: 'Ziwa Rhino Sanctuary',
    category: 'Wildlife',
    description: 'The only place in Uganda to see wild white rhinos. A successful conservation story with guided walking safaris.',
    location: 'Central Uganda',
    distance: '2.5h from Kampala',
    rating: 4.6,
  },
  {
    id: 11,
    name: 'Kibale National Park',
    category: 'Wildlife',
    description: 'The primate capital of the world. Track wild chimpanzees through lush rainforest with experienced guides.',
    location: 'Western Uganda',
    distance: '2h from Hoima',
    rating: 4.8,
  },
  {
    id: 12,
    name: 'Ngamba Island Chimpanzee Sanctuary',
    category: 'Wildlife',
    description: 'A haven for orphaned chimpanzees on Lake Victoria. Interactive feeding experiences and forest walks.',
    location: 'Lake Victoria',
    distance: '45 min boat from Entebbe',
    rating: 4.7,
  },
  {
    id: 13,
    name: 'Fort Portal Crater Lakes',
    category: 'Nature',
    description: 'Dozens of extinct volcanic crater lakes dot the landscape. Stunning viewpoints and peaceful swimming spots.',
    location: 'Western Uganda',
    distance: '2.5h from Hoima',
    rating: 4.5,
  },
  {
    id: 14,
    name: 'Jinja Adventure Capital',
    category: 'Adventure',
    description: "East Africa's adventure hub — bungee jumping, quad biking, horseback riding, and grade 5 white-water rafting.",
    location: 'Jinja',
    distance: '1.5h from Kampala',
    rating: 4.8,
  },
  {
    id: 15,
    name: 'Ndere Cultural Centre',
    category: 'Culture',
    description: 'Vibrant performances of traditional music and dance from across Uganda. An essential cultural experience.',
    location: 'Kampala',
    distance: 'Within Kampala',
    rating: 4.7,
  },
]

const FAQ_ITEMS = [
  {
    q: 'How do I book an attraction tour through Kitufu?',
    a: 'You can book attraction tours directly through your Kitufu dashboard after reserving accommodation. Visit the "Experiences" tab to browse available tours, select your dates, and add them to your itinerary. Our concierge team can also arrange custom tours for groups.',
  },
  {
    q: 'Are shuttle services available to national parks?',
    a: 'Yes! Kitufu offers direct shuttle services from select residences to Murchison Falls, Queen Elizabeth, and Bwindi. Shuttles run on fixed schedules and can be added during booking or via your dashboard. Private shuttle charters are available for groups of 8 or more.',
  },
  {
    q: 'What is the best time to visit Uganda\'s attractions?',
    a: 'June to September (dry season) is ideal for wildlife viewing and trekking. AFCON 2027 falls perfectly within this window! Gorilla trekking is available year-round, but trails are easier during drier months. Book early as permits are limited.',
  },
  {
    q: 'Can I combine a safari with my AFCON stay?',
    a: 'Absolutely. Kitufu offers curated "Safari & Football" packages that combine match tickets with 3-day and 5-day safari experiences. Build in rest days between matches for the best experience. Contact us for custom itineraries.',
  },
  {
    q: 'Are guides included in attraction visits?',
    a: 'All Kitufu-arranged attraction visits include certified local guides who speak English and local languages. Specialist guides (gorilla trekking, birdwatching) are also provided. Tips for guides are appreciated but not mandatory.',
  },
  {
    q: 'What should I pack for gorilla trekking?',
    a: 'Pack sturdy hiking boots, long trousers, a waterproof jacket, gardening gloves (for vegetation), insect repellent, and a small backpack. Treks can take 2-8 hours depending on gorilla locations. A packed lunch and water are provided by Kitufu.',
  },
]

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    },
  }),
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
}

/* ------------------------------------------------------------------ */
/*  HELPER COMPONENTS                                                  */
/* ------------------------------------------------------------------ */

function CategoryIcon({ category, className = '' }: { category: string; className?: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    Wildlife: <Binoculars className={className} />,
    Adventure: <Mountain className={className} />,
    Culture: <Building2 className={className} />,
    Nature: <Palmtree className={className} />,
    'City Life': <Waves className={className} />,
  }
  return <>{iconMap[category] || <Trees className={className} />}</>
}

function ImagePlaceholder({ category, className = '' }: { category: string; className?: string }) {
  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br ${CATEGORY_GRADIENTS[category] || 'from-deep-forest to-teal-depth'} ${className}`}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-8 h-8 border border-white rounded-full" />
        <div className="absolute bottom-6 right-8 w-12 h-12 border border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full" />
      </div>
      <Camera size={48} className="text-white/60" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 1 — HERO                                                   */
/* ------------------------------------------------------------------ */

function HeroSection({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
}: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  activeCategory: Category
  setActiveCategory: (v: Category) => void
}) {
  return (
    <section className="relative min-h-[70vh] md:min-h-[65vh] flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/hero-bg.jpg"
          alt="Uganda landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 dark-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 container-kitufu text-center pt-16 pb-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-3xl mx-auto"
        >
          <motion.p
            variants={staggerItem}
            className="text-savanna-gold text-xs md:text-sm font-medium uppercase tracking-[0.15em] mb-4"
          >
            Discover the Pearl of Africa
          </motion.p>
          <motion.h1
            variants={staggerItem}
            className="font-display text-display-lg text-white mb-4"
          >
            Explore Uganda Beyond the Stadium
          </motion.h1>
          <motion.p
            variants={staggerItem}
            className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8"
          >
            From gorilla treks to thundering waterfalls — make your AFCON 2027 journey unforgettable
          </motion.p>

          {/* Search + Filter */}
          <motion.div variants={staggerItem} className="space-y-4">
            {/* Search bar */}
            <div className="relative max-w-xl mx-auto">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
              <Input
                type="text"
                placeholder="Search attractions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 bg-white rounded-xl border-none shadow-search text-deep-forest placeholder:text-slate/60 text-base focus-visible:ring-2 focus-visible:ring-sunset/30"
              />
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
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
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 2 — FEATURED ATTRACTIONS                                   */
/* ------------------------------------------------------------------ */

function FeaturedAttractions({ attractions }: { attractions: Attraction[] }) {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-12">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Handpicked Experiences</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Featured Attractions</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Essential Ugandan experiences curated for AFCON 2027 visitors. Every attraction is vetted by the Kitufu team.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((attraction, i) => (
              <motion.div
                key={attraction.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="bg-white border border-light-grey rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover h-full flex flex-col">
                  {/* Image placeholder */}
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <ImagePlaceholder category={attraction.category} className="w-full h-full" />
                    {/* Category badge */}
                    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[attraction.category]}`}>
                      {attraction.category}
                    </span>
                    {/* Rating */}
                    <div className="absolute top-3 right-3 bg-white/95 rounded-md px-2 py-1 flex items-center gap-1">
                      <Star size={14} className="text-savanna-gold fill-savanna-gold" />
                      <span className="text-sm font-medium text-charcoal">{attraction.rating}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-semibold text-lg text-deep-forest mb-2">{attraction.name}</h3>
                    <p className="text-slate text-sm leading-relaxed mb-4 flex-1">{attraction.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-slate">
                        <MapPin size={14} className="text-teal-depth shrink-0" />
                        <span>{attraction.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate">
                        <Compass size={14} className="text-sunset shrink-0" />
                        <span>{attraction.distance}</span>
                      </div>
                    </div>

                    <button className="mt-4 w-full btn-secondary text-sm py-2.5 rounded-lg flex items-center justify-center gap-1 group">
                      View Details
                      <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
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
/*  SECTION 3 — ALL ATTRACTIONS                                        */
/* ------------------------------------------------------------------ */

function AllAttractions({
  attractions,
}: {
  attractions: Attraction[]
}) {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Complete Guide</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">All Attractions</h2>
            <p className="text-slate max-w-2xl mx-auto">
              {attractions.length} incredible destinations waiting to be discovered during your AFCON 2027 adventure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {attractions.map((attraction, i) => (
              <motion.div
                key={attraction.id}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="bg-warm-sand border border-light-grey rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card flex flex-col h-full">
                  <div className="flex items-start gap-4 p-4 flex-1">
                    {/* Small image placeholder */}
                    <div className="shrink-0">
                      <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${CATEGORY_GRADIENTS[attraction.category]} flex items-center justify-center`}>
                        <CategoryIcon category={attraction.category} className="w-8 h-8 text-white/80" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[attraction.category]}`}>
                          {attraction.category}
                        </span>
                        <div className="flex items-center gap-0.5 ml-auto">
                          <Star size={12} className="text-savanna-gold fill-savanna-gold" />
                          <span className="text-xs font-medium text-slate">{attraction.rating}</span>
                        </div>
                      </div>
                      <h4 className="font-display font-semibold text-deep-forest text-base mb-1 truncate">{attraction.name}</h4>
                      <p className="text-slate text-xs leading-relaxed line-clamp-2 mb-2">{attraction.description}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate">
                        <Compass size={12} className="text-sunset shrink-0" />
                        <span>{attraction.distance}</span>
                      </div>
                    </div>
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
/*  SECTION 4 — INTERACTIVE MAP                                        */
/* ------------------------------------------------------------------ */

function MapSection() {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-br from-deep-forest to-teal-depth p-8 md:p-12 lg:p-16 relative">
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none lubugo-bg" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <p className="text-savanna-gold text-xs font-medium uppercase tracking-[0.1em] mb-3">Smart Planning</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                  Find Attractions Near Your Stay
                </h2>
                <p className="text-white/70 max-w-lg mb-8 leading-relaxed">
                  Every Kitufu Residence includes curated recommendations for nearby attractions, with shuttle options for select destinations.
                </p>

                {/* Location pins */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
                  {[
                    { label: 'Near Mandela Stadium', color: 'bg-sunset' },
                    { label: 'Near Hoima Stadium', color: 'bg-[#3D5A80]' },
                    { label: 'Western Circuit', color: 'bg-[#F5A623]' },
                  ].map((pin) => (
                    <div key={pin.label} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${pin.color}`} />
                      <span className="text-white text-sm">{pin.label}</span>
                    </div>
                  ))}
                </div>

                <Link to="/listings">
                  <Button className="btn-sunset-gradient">
                    Search Residences by Attraction Proximity
                  </Button>
                </Link>
              </div>

              {/* Stylized map graphic */}
              <div className="hidden lg:block relative w-[380px] h-[300px]">
                {/* Map background shape */}
                <div className="absolute inset-0 bg-white/5 rounded-2xl border border-white/10" />

                {/* Stylized Uganda shape dots */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 380 300">
                  {/* Grid lines */}
                  {[50, 100, 150, 200, 250, 300, 350].map((x) => (
                    <line key={`v${x}`} x1={x} y1={20} x2={x} y2={280} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  ))}
                  {[50, 100, 150, 200, 250].map((y) => (
                    <line key={`h${y}`} x1={20} y1={y} x2={360} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  ))}

                  {/* Connection lines */}
                  <motion.line
                    x1="140" y1="180"
                    x2="260" y2="120"
                    stroke="#FF6B35"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                  <motion.line
                    x1="140" y1="180"
                    x2="180" y2="60"
                    stroke="#FF6B35"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 0.5 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.8 }}
                  />
                </svg>

                {/* Pin: Kampala / Mandela */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="absolute left-[120px] top-[155px]"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-sunset rounded-full flex items-center justify-center shadow-lg">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-white text-[10px] font-medium whitespace-nowrap bg-black/30 px-2 py-0.5 rounded">
                      Kampala
                    </div>
                  </div>
                </motion.div>

                {/* Pin: Hoima */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="absolute left-[240px] top-[95px]"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-[#3D5A80] rounded-full flex items-center justify-center shadow-lg">
                      <MapPin size={16} className="text-white" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-white text-[10px] font-medium whitespace-nowrap bg-black/30 px-2 py-0.5 rounded">
                      Hoima
                    </div>
                  </div>
                </motion.div>

                {/* Pin: Western Circuit */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                  className="absolute left-[160px] top-[35px]"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-[#F5A623] rounded-full flex items-center justify-center shadow-lg">
                      <Trees size={16} className="text-white" />
                    </div>
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-white text-[10px] font-medium whitespace-nowrap bg-black/30 px-2 py-0.5 rounded">
                      Western Circuit
                    </div>
                  </div>
                </motion.div>

                {/* Pulse rings */}
                <div className="absolute left-[120px] top-[155px] w-8 h-8 -m-0">
                  <span className="absolute inset-0 rounded-full bg-sunset/30 animate-ping" style={{ animationDuration: '2s' }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 5 — PLAN YOUR SAFARI                                       */
/* ------------------------------------------------------------------ */

function SafariSection() {
  const features = [
    { icon: Ticket, text: 'Combine match days with wildlife adventures' },
    { icon: Compass, text: 'Curated 3-day and 5-day safari packages' },
    { icon: Bus, text: 'Direct shuttles from residences to national parks' },
    { icon: Users, text: "Group discounts for supporters' clubs" },
  ]

  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16"
        >
          {/* Left — Image */}
          <motion.div variants={staggerItem} className="lg:w-1/2 w-full">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10]">
              <img
                src="/supporters-club.jpg"
                alt="Football supporters on safari"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-forest/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-savanna-gold text-xs font-medium uppercase tracking-[0.1em]">Kitufu Safari Packages</p>
                <p className="text-white font-display font-semibold text-lg">Football meets wildlife</p>
              </div>
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div variants={staggerItem} className="lg:w-1/2">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-3">Special Packages</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-deep-forest mb-4">
              Make It a Safari &amp; Football Holiday
            </h2>
            <p className="text-slate leading-relaxed mb-6">
              Turn your AFCON 2027 trip into the adventure of a lifetime. Our safari packages seamlessly blend match-day excitement with Uganda&apos;s world-class wildlife experiences.
            </p>

            <div className="space-y-4 mb-8">
              {features.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={text}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-sunset/10 flex items-center justify-center shrink-0">
                    <Icon size={20} className="text-sunset" />
                  </div>
                  <span className="text-deep-forest text-sm font-medium">{text}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/group-booking">
              <Button className="btn-sunset-gradient">
                Enquire About Safari Packages
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 6 — FAQ                                                    */
/* ------------------------------------------------------------------ */

function FaqSection() {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu max-w-3xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Got Questions?</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Attraction &amp; Safari FAQ</h2>
            <p className="text-slate">
              Everything you need to know about exploring Uganda during AFCON 2027.
            </p>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Accordion type="single" collapsible className="space-y-3">
              {FAQ_ITEMS.map((item, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-white border border-light-grey rounded-xl px-5 data-[state=open]:shadow-card"
                >
                  <AccordionTrigger className="text-deep-forest font-medium text-base hover:no-underline py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate text-sm leading-relaxed pb-4">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 7 — FOOD & NIGHTLIFE TEASER                                */
/* ------------------------------------------------------------------ */

function FoodNightlifeTeaser() {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Beyond Attractions</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Food, Drinks &amp; After Dark</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Complete your AFCON 2027 experience with incredible cuisine and unforgettable nightlife.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Dining Card */}
            <Link to="/dining" className="group">
              <div className="bg-deep-forest rounded-2xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover h-full">
                <div className="w-14 h-14 rounded-xl bg-sunset/20 flex items-center justify-center mb-6">
                  <UtensilsCrossed size={28} className="text-sunset" />
                </div>
                <h3 className="font-display font-semibold text-white text-xl mb-3">
                  Discover Ugandan Cuisine
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  From the legendary Rolex to fine dining with panoramic views, explore Uganda&apos;s vibrant food scene. 
                  15+ curated restaurants, street food guides, and the AFCON Food Festival.
                </p>
                <span className="inline-flex items-center gap-2 bg-sunset text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all group-hover:bg-sunset/90">
                  Explore Dining
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Nightlife Card */}
            <Link to="/nightlife" className="group">
              <div className="bg-deep-forest rounded-2xl p-8 md:p-10 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover h-full">
                <div className="w-14 h-14 rounded-xl bg-sunset/20 flex items-center justify-center mb-6">
                  <Music size={28} className="text-sunset" />
                </div>
                <h3 className="font-display font-semibold text-white text-xl mb-3">
                  Experience the Nightlife
                </h3>
                <p className="text-white/70 text-sm leading-relaxed mb-6">
                  Watch parties, rooftop bars, live music, and clubs. The night in Kampala and Hoima 
                  is just getting started when the final whistle blows.
                </p>
                <span className="inline-flex items-center gap-2 bg-sunset text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all group-hover:bg-sunset/90">
                  Explore Nightlife
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
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

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  const featuredAttractions = ATTRACTIONS.filter((a) => a.featured)

  const allAttractions = useMemo(() => {
    let filtered = ATTRACTIONS.filter((a) => !a.featured)

    if (activeCategory !== 'All') {
      filtered = filtered.filter((a) => a.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q)
      )
    }

    return filtered
  }, [activeCategory, searchQuery])

  return (
    <div className="min-h-[100dvh] bg-warm-sand">
      {/* Section 1: Hero */}
      <HeroSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />

      {/* Section 2: Featured Attractions */}
      <FeaturedAttractions attractions={featuredAttractions} />

      {/* Section 3: All Attractions */}
      <AllAttractions attractions={allAttractions} />

      {/* Section 4: Interactive Map */}
      <MapSection />

      {/* Section 5: Plan Your Safari */}
      <SafariSection />

      {/* Section 6: FAQ */}
      <FaqSection />

      {/* Section 7: Food & Nightlife Teaser */}
      <FoodNightlifeTeaser />
    </div>
  )
}
