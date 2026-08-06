import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Star, Bed, Wind, Wifi, Shield, Bus, MapPin, ArrowUpDown, Plane, UtensilsCrossed, Filter, X, ChevronDown, Users, TrendingDown, BadgeCheck } from 'lucide-react'
import { trpc } from '../providers/trpc'
import QuickBookModal from '@/components/QuickBookModal'
import { useCurrency } from '@/context/CurrencyContext'

function parseDistance(dist: string | null): number {
  if (!dist) return 999
  const match = dist.match(/([0-9.]+)/)
  return match ? parseFloat(match[1]) : 999
}

type SortOption = 'distance' | 'price-asc' | 'price-desc' | 'value' | 'rating'

const CITIES = ['All Cities', 'Kampala', 'Entebbe', 'Jinja', 'Hoima', 'Gulu', 'Mbarara', 'Lubowa', 'Kira', 'Kyaliwajjala']

const PROXIMITY_LABELS = [
  { max: 1, label: 'Stadium Walk', color: 'bg-green-500', icon: MapPin },
  { max: 3, label: 'Very Close', color: 'bg-emerald-500', icon: MapPin },
  { max: 5, label: 'Close', color: 'bg-sage', icon: MapPin },
  { max: 10, label: 'Short Drive', color: 'bg-yellow-500', icon: Bus },
  { max: 999, label: 'Further', color: 'bg-gray-500', icon: Bus },
]

function getProximityBadge(distKm: number) {
  const badge = PROXIMITY_LABELS.find(b => distKm <= b.max) || PROXIMITY_LABELS[PROXIMITY_LABELS.length - 1]
  return badge
}

