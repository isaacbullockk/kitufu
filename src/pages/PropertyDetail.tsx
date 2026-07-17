import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bed, Wind, Wifi, Shield, Lock, Bath, Car, Bus,
  Bell, Camera, Flame, Check, MapPin, Star, Share2, Heart,
  ChevronLeft, ChevronRight, X, Clock, Users, PawPrint,
  ThumbsUp, Calendar, Compass, Mountain, Building2,
  UtensilsCrossed, ChevronRight as ChevronRightIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import useEmblaCarousel from 'embla-carousel-react'
import { trpc } from '@/providers/trpc'
import ReviewsSection from '@/components/ReviewsSection'

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface UiPropertyDetail {
  id: number
  title: string
  subtitle: string
  location: string
  distanceToStadium: string | null
  badges: string[]
  rating: number
  reviewCount: number
  pricePerNight: number
  images: string[]
  amenities: { icon: typeof Bed; label: string }[]
  description: string
  houseRules: { icon: typeof Clock; text: string }[]
  hasShuttle: boolean
  capacity: number
  bedrooms: number | null
  bathrooms: number | null
  isKitufu: boolean
  isGroupFriendly: boolean
}

/* ------------------------------------------------------------------ */
/*  STATIC DATA (reviews, nearby, etc.)                                */
/* ------------------------------------------------------------------ */

const REVIEWS = {
  breakdown: [
    { stars: 5, count: 78 },
    { stars: 4, count: 32 },
    { stars: 3, count: 12 },
    { stars: 2, count: 4 },
    { stars: 1, count: 2 },
  ],
  items: [
    {
      id: 1, name: 'James O.', date: 'Dec 2026', rating: 5,
      text: 'Excellent location and the shuttle service made getting to the stadium so easy. Rooms were clean, AC worked great, and the staff was incredibly helpful. Highly recommend for any football fan!',
      helpful: 24,
    },
    {
      id: 2, name: 'Maria K.', date: 'Nov 2026', rating: 4,
      text: 'Great value for money. The building is secure and well-maintained. WiFi was fast enough for video calls. Only minor issue was shared bathrooms getting busy on match mornings.',
      helpful: 18,
    },
    {
      id: 3, name: 'David M.', date: 'Oct 2026', rating: 5,
      text: 'Perfect for AFCON! The Kitufu team really knows what football fans need. The concierge helped us plan our match days and the shuttle was always on time. Will book again!',
      helpful: 31,
    },
  ],
}

const NEARBY_ATTRACTIONS = [
  { id: 'na-1', name: 'Kasubi Royal Tombs', category: 'Culture', description: 'UNESCO World Heritage Site and burial ground of Buganda kings.', distance: '20 min', icon: Building2 },
  { id: 'na-2', name: 'Bahai Temple', category: 'Culture', description: 'The only Bahai House of Worship in Africa. Stunning architecture.', distance: '30 min', icon: Camera },
  { id: 'na-3', name: 'Ndere Cultural Centre', category: 'Culture', description: 'Vibrant performances of traditional music and dance.', distance: '25 min', icon: Users },
  { id: 'na-4', name: 'Lake Victoria', category: 'Nature', description: "Africa's largest lake. Sunset cruises and island hopping.", distance: '40 min', icon: Mountain },
]

const SIMILAR_PROPERTIES = [
  { id: 'kampala-2', name: 'Kampala Fan Lodge', location: 'Kira, Kampala', rating: 4.5, reviews: 96, price: 38, image: '/property-kampala-2.jpg' },
  { id: 'kampala-3', name: 'Stadium View Stay', location: 'Namboole, Kampala', rating: 4.8, reviews: 64, price: 52, image: '/property-kampala-1.jpg' },
  { id: 'hoima-1', name: 'Hoima Football Hub', location: 'Hoima City', rating: 4.3, reviews: 42, price: 32, image: '/property-hoima-1.jpg' },
  { id: 'kampala-4', name: 'Namboole Fan House', location: 'Namboole, Kampala', rating: 4.6, reviews: 87, price: 41, image: '/property-kampala-3.jpg' },
]

const NEARBY_RESTAURANTS = [
  { id: 1, name: '2K Restaurant', cuisine: 'Ugandan Local', price: '$$', distance: '10 min', rating: 4.5, gradient: 'from-[#1B4332] to-[#2A9D8F]' },
  { id: 2, name: 'The Lawns', cuisine: 'Fine Dining', price: '$$$$', distance: '15 min', rating: 4.7, gradient: 'from-[#FF6B35] to-[#F5A623]' },
  { id: 3, name: 'Faze 2', cuisine: 'Indian', price: '$$', distance: '25 min', rating: 4.3, gradient: 'from-[#C73E1D] to-[#E07A5F]' },
  { id: 4, name: 'Cafe Javas', cuisine: 'Cafes', price: '$$', distance: '15 min', rating: 4.5, gradient: 'from-[#6B4F4B] to-[#E07A5F]' },
]

