import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { Heart, Star, Bed, Wind, Wifi, Shield, Bus, Lock } from 'lucide-react'

const properties = [
  {
    id: 1,
    image: '/property-kampala-1.jpg',
    badges: [
      { label: 'Kitufu Residence', color: 'bg-sunset' },
      { label: 'Shuttle Included', color: 'bg-teal-depth' },
    ],
    name: 'Kampala Central Hub',
    location: 'Namboole, Kampala',
    distance: '2.1 km to Mandela Stadium',
    rating: 4.7,
    reviews: 128,
    amenities: [
      { icon: Bed, label: 'Twin/Quad' },
      { icon: Wind, label: 'AC' },
      { icon: Wifi, label: 'WiFi' },
      { icon: Shield, label: '24/7 Security' },
    ],
    price: 45,
    total: 315,
    nights: 7,
  },
  {
    id: 2,
    image: '/property-hoima-1.jpg',
    badges: [
      { label: 'Kitufu Residence', color: 'bg-sunset' },
      { label: 'Group Friendly', color: 'bg-hoima-blue' },
      { label: 'Limited Availability', color: 'bg-earth-red animate-pulse' },
    ],
    name: 'Hoima Fan Village',
    location: 'Central Hoima',
    distance: '1.5 km to Hoima Stadium',
    rating: 4.5,
    reviews: 89,
    amenities: [
      { icon: Bed, label: 'Multi-share' },
      { icon: Wind, label: 'Fan' },
      { icon: Bus, label: 'Shuttle' },
      { icon: Shield, label: 'Gated' },
    ],
    price: 28,
    total: 196,
    nights: 7,
  },
  {
    id: 3,
    image: '/property-kampala-2.jpg',
    badges: [
      { label: 'Kitufu Residence', color: 'bg-sunset' },
      { label: 'Season Pass Available', color: 'bg-gradient-to-r from-sunset to-savanna-gold' },
    ],
    name: 'Kampala Premium Suites',
    location: 'Kireka, Kampala',
    distance: '3.8 km to Mandela Stadium',
    rating: 4.9,
    reviews: 203,
    amenities: [
      { icon: Bed, label: 'Private Rooms' },
      { icon: Wind, label: 'AC' },
      { icon: Wifi, label: 'WiFi' },
      { icon: Lock, label: 'Safe' },
    ],
    price: 72,
    total: 2160,
    nights: 30,
    seasonPass: true,
  },
]

function PropertyCard({ property, index }: { property: typeof properties[0]; index: number }) {
  const navigate = useNavigate()
  const [favorited, setFavorited] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
      onClick={() => navigate(`/property/${property.id}`)}
      className="group bg-white rounded-xl border border-light-grey overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-sunset/30"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {property.badges.map((badge) => (
            <span
              key={badge.label}
              className={`${badge.color} text-white text-[10px] font-body font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md`}
            >
              {badge.label}
            </span>
          ))}
        </div>
        {/* Rating */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1">
          <Star size={12} className="text-savanna-gold fill-savanna-gold" />
          <span className="text-xs font-body font-semibold text-charcoal">{property.rating}</span>
        </div>
        {/* Heart */}
        <button
          onClick={(e) => { e.stopPropagation(); setFavorited(!favorited) }}
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <Heart
            size={16}
            className={favorited ? 'text-earth-red fill-earth-red' : 'text-slate'}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-base text-deep-forest mb-1 group-hover:text-sunset transition-colors">
          {property.name}
        </h3>
        <p className="text-sm text-slate font-body mb-0.5">{property.location}</p>
        <p className="text-xs text-slate/70 font-body mb-3">{property.distance}</p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mb-4">
          {property.amenities.map((amenity) => (
            <div key={amenity.label} className="flex items-center gap-1 text-slate">
              <amenity.icon size={13} className="text-teal-depth" />
              <span className="text-xs font-body">{amenity.label}</span>
            </div>
          ))}
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between">
          <div>
            <div className="font-display font-bold text-lg text-deep-foreground">
              ${property.price}<span className="text-sm font-normal text-slate">/night</span>
            </div>
            <div className="text-xs text-slate font-body">
              Total: ${property.total.toLocaleString()} for {property.nights} night{property.nights > 1 ? 's' : ''}
              {property.seasonPass && ' (Season Pass)'}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/property/${property.id}`) }}
            className="btn-secondary text-sm px-4 py-2"
          >
            Check Availability
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function FeaturedResidences() {
  const navigate = useNavigate()
  const headerRef = useRef<HTMLDivElement>(null)
  const headerInView = useInView(headerRef, { once: true, margin: '-10% 0px' })

  return (
    <section className="bg-white section-padding">
      <div className="container-kitufu">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 40 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="text-sunset text-xs font-body font-medium uppercase tracking-[0.12em] mb-2 block">
              KITUFU RESIDENCES
            </span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest mb-3">
              Where Fans Stay Together
            </h2>
            <p className="text-body-large text-slate font-body max-w-xl">
              Converted buildings, fully kitted for AFCON. Clean, secure, and closer to the action than anywhere else.
            </p>
          </div>
          <button onClick={() => navigate('/listings')} className="text-teal-depth font-body font-medium text-sm underline underline-offset-4 hover:text-deep-forest transition-colors shrink-0">
            View All &rarr;
          </button>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, i) => (
            <PropertyCard key={property.id} property={property} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