export default function Listings() {
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [city, setCity] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 300000])
  const [sortBy, setSortBy] = useState<SortOption>('distance')
  const [nearStadiumOnly, setNearStadiumOnly] = useState(false)
  const [shuttleOnly, setShuttleOnly] = useState(false)
  const [groupFriendlyOnly, setGroupFriendlyOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [quickBookProperty, setQuickBookProperty] = useState<{
    id: number
    title: string
    pricePerNight: number
    image: string
  } | null>(null)
  const [nights, setNights] = useState(3)
  const [guests, setGuests] = useState(2)

  const { data: properties, isLoading } = trpc.property.list.useQuery({
    city: city || undefined,
    status: 'approved',
  })

  const processed = useMemo(() => {
    let list = (properties || []).map((p: any) => ({
      ...p,
      distKm: parseDistance(p.distanceToStadium),
      pricePerPerson: Math.round(p.pricePerNight / Math.max(p.capacity, 1)),
      totalCost: p.pricePerNight * nights,
      firstImage: (() => {
        try { return JSON.parse(p.images)[0] } catch { return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267' }
      })(),
      amenityList: (() => {
        try { return JSON.parse(p.amenities) } catch { return [] }
      })(),
    }))

    // Filters
    list = list.filter((p: any) => p.pricePerNight >= priceRange[0] && p.pricePerNight <= priceRange[1])
    if (nearStadiumOnly) list = list.filter((p: any) => p.distKm <= 3)
    if (shuttleOnly) list = list.filter((p: any) => p.hasShuttle === 1)
    if (groupFriendlyOnly) list = list.filter((p: any) => p.isGroupFriendly === 1)

    // Sorting
    list.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'distance': return a.distKm - b.distKm
        case 'price-asc': return a.pricePerNight - b.pricePerNight
        case 'price-desc': return b.pricePerNight - a.pricePerNight
        case 'value': return a.pricePerPerson - b.pricePerPerson
        case 'rating': return (b.isKitufu || 0) - (a.isKitufu || 0)
        default: return 0
      }
    })

    return list
  }, [properties, priceRange, sortBy, nearStadiumOnly, shuttleOnly, groupFriendlyOnly, nights])

  const cheapest = processed.length > 0 ? processed.reduce((min: any, p: any) => p.pricePerNight < min.pricePerNight ? p : min, processed[0]) : null
  const closest = processed.length > 0 ? processed.reduce((min: any, p: any) => p.distKm < min.distKm ? p : min, processed[0]) : null
  const bestValue = processed.length > 0 ? processed.reduce((min: any, p: any) => p.pricePerPerson < min.pricePerPerson ? p : min, processed[0]) : null

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Find Your Stay</h1>
            <p className="text-gray-400">{processed.length} properties near Mandela National Stadium</p>
            {isLoading && <p className="text-savanna-gold text-sm mt-1">Loading from database...</p>}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => navigate('/trip-planner')} className="bg-sunset hover:bg-sunset/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plane className="w-4 h-4" /> Trip Planner
            </button>
            <button onClick={() => navigate('/restaurants')} className="bg-midnight hover:bg-midnight/80 border border-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" /> Dining Guide
            </button>
            <button onClick={() => navigate('/add-property')} className="bg-savanna-gold hover:bg-savanna-gold/90 text-deep-forest px-4 py-2 rounded-lg text-sm font-bold transition-colors">
              + List Property
            </button>
          </div>
        </div>

        {/* Smart Picks Bar */}
        {processed.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {closest && (
              <button onClick={() => navigate('/property/' + closest.id)} className="bg-midnight border border-gray-700 rounded-xl p-4 text-left hover:border-green-500 transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Closest to Stadium</span>
                </div>
                <p className="text-white font-bold truncate group-hover:text-green-400 transition-colors">{closest.title}</p>
                <p className="text-gray-400 text-sm">{closest.distanceToStadium} • {formatPrice(closest.pricePerNight)}/night</p>
              </button>
            )}
            {cheapest && (
              <button onClick={() => navigate('/property/' + cheapest.id)} className="bg-midnight border border-gray-700 rounded-xl p-4 text-left hover:border-sunset transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-sunset" />
                  <span className="text-xs text-sunset font-bold uppercase tracking-wider">Best Price</span>
                </div>
                <p className="text-white font-bold truncate group-hover:text-sunset transition-colors">{cheapest.title}</p>
                <p className="text-gray-400 text-sm">{formatPrice(cheapest.pricePerNight)}/night • {cheapest.distanceToStadium}</p>
              </button>
            )}
            {bestValue && (
              <button onClick={() => navigate('/property/' + bestValue.id)} className="bg-midnight border border-gray-700 rounded-xl p-4 text-left hover:border-savanna-gold transition-colors group">
                <div className="flex items-center gap-2 mb-1">
                  <BadgeCheck className="w-4 h-4 text-savanna-gold" />
                  <span className="text-xs text-savanna-gold font-bold uppercase tracking-wider">Best Value</span>
                </div>
                <p className="text-white font-bold truncate group-hover:text-savanna-gold transition-colors">{bestValue.title}</p>
                <p className="text-gray-400 text-sm">{formatPrice(bestValue.pricePerPerson)}/person/night</p>
              </button>
            )}
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-midnight rounded-xl p-4 mb-8 border border-gray-800">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* City Filter */}
            <div className="flex gap-2 flex-wrap">
              {CITIES.map(c => (
                <button key={c} onClick={() => setCity(c === 'All Cities' ? '' : c)} 
                  className={(city === (c === 'All Cities' ? '' : c) ? 'bg-sunset text-white' : 'bg-deep-forest text-gray-400 hover:text-white') + ' px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap'}>
                  {c}
                </button>
              ))}
            </div>
            <div className="hidden lg:block w-px h-8 bg-gray-700" />
            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortOption)}
                className="bg-deep-forest text-white text-sm rounded-lg px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-sunset">
                <option value="distance">Closest to Stadium</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="value">Best Value (per person)</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
            <button onClick={() => setShowFilters(!showFilters)} 
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
              <Filter className="w-4 h-4" /> More Filters {showFilters ? <X className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mt-4 pt-4 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price Range */}
                <div>
                  <label className="text-gray-400 text-xs mb-2 block">Max Price: {formatPrice(priceRange[1])}</label>
                  <input type="range" min="0" max="300000" step="5000" value={priceRange[1]} 
                    onChange={e => setPriceRange([0, Number(e.target.value)])}
                    className="w-full accent-sunset" />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Free</span>
                    <span>{formatPrice(300000)}</span>
                  </div>
                </div>
                {/* Stay Calculator */}
                <div>
                  <label className="text-gray-400 text-xs mb-2 block">Your Stay: {nights} nights, {guests} guests</label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 bg-deep-forest rounded-lg px-3 py-2">
                      <span className="text-gray-400 text-xs">Nights</span>
                      <button onClick={() => setNights(Math.max(1, nights - 1))} className="text-white hover:text-sunset">-</button>
                      <span className="text-white text-sm w-6 text-center">{nights}</span>
                      <button onClick={() => setNights(Math.min(30, nights + 1))} className="text-white hover:text-sunset">+</button>
                    </div>
                    <div className="flex items-center gap-2 bg-deep-forest rounded-lg px-3 py-2">
                      <span className="text-gray-400 text-xs">Guests</span>
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="text-white hover:text-sunset">-</button>
                      <span className="text-white text-sm w-6 text-center">{guests}</span>
                      <button onClick={() => setGuests(Math.min(50, guests + 1))} className="text-white hover:text-sunset">+</button>
                    </div>
                  </div>
                </div>
                {/* Toggles */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={nearStadiumOnly} onChange={e => setNearStadiumOnly(e.target.checked)} className="w-4 h-4 accent-sunset rounded" />
                    <span className="text-gray-300 text-sm">Within 3km of Stadium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={shuttleOnly} onChange={e => setShuttleOnly(e.target.checked)} className="w-4 h-4 accent-sunset rounded" />
                    <span className="text-gray-300 text-sm">Stadium Shuttle Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={groupFriendlyOnly} onChange={e => setGroupFriendlyOnly(e.target.checked)} className="w-4 h-4 accent-sunset rounded" />
                    <span className="text-gray-300 text-sm">Group Friendly</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="w-8 h-8 border-2 border-savanna-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Finding the best stays for you...
          </div>
        ) : processed.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No properties match your filters</p>
            <button onClick={() => { setCity(''); setPriceRange([0, 300000]); setNearStadiumOnly(false); setShuttleOnly(false); setGroupFriendlyOnly(false); }} 
              className="text-sunset hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processed.map((p: any, i: number) => {
              const badge = getProximityBadge(p.distKm)
              const isCheapest = cheapest && p.id === cheapest.id
              const isClosest = closest && p.id === closest.id
              const isBestValue = bestValue && p.id === bestValue.id
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.5) }}
                  className="bg-midnight rounded-xl overflow-hidden hover:shadow-xl transition-all group border border-gray-800 hover:border-gray-600"
                >
                  <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => navigate('/property/' + p.id)}>
                    <img src={p.firstImage} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267' }} />
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      {isClosest && <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><MapPin className="w-3 h-3" /> Closest</span>}
                      {isCheapest && <span className="bg-sunset text-white text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><TrendingDown className="w-3 h-3" /> Best Price</span>}
                      {isBestValue && <span className="bg-savanna-gold text-deep-forest text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Best Value</span>}
                      {p.isKitufu === 1 && <span className="bg-white/90 text-deep-forest text-xs px-2 py-0.5 rounded-full font-bold">Kitufu Verified</span>}
                    </div>
                    {/* Distance badge */}
                    <div className="absolute bottom-3 left-3">
                      <span className={`${badge.color} text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1`}>
                        <badge.icon className="w-3 h-3" /> {p.distanceToStadium}
                      </span>
                    </div>
                    {/* Price badge */}
                    <div className="absolute bottom-3 right-3">
                      <span className="bg-deep-forest/90 text-white text-sm font-bold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                        {formatPrice(p.pricePerNight)}<span className="text-xs font-normal text-gray-300">/night</span>
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-white font-bold text-lg truncate pr-2 cursor-pointer hover:text-sunset transition-colors" onClick={() => navigate('/property/' + p.id)}>{p.title}</h3>
                      <div className="flex items-center gap-1 text-savanna-gold flex-shrink-0">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold">{(4 + (p.id % 10) / 10).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3 text-sage" /> {p.location} • {p.distanceToStadium} from stadium
                    </p>
                    {/* Amenities */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {p.amenityList.slice(0, 4).map((a: string) => (
                        <span key={a} className="text-xs bg-deep-forest text-gray-300 px-2 py-0.5 rounded">{a}</span>
                      ))}
                      {p.amenityList.length > 4 && <span className="text-xs text-gray-500">+{p.amenityList.length - 4}</span>}
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.capacity}</span>
                      <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {p.bedrooms}</span>
                      {p.hasShuttle === 1 && <span className="flex items-center gap-1 text-green-400"><Bus className="w-3.5 h-3.5" /> Shuttle</span>}
                    </div>
                    {/* Price comparison & CTA */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                      <div>
                        <p className="text-xs text-gray-500">{formatPrice(p.pricePerPerson)} <span className="text-gray-600">/person/night</span></p>
                        <p className="text-sm text-sage font-bold">{formatPrice(p.totalCost)} <span className="text-gray-500 text-xs font-normal">for {nights} nights</span></p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setQuickBookProperty({ id: p.id, title: p.title, pricePerNight: p.pricePerNight, image: p.firstImage })}
                          className="bg-sunset hover:bg-sunset/90 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {quickBookProperty && (
        <QuickBookModal
          propertyId={quickBookProperty.id}
          title={quickBookProperty.title}
          pricePerNight={quickBookProperty.pricePerNight}
          image={quickBookProperty.image}
          onClose={() => setQuickBookProperty(null)}
        />
      )}
    </div>
  )
}