const CUISINE_COLORS: Record<string, string> = {
  'Ugandan Local': 'bg-[#1B4332] text-white',
  'Fine Dining': 'bg-[#1A1A2E] text-white',
  'Indian': 'bg-[#C73E1D] text-white',
  'Cafes': 'bg-[#6B4F4B] text-white',
}

const CATEGORY_COLORS: Record<string, string> = {
  Wildlife: 'bg-[#1B4332] text-white',
  Adventure: 'bg-[#E07A5F] text-white',
  Culture: 'bg-[#F5A623] text-white',
  Nature: 'bg-[#2A9D8F] text-white',
  'City Life': 'bg-[#3D5A80] text-white',
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Wildlife: 'from-[#1B4332] to-[#2A9D8F]',
  Adventure: 'from-[#E07A5F] to-[#FF6B35]',
  Culture: 'from-[#F5A623] to-[#E07A5F]',
  Nature: 'from-[#2A9D8F] to-[#1B4332]',
  'City Life': 'from-[#3D5A80] to-[#2A9D8F]',
}

const AMENITY_ICON_MAP: Record<string, typeof Bed> = {
  'Twin & Quad Rooms': Bed,
  'Air Conditioning': Wind,
  'Free WiFi': Wifi,
  '24/7 Security': Shield,
  'In-Room Safe': Lock,
  'Shared Bathrooms': Bath,
  'Free Parking': Car,
  'Stadium Shuttle': Bus,
  'Concierge Desk': Bell,
  'CCTV Coverage': Camera,
  'Fire Safety': Flame,
  'UTB Certified': Check,
}

/* ------------------------------------------------------------------ */
/*  DB → UI MAPPER                                                     */
/* ------------------------------------------------------------------ */

function mapDbToUi(
  db: NonNullable<ReturnType<typeof trpc.property.byId.useQuery>['data']>
): UiPropertyDetail {
  const images: string[] = db.images ? JSON.parse(db.images) : []
  const rawAmenities: string[] = db.amenities ? JSON.parse(db.amenities) : []

  const amenities = rawAmenities.map((label: string) => ({
    icon: AMENITY_ICON_MAP[label] || Check,
    label,
  }))

  // Fill with default amenities if none provided
  const finalAmenities = amenities.length > 0 ? amenities : [
    { icon: Bed, label: 'Twin & Quad Rooms' },
    { icon: Wind, label: 'Air Conditioning' },
    { icon: Wifi, label: 'Free WiFi' },
    { icon: Shield, label: '24/7 Security' },
    { icon: Lock, label: 'In-Room Safe' },
    { icon: Bath, label: 'Shared Bathrooms' },
    { icon: Car, label: 'Free Parking' },
    { icon: Bus, label: 'Stadium Shuttle' },
    { icon: Bell, label: 'Concierge Desk' },
    { icon: Camera, label: 'CCTV Coverage' },
    { icon: Flame, label: 'Fire Safety' },
    { icon: Check, label: 'UTB Certified' },
  ]

  const badges: string[] = []
  if (db.isKitufu) badges.push('Kitufu Residence')
  if (db.hasShuttle) badges.push('Shuttle Included')
  if (db.isGroupFriendly) badges.push('Group Friendly')

  const hasShuttle = !!db.hasShuttle

  return {
    id: db.id,
    title: db.title,
    subtitle: `${db.location} Fan Residence \u2022 ${db.bedrooms ?? 'Multi'}-Room Stay`,
    location: db.address || `${db.location}, Uganda`,
    distanceToStadium: db.distanceToStadium,
    badges,
    rating: 4.5,
    reviewCount: 128,
    pricePerNight: db.pricePerNight,
    images: images.length > 0 ? images : ['/property-kampala-1.jpg', '/property-kampala-2.jpg'],
    amenities: finalAmenities,
    description: db.description || `${db.title} is a ${db.isKitufu ? 'Kitufu Residence' : 'fan accommodation'} located in ${db.location}. It accommodates up to ${db.capacity} guests with ${db.bedrooms ?? 'multiple'} bedrooms and ${db.bathrooms ?? 'shared'} bathrooms. Enjoy amenities including ${rawAmenities.join(', ') || 'WiFi, AC, and Security'}.`,
    houseRules: [
      { icon: Clock, text: 'Check-in: 2:00 PM \u2014 10:00 PM' },
      { icon: Clock, text: 'Check-out: 11:00 AM' },
      { icon: Users, text: 'No smoking in rooms' },
      { icon: Users, text: 'No parties or events' },
      { icon: Users, text: 'Quiet hours: 11:00 PM \u2014 7:00 AM' },
      { icon: PawPrint, text: 'No pets' },
    ],
    hasShuttle,
    capacity: db.capacity,
    bedrooms: db.bedrooms,
    bathrooms: db.bathrooms,
    isKitufu: !!db.isKitufu,
    isGroupFriendly: !!db.isGroupFriendly,
  }
}

