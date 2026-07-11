import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search, UtensilsCrossed, MapPin, Star, Sandwich,
  Cookie, Flame, Coffee, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

type CuisineType = 'All' | 'Ugandan Local' | 'Pan-African' | 'International' | 'Street Food' | 'Indian' | 'Chinese' | 'Italian' | 'Ethiopian' | 'Fine Dining' | 'Cafes' | 'Quick Bites'

const CUISINE_TYPES: CuisineType[] = [
  'All', 'Ugandan Local', 'Pan-African', 'International', 'Street Food',
  'Indian', 'Chinese', 'Italian', 'Ethiopian', 'Fine Dining', 'Cafes', 'Quick Bites',
]

interface Restaurant {
  id: number
  name: string
  cuisine: CuisineType[]
  price: string
  description: string
  location: string
  distance: string
  rating: number
  reviewCount: number
  featured?: boolean
}

const RESTAURANTS: Restaurant[] = [
  {
    id: 1, name: 'The Lawns', cuisine: ['Fine Dining'], price: '$$$$',
    description: "Kololo's most elegant steakhouse with panoramic Kampala views. Premium cuts, wine cellar, and impeccable service.",
    location: 'Kololo, Kampala', distance: '15 min from Mandela Stadium',
    rating: 4.7, reviewCount: 234, featured: true,
  },
  {
    id: 2, name: '2K Restaurant', cuisine: ['Ugandan Local'], price: '$$',
    description: 'Authentic Ugandan cuisine in the heart of the city. Famous for luwombo (steamed beef in banana leaves) and matoke.',
    location: 'Nakasero, Kampala', distance: '10 min from Mandela Stadium',
    rating: 4.5, reviewCount: 412, featured: true,
  },
  {
    id: 3, name: 'MishMash', cuisine: ['International'], price: '$$$',
    description: 'Eclectic fusion restaurant in a beautiful garden setting. Mediterranean meets East African flavors with craft cocktails.',
    location: 'Kololo, Kampala', distance: '15 min from Mandela Stadium',
    rating: 4.6, reviewCount: 189, featured: true,
  },
  {
    id: 4, name: 'Karamojong Restaurant', cuisine: ['Pan-African'], price: '$$',
    description: 'A cultural dining experience featuring dishes from across East Africa — Ethiopian injera, Kenyan nyama choma, Ugandan groundnut stew.',
    location: 'Wandegeya, Kampala', distance: '20 min from Mandela Stadium',
    rating: 4.4, reviewCount: 156, featured: true,
  },
  {
    id: 5, name: 'Faze 2', cuisine: ['Indian'], price: '$$',
    description: 'Authentic North Indian and Ugandan-Indian fusion. Famous for butter chicken, biryanis, and tandoori specialties.',
    location: 'Nakulabye, Kampala', distance: '25 min from Mandela Stadium',
    rating: 4.3, reviewCount: 278, featured: true,
  },
  {
    id: 6, name: 'The Great Indian Dhaba', cuisine: ['Indian'], price: '$',
    description: 'Delicious, affordable Indian street food — samosas, chaat, dosas, and chai in a casual, vibrant setting.',
    location: 'Kampala Road', distance: '10 min from Mandela Stadium',
    rating: 4.2, reviewCount: 340, featured: true,
  },
  {
    id: 7, name: "Cafe Javas", cuisine: ['Cafes'], price: '$$',
    description: "Kampala's beloved cafe chain. All-day breakfast, gourmet burgers, fresh pastries, and the best coffee in town.",
    location: 'Acacia Mall, Kampala', distance: '15 min from Mandela Stadium',
    rating: 4.5, reviewCount: 567,
  },
  {
    id: 8, name: 'Endiro Coffee', cuisine: ['Cafes'], price: '$$',
    description: "Uganda's premier specialty coffee house. Single-origin Arabica from Mount Elgon, light meals, and a cozy garden atmosphere.",
    location: 'Kisementi, Kampala', distance: '12 min from Mandela Stadium',
    rating: 4.6, reviewCount: 198,
  },
  {
    id: 9, name: "Phillip's Pizza", cuisine: ['International', 'Italian'], price: '$$$',
    description: 'Wood-fired Neapolitan pizzas, fresh pasta, and Italian classics in a warm, family-friendly setting.',
    location: 'Bugolobi, Kampala', distance: '20 min from Mandela Stadium',
    rating: 4.4, reviewCount: 145,
  },
  {
    id: 10, name: 'New Haven Restaurant', cuisine: ['Chinese'], price: '$$',
    description: 'Authentic Cantonese and Szechuan cuisine. Famous for dim sum lunch, Peking duck, and hot pot.',
    location: 'Entebbe Road, Kampala', distance: '25 min from Mandela Stadium',
    rating: 4.3, reviewCount: 203,
  },
  {
    id: 11, name: 'Boda Boda Rolex Stand', cuisine: ['Street Food'], price: '$',
    description: 'The iconic Ugandan street food — a rolled chapati stuffed with eggs, veggies, and your choice of fillings. Found on every corner.',
    location: 'Citywide', distance: '5 min walk',
    rating: 4.6, reviewCount: 891,
  },
  {
    id: 12, name: 'Rhino Fund Restaurant', cuisine: ['Ugandan Local'], price: '$$',
    description: 'Rustic bush dining experience overlooking the savanna. Traditional Ugandan barbecue and fresh lake fish.',
    location: 'Nakasongola (Ziwa)', distance: '2.5h from Kampala',
    rating: 4.5, reviewCount: 87,
  },
  {
    id: 13, name: 'Le Chateau', cuisine: ['Fine Dining'], price: '$$$$',
    description: 'French-inspired fine dining with an African twist. Tasting menus, extensive wine list, and elegant colonial-era setting.',
    location: 'Muyenga, Kampala', distance: '25 min from Mandela Stadium',
    rating: 4.7, reviewCount: 112,
  },
  {
    id: 14, name: 'Nandos', cuisine: ['Quick Bites'], price: '$$',
    description: 'Famous Afro-Portuguese flame-grilled peri-peri chicken. A reliable favorite for casual, flavorful meals.',
    location: 'Multiple locations', distance: 'varies',
    rating: 4.3, reviewCount: 445,
  },
  {
    id: 15, name: 'Habesha Ethiopian Restaurant', cuisine: ['Pan-African', 'Ethiopian'], price: '$$',
    description: 'Traditional Ethiopian cuisine served on communal injera platters. Vegetarian and meat combinations with authentic spices.',
    location: 'Kabalagala, Kampala', distance: '30 min from Mandela Stadium',
    rating: 4.4, reviewCount: 167,
  },
]

