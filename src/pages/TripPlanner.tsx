import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Plane, Bed, UtensilsCrossed, Calendar, Users, MapPin, ChevronRight, Check, Star, Bus, TrendingDown, BadgeCheck, ArrowRight, Clock } from 'lucide-react'
import { trpc } from '../providers/trpc'
import FlightSearch from '@/components/FlightSearch'
import { useCurrency } from '@/context/CurrencyContext'

function parseDistance(dist: string | null): number {
  if (!dist) return 999
  const match = dist.match(/([0-9.]+)/)
  return match ? parseFloat(match[1]) : 999
}

const STEPS = [
  { id: 'flight', label: 'Flight', icon: Plane },
  { id: 'stay', label: 'Stay', icon: Bed },
  { id: 'dine', label: 'Dine', icon: UtensilsCrossed },
  { id: 'plan', label: 'Plan', icon: Calendar },
]

export default function TripPlanner() {
  const navigate = useNavigate()
  const { formatPrice } = useCurrency()
  const [step, setStep] = useState(0)
  const [tripData, setTripData] = useState({
    origin: '',
    arriveDate: '',
    departDate: '',
    guests: 2,
    nights: 3,
    selectedProperty: null as any,
  })

  const { data: properties } = trpc.property.list.useQuery({ status: 'approved' })

  const processedProperties = (properties || [])
    .map((p: any) => ({
      ...p,
      distKm: parseDistance(p.distanceToStadium),
      pricePerPerson: Math.round(p.pricePerNight / Math.max(p.capacity, 1)),
      totalCost: p.pricePerNight * tripData.nights,
      firstImage: (() => { try { return JSON.parse(p.images)[0] } catch { return '' } })(),
    }))
    .sort((a: any, b: any) => a.distKm - b.distKm)

  const closestThree = processedProperties.slice(0, 3)
  const cheapestThree = [...processedProperties].sort((a: any, b: any) => a.pricePerNight - b.pricePerNight).slice(0, 3)
  const bestValueThree = [...processedProperties].sort((a: any, b: any) => a.pricePerPerson - b.pricePerPerson).slice(0, 3)

  const updateTrip = (key: string, value: any) => {
    setTripData(prev => ({ ...prev, [key]: value }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 0))

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Plan Your AFCON 2027 Trip</h1>
          <p className="text-gray-400 max-w-xl mx-auto">Everything in one place — flights, accommodation, dining. We'll help you find the best options for your stay in Uganda.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <button onClick={() => setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  i === step ? 'bg-sunset text-white' : i < step ? 'bg-green-500 text-white' : 'bg-midnight text-gray-500'
                }`}>
                {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-5 h-5 text-gray-600 mx-1" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: FLIGHT */}
          {step === 0 && (
            <motion.div key="flight" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Find Your Flight</h2>
                <p className="text-gray-400">Fly into Entebbe International Airport (EBB) — the gateway to AFCON 2027</p>
              </div>
              <FlightSearch />
              <div className="mt-6 flex justify-end">
                <button onClick={nextStep} className="bg-sunset hover:bg-sunset/90 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                  Pick Accommodation <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: STAY */}
          {step === 1 && (
            <motion.div key="stay" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Stay</h2>
                <p className="text-gray-400">Properties sorted by distance to Mandela National Stadium</p>
              </div>

              {/* Stay config */}
              <div className="bg-midnight rounded-xl p-4 mb-6 border border-gray-800 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Nights:</span>
                  <div className="flex items-center gap-2 bg-deep-forest rounded-lg px-3 py-1.5">
                    <button onClick={() => updateTrip('nights', Math.max(1, tripData.nights - 1))} className="text-white hover:text-sunset">-</button>
                    <span className="text-white text-sm w-6 text-center">{tripData.nights}</span>
                    <button onClick={() => updateTrip('nights', Math.min(30, tripData.nights + 1))} className="text-white hover:text-sunset">+</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Guests:</span>
                  <div className="flex items-center gap-2 bg-deep-forest rounded-lg px-3 py-1.5">
                    <button onClick={() => updateTrip('guests', Math.max(1, tripData.guests - 1))} className="text-white hover:text-sunset">-</button>
                    <span className="text-white text-sm w-6 text-center">{tripData.guests}</span>
                    <button onClick={() => updateTrip('guests', Math.min(20, tripData.guests + 1))} className="text-white hover:text-sunset">+</button>
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-gray-400 text-xs">for {tripData.nights} nights, {tripData.guests} guests</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Closest */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <h3 className="text-white font-bold">Closest to Stadium</h3>
                  </div>
                  <div className="space-y-3">
                    {closestThree.map((p: any) => (
                      <button key={p.id} onClick={() => updateTrip('selectedProperty', p)}
                        className={`w-full text-left bg-midnight rounded-xl p-4 border transition-all ${
                          tripData.selectedProperty?.id === p.id ? 'border-sunset ring-1 ring-sunset' : 'border-gray-800 hover:border-gray-600'
                        }`}>
                        <div className="flex gap-3">
                          <img src={p.firstImage} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{p.title}</p>
                            <p className="text-green-400 text-xs">{p.distanceToStadium} from stadium</p>
                            <p className="text-savanna-gold text-sm font-bold mt-1">{formatPrice(p.totalCost)} <span className="text-gray-500 text-xs font-normal">total</span></p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Best Price */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="w-4 h-4 text-sunset" />
                    <h3 className="text-white font-bold">Best Price</h3>
                  </div>
                  <div className="space-y-3">
                    {cheapestThree.map((p: any) => (
                      <button key={p.id} onClick={() => updateTrip('selectedProperty', p)}
                        className={`w-full text-left bg-midnight rounded-xl p-4 border transition-all ${
                          tripData.selectedProperty?.id === p.id ? 'border-sunset ring-1 ring-sunset' : 'border-gray-800 hover:border-gray-600'
                        }`}>
                        <div className="flex gap-3">
                          <img src={p.firstImage} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{p.title}</p>
                            <p className="text-gray-400 text-xs">{p.distanceToStadium} from stadium</p>
                            <p className="text-savanna-gold text-sm font-bold mt-1">{formatPrice(p.totalCost)} <span className="text-gray-500 text-xs font-normal">total</span></p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Best Value */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BadgeCheck className="w-4 h-4 text-savanna-gold" />
                    <h3 className="text-white font-bold">Best Value</h3>
                  </div>
                  <div className="space-y-3">
                    {bestValueThree.map((p: any) => (
                      <button key={p.id} onClick={() => updateTrip('selectedProperty', p)}
                        className={`w-full text-left bg-midnight rounded-xl p-4 border transition-all ${
                          tripData.selectedProperty?.id === p.id ? 'border-sunset ring-1 ring-sunset' : 'border-gray-800 hover:border-gray-600'
                        }`}>
                        <div className="flex gap-3">
                          <img src={p.firstImage} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-white font-bold text-sm truncate">{p.title}</p>
                            <p className="text-gray-400 text-xs">{formatPrice(p.pricePerPerson)}/person/night</p>
                            <p className="text-savanna-gold text-sm font-bold mt-1">{formatPrice(p.totalCost)} <span className="text-gray-500 text-xs font-normal">total</span></p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={prevStep} className="text-gray-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 rotate-180" /> Back
                </button>
                <button onClick={nextStep} disabled={!tripData.selectedProperty}
                  className="bg-sunset hover:bg-sunset/90 disabled:bg-gray-700 disabled:text-gray-500 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                  Plan Dining <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: DINE */}
          {step === 2 && (
            <motion.div key="dine" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Where to Eat</h2>
                <p className="text-gray-400">Recommended restaurants near your stay</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[
                  { name: "Cafe Javas", cuisine: "Continental", rating: 4.5, price: "$$", distance: "City Center", specialty: "Breakfast, Burgers, Coffee" },
                  { name: "The Lawns", cuisine: "Continental", rating: 4.7, price: "$$$", distance: "Kololo", specialty: "Steak, Grill, Sundowners" },
                  { name: "2K Restaurant", cuisine: "Ugandan", rating: 4.3, price: "$", distance: "Near Stadium", specialty: "Local dishes, Matoke, Luwombo" },
                  { name: "Faze 2", cuisine: "Nigerian", rating: 4.4, price: "$$", distance: "Ntinda", specialty: "Jollof Rice, Suya, Pepper Soup" },
                  { name: "Khana Khazana", cuisine: "Indian", rating: 4.5, price: "$$", distance: "Kololo", specialty: "Butter Chicken, Biryani" },
                  { name: "Nyama Choma Spot", cuisine: "East African", rating: 4.2, price: "$", distance: "Kansanga", specialty: "Nyama Choma, Ugali" },
                ].map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-midnight rounded-xl p-4 border border-gray-800 hover:border-gray-600 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-bold">{r.name}</h3>
                        <p className="text-gray-400 text-sm">{r.cuisine} • {r.distance}</p>
                        <p className="text-sage text-xs mt-1">{r.specialty}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-savanna-gold/20 px-2 py-1 rounded">
                        <Star className="w-3 h-3 text-savanna-gold fill-current" />
                        <span className="text-savanna-gold text-sm font-bold">{r.rating}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mb-6">
                <button onClick={() => navigate('/restaurants')} className="text-sunset hover:underline text-sm flex items-center gap-1 mx-auto">
                  <UtensilsCrossed className="w-4 h-4" /> See full dining guide
                </button>
              </div>

              <div className="flex justify-between">
                <button onClick={prevStep} className="text-gray-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 rotate-180" /> Back
                </button>
                <button onClick={nextStep}
                  className="bg-sunset hover:bg-sunset/90 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                  Review Plan <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: SUMMARY */}
          {step === 3 && (
            <motion.div key="plan" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Your Trip Summary</h2>
                <p className="text-gray-400">Review everything before booking</p>
              </div>

              <div className="bg-midnight rounded-2xl p-6 border border-gray-800 mb-8">
                {/* Flight Summary */}
                <div className="flex items-start gap-4 pb-6 border-b border-gray-800">
                  <div className="w-10 h-10 bg-sunset/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Plane className="w-5 h-5 text-sunset" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">Flight to Entebbe (EBB)</h3>
                    <p className="text-gray-400 text-sm mt-1">Search for flights on Google Flights and book separately.</p>
                    <button onClick={() => window.open('https://www.google.com/travel/flights?q=Flights+to+Entebbe', '_blank')}
                      className="text-sunset hover:underline text-sm mt-2 flex items-center gap-1">
                      <Plane className="w-4 h-4" /> Search flights now
                    </button>
                  </div>
                </div>

                {/* Stay Summary */}
                {tripData.selectedProperty && (
                  <div className="flex items-start gap-4 py-6 border-b border-gray-800">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bed className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold">{tripData.selectedProperty.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{tripData.selectedProperty.location} • {tripData.selectedProperty.distanceToStadium} from stadium</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-300">{tripData.nights} nights</span>
                        <span className="text-gray-300">{tripData.guests} guests</span>
                        <span className="text-savanna-gold font-bold text-lg">{formatPrice(tripData.selectedProperty.pricePerNight * tripData.nights)}</span>
                      </div>
                      <button onClick={() => navigate('/property/' + tripData.selectedProperty.id)}
                        className="text-sunset hover:underline text-sm mt-2 flex items-center gap-1">
                        <Bed className="w-4 h-4" /> Book this stay
                      </button>
                    </div>
                  </div>
                )}

                {/* Dining Summary */}
                <div className="flex items-start gap-4 pt-6">
                  <div className="w-10 h-10 bg-savanna-gold/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <UtensilsCrossed className="w-5 h-5 text-savanna-gold" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">Dining</h3>
                    <p className="text-gray-400 text-sm mt-1">6 recommended restaurants saved to your plan.</p>
                    <button onClick={() => navigate('/restaurants')}
                      className="text-sunset hover:underline text-sm mt-2 flex items-center gap-1">
                      <UtensilsCrossed className="w-4 h-4" /> View dining guide
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/listings')}
                  className="bg-sunset hover:bg-sunset/90 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 justify-center">
                  <Bed className="w-5 h-5" /> Book Your Stay Now
                </button>
                <button onClick={() => window.open('https://www.google.com/travel/flights?q=Flights+to+Entebbe', '_blank')}
                  className="bg-midnight hover:bg-midnight/80 border border-gray-700 text-white px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 justify-center">
                  <Plane className="w-5 h-5" /> Find Flights
                </button>
              </div>

              <div className="flex justify-center mt-6">
                <button onClick={prevStep} className="text-gray-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 rotate-180" /> Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
