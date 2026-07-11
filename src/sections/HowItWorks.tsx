import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Search, Calendar, Bus, Trophy } from 'lucide-react'

const steps = [
  {
    icon: Search,
    number: '01',
    title: 'Find Your Residence',
    description: 'Search by city, dates, and group size. Filter by amenities, shuttle access, and budget.',
  },
  {
    icon: Calendar,
    number: '02',
    title: 'Reserve Your Spot',
    description: 'Instant booking confirmation. No hidden fees. Flexible cancellation up to 48 hours before check-in.',
  },
  {
    icon: Bus,
    number: '03',
    title: 'Ride to the Stadium',
    description: 'Add a shuttle pass for direct transport to the stadium. Private buses for group bookings.',
  },
  {
    icon: Trophy,
    number: '04',
    title: 'Live the Tournament',
    description: 'Check in, meet fellow fans, and walk into the stadium knowing everything is handled.',
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })

  return (
    <section ref={ref} className="bg-warm-sand section-padding relative overflow-hidden">
      <div className="container-kitufu relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-sunset text-xs font-body font-medium uppercase tracking-[0.12em] mb-2 block">
            THE PROCESS
          </span>
          <h2 className="font-display font-bold text-display-lg text-deep-forest mb-3">
            Book in 4 Simple Steps
          </h2>
          <p className="text-body-large text-slate font-body">
            From search to stadium — we&apos;ve made it seamless
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative">
          {/* Connecting line - desktop only */}
          <div className="hidden lg:block absolute top-[60px] left-[12.5%] right-[12.5%] h-0">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              className="border-t-2 border-dashed border-sunset/30 origin-left"
              style={{ width: '100%' }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
                className="relative text-center"
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-sunset/10 flex items-center justify-center mx-auto mb-4 relative z-10">
                  <step.icon size={28} className="text-sunset" />
                </div>

                {/* Number */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={inView ? { opacity: 0.3 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.12 + 0.2 }}
                  className="font-mono text-sunset text-lg mb-2"
                >
                  {step.number}
                </motion.div>

                {/* Title */}
                <h4 className="font-display font-semibold text-lg text-deep-forest mb-2">
                  {step.title}
                </h4>

                {/* Description */}
                <p className="text-sm text-slate font-body leading-relaxed max-w-[260px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
