import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Star, Bed, Wind, Wifi, Shield, Bus, MapPin, Filter } from 'lucide-react'
import { trpc } from '../providers/trpc'

export default function Listings() {
  const navigate = useNavigate()
  const [city, setCity] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000])

  const { data: properties, isLoading } = trpc.property.list.useQuery({
    city: city || undefined,
    status: 'approved',
  })

  const filtered = (properties || []).filter((p: any) =>
    p.pricePerNight >= priceRange[0] && p.pricePerNight <= priceRange[1]
  )

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">All Residences</h1>
            <p className="text-gray-400">{filtered.length} properties available for AFCON 2027</p>
            {isLoading && <p className="text-savanna-gold text-sm">Loading from database...</p>}
          </div>
          <button onClick={() => navigate('/add-property')} className="bg-sunset hover:bg-sunset/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + Add Property
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {['', 'Kampala', 'Hoima'].map(c => (
            <button key={c || 'all'} onClick={() => setCity(c)} className={(city === c ? 'bg-sunset text-white' : 'bg-midnight text-gray-400') + ' px-4 py-2 rounded-full text-sm transition-colors'}>
              {c || 'All Cities'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-400">Loading properties...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">No properties found</p>
            <button onClick={() => navigate('/add-property')} className="text-sunset hover:underline">Be the first to list a property</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate('/property/' + p.id)}
                className="bg-midnight rounded-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={p.images ? JSON.parse(p.images)[0] : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267' }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    {p.isKitufu === 1 && <span className="bg-sunset text-white text-xs px-2.5 py-1 rounded-full">Kitufu</span>}
                    {p.hasShuttle === 1 && <span className="bg-teal-depth text-white text-xs px-2.5 py-1 rounded-full">Shuttle</span>}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold text-lg mb-1">{p.title}</h3>
                  <p className="text-gray-400 text-sm mb-2"><MapPin className="w-3 h-3 inline mr-1" />{p.location} {p.distanceToStadium ? '· ' + p.distanceToStadium : ''}</p>
                  <div className="flex gap-3 mb-3 text-gray-300 text-xs">
                    <span><Bed className="w-3 h-3 inline mr-1" />{p.bedrooms} BR</span>
                    <span><Wind className="w-3 h-3 inline mr-1" />AC</span>
                    <span><Wifi className="w-3 h-3 inline mr-1" />WiFi</span>
                  </div>
                  <div className="flex items-end justify-between pt-3 border-t border-white/10">
                    <div>
                      <span className="text-xl font-bold text-white">USh {p.pricePerNight.toLocaleString()}</span>
                      <span className="text-gray-400 text-sm"> /night</span>
                    </div>
                    <span className="text-savanna-gold text-sm font-medium">{p.capacity} guests</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
