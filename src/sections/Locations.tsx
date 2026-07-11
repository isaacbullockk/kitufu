import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { Building2, Bed, Bus } from 'lucide-react'

const locations = [
  {
    city: 'Kampala',
    badge: 'KAMPALA',
    badgeColor: 'bg-sunset',
    stadium: 'Mandela National Stadium',
    residences: '250+',
    beds: '8,000',
    image: '/stadium-mandela.jpg',
    stats: [
      { icon: Building2, value: '250+', label: 'Residences' },
      { icon: Bed, value: '8,000', label: 'Beds' },
      { icon: Bus, value: 'Shuttle', label: 'to Stadium' },
    ],
  },
  {
    city: 'Hoima',
    badge: 'HOIMA',
    badgeColor: 'bg-hoima-blue',
    stadium: 'Hoima City Stadium',
    residences: '150+',
    beds: '5,000',
    image: '/stadium-hoima.jpg',
    stats: [
      { icon: Building2, value: '150+', label: 'Residences' },
      { icon: Bed, value: '5,000', label: 'Beds' },
      { icon: Bus, value: 'Shuttle', label: 'to Stadium' },
    ],
  },
]

export default function Locations() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })
  const navigate = useNavigate()

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[500px]">
        {locations.map((loc, i) => (
          <motion.div
            key={loc.city}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: i * 0.2 }}
            className="relative flex-1 min-h-[400px] lg:min-h-0 group overflow-hidden"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={loc.image}
                alt={loc.stadium}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>

            {/* Dark Overlay */}
            <div className="dark-overlay absolute inset-0" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end p-8 lg:p-10">
              {/* Badge */}
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.2 + 0.2 }}
                className={`${loc.badgeColor} text-white text-xs font-body font-semibold uppercase tracking-wider px-4 py-1.5 rounded-md w-fit mb-4`}
              >
                {loc.badge}
              </motion.span>

              {/* Title */}
              <motion.h3
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 + 0.3 }}
                className="font-display font-bold text-4xl lg:text-[2.5rem] text-white mb-2"
              >
                {loc.city}
              </motion.h3>

              {/* Stadium */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 + 0.4 }}
                className="text-white/80 text-body-large font-body mb-4"
              >
                {loc.stadium}
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.2 + 0.5 }}
                className="flex gap-4 mb-6"
              >
                {loc.stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-1.5 text-white/80">
                    <stat.icon size={14} className="text-savanna-gold" />
                    <span className="text-sm font-body">{stat.value} {stat.label}</span>
                  </div>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.2 + 0.6 }}
              >
                <button
                  onClick={() => navigate('/listings')}
                  className="bg-white text-deep-forest font-body font-semibold text-sm px-6 py-3 rounded-lg hover:bg-sunset hover:text-white transition-all duration-200"
                >
                  Explore {loc.city}
                </button>
              </motion.div>
            </div>

            {/* Lubugo decoration */}
            <div
              className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none"
              style={{ backgroundImage: 'url(/lubugo-pattern.svg)', backgroundSize: '200px 200px' }}
            />
          </motion.div>
        ))}

        {/* Diagonal divider - desktop only */}
        <div className="hidden lg:block absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2 z-20 pointer-events-none">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
            className="h-full origin-top"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 30%, rgba(255,255,255,0.4) 70%, transparent 100%)',
              transform: 'rotate(12deg)',
              transformOrigin: 'center',
            }}
          />
        </div>
      </div>
    </section>
  )
}
