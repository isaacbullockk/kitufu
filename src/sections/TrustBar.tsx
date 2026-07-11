import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useMotionValue, animate } from 'framer-motion'
import { Building2, Users, MapPin, Shield } from 'lucide-react'

const stats = [
  { icon: Building2, number: 500, suffix: '+', label: 'Converted Residences' },
  { icon: Users, number: 15000, suffix: '+', label: 'Beds Available' },
  { icon: MapPin, number: 2, suffix: '', label: 'Host Cities' },
  { icon: Shield, number: 100, suffix: '%', label: 'UTB Certified' },
]

function AnimatedCounter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const count = useMotionValue(0)
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (!inView) return
    const controls = animate(count, target, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (target >= 1000) {
          setDisplay(Math.round(v).toLocaleString())
        } else {
          setDisplay(Math.round(v).toString())
        }
      },
    })
    return controls.stop
  }, [inView, target, count])

  return <span>{display}{suffix}</span>
}

export default function TrustBar() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20% 0px' })

  return (
    <section ref={ref} className="bg-white border-b border-light-grey">
      <div className="container-kitufu py-8 lg:py-10">
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
              <stat.icon size={24} className="text-teal-depth mb-3" />
              <div className="font-display font-bold text-2xl lg:text-[2rem] text-sunset mb-1">
                <AnimatedCounter target={stat.number} suffix={stat.suffix} inView={inView} />
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
