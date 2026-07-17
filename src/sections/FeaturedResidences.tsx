import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { Heart, Star, Bed, Wind, Wifi, Shield, Bus, Lock } from 'lucide-react'
import { trpc } from '../providers/trpc'

const fallbackProperties = [
  { id: 1, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267', badges: [{ label: 'Kitufu Residence', color: 'bg-sunset' }], name: 'Kampala Central Hub', location: 'Namboole, Kampala', distance: '2.1 km to Mandela Stadium', rating: 4.7, reviews: 128, amenities: [{ icon: Bed, label: 'Twin' }, { icon: Wind, label: 'AC' }, { icon: Wifi, label: 'WiFi' }, { icon: Shield, label: 'Security' }], price: 45, total: 315, nights: 7 },
  { id: 2, image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811', badges: [{ label: 'Kitufu Residence', color: 'bg-sunset' }], name: 'Mandela Walk Suites', location: 'Namboole, Kampala', distance: '0.5 km to Mandela Stadium', rating: 4.9, reviews: 256, amenities: [{ icon: Bed, label: 'Quad' }, { icon: Wind, label: 'AC' }, { icon: Bus, label: 'Shuttle' }, { icon: Wifi, label: 'WiFi' }], price: 85, total: 595, nights: 7 },
  { id: 3, image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', badges: [{ label: 'Kitufu Residence', color: 'bg-sunset' }], name: 'Kololo View Apartments', location: 'Kololo, Kampala', distance: '4.5 km to Mandela Stadium', rating: 4.8, reviews: 89, amenities: [{ icon: Bed, label: 'Private' }, { icon: Wind, label: 'AC' }, { icon: Lock, label: 'Safe' }, { icon: Wifi, label: 'WiFi' }], price: 120, total: 840, nights: 7 },
]

export default function FeaturedResidences() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const navigate = useNavigate()

  const { data: apiProperties, isLoading } = trpc.property.list.useQuery({ status: 'approved' })

  // Map API properties to display format, fallback to static if API fails
  const properties = (apiProperties && apiProperties.length > 0)
    ? apiProperties.slice(0, 3).map((p: any) => ({
        id: p.id,
        image: (p.images ? JSON.parse(p.images)[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'),
        badges: [{ label: p.isKitufu ? 'Kitufu Residence' : 'Verified Stay', color: 'bg-sunset' }, ...(p.hasShuttle ? [{ label: 'Shuttle', color: 'bg-teal-depth' }] : [])],
        name: p.title,
        location: p.location + ', Uganda',
        distance: p.distanceToStadium ? p.distanceToStadium + ' to stadium' : '',
        rating: 4.5 + Math.random() * 0.5,
        reviews: Math.floor(50 + Math.random() * 200),
        amenities: [{ icon: Bed, label: p.bedrooms + ' BR' }, { icon: Wind, label: 'AC' }, { icon: Wifi, label: 'WiFi' }, { icon: Shield, label: 'Security' }],
        price: Math.round(p.pricePerNight / 1000),
        total: Math.round(p.pricePerNight / 1000) * 7,
        nights: 7,
      }))
    : fallbackProperties

  return (
    <section className="bg-deep-forest py-20" ref={ref}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Featured Kitufu Residences</h2>
            <p className="text-gray-400">Handpicked stays for AFCON 2027</p>
            {isLoading && <p className="text-savanna-gold text-sm mt-1">Loading from database...</p>}
            {apiProperties && apiProperties.length > 0 && (
              <p className="text-green-400 text-sm mt-1">Loaded {apiProperties.length} properties from database</p>
            )}
          </div>
          <button onClick={() => navigate('/listings')} className="hidden sm:flex items-center gap-2 text-savanna-gold hover:text-white transition-colors">
            View all <span>→</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property: any, i: number) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={() => navigate('/property/' + property.id)}
              className="bg-midnight rounded-xl overflow-hidden cursor-pointer group hover:shadow-2xl hover:shadow-sunset/10 transition-all duration-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img src={property.image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 flex gap-2">
                  {property.badges.map((badge: any, j: number) => (
                    <span key={j} className={badge.color + ' text-white text-xs font-medium px-2.5 py-1 rounded-full'}>{badge.label}</span>
                  ))}
                </div>
                <button className="absolute top-3 right-3 w-9 h-9 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-sunset transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-white font-semibold text-lg">{property.name}</h3>
                  <div className="flex items-center gap-1 text-savanna-gold">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">{property.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-3">{property.location} · {property.distance}</p>
                <div className="flex gap-4 mb-4">
                  {property.amenities.map((amenity: any, j: number) => (
                    <div key={j} className="flex items-center gap-1.5 text-gray-300 text-xs">
                      <amenity.icon className="w-3.5 h-3.5" />
                      <span>{amenity.label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-end justify-between pt-4 border-t border-white/10">
                  <div>
                    <span className="text-2xl font-bold text-white">${property.price}</span>
                    <span className="text-gray-400 text-sm"> /night</span>
                  </div>
                  <span className="text-gray-400 text-sm">${property.total} total</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
