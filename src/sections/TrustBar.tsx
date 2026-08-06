import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, Users, MapPin, Shield } from 'lucide-react'
import { trpc } from '../providers/trpc'

const fallbackStats = [
  { icon: Building2, number: 500, suffix: '+', label: 'Converted Residences' },
  { icon: Users, number: 15000, suffix: '+', label: 'Beds Available' },
  { icon: MapPin, number: 2, suffix: '', label: 'Host Cities' },
  { icon: Shield, number: 100, suffix: '%', label: 'UTB Certified' },
]

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString()
  return n.toString()
}

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })

  const { data: properties } = trpc.property.list.useQuery({ status: 'approved' })

  // Calculate real stats from data
  const totalProperties = properties?.length ?? fallbackStats[0].number
  const totalBeds = properties?.reduce((sum: number, p: any) => sum + (p.capacity || 0), 0) ?? fallbackStats[1].number
  const uniqueCities = new Set(properties?.map((p: any) => p.location) ?? []).size || fallbackStats[2].number

  const stats = [
    { icon: Building2, number: totalProperties, suffix: '+', label: 'Converted Residences' },
    { icon: Users, number: totalBeds, suffix: '+', label: 'Beds Available' },
    { icon: MapPin, number: Math.max(uniqueCities, 2), suffix: '', label: 'Host Cities' },
    { icon: Shield, number: 100, suffix: '%', label: 'UTB Certified' },
  ]

  return (
    <section ref={ref} className="bg-white border-b border-light-grey">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 lg:py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`flex flex-col items-center text-center py-4 ${
                i < stats.length - 1 ? 'lg:border-r lg:border-light-grey' : ''
              }`}
            >
              <stat.icon size={24} className="text-deep-forest mb-3" />
              <div className="font-display font-bold text-2xl lg:text-[2rem] text-sunset mb-1">
                {inView ? formatNumber(stat.number) : '0'}{stat.suffix}
              </div>
              <div className="text-sm text-slate font-body">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="mt-8 pt-6 border-t border-light-grey"
        >
          <p className="text-center text-xs text-slate font-body uppercase tracking-[0.1em] mb-4">
            Official Partners
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60 hover:opacity-100 transition-opacity duration-300">
            {['UTB', 'CAF', 'UHOA', 'Kitufu'].map((partner) => (
              <div
                key={partner}
                className="text-deep-forest font-display font-bold text-sm lg:text-base tracking-wide"
              >
                {partner === 'UTB' && 'Uganda Tourism Board'}
                {partner === 'CAF' && 'CAF Official Partner'}
                {partner === 'UHOA' && 'UHOA'}
                {partner === 'Kitufu' && 'Kitufu Residences'}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
