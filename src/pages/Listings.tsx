import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Calendar, Users, Heart, Star, Bed, Wind,
  Wifi, Shield, ChevronDown, Filter, Bus, Eye, Check,
  LayoutGrid, Map as MapIcon, ChevronLeft, ChevronRight
} from 'lucide-react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'

/* ─────────────────────── types ─────────────────────── */

interface UiProperty {
  id: number
  title: string
  location: string
  city: string
  distanceToStadium: string | null
  pricePerNight: number
  rating: number
  reviews: number
  images: string[]
  bedrooms: number | null
  amenities: string[]
  isKitufu: boolean
  hasShuttle: boolean
  isGroupFriendly: boolean
  capacity: number
  description: string | null
}

const AMENITY_OPTIONS = ['AC / Fan', 'WiFi', 'Security', 'Shuttle Included', 'Group Friendly', 'Rating 4+']

/* ─────────────────────── easing token ─────────────────────── */
const easeSmooth = [0.25, 0.1, 0.25, 1] as [number, number, number, number]

/* ─────────────────────── amenity icon helper ─────────────────────── */
function AmenityIcon({ type, size = 14 }: { type: string; size?: number }) {
  const lower = type.toLowerCase()
  if (lower.includes('bed') || lower.includes('twin') || lower.includes('private') || lower.includes('multi')) return <Bed size={size} />
  if (lower.includes('ac') || lower.includes('fan') || lower.includes('wind') || lower.includes('air')) return <Wind size={size} />
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi size={size} />
  if (lower.includes('security') || lower.includes('safe') || lower.includes('shield') || lower.includes('gated') || lower.includes('basic')) return <Shield size={size} />
  return <Check size={size} />
}

/* ─────────────────────── DB → UI mapper ─────────────────────── */
function mapToUi(p: NonNullable<ReturnType<typeof trpc.property.list.useQuery>['data']>[number]): UiProperty {
  const images: string[] = p.images ? JSON.parse(p.images) : []
  const amenities: string[] = p.amenities ? JSON.parse(p.amenities) : []
  return {
    id: p.id,
    title: p.title,
    location: p.address || p.location,
    city: p.location,
    distanceToStadium: p.distanceToStadium,
    pricePerNight: p.pricePerNight,
    rating: 4.5,
    reviews: 0,
    images,
    bedrooms: p.bedrooms,
    amenities,
    isKitufu: !!p.isKitufu,
    hasShuttle: !!p.hasShuttle,
    isGroupFriendly: !!p.isGroupFriendly,
    capacity: p.capacity,
    description: p.description,
  }
}

/* ─────────────────────── sub-components ─────────────────────── */