const STREET_FOOD = [
  {
    name: 'The Rolex', price: '$1-2',
    description: "Uganda's national street food. A chapati rolled with fried eggs, cabbage, tomatoes, and optional meat. Available on every corner.",
    Icon: Sandwich,
  },
  {
    name: 'Samosa & Chapati', price: '$0.50-1',
    description: 'Crispy fried pastries filled with spiced meat or lentils, served with fresh chapati. The perfect snack.',
    Icon: Cookie,
  },
  {
    name: 'Roasted Maize', price: '$0.30-0.50',
    description: 'Fresh charcoal-roasted corn on the cob, rubbed with lemon and chili. A beloved evening snack.',
    Icon: Flame,
  },
  {
    name: 'Mandazi & Chai', price: '$0.50-1',
    description: 'Sweet, fluffy fried dough paired with spiced milk tea. The ultimate Ugandan breakfast.',
    Icon: Coffee,
  },
]

const CUISINE_COLORS: Record<string, string> = {
  'Ugandan Local': 'bg-[#1B4332] text-white',
  'Pan-African': 'bg-[#F5A623] text-white',
  'International': 'bg-[#2A9D8F] text-white',
  'Street Food': 'bg-[#E07A5F] text-white',
  'Indian': 'bg-[#C73E1D] text-white',
  'Chinese': 'bg-[#C73E1D] text-white',
  'Italian': 'bg-[#27AE60] text-white',
  'Ethiopian': 'bg-[#8B4513] text-white',
  'Fine Dining': 'bg-[#1A1A2E] text-white',
  'Cafes': 'bg-[#6B4F4B] text-white',
  'Quick Bites': 'bg-[#FF6B35] text-white',
}

