import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    quote: "We brought 150 Super Eagles fans and Kitufu handled everything. Our own building, private shuttle, and the concierge even helped us find a spot to hang our banner. Unforgettable.",
    name: 'Chinedu Okafor',
    role: 'Nigeria Supporters\' Club, Lagos Chapter',
    initials: 'CO',
    color: 'bg-sunset',
  },
  {
    quote: "I was worried about finding clean, safe accommodation in Hoima. The Kitufu Hub exceeded every expectation. Working AC, hot water, and the shuttle got us to the stadium in 10 minutes.",
    name: 'Amadou Diallo',
    role: 'Senegal Fan, Dakar',
    initials: 'AD',
    color: 'bg-teal-depth',
  },
  {
    quote: "The Season Pass was the best decision. Same room for three weeks, no hassle, and I saved money compared to switching hotels. Met fans from 12 different countries in my building.",
    name: 'Sarah Mensah',
    role: 'Ghana Fan, Accra',
    initials: 'SM',
    color: 'bg-hoima-blue',
  },
  {
    quote: "As a building owner, listing with Kitufu was straightforward. They handled all the UTB paperwork and the income during AFCON covered my entire year's rent.",
    name: 'Robert Mukasa',
    role: 'Building Owner, Kampala',
    initials: 'RM',
    color: 'bg-deep-forest',
  },
  {
    quote: "The group booking process was seamless. We submitted our enquiry, got a video tour of the building within 24 hours, and locked in our rate. Professional from start to finish.",
    name: 'Fatima Al-Hassan',
    role: 'Morocco Supporters\' Club Organizer',
    initials: 'FA',
    color: 'bg-savanna-gold',
  },
]

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(0)

  // Auto-scroll
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1)
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  const goPrev = () => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goNext = () => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }

  const [visibleIndices, setVisibleIndices] = useState([0, 1, 2])

  useEffect(() => {
    const handleResize = () => {
      const count = window.innerWidth < 768 ? 1 : 3
      const indices = []
      for (let i = 0; i < count; i++) {
        indices.push((current + i) % testimonials.length)
      }
      setVisibleIndices(indices)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [current])

  return (
    <section ref={ref} className="bg-warm-sand section-padding overflow-hidden">
      <div className="container-kitufu">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="text-sunset text-xs font-body font-medium uppercase tracking-[0.12em] mb-2 block">
              FAN STORIES
            </span>
            <h2 className="font-display font-bold text-display-lg text-deep-forest">
              What Fans Are Saying
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              className="w-10 h-10 rounded-full bg-white border border-light-grey flex items-center justify-center text-slate hover:border-sunset hover:text-sunset transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={goNext}
              className="w-10 h-10 rounded-full bg-white border border-light-grey flex items-center justify-center text-slate hover:border-sunset hover:text-sunset transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout" custom={direction}>
              {visibleIndices.map((idx, arrIdx) => (
                <motion.div
                  key={`${idx}-${testimonials[idx].name}`}
                  initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
                  className={`bg-white rounded-xl p-8 shadow-card border-t-4 border-sunset ${
                    arrIdx === 1 ? 'md:scale-[1.02]' : ''
                  } transition-transform duration-300`}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className="text-savanna-gold fill-savanna-gold" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm text-slate font-body leading-relaxed mb-6">
                    &ldquo;{testimonials[idx].quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${testimonials[idx].color} flex items-center justify-center text-white font-body font-semibold text-sm`}>
                      {testimonials[idx].initials}
                    </div>
                    <div>
                      <div className="font-body font-semibold text-sm text-deep-forest">
                        {testimonials[idx].name}
                      </div>
                      <div className="text-xs text-slate font-body">
                        {testimonials[idx].role}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                i === current ? 'bg-sunset' : 'bg-light-grey hover:bg-slate/50'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