function FilterChip({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-4 py-2 rounded-full border font-body font-medium text-sm transition-all duration-200 ${
        active
          ? 'bg-sunset text-white border-sunset'
          : 'bg-white text-slate border-light-grey hover:border-sunset/40'
      }`}
    >
      {label}
      {count !== undefined && active && <span className="ml-1.5 opacity-80">({count})</span>}
    </button>
  )
}

function StarRating({ score, reviews }: { score: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        <Star size={14} className="text-savanna-gold fill-savanna-gold" />
        <span className="font-body font-semibold text-sm text-deep-forest">{score}</span>
      </div>
      <span className="text-light-grey">|</span>
      <span className="font-body text-xs text-slate">{reviews} reviews</span>
    </div>
  )
}

/* ─────── Skeleton Card ─────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-light-grey overflow-hidden">
      <div className="aspect-[16/10] bg-light-grey animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-light-grey rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-light-grey rounded w-1/2 animate-pulse" />
        <div className="h-3 bg-light-grey rounded w-2/3 animate-pulse" />
        <div className="h-8 bg-light-grey rounded w-full animate-pulse mt-2" />
      </div>
    </div>
  )
}

function PropertyCard({ property, index }: { property: UiProperty; index: number }) {
  const [fav, setFav] = useState(false)
  const [imgIndex, setImgIndex] = useState(0)

  const images = property.images.length > 0 ? property.images : ['/property-kampala-1.jpg']
  const displayAmenities = property.amenities.slice(0, 4).map(label => ({ icon: label, label }))
  const badges: string[] = []
  if (property.isKitufu) badges.push('Kitufu Residence')
  if (property.hasShuttle) badges.push('Shuttle Included')
  if (property.isGroupFriendly) badges.push('Group Friendly')

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: easeSmooth }}
      layout
      className="group bg-white rounded-xl border border-light-grey overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-sunset/30"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {property.images.length > 0 ? (
          <motion.img
            key={imgIndex}
            src={images[imgIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sunset/20 to-savanna-gold/20 flex items-center justify-center">
            <div className="text-sunset/40 text-4xl font-display font-bold">{property.title.charAt(0)}</div>
          </div>
        )}

        {/* Favorite */}
        <button
          onClick={() => setFav(!fav)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-all duration-200 hover:scale-110 z-10"
        >
          <Heart size={16} className={fav ? 'text-earth-red fill-earth-red' : 'text-slate'} />
        </button>

        {/* Rating badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 px-2 py-1 rounded-md">
          <Star size={12} className="text-savanna-gold fill-savanna-gold" />
          <span className="font-body font-semibold text-xs text-charcoal">{property.rating}</span>
        </div>

        {/* Shuttle badge on image */}
        {property.hasShuttle && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-teal-depth text-white px-2.5 py-1 rounded-md text-xs font-medium">
            <Bus size={12} />
            <span>Shuttle</span>
          </div>
        )}

        {/* Image dots */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          {[0, 1, 2].map(i => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setImgIndex(i) }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === imgIndex ? 'bg-white' : 'bg-white/50'}`}
            />
          ))}
        </div>

        {/* Badges */}
        <div className="absolute top-12 left-3 flex flex-col gap-1">
          {badges.filter(b => b !== 'Shuttle Included').map(badge => (
            <span
              key={badge}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                badge === 'Kitufu Residence'
                  ? 'bg-sunset text-white'
                  : badge === 'Group Friendly'
                    ? 'bg-hoima-blue text-white'
                    : 'bg-deep-forest text-white'
              }`}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-base text-deep-forest truncate">{property.title}</h3>
        <div className="flex items-center gap-1 mt-1 text-slate">
          <MapPin size={12} />
          <span className="font-body text-xs">{property.location} &bull; {property.distanceToStadium} to stadium</span>
        </div>

        <div className="mt-2">
          <StarRating score={property.rating} reviews={property.reviews} />
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-3 mt-3">
          {displayAmenities.map(a => (
            <div key={a.label} className="flex items-center gap-1 text-slate">
              <AmenityIcon type={a.icon} />
              <span className="text-xs font-body">{a.label}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-light-grey my-3" />

        {/* Price & CTA */}
        <div className="flex items-end justify-between">
          <div>
            <span className="font-display font-bold text-xl text-deep-forest">${property.pricePerNight}</span>
            <span className="font-body text-sm text-slate">/night</span>
            <div className="font-body text-xs text-slate">up to {property.capacity} guests</div>
          </div>
          <Link
            to={`/property/${property.id}`}
            className="btn-secondary text-sm px-4 py-2 rounded-lg"
          >
            Check Availability
          </Link>
        </div>

        {/* Shuttle bundling promo */}
        {property.hasShuttle && (
          <div className="mt-3 flex items-center gap-2 bg-teal-depth/10 border border-teal-depth/20 rounded-lg px-3 py-2">
            <Bus size={14} className="text-teal-depth animate-shuttle-float" />
            <span className="text-xs font-body font-medium text-teal-depth">
              Stay + Private Shuttle to Stadium
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ─────── Simulated Map View ─────── */

function SimulatedMapView({ properties }: { properties: UiProperty[] }) {
  return (
    <div className="relative w-full h-full min-h-[calc(100dvh-200px)] bg-warm-sand overflow-hidden rounded-xl">
      {/* Stylized map background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(180deg, #E8F4F0 0%, #FFF8F0 50%, #E8F4F0 100%)'
      }}>
        {/* Roads */}
        <div className="absolute top-[20%] left-0 right-0 h-3 bg-white/80" />
        <div className="absolute top-[60%] left-0 right-0 h-2 bg-white/80" />
        <div className="absolute left-[30%] top-0 bottom-0 w-3 bg-white/80" />
        <div className="absolute left-[70%] top-0 bottom-0 w-2 bg-white/80" />
        {/* Stadium markers */}
        <div className="absolute top-[35%] left-[25%] flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-savanna-gold flex items-center justify-center shadow-lg">
            <Star size={18} className="text-white fill-white" />
          </div>
          <span className="mt-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-semibold text-deep-forest">Mandela Stadium</span>
        </div>
        <div className="absolute top-[50%] right-[20%] flex flex-col items-center">
          <div className="w-8 h-8 rounded-full bg-savanna-gold flex items-center justify-center shadow-lg">
            <Star size={14} className="text-white fill-white" />
          </div>
          <span className="mt-1 bg-white/90 px-2 py-0.5 rounded text-[10px] font-semibold text-deep-forest">Hoima Stadium</span>
        </div>
        {/* Property price markers */}
        {properties.map((p, i) => {
          const top = 15 + (i * 7 + (p.city === 'Hoima' ? 30 : 0)) % 65
          const left = 10 + (i * 13 + (p.city === 'Kampala' ? 0 : 35)) % 80
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03, ease: easeSmooth }}
              className="absolute flex flex-col items-center cursor-pointer group"
              style={{ top: `${top}%`, left: `${left}%` }}
            >
              <div className="bg-sunset text-white px-2.5 py-1.5 rounded-lg font-display font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                ${p.pricePerNight}
              </div>
              <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-sunset" />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────── Pagination ─────── */

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  const pages = useMemo(() => {
    const p: (number | string)[] = []
    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        p.push(i)
      } else if (p[p.length - 1] !== '...') {
        p.push('...')
      }
    }
    return p
  }, [current, total])

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => onChange(Math.max(1, current - 1))}
        disabled={current === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-light-grey text-slate hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((p, i) => (
        p === '...' ? (
          <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-slate">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-body font-semibold text-sm transition-colors ${
              current === p
                ? 'bg-sunset text-white'
                : 'text-slate hover:bg-cream'
            }`}
          >
            {p}
          </button>
        )
      ))}
      <button
        onClick={() => onChange(Math.min(total, current + 1))}
        disabled={current === total}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-light-grey text-slate hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function Listings() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [sortBy, setSortBy] = useState('Recommended')
  const [sortOpen, setSortOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchCity, setSearchCity] = useState('Kampala')
  const [showFilters, setShowFilters] = useState(false)

  /* filter states */
  const [kitufuOnly, setKitufuOnly] = useState(false)
  const [groupFriendly, setGroupFriendly] = useState(false)
  const [shuttleFilter, setShuttleFilter] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([15, 300000])
  const [activeAmenities, setActiveAmenities] = useState<string[]>([])

  const toggleAmenity = useCallback((amenity: string) => {
    setActiveAmenities(prev => prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity])
  }, [])

  /* tRPC query */
  const { data: rawProperties, isLoading } = trpc.property.list.useQuery({
    location: searchCity !== 'All Uganda' ? searchCity : undefined,
    kitufuOnly: kitufuOnly || undefined,
    hasShuttle: shuttleFilter || undefined,
    groupFriendly: groupFriendly || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 300000 ? priceRange[1] : undefined,
  })

  /* map to UI type */
  const properties = useMemo(() => {
    if (!rawProperties) return []
    return rawProperties.map(mapToUi)
  }, [rawProperties])

  /* filtered + sorted (client-side for sorting and amenities) */
  const filtered = useMemo(() => {
    let result = [...properties]

    if (activeAmenities.includes('Rating 4+')) result = result.filter(p => p.rating >= 4.0)

    switch (sortBy) {
      case 'Price: Low to High': result.sort((a, b) => a.pricePerNight - b.pricePerNight); break
      case 'Price: High to Low': result.sort((a, b) => b.pricePerNight - a.pricePerNight); break
      case 'Rating': result.sort((a, b) => b.rating - a.rating); break
      default: break
    }

    return result
  }, [properties, activeAmenities, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / 9))
  const paginated = filtered.slice((currentPage - 1) * 9, currentPage * 9)

  useEffect(() => { setCurrentPage(1) }, [searchCity, kitufuOnly, groupFriendly, shuttleFilter, priceRange, activeAmenities, sortBy])

  const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Distance to Stadium']

  return (
    <div className="min-h-[100dvh] bg-warm-sand">
      {/* ═══════════ Section 1: Sticky Search & Filter Bar ═══════════ */}
      <div className="sticky top-16 z-40 bg-white border-b border-light-grey shadow-sm">
        <div className="container-kitufu py-3">
          {/* Compact Search */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeSmooth }}
            className="flex flex-wrap items-center gap-2"
          >
            {/* Location */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(false)}
                className="flex items-center gap-2 px-4 py-2.5 border border-light-grey rounded-lg hover:border-sunset/40 transition-colors"
              >
                <MapPin size={16} className="text-sunset" />
                <span className="font-body text-sm text-deep-forest">{searchCity} &bull; Mandela Stadium</span>
              </button>
            </div>
            {/* Dates */}
            <div className="flex items-center gap-2 px-4 py-2.5 border border-light-grey rounded-lg hover:border-sunset/40 transition-colors">
              <Calendar size={16} className="text-sunset" />
              <span className="font-body text-sm text-deep-forest">Jun 15 &mdash; Jul 2</span>
            </div>
            {/* Guests */}
            <div className="flex items-center gap-2 px-4 py-2.5 border border-light-grey rounded-lg hover:border-sunset/40 transition-colors">
              <Users size={16} className="text-sunset" />
              <span className="font-body text-sm text-deep-forest">2 adults</span>
            </div>
            {/* Search button */}
            <button className="w-10 h-10 bg-sunset rounded-lg flex items-center justify-center text-white hover:bg-[#E55A2B] transition-colors">
              <Search size={18} />
            </button>
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors lg:hidden ${showFilters ? 'border-sunset bg-sunset/10 text-sunset' : 'border-light-grey text-slate'}`}
            >
              <Filter size={16} />
              <span className="font-body text-sm">Filters</span>
            </button>
          </motion.div>

          {/* Filter Chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, staggerChildren: 0.04 }}
            className="flex items-center gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1"
          >
            <FilterChip label="Price" active={showFilters} onClick={() => setShowFilters(!showFilters)} />
            <FilterChip label="Kitufu Residences Only" active={kitufuOnly} onClick={() => setKitufuOnly(!kitufuOnly)} />
            <FilterChip label="Shuttle Included" active={shuttleFilter} onClick={() => setShuttleFilter(!shuttleFilter)} />
            <FilterChip label="Group Friendly" active={groupFriendly} onClick={() => setGroupFriendly(!groupFriendly)} />
            {AMENITY_OPTIONS.map(opt => (
              <FilterChip
                key={opt}
                label={opt}
                active={activeAmenities.includes(opt)}
                onClick={() => toggleAmenity(opt)}
              />
            ))}
            {/* Location toggle */}
            <div className="flex items-center border border-light-grey rounded-lg overflow-hidden shrink-0">
              {(['Kampala', 'Hoima'] as const).map(city => (
                <button
                  key={city}
                  onClick={() => setSearchCity(city)}
                  className={`px-4 py-2 font-body text-sm transition-colors ${
                    searchCity === city ? 'bg-sunset text-white' : 'text-slate hover:bg-cream'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Expandable Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: easeSmooth }}
                className="overflow-hidden"
              >
                <div className="py-5 border-t border-light-grey mt-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Price Range */}
                    <div>
                      <label className="font-body font-medium text-sm text-deep-forest mb-2 block">
                        Price Range: ${priceRange[0]} &mdash; ${priceRange[1]}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={15}
                          max={300000}
                          value={priceRange[0]}
                          onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="flex-1 accent-sunset"
                        />
                        <input
                          type="range"
                          min={15}
                          max={300000}
                          value={priceRange[1]}
                          onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="flex-1 accent-sunset"
                        />
                      </div>
                    </div>
                    {/* Amenities checkboxes */}
                    <div>
                      <label className="font-body font-medium text-sm text-deep-forest mb-2 block">Amenities</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['AC', 'WiFi', 'Security', 'Shuttle'].map(a => (
                          <label key={a} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="accent-sunset w-4 h-4" />
                            <span className="font-body text-sm text-slate">{a}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Guest capacity */}
                    <div>
                      <label className="font-body font-medium text-sm text-deep-forest mb-2 block">Minimum Beds</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4].map(n => (
                          <button
                            key={n}
                            className="w-10 h-10 rounded-lg border border-light-grey font-body text-sm text-slate hover:border-sunset hover:text-sunset transition-colors"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                      onClick={() => { setKitufuOnly(false); setGroupFriendly(false); setShuttleFilter(false); setPriceRange([15, 300000]); setActiveAmenities([]) }}
                      className="font-body text-sm text-slate hover:text-deep-forest underline underline-offset-4"
                    >
                      Clear All
                    </button>
                    <button className="btn-primary px-5 py-2.5 text-sm">
                      Show {filtered.length} Results
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════ Section 2: Results Header ═══════════ */}
      <div className="container-kitufu py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2, ease: easeSmooth }}
          className="flex flex-wrap items-center justify-between gap-4"
        >
          {/* Breadcrumbs + Count */}
          <div>
            <div className="flex items-center gap-1 text-sm text-slate mb-1">
              <Link to="/" className="hover:text-sunset transition-colors">Home</Link>
              <ChevronRight size={14} />
              <span className="text-deep-forest font-medium">Listings</span>
              <ChevronRight size={14} />
              <span className="text-deep-forest font-medium">{searchCity}</span>
            </div>
            <p className="font-body text-deep-forest">
              <span className="font-semibold">{isLoading ? '...' : filtered.length}</span> residences found in {searchCity}
            </p>
            <p className="font-body text-xs text-slate">for Jun 15 &mdash; Jul 2, 2027 &bull; 2 guests</p>
          </div>

          {/* View Toggle + Sort */}
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex items-center border border-light-grey rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-2 font-body text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-cream text-sunset' : 'text-slate hover:bg-cream'
                }`}
              >
                <LayoutGrid size={16} />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-4 py-2 font-body text-sm transition-colors ${
                  viewMode === 'map' ? 'bg-cream text-sunset' : 'text-slate hover:bg-cream'
                }`}
              >
                <MapIcon size={16} />
                <span className="hidden sm:inline">Map</span>
              </button>
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-light-grey rounded-lg font-body text-sm text-slate hover:border-sunset/40 transition-colors"
              >
                <span>Sort: {sortBy}</span>
                <ChevronDown size={14} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-light-grey rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]"
                  >
                    {sortOptions.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortOpen(false) }}
                        className={`w-full text-left px-4 py-2.5 font-body text-sm transition-colors ${
                          sortBy === opt ? 'bg-cream text-sunset font-medium' : 'text-slate hover:bg-cream'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════ Section 3: Property Grid + Map ═══════════ */}
      <div className="container-kitufu pb-8">
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Loading skeletons */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {/* Property Grid */}
              {!isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {paginated.map((property, i) => (
                      <PropertyCard key={property.id} property={property} index={i} />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {!isLoading && filtered.length === 0 && (
                <div className="text-center py-20">
                  <p className="font-display font-semibold text-xl text-deep-forest mb-2">No properties found</p>
                  <p className="font-body text-slate">Try adjusting your filters to see more results.</p>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && filtered.length > 0 && (
                <Pagination current={currentPage} total={totalPages} onChange={setCurrentPage} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col lg:flex-row gap-6"
            >
              {/* Left: Compact list */}
              <div className="lg:w-[55%] max-h-[calc(100dvh-260px)] overflow-y-auto pr-1 scrollbar-hide">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(isLoading ? Array.from({ length: 4 }) : filtered).map((p, i) => (
                    isLoading ? (
                      <div key={`map-skel-${i}`} className="flex gap-3 bg-white rounded-lg border border-light-grey p-3">
                        <div className="w-28 h-20 bg-light-grey rounded-lg shrink-0 animate-pulse" />
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 bg-light-grey rounded w-3/4 animate-pulse" />
                          <div className="h-3 bg-light-grey rounded w-1/2 animate-pulse" />
                          <div className="h-3 bg-light-grey rounded w-1/3 animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <motion.div
                        key={(p as UiProperty).id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.04, ease: easeSmooth }}
                        className="flex gap-3 bg-white rounded-lg border border-light-grey p-3 hover:border-sunset/30 cursor-pointer transition-colors"
                      >
                        <div className="w-28 h-20 rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-sunset/10 to-savanna-gold/10">
                          {(p as UiProperty).images.length > 0 ? (
                            <img src={(p as UiProperty).images[0]} alt={(p as UiProperty).title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sunset/30 text-xl font-display font-bold">
                              {(p as UiProperty).title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-display font-semibold text-sm text-deep-forest truncate">{(p as UiProperty).title}</h4>
                          <div className="flex items-center gap-1 mt-0.5 text-slate">
                            <MapPin size={10} />
                            <span className="text-xs">{(p as UiProperty).location}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={10} className="text-savanna-gold fill-savanna-gold" />
                            <span className="text-xs font-semibold text-deep-forest">{(p as UiProperty).rating}</span>
                          </div>
                          <div className="mt-1 font-display font-bold text-sm text-deep-forest">
                            ${(p as UiProperty).pricePerNight}<span className="text-xs font-normal text-slate">/night</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  ))}
                </div>
              </div>
              {/* Right: Map */}
              <div className="lg:w-[45%] lg:sticky lg:top-[152px] lg:h-[calc(100dvh-260px)]">
                <SimulatedMapView properties={filtered} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════ Section 4: Kitufu Residences Promo Strip ═══════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, ease: easeSmooth }}
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #1B4332 0%, #2A9D8F 100%)' }}
      >
        <div className="container-kitufu py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="font-body font-medium text-xs text-savanna-gold uppercase tracking-[0.1em]">Discover Kitufu Residences</span>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-white mt-2">Stay at Converted Buildings, Fully Kitted for Fans</h2>
              <p className="font-body text-white/80 mt-3 leading-relaxed">
                The cleanest, most secure pop-up accommodation in Uganda. UTB certified with 24/7 security, working AC, and shuttle to the stadium.
              </p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
              <Link to="/afcon-2027" className="px-6 py-3 border-2 border-white text-white rounded-lg font-body font-semibold text-sm hover:bg-white hover:text-deep-forest transition-all">
                Learn More
              </Link>
              <span className="font-body text-sm text-white/60 underline underline-offset-4 cursor-pointer hover:text-white transition-colors">
                What&apos;s a Kitufu Residence?
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ═══════════ Section 5: Recently Viewed ═══════════ */}
      <section className="bg-white">
        <div className="container-kitufu py-12">
          <h3 className="font-display font-bold text-xl text-deep-forest mb-6">Recently Viewed</h3>
          {isLoading ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shrink-0 w-64 bg-white rounded-lg border border-light-grey overflow-hidden">
                  <div className="w-full h-32 bg-light-grey animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-light-grey rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-light-grey rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {properties.slice(0, 4).map((property, i) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, x: 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: easeSmooth }}
                  className="shrink-0 w-64 bg-white rounded-lg border border-light-grey overflow-hidden hover:shadow-card-hover transition-shadow"
                >
                  {property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-br from-sunset/10 to-savanna-gold/10 flex items-center justify-center text-sunset/30 text-3xl font-display font-bold">
                      {property.title.charAt(0)}
                    </div>
                  )}
                  <div className="p-3">
                    <h4 className="font-display font-semibold text-sm text-deep-forest truncate">{property.title}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-display font-bold text-sm text-deep-forest">${property.pricePerNight}<span className="text-xs font-normal text-slate">/night</span></span>
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-savanna-gold fill-savanna-gold" />
                        <span className="text-xs font-semibold">{property.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