/* ------------------------------------------------------------------ */
/*  ANIMATION VARIANTS                                                 */
/* ------------------------------------------------------------------ */

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
}

/* ------------------------------------------------------------------ */
/*  IMAGE GALLERY                                                      */
/* ------------------------------------------------------------------ */

function ImageGallery({ images, onOpenLightbox }: { images: string[]; onOpenLightbox: (i: number) => void }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <>
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden">
        <div
          className="col-span-2 row-span-2 cursor-pointer overflow-hidden"
          onClick={() => onOpenLightbox(0)}
        >
          {images[0] ? (
            <img
              src={images[0]}
              alt="Main"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sunset/20 to-savanna-gold/20" />
          )}
        </div>
        {images.slice(1, 4).map((img, i) => (
          <div
            key={i}
            className="cursor-pointer overflow-hidden"
            onClick={() => onOpenLightbox(i + 1)}
          >
            <img
              src={img}
              alt={`Thumbnail ${i + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
        <div
          className="relative cursor-pointer overflow-hidden"
          onClick={() => onOpenLightbox(0)}
        >
          {images[4] || images[0] ? (
            <img
              src={images[4] || images[0]}
              alt="More"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sunset/20 to-savanna-gold/20" />
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white/95 text-charcoal px-4 py-2.5 rounded-lg font-medium text-sm">
              Show All Photos
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden relative">
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex">
            {images.length > 0 ? images.map((img, i) => (
              <div key={i} className="flex-[0_0_100%] min-w-0" onClick={() => onOpenLightbox(i)}>
                <img src={img} alt={`Slide ${i + 1}`} className="w-full h-[300px] object-cover" />
              </div>
            )) : (
              <div className="flex-[0_0_100%] min-w-0">
                <div className="w-full h-[300px] bg-gradient-to-br from-sunset/20 to-savanna-gold/20" />
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${i === currentSlide ? 'bg-white w-4' : 'bg-white/40 w-2'}`}
            />
          ))}
        </div>
        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2.5 py-1 rounded-md">
          {images.length} Photos
        </div>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  LIGHTBOX                                                           */
/* ------------------------------------------------------------------ */

function Lightbox({ images, initialIndex, onClose }: { images: string[]; initialIndex: number; onClose: () => void }) {
  const [index, setIndex] = useState(initialIndex)

  const goNext = () => setIndex((i) => (i + 1) % images.length)
  const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-lg transition-colors z-10">
        <X size={28} />
      </button>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm font-medium">
        {index + 1} / {images.length}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); goPrev() }}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronLeft size={32} />
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); goNext() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/10 rounded-full transition-colors"
      >
        <ChevronRight size={32} />
      </button>

      {images[index] && (
        <motion.img
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          src={images[index]}
          alt={`Photo ${index + 1}`}
          className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={(e) => { e.stopPropagation(); setIndex(i) }}
            className={`w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${i === index ? 'border-sunset' : 'border-transparent opacity-60'}`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  RATING BREAKDOWN                                                   */
/* ------------------------------------------------------------------ */

function RatingBreakdown({ rating, reviewCount, breakdown }: {
  rating: number; reviewCount: number; breakdown: { stars: number; count: number }[]
}) {
  const maxCount = Math.max(...breakdown.map((b) => b.count))

  return (
    <div className="flex flex-col sm:flex-row gap-8 items-start">
      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-5xl font-bold text-deep-forest">{rating}</span>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={18} className={i < Math.round(rating) ? 'text-savanna-gold fill-savanna-gold' : 'text-light-grey'} />
          ))}
        </div>
        <span className="text-sm text-slate">{reviewCount} reviews</span>
      </div>
      <div className="flex-1 w-full space-y-2">
        {breakdown.map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-3">
            <span className="text-sm text-slate w-12">{stars} star</span>
            <div className="flex-1 h-2 bg-light-grey rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-sunset rounded-full"
              />
            </div>
            <span className="text-sm text-slate w-8 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  REVIEW CARD                                                        */
/* ------------------------------------------------------------------ */

function ReviewCard({ review }: { review: typeof REVIEWS.items[0] }) {
  const initials = review.name.split(' ').map((n) => n[0]).join('')
  return (
    <div className="border-b border-light-grey pb-6 last:border-0">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-sunset/10 flex items-center justify-center text-sunset font-semibold text-sm shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-medium text-deep-forest text-sm">{review.name}</p>
          <p className="text-xs text-slate">{review.date}</p>
        </div>
      </div>
      <div className="flex gap-0.5 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className={i < review.rating ? 'text-savanna-gold fill-savanna-gold' : 'text-light-grey'} />
        ))}
      </div>
      <p className="text-slate text-sm leading-relaxed mb-3">{review.text}</p>
      <button className="flex items-center gap-1.5 text-xs text-slate hover:text-deep-forest transition-colors">
        <ThumbsUp size={14} />
        Helpful ({review.helpful})
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  BOOKING PANEL                                                      */
/* ------------------------------------------------------------------ */

function BookingPanel({ property }: { property: UiPropertyDetail }) {
  const [shuttle, setShuttle] = useState(!!property.hasShuttle)
  const nights = 7
  const shuttleCost = shuttle ? 8 * nights : 0
  const accommodation = property.pricePerNight * nights
  const serviceFee = 28
  const taxes = Math.round(accommodation * 0.18)
  const total = accommodation + shuttleCost + serviceFee + taxes

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white border border-light-grey rounded-xl p-6 shadow-card sticky top-[120px]"
    >
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-price-display text-deep-forest">${property.pricePerNight}</span>
          <span className="text-slate text-sm">/ night</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star size={16} className="text-savanna-gold fill-savanna-gold" />
          <span className="text-savanna-gold font-medium">{property.rating}</span>
        </div>
      </div>

      {/* Date Selection */}
      <div className="border border-light-grey rounded-lg overflow-hidden mb-4">
        <div className="p-3 border-b border-light-grey">
          <label className="text-xs text-slate font-medium uppercase tracking-wide">Dates</label>
          <div className="flex items-center gap-2 mt-1">
            <Calendar size={16} className="text-slate" />
            <span className="text-sm text-deep-forest">Jun 15 &mdash; Jul 2</span>
          </div>
        </div>
        <div className="p-3">
          <label className="text-xs text-slate font-medium uppercase tracking-wide">Guests</label>
          <div className="flex items-center gap-2 mt-1">
            <Users size={16} className="text-slate" />
            <span className="text-sm text-deep-forest">2 adults</span>
          </div>
        </div>
      </div>

      {/* Season Pass Badge */}
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-sunset/10 text-sunset hover:bg-sunset/20 text-xs">Season Pass Available</Badge>
      </div>

      {/* Shuttle Toggle */}
      {property.hasShuttle && (
        <div className="flex items-center justify-between mb-4 p-3 bg-warm-sand rounded-lg">
          <div>
            <p className="text-sm font-medium text-deep-forest">Add Stadium Shuttle</p>
            <p className="text-xs text-slate">+$8/day per person</p>
          </div>
          <Switch checked={shuttle} onCheckedChange={setShuttle} className="data-[state=checked]:bg-teal-depth" />
        </div>
      )}

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate">${property.pricePerNight} &times; {nights} nights</span>
          <span className="text-deep-forest">${accommodation}</span>
        </div>
        {shuttle && (
          <div className="flex justify-between text-sm">
            <span className="text-slate">Shuttle pass</span>
            <span className="text-deep-forest">${shuttleCost}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-slate">Service fee</span>
          <span className="text-deep-forest">${serviceFee}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate">Taxes</span>
          <span className="text-deep-forest">${taxes}</span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="flex justify-between items-center mb-4">
        <span className="font-display font-bold text-deep-forest">Total</span>
        <span className="font-display text-price-display text-deep-forest">${total}</span>
      </div>

      {/* CTA Buttons */}
      <Link to={`/booking/${property.id}`}>
        <Button className="w-full btn-sunset-gradient animate-pulse-cta mb-3">
          Reserve
        </Button>
      </Link>
      <Button variant="outline" className="w-full btn-secondary mb-3">
        Contact Host
      </Button>
      <p className="text-xs text-slate text-center mb-4">You won&apos;t be charged yet</p>

      {/* Trust Badges */}
      <div className="flex justify-center gap-4 text-xs text-slate">
        <div className="flex items-center gap-1">
          <Shield size={14} className="text-teal-depth" />
          <span>UTB Certified</span>
        </div>
        <div className="flex items-center gap-1">
          <Check size={14} className="text-teal-depth" />
          <span>Free Cancellation</span>
        </div>
        <div className="flex items-center gap-1">
          <Lock size={14} className="text-teal-depth" />
          <span>Secure</span>
        </div>
      </div>

      {/* Group Booking Teaser */}
      <Separator className="my-4" />
      <div className="text-center">
        <p className="text-sm font-medium text-deep-forest mb-1">Bringing a group?</p>
        <p className="text-xs text-slate mb-2">Request to buy out this building for your supporters&apos; club.</p>
        <Link to="/group-booking" className="text-sm text-teal-depth underline underline-offset-4 hover:text-deep-forest transition-colors">
          Learn More &rarr;
        </Link>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  NEARBY RESTAURANTS COMPONENT                                       */
/* ------------------------------------------------------------------ */

function NearbyRestaurants() {
  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-sunset/10 flex items-center justify-center">
                <UtensilsCrossed size={20} className="text-sunset" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-deep-forest">Where to Eat Nearby</h2>
                <p className="text-slate text-sm">Curated restaurants close to this residence</p>
              </div>
            </div>
            <Link
              to="/dining"
              className="hidden sm:flex items-center gap-1 text-sm text-teal-depth hover:text-deep-forest transition-colors font-medium"
            >
              View All Restaurants
              <ChevronRightIcon size={16} />
            </Link>
          </motion.div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
            {NEARBY_RESTAURANTS.map((restaurant, i) => (
              <motion.div
                key={restaurant.id}
                custom={i}
                variants={staggerItem}
                className="min-w-[200px] sm:min-w-0 snap-start"
              >
                <div className="bg-white border border-light-grey rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card h-full">
                  <div className={`aspect-[16/9] bg-gradient-to-br ${restaurant.gradient} flex items-center justify-center`}>
                    <UtensilsCrossed size={28} className="text-white/60" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CUISINE_COLORS[restaurant.cuisine] || 'bg-slate text-white'}`}>
                        {restaurant.cuisine}
                      </span>
                      <span className="text-savanna-gold text-xs font-medium ml-auto">{restaurant.price}</span>
                    </div>
                    <h4 className="font-display font-semibold text-deep-forest text-sm mb-1">{restaurant.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate">
                      <div className="flex items-center gap-0.5">
                        <Star size={10} className="text-savanna-gold fill-savanna-gold" />
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                      <span className="text-sunset">{restaurant.distance}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            to="/dining"
            className="sm:hidden flex items-center justify-center gap-1 text-sm text-teal-depth hover:text-deep-forest transition-colors font-medium mt-4"
          >
            View All Restaurants
            <ChevronRightIcon size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  NEARBY ATTRACTIONS                                                 */
/* ------------------------------------------------------------------ */

function NearbyAttractions({ attractions }: { attractions: typeof NEARBY_ATTRACTIONS }) {
  return (
    <section className="section-padding bg-white">
      <div className="container-kitufu">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-depth/10 flex items-center justify-center">
                <MapPin size={20} className="text-teal-depth" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-deep-forest">Explore Nearby</h2>
                <p className="text-slate text-sm">Curated attractions close to this residence</p>
              </div>
            </div>
            <Link
              to="/explore"
              className="hidden sm:flex items-center gap-1 text-sm text-teal-depth hover:text-deep-forest transition-colors font-medium"
            >
              View All Attractions
              <ChevronRightIcon size={16} />
            </Link>
          </motion.div>

          <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
            {attractions.map((attr, i) => (
              <motion.div
                key={attr.id}
                custom={i}
                variants={staggerItem}
                className="min-w-[260px] sm:min-w-0 snap-start"
              >
                <div className="bg-warm-sand border border-light-grey rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card h-full">
                  <div className={`aspect-[16/9] bg-gradient-to-br ${CATEGORY_GRADIENTS[attr.category]} flex items-center justify-center`}>
                    <attr.icon size={32} className="text-white/60" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[attr.category]}`}>
                        {attr.category}
                      </span>
                      <span className="text-[10px] text-slate flex items-center gap-0.5 ml-auto">
                        <Compass size={10} className="text-sunset" />
                        {attr.distance}
                      </span>
                    </div>
                    <h4 className="font-display font-semibold text-deep-forest text-sm mb-1">{attr.name}</h4>
                    <p className="text-slate text-xs leading-relaxed">{attr.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Link
            to="/explore"
            className="sm:hidden flex items-center justify-center gap-1 text-sm text-teal-depth hover:text-deep-forest transition-colors font-medium mt-4"
          >
            View All Attractions
            <ChevronRightIcon size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SIMILAR PROPERTIES CAROUSEL                                        */
/* ------------------------------------------------------------------ */

function SimilarProperties({ properties }: { properties: typeof SIMILAR_PROPERTIES }) {
  const [emblaRef] = useEmblaCarousel({ align: 'start', slidesToScroll: 1, containScroll: 'trimSnaps' })

  return (
    <section className="section-padding bg-warm-sand">
      <div className="container-kitufu">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-display-lg text-deep-forest mb-8"
        >
          Similar Properties
        </motion.h2>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {properties.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-[0_0_280px] min-w-0 md:flex-[0_0_300px]"
              >
                <Link to={`/property/${prop.id}`} className="block group">
                  <div className="bg-white border border-light-grey rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={prop.image}
                        alt={prop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-display font-semibold text-deep-forest group-hover:text-sunset transition-colors">
                          {prop.name}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star size={14} className="text-savanna-gold fill-savanna-gold" />
                          <span className="text-sm font-medium">{prop.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate mb-3">{prop.location}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-display font-bold text-deep-forest">${prop.price}</span>
                        <span className="text-sm text-slate">/ night</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  LOCATION MAP SECTION                                               */
/* ------------------------------------------------------------------ */

function LocationMapSection({ property }: { property: UiPropertyDetail }) {
  return (
    <section className="section-padding">
      <div className="container-kitufu">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-display-lg text-deep-forest mb-6"
        >
          Where You&apos;ll Be
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative h-[400px] rounded-xl overflow-hidden bg-warm-sand"
        >
          {/* Stylized Map Placeholder */}
          <div className="absolute inset-0 bg-[#EDE9E0]">
            {/* Road grid lines */}
            <div className="absolute top-[30%] left-0 right-0 h-[3px] bg-white" />
            <div className="absolute top-[60%] left-0 right-0 h-[3px] bg-white" />
            <div className="absolute left-[25%] top-0 bottom-0 w-[3px] bg-white" />
            <div className="absolute left-[55%] top-0 bottom-0 w-[3px] bg-white" />
            <div className="absolute left-[80%] top-0 bottom-0 w-[3px] bg-white" />

            {/* Property marker */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute left-[28%] top-[35%] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="bg-sunset text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-sunset rotate-45" />
                <span className="relative z-10 flex items-center gap-1">
                  <MapPin size={14} /> {property.title}
                </span>
              </div>
            </motion.div>

            {/* Stadium marker */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="absolute left-[78%] top-[25%] -translate-x-1/2 -translate-y-1/2"
            >
              <div className="bg-savanna-gold text-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium whitespace-nowrap">
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-savanna-gold rotate-45" />
                <span className="relative z-10 flex items-center gap-1">
                  <Star size={14} /> Mandela Stadium
                </span>
              </div>
            </motion.div>

            {/* Shuttle route line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <motion.line
                x1="28%" y1="38%"
                x2="74%" y2="28%"
                stroke="#2A9D8F"
                strokeWidth="3"
                strokeDasharray="8 4"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </svg>

            {/* Distance badge */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-card text-sm">
              <span className="font-medium text-deep-forest">{property.distanceToStadium}</span>
              <span className="text-slate"> to stadium</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <p className="text-deep-forest font-medium">{property.location}</p>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-teal-depth underline underline-offset-4 hover:text-deep-forest transition-colors text-sm"
          >
            Get Directions
          </a>
        </div>

        {/* Nearby */}
        <div className="mt-6">
          <h3 className="font-display font-semibold text-deep-forest mb-3">What&apos;s nearby</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { name: `${property.city === 'Hoima' ? 'Hoima' : 'Namboole'} Shopping Centre`, distance: '0.3 km' },
              { name: 'Local Restaurants & Bars', distance: '0.5 km' },
              { name: 'Public Transport Hub', distance: '0.4 km' },
            ].map((place) => (
              <div key={place.name} className="flex items-center justify-between p-3 bg-warm-sand rounded-lg">
                <span className="text-sm text-deep-forest">{place.name}</span>
                <span className="text-xs text-slate">{place.distance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  GROUP BOOKING CTA                                                  */
/* ------------------------------------------------------------------ */

function GroupBookingCTA({ property }: { property: UiPropertyDetail }) {
  return (
    <section className="section-padding">
      <div className="container-kitufu">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-deep-forest rounded-2xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Decorative pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: 'url(/lubugo-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '400px 400px' }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <p className="text-savanna-gold text-xs font-medium uppercase tracking-[0.1em] mb-2">Group Booking Available</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Buy Out This Building</h2>
              <p className="text-white/70 mb-6 max-w-lg">
                This residence can be reserved exclusively for your supporters&apos; club. Up to {property.capacity} fans, private shuttle, dedicated staff.
              </p>
              <Link to="/group-booking">
                <Button className="bg-white text-deep-forest hover:bg-white/90 font-semibold px-6 py-3 rounded-lg transition-all">
                  Get Group Quote
                </Button>
              </Link>
            </div>
            <div className="hidden md:flex items-center justify-center w-32 h-32">
              <Users size={120} className="text-savanna-gold opacity-10" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  SKELETON LOADER                                                    */
/* ------------------------------------------------------------------ */

function PropertyDetailSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-white animate-pulse">
      {/* Image gallery skeleton */}
      <section className="pt-4 px-4 md:px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[500px] rounded-xl overflow-hidden">
            <div className="col-span-2 row-span-2 bg-light-grey" />
            <div className="bg-light-grey" />
            <div className="bg-light-grey" />
            <div className="bg-light-grey" />
            <div className="bg-light-grey" />
          </div>
          <div className="md:hidden h-[300px] bg-light-grey rounded-xl" />
        </div>
      </section>

      {/* Header skeleton */}
      <section className="pt-8 pb-6">
        <div className="container-kitufu">
          <div className="space-y-3">
            <div className="h-4 bg-light-grey rounded w-32" />
            <div className="h-8 bg-light-grey rounded w-2/3" />
            <div className="h-4 bg-light-grey rounded w-1/2" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-8">
        <div className="container-kitufu">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-[60%] space-y-6">
              <div className="h-6 bg-light-grey rounded w-48" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-8 bg-light-grey rounded" />
                ))}
              </div>
              <div className="h-32 bg-light-grey rounded" />
            </div>
            <div className="lg:w-[35%]">
              <div className="h-[500px] bg-light-grey rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  MAIN PAGE COMPONENT                                                */
/* ------------------------------------------------------------------ */

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [saved, setSaved] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [readMore, setReadMore] = useState(false)

  const openLightbox = (i: number) => {
    setLightboxIndex(i)
    setLightboxOpen(true)
  }

  /* tRPC query */
  const { data: rawProperty, isLoading } = trpc.property.byId.useQuery(
    { id: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) }
  )

  /* Reviews query */
  const { data: reviewsData } = trpc.review.list.useQuery(
    { propertyId: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) }
  )
  const { data: reviewStats } = trpc.review.stats.useQuery(
    { propertyId: Number(id) },
    { enabled: !!id && !isNaN(Number(id)) }
  )

  /* Map to UI type */
  const property: UiPropertyDetail | null = rawProperty ? mapDbToUi(rawProperty) : null

  /* Loading state */
  if (isLoading) {
    return <PropertyDetailSkeleton />
  }

  /* Not found state */
  if (!property) {
    return (
      <div className="min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-semibold text-2xl text-deep-forest mb-2">Property not found</p>
          <p className="font-body text-slate mb-6">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <Link to="/listings" className="btn-primary px-6 py-3">
            Browse All Properties
          </Link>
        </div>
      </div>
    )
  }

  const visibleAmenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 9)
  const realReviews = (reviewsData || []).map((r: any) => ({ id: r.id, name: r.userName, date: new Date(r.createdAt).toLocaleDateString(), rating: r.rating, text: r.comment, helpful: 0, avatar: r.userType === 'host' ? 'host' : 'guest' }))
  const visibleReviews = showAllReviews ? realReviews : realReviews.slice(0, 3)

  return (
    <div className="min-h-[100dvh] bg-white">
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            images={property.images}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Section 1: Image Gallery */}
      <section className="pt-4 px-4 md:px-6 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          <ImageGallery images={property.images} onOpenLightbox={openLightbox} />
        </div>
      </section>

      {/* Section 2: Property Header */}
      <section className="pt-8 pb-6">
        <div className="container-kitufu">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
          >
            <div className="flex-1">
              {/* Badges */}
              <motion.div variants={staggerItem} className="flex flex-wrap gap-2 mb-3">
                {property.badges.map((badge) => {
                  const badgeStyles: Record<string, string> = {
                    'Kitufu Residence': 'bg-sunset text-white',
                    'Shuttle Included': 'bg-teal-depth text-white',
                    'Group Friendly': 'bg-hoima-blue text-white',
                  }
                  return (
                    <Badge key={badge} className={`${badgeStyles[badge]} text-xs font-medium`}>
                      {badge}
                    </Badge>
                  )
                })}
              </motion.div>

              <motion.h1 variants={staggerItem} className="font-display text-3xl md:text-4xl font-bold text-deep-forest mb-2">
                {property.title}
              </motion.h1>
              <motion.p variants={staggerItem} className="text-slate mb-2">{property.subtitle}</motion.p>
              <motion.div variants={staggerItem} className="flex flex-wrap items-center gap-2 text-slate text-sm">
                <MapPin size={16} className="text-slate shrink-0" />
                <span>{property.location}</span>
                <span>&bull;</span>
                <span>{property.distanceToStadium} to stadium</span>
              </motion.div>
              <motion.div variants={staggerItem}>
                <Link
                  to="/afcon-2027"
                  className="text-teal-depth underline underline-offset-4 hover:text-deep-forest transition-colors text-sm mt-1 inline-block"
                >
                  View stadium info &rarr;
                </Link>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div variants={staggerItem} className="flex flex-col items-start md:items-end gap-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-3xl font-bold text-deep-forest">{property.rating}</span>
                <Star size={24} className="text-savanna-gold fill-savanna-gold" />
              </div>
              <span className="text-sm text-slate">({property.reviewCount} reviews)</span>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`p-2.5 border border-light-grey rounded-lg transition-all ${saved ? 'bg-earth-red/10 border-earth-red' : 'hover:bg-warm-sand'}`}
                >
                  <Heart size={20} className={saved ? 'text-earth-red fill-earth-red' : 'text-slate'} />
                </button>
                <button className="p-2.5 border border-light-grey rounded-lg hover:bg-warm-sand transition-all">
                  <Share2 size={20} className="text-slate" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Separator />

      {/* Section 3: Main Content */}
      <section className="py-8">
        <div className="container-kitufu">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-[5%]">
            {/* Left Column - Details */}
            <div className="lg:w-[60%]">
              {/* Amenities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <h2 className="font-display text-2xl font-bold text-deep-forest mb-6">What This Place Offers</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {visibleAmenities.map(({ icon: Icon, label }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      <Icon size={22} className="text-teal-depth shrink-0" />
                      <span className="text-slate text-sm">{label}</span>
                    </motion.div>
                  ))}
                </div>
                {!showAllAmenities && property.amenities.length > 9 && (
                  <button
                    onClick={() => setShowAllAmenities(true)}
                    className="mt-4 text-sunset underline underline-offset-4 hover:text-deep-forest transition-colors text-sm font-medium"
                  >
                    Show All {property.amenities.length} Amenities
                  </button>
                )}
              </motion.div>

              <Separator className="mb-10" />

              {/* About */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <h2 className="font-display text-2xl font-bold text-deep-forest mb-4">About This Residence</h2>
                <div className={`text-slate leading-relaxed ${!readMore ? 'line-clamp-4' : ''}`}>
                  {property.description.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-4">{para}</p>
                  ))}
                </div>
                <button
                  onClick={() => setReadMore(!readMore)}
                  className="text-sunset underline underline-offset-4 hover:text-deep-forest transition-colors text-sm font-medium mt-2"
                >
                  {readMore ? 'Show less' : 'Read more'}
                </button>
              </motion.div>

              <Separator className="mb-10" />

              {/* Shuttle Info */}
              {property.hasShuttle && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-10 bg-[#F0FAF8] rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Bus size={28} className="text-teal-depth" />
                      <h2 className="font-display text-xl font-bold text-teal-depth">Stadium Shuttle Included</h2>
                    </div>
                    <div className="space-y-2 mb-4">
                      {[
                        { label: 'Route', value: `${property.location} \u2192 Mandela National Stadium` },
                        { label: 'Duration', value: '\u223c12 minutes (direct)' },
                        { label: 'Schedule', value: 'Match days: 3 hours before kickoff, every 30 minutes' },
                        { label: 'Return', value: 'Runs for 2 hours after final whistle' },
                        { label: 'Capacity', value: 'Guaranteed seat with booking' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex gap-2 text-sm">
                          <span className="font-medium text-deep-forest min-w-[80px]">{label}:</span>
                          <span className="text-slate">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-full h-40 bg-gradient-to-br from-teal-depth/20 to-savanna-gold/20 rounded-lg mb-3 flex items-center justify-center">
                      <Bus size={48} className="text-teal-depth/30" />
                    </div>
                    <p className="text-xs text-slate">Private shuttle upgrade available for groups of 20+</p>
                  </motion.div>

                  <Separator className="mb-10" />
                </>
              )}

              {/* House Rules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-10"
              >
                <h2 className="font-display text-2xl font-bold text-deep-forest mb-4">House Rules</h2>
                <div className="space-y-3">
                  {property.houseRules.map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Icon size={18} className="text-slate shrink-0" />
                      <span className="text-slate text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <Separator className="mb-10" />

              {/* Reviews */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-2xl font-bold text-deep-forest mb-6">Reviews</h2>
                <RatingBreakdown
                  rating={reviewStats?.average || property.rating}
                  reviewCount={reviewStats?.count || property.reviewCount}
                  breakdown={REVIEWS.breakdown}
                />

                <div className="mt-8 space-y-6">
                  {visibleReviews.length > 0 ? visibleReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  )) : <p className="text-slate text-sm">No reviews yet. Be the first to review after your stay!</p>}
                </div>

                {!showAllReviews && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="mt-6 btn-secondary"
                  >
                    Show All {reviewStats?.count || property.reviewCount} Reviews
                  </button>
                )}
              </motion.div>
            </div>

            {/* Right Column - Booking Panel */}
            <div className="lg:w-[35%]">
              <BookingPanel property={property} />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Location Map */}
      <LocationMapSection property={property} />

      {/* Section 5: Nearby Restaurants */}
      <NearbyRestaurants />

      {/* Section 6: Nearby Attractions */}
      <NearbyAttractions attractions={NEARBY_ATTRACTIONS} />

      {/* Section 6: Similar Properties */}
      <SimilarProperties properties={SIMILAR_PROPERTIES} />

      {/* Section 6: Group Booking CTA */}
      <GroupBookingCTA property={property} />
    </div>
  )
}
