import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { Lock, Bed, Bus, Check } from 'lucide-react'

const benefits = [
  {
    icon: Lock,
    title: 'Lock in your rate',
    description: "Prices won't change. Book now at today's rate for the full tournament.",
  },
  {
    icon: Bed,
    title: 'Never move rooms',
    description: 'Same room, same building, from opening match to the final group game.',
  },
  {
    icon: Bus,
    title: 'Priority shuttle access',
    description: 'Guaranteed seat on every match-day shuttle. No queues, no hassle.',
  },
]

export default function SeasonPass() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const navigate = useNavigate()

  return (
    <section ref={ref} className="bg-white section-padding">
      <div className="container-kitufu">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Image with Overlay Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="/property-kampala-2.jpg"
                alt="Premium room interior"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Overlay Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:w-auto bg-white/95 backdrop-blur-md rounded-xl p-4 sm:p-5 shadow-card"
            >
              <span className="sunset-gradient text-white text-[10px] font-body font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md inline-block mb-2">
                SEASON PASS
              </span>
              <h4 className="font-display font-semibold text-base text-deep-forest mb-1">
                Book for the Entire Group Stage
              </h4>
              <p className="text-sm text-slate font-body mb-2">
                June 15 — July 15, 2027
              </p>
              <div className="font-display font-bold text-xl text-savanna-gold">
                From $1,800
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="text-sunset text-xs font-body font-medium uppercase tracking-[0.12em] mb-2 block">
              SEASON PASS
            </span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest mb-4">
              One Booking. Every Match.
            </h2>
            <p className="text-body-large text-slate font-body mb-8 leading-relaxed">
              Stay for the entire AFCON group stage and never worry about accommodation again. Perfect for fans following their national team through every game.
            </p>

            {/* Benefits */}
            <div className="space-y-5 mb-8">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.12 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-sunset/10 flex items-center justify-center shrink-0">
                    <benefit.icon size={20} className="text-sunset" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-base text-deep-forest mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm text-slate font-body leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Price & CTA */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="font-display font-bold text-2xl text-deep-forest">
                Season Pass from $1,800
              </div>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="btn-primary"
            >
              Explore Season Passes
            </button>
            <div className="flex items-center gap-2 mt-4 text-xs text-slate font-body">
              <Check size={14} className="text-teal-depth" />
              <span>Flexible cancellation until April 2027</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