const RESTAURANT_GRADIENTS = [
  'from-[#1B4332] to-[#2A9D8F]',
  'from-[#FF6B35] to-[#F5A623]',
  'from-[#2A9D8F] to-[#1B4332]',
  'from-[#E07A5F] to-[#FF6B35]',
  'from-[#C73E1D] to-[#E07A5F]',
  'from-[#3D5A80] to-[#2A9D8F]',
  'from-[#F5A623] to-[#E07A5F]',
  'from-[#1B4332] to-[#3D5A80]',
  'from-[#27AE60] to-[#2A9D8F]',
  'from-[#8B4513] to-[#C73E1D]',
  'from-[#6B4F4B] to-[#E07A5F]',
  'from-[#1A1A2E] to-[#3D5A80]',
  'from-[#2A9D8F] to-[#27AE60]',
  'from-[#FF6B35] to-[#C73E1D]',
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

function HeroSection({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (v: string) => void }) {
  return (
    <section className="relative min-h-[70vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img src="/hero-bg.jpg" alt="Uganda" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#1A1A2E]/80" />
      </div>

      <div className="relative z-10 container-kitufu text-center pt-16 pb-8">
        <motion.div
          initial="hidden" animate="visible" variants={staggerContainer} className="max-w-3xl mx-auto"
        >
          <motion.p
            variants={staggerItem}
            className="text-savanna-gold text-xs md:text-sm font-medium uppercase tracking-[0.15em] mb-4"
          >
            TASTE UGANDA
          </motion.p>
          <motion.h1 variants={staggerItem} className="font-display text-display-lg text-white mb-4">
            Flavors of the Pearl of Africa
          </motion.h1>
          <motion.p variants={staggerItem} className="text-white/80 text-base md:text-lg max-w-xl mx-auto mb-8">
            From street-side Rolex to fine dining with a view — discover Uganda&apos;s incredible food scene
          </motion.p>

          <motion.div variants={staggerItem} className="relative max-w-xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate pointer-events-none" />
            <Input
              type="text" placeholder="Search restaurants..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 bg-white rounded-xl border-none shadow-search text-deep-forest placeholder:text-slate/60 text-base focus-visible:ring-2 focus-visible:ring-sunset/30"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 2 — CUISINE FILTER CHIPS                                   */
/* ------------------------------------------------------------------ */

function CuisineFilterChips({ activeCuisines, toggleCuisine }: {
  activeCuisines: CuisineType[]; toggleCuisine: (c: CuisineType) => void
}) {
  return (
    <section className="py-6 bg-white border-b border-light-grey sticky top-16 z-30">
      <div className="container-kitufu">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-2 px-2 snap-x snap-mandatory">
          {CUISINE_TYPES.map((cuisine) => {
            const isActive = activeCuisines.includes(cuisine)
            return (
              <button
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 snap-start ${
                  isActive
                    ? 'bg-sunset text-white shadow-sunset-glow'
                    : 'bg-white text-slate border border-light-grey hover:border-sunset hover:text-sunset'
                }`}
              >
                {cuisine}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 3 — FEATURED RESTAURANTS                                   */
/* ------------------------------------------------------------------ */

function FeaturedRestaurants({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-12">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Curated Selection</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Featured Restaurants</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Handpicked dining experiences for AFCON 2027 visitors — from local flavors to international cuisine.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, i) => (
              <motion.div
                key={restaurant.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="bg-white border border-light-grey rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover h-full flex flex-col">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <div className={`w-full h-full bg-gradient-to-br ${RESTAURANT_GRADIENTS[restaurant.id - 1]} flex items-center justify-center`}>
                      <UtensilsCrossed size={40} className="text-white/60" />
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {restaurant.cuisine.map((c) => (
                        <span key={c} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CUISINE_COLORS[c] || 'bg-slate text-white'}`}>
                          {c}
                        </span>
                      ))}
                      <span className="text-savanna-gold text-xs font-medium ml-auto">{restaurant.price}</span>
                    </div>

                    <h3 className="font-display font-semibold text-lg text-deep-forest mb-1">{restaurant.name}</h3>

                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} size={12} className={s < Math.round(restaurant.rating) ? 'text-savanna-gold fill-savanna-gold' : 'text-light-grey'} />
                        ))}
                      </div>
                      <span className="text-xs text-slate">{restaurant.rating} ({restaurant.reviewCount})</span>
                    </div>

                    <p className="text-slate text-sm leading-relaxed mb-3 line-clamp-2 flex-1">{restaurant.description}</p>

                    <div className="flex items-center gap-1.5 text-xs text-slate mb-3">
                      <MapPin size={12} className="text-teal-depth shrink-0" />
                      <span>{restaurant.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate mb-3">
                      <span className="text-sunset font-medium">{restaurant.distance}</span>
                    </div>

                    <button className="text-teal-depth text-sm font-medium hover:text-deep-forest transition-colors self-start">
                      View Menu &rarr;
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
/*  SECTION 4 — ALL RESTAURANTS                                        */
/* ------------------------------------------------------------------ */

function AllRestaurants({ restaurants }: { restaurants: Restaurant[] }) {
  const [expanded, setExpanded] = useState(false)
  const display = expanded ? restaurants : restaurants.slice(0, 9)

  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Complete Guide</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">All Restaurants</h2>
            <p className="text-slate max-w-2xl mx-auto">
              {restaurants.length} restaurants across Kampala and beyond — something for every taste and budget.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {display.map((restaurant, i) => (
              <motion.div
                key={restaurant.id} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              >
                <div className="bg-warm-sand border border-light-grey rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card flex flex-col h-full">
                  <div className="flex items-start gap-4 p-4 flex-1">
                    <div className="shrink-0">
                      <div className={`w-20 h-20 rounded-lg bg-gradient-to-br ${RESTAURANT_GRADIENTS[restaurant.id - 1]} flex items-center justify-center`}>
                        <UtensilsCrossed size={24} className="text-white/70" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {restaurant.cuisine.slice(0, 1).map((c) => (
                          <span key={c} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CUISINE_COLORS[c] || 'bg-slate text-white'}`}>
                            {c}
                          </span>
                        ))}
                        <span className="text-savanna-gold text-xs font-medium ml-auto">{restaurant.price}</span>
                      </div>
                      <h4 className="font-display font-semibold text-deep-forest text-base mb-1 truncate">{restaurant.name}</h4>
                      <p className="text-slate text-xs leading-relaxed line-clamp-2 mb-2">{restaurant.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate">
                        <div className="flex items-center gap-0.5">
                          <Star size={12} className="text-savanna-gold fill-savanna-gold" />
                          <span className="font-medium">{restaurant.rating}</span>
                        </div>
                        <span className="text-sunset">{restaurant.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {restaurants.length > 9 && (
            <motion.div variants={staggerItem} className="text-center mt-8">
              <button
                onClick={() => setExpanded(!expanded)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                {expanded ? 'Show Less' : `Show All ${restaurants.length} Restaurants`}
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SECTION 5 — STREET FOOD GUIDE                                      */
/* ------------------------------------------------------------------ */

function StreetFoodGuide() {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center mb-10">
            <p className="text-sunset text-xs font-medium uppercase tracking-[0.1em] mb-2">Local Culture</p>
            <h2 className="font-display text-display-lg text-deep-forest mb-3">Street Food You Can&apos;t Miss</h2>
            <p className="text-slate max-w-2xl mx-auto">
              Uganda&apos;s street food is an essential part of the experience. Delicious, affordable, and everywhere.
            </p>
          </motion.div>

          <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
            {STREET_FOOD.map((item, i) => (
              <motion.div
                key={item.name} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className="min-w-[260px] sm:min-w-0 sm:flex-1 snap-start"
              >
                <div className="bg-white border border-light-grey rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card h-full text-center">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-sunset/10 flex items-center justify-center mb-4">
                    <item.Icon size={32} className="text-sunset" />
                  </div>
                  <span className="text-sunset font-display font-bold text-lg block mb-1">{item.price}</span>
                  <h3 className="font-display font-semibold text-deep-forest text-lg mb-2">{item.name}</h3>
                  <p className="text-slate text-sm leading-relaxed">{item.description}</p>
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
/*  SECTION 6 — AFCON FOOD FESTIVAL PROMO                              */
/* ------------------------------------------------------------------ */

function FoodFestivalPromo() {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative rounded-2xl overflow-hidden">
            <div className="sunset-gradient p-8 md:p-12 lg:p-16">
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                <div className="flex-1 text-center lg:text-left">
                  <p className="text-white/80 text-xs font-medium uppercase tracking-[0.15em] mb-3">Special Event</p>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                    AFCON 2027 Food Festival
                  </h2>
                  <p className="text-white/90 max-w-lg mb-8 leading-relaxed">
                    Throughout the tournament, experience special food festivals at stadium precincts featuring cuisines from all 24 participating nations.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                    {['24 National Cuisines', 'Live Cooking Demos', 'Cultural Performances'].map((pill) => (
                      <span key={pill} className="bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm">
                        {pill}
                      </span>
                    ))}
                  </div>
                  <button className="bg-white text-sunset font-body font-semibold px-6 py-3 rounded-lg transition-all hover:bg-white/90 hover:-translate-y-0.5">
                    View Festival Schedule
                  </button>
                </div>
                <div className="hidden lg:flex items-center justify-center w-40 h-40">
                  <UtensilsCrossed size={160} className="text-white/10" />
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
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function Dining() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCuisines, setActiveCuisines] = useState<CuisineType[]>(['All'])

  const toggleCuisine = (cuisine: CuisineType) => {
    if (cuisine === 'All') {
      setActiveCuisines(['All'])
      return
    }
    setActiveCuisines((prev) => {
      const withoutAll = prev.filter((c) => c !== 'All')
      if (withoutAll.includes(cuisine)) {
        const next = withoutAll.filter((c) => c !== cuisine)
        return next.length === 0 ? ['All'] : next
      }
      return [...withoutAll, cuisine]
    })
  }

  const allRestaurants = useMemo(() => {
    let filtered = [...RESTAURANTS]

    const cuisines = activeCuisines.includes('All') ? [] : activeCuisines
    if (cuisines.length > 0) {
      filtered = filtered.filter((r) => r.cuisine.some((c) => cuisines.includes(c)))
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.cuisine.some((c) => c.toLowerCase().includes(q))
      )
    }

    return filtered
  }, [activeCuisines, searchQuery])

  const featured = allRestaurants.filter((r) => r.featured)
  const nonFeatured = allRestaurants.filter((r) => !r.featured)

  return (
    <div className="min-h-[100dvh] bg-warm-sand">
      <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <CuisineFilterChips activeCuisines={activeCuisines} toggleCuisine={toggleCuisine} />

      {featured.length > 0 && <FeaturedRestaurants restaurants={featured} />}

      {nonFeatured.length > 0 && <AllRestaurants restaurants={nonFeatured} />}

      {allRestaurants.length === 0 && (
        <section className="section-padding bg-white">
          <div className="container-kitufu text-center">
            <UtensilsCrossed size={48} className="text-light-grey mx-auto mb-4" />
            <h3 className="font-display text-xl text-deep-forest mb-2">No restaurants found</h3>
            <p className="text-slate">Try adjusting your search or filters.</p>
          </div>
        </section>
      )}

      <StreetFoodGuide />
      <FoodFestivalPromo />
    </div>
  )
}
