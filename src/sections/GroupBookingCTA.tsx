import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { motion, useInView } from 'framer-motion'
import { Check } from 'lucide-react'

const features = [
  'Exclusive use of entire building',
  'Private shuttle to stadium (direct)',
  'Dedicated group check-in & concierge',
  'Bulk pricing — save up to 35%',
]

export default function GroupBookingCTA() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  const navigate = useNavigate()

  return (
    <section ref={ref} className="bg-deep-forest section-padding relative overflow-hidden">
      {/* Lubugo pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url(/lubugo-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '400px 400px' }}
      />

      {/* Decorative football icon */}
      <div className="absolute -bottom-10 -right-10 opacity-[0.05] pointer-events-none">
        <svg width="200" height="200" viewBox="0 0 24 24" fill="none" className="text-savanna-gold animate-[spin_60s_linear_infinite]">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" />
          <path d="M12 6c-2 3-4 4.5-4 7a4 4 0 008 0c0-2.5-2-4-4-7z" fill="currentColor" />
          <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      <div className="container-kitufu relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <span className="text-savanna-gold text-xs font-body font-medium uppercase tracking-[0.12em] mb-3 block">
              FOR SUPPORTERS&apos; CLUBS
            </span>
            <h2 className="font-display font-bold text-display-lg text-white mb-4">
              Buy Out a Building for Your Fans
            </h2>
            <p className="text-white/80 text-body-large font-body mb-8 leading-relaxed">
              Traveling with 50, 100, or 200+ fans? Reserve an entire converted building exclusively for your supporters&apos; club. Private shuttles, dedicated concierge, and group rates.
            </p>

            {/* Feature List */}
            <div className="space-y-3 mb-8">
              {features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-depth/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-teal-depth" />
                  </div>
                  <span className="text-white/90 font-body text-sm">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => navigate('/group-booking')}
                className="btn-sunset-gradient animate-pulse-cta"
              >
                Start Your Group Enquiry
              </button>
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 1 }}
              onClick={() => navigate('/group-booking')}
              className="mt-4 text-teal-depth font-body font-medium text-sm underline underline-offset-4 hover:text-white transition-colors"
            >
              Learn more about group bookings &rarr;
            </motion.button>
          </motion.div>

          {/* Right - Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative order-first lg:order-last"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src="/supporters-club.jpg"
                alt="Supporters club celebrating"
                className="w-full h-auto object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(27,67,50,0.5) 100%)' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
