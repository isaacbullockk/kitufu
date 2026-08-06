import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plane, Calendar, Users, ArrowRight, MapPin, ExternalLink, Clock, Luggage, Star } from 'lucide-react'

const FLIGHT_ROUTES = [
  { from: 'Lagos (LOS)', fromCity: 'Lagos', country: 'Nigeria', priceUSD: 450, duration: '4h 30m', airline: 'Uganda Airlines', stops: 'Direct', frequency: 'Daily' },
  { from: 'Nairobi (NBO)', fromCity: 'Nairobi', country: 'Kenya', priceUSD: 320, duration: '1h 15m', airline: 'Kenya Airways', stops: 'Direct', frequency: 'Daily' },
  { from: 'Kigali (KGL)', fromCity: 'Kigali', country: 'Rwanda', priceUSD: 280, duration: '45m', airline: 'RwandAir', stops: 'Direct', frequency: 'Daily' },
  { from: 'Johannesburg (JNB)', fromCity: 'Johannesburg', country: 'South Africa', priceUSD: 520, duration: '4h 15m', airline: 'South African Airways', stops: 'Direct', frequency: 'Mon, Wed, Fri, Sun' },
  { from: 'Casablanca (CMN)', fromCity: 'Casablanca', country: 'Morocco', priceUSD: 680, duration: '7h 30m', airline: 'Royal Air Maroc', stops: '1 Stop', frequency: 'Tue, Thu, Sat' },
  { from: 'London (LHR)', fromCity: 'London', country: 'UK', priceUSD: 750, duration: '8h 45m', airline: 'British Airways', stops: 'Direct', frequency: 'Mon, Wed, Fri, Sun' },
  { from: 'Paris (CDG)', fromCity: 'Paris', country: 'France', priceUSD: 720, duration: '8h 15m', airline: 'Air France', stops: 'Direct', frequency: 'Tue, Thu, Sat, Sun' },
  { from: 'Dubai (DXB)', fromCity: 'Dubai', country: 'UAE', priceUSD: 480, duration: '5h 30m', airline: 'Emirates', stops: 'Direct', frequency: 'Daily' },
  { from: 'Addis Ababa (ADD)', fromCity: 'Addis Ababa', country: 'Ethiopia', priceUSD: 380, duration: '2h 10m', airline: 'Ethiopian Airlines', stops: 'Direct', frequency: 'Daily' },
  { from: 'Accra (ACC)', fromCity: 'Accra', country: 'Ghana', priceUSD: 580, duration: '5h 45m', airline: 'Africa World Airlines', stops: '1 Stop', frequency: 'Mon, Thu, Sat' },
]

const formatPrice = (usd: number, currency: string) => {
  const rates: Record<string, number> = { UGX: 3700, USD: 1, EUR: 0.92, GBP: 0.79, KES: 129, NGN: 1550 }
  const symbols: Record<string, string> = { UGX: 'USh ', USD: '$', EUR: '€', GBP: '£', KES: 'KSh ', NGN: '₦' }
  const rate = rates[currency] || rates.UGX
  const symbol = symbols[currency] || 'USh '
  const converted = Math.round(usd * rate)
  return symbol + converted.toLocaleString()
}

interface FlightSearchProps {
  compact?: boolean
}

export default function FlightSearch({ compact }: FlightSearchProps) {
  const [origin, setOrigin] = useState('')
  const [departDate, setDepartDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [currency, setCurrency] = useState('USD')
  const [showResults, setShowResults] = useState(false)

  const filtered = origin 
    ? FLIGHT_ROUTES.filter(r => r.fromCity.toLowerCase().includes(origin.toLowerCase()) || r.country.toLowerCase().includes(origin.toLowerCase()))
    : FLIGHT_ROUTES

  const searchGoogleFlights = (route: typeof FLIGHT_ROUTES[0]) => {
    const dep = departDate || '2027-01-15'
    const ret = returnDate || '2027-01-22'
    const url = `https://www.google.com/travel/flights?q=Flights+to+Entebbe+from+${encodeURIComponent(route.fromCity)}+on+${dep}+through+${ret}`
    window.open(url, '_blank')
  }

  if (compact) {
    return (
      <div className="bg-midnight rounded-xl p-5 border border-gray-800">
        <div className="flex items-center gap-2 mb-4">
          <Plane className="w-5 h-5 text-sunset" />
          <h3 className="text-white font-bold">Flights to Entebbe (EBB)</h3>
        </div>
        <div className="space-y-3">
          {FLIGHT_ROUTES.slice(0, 4).map((route, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div>
                <p className="text-white text-sm font-medium">{route.from}</p>
                <p className="text-gray-500 text-xs">{route.duration} • {route.stops}</p>
              </div>
              <div className="text-right">
                <p className="text-savanna-gold font-bold text-sm">${route.priceUSD}</p>
                <button onClick={() => searchGoogleFlights(route)} className="text-sunset text-xs hover:underline flex items-center gap-0.5 ml-auto">
                  Find <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => window.open('https://www.google.com/travel/flights?q=Flights+to+Entebbe', '_blank')}
          className="w-full mt-4 bg-deep-forest hover:bg-deep-forest/80 text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Plane className="w-4 h-4" /> Search All Flights
        </button>
      </div>
    )
  }

  return (
    <div className="bg-midnight rounded-2xl p-6 border border-gray-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-sunset/20 rounded-lg flex items-center justify-center">
          <Plane className="w-5 h-5 text-sunset" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Find Flights to Uganda</h3>
          <p className="text-gray-400 text-sm">Entebbe International Airport (EBB) — 45 min to Kampala</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="From where?" value={origin} onChange={e => setOrigin(e.target.value)}
            className="w-full bg-deep-forest text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-sunset focus:outline-none text-sm" />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="date" value={departDate} onChange={e => setDepartDate(e.target.value)}
            className="w-full bg-deep-forest text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-sunset focus:outline-none text-sm" />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)}
            className="w-full bg-deep-forest text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-sunset focus:outline-none text-sm" />
        </div>
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <select value={passengers} onChange={e => setPassengers(Number(e.target.value))}
            className="w-full bg-deep-forest text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-sunset focus:outline-none text-sm appearance-none">
            {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-gray-400 text-sm">Currency:</span>
        {['USD', 'UGX', 'EUR', 'GBP'].map(c => (
          <button key={c} onClick={() => setCurrency(c)} 
            className={`text-xs px-3 py-1 rounded-full transition-colors ${currency === c ? 'bg-sunset text-white' : 'bg-deep-forest text-gray-400 hover:text-white'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.map((route, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-deep-forest rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-sunset/50 border border-transparent transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-midnight rounded-lg flex items-center justify-center text-lg">✈️</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold">{route.from}</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                  <span className="text-white font-bold">Entebbe (EBB)</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {route.duration}</span>
                  <span className="flex items-center gap-1"><Luggage className="w-3 h-3" /> {route.stops}</span>
                  <span className="text-sage">{route.airline}</span>
                  <span className="text-gray-500">{route.frequency}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-savanna-gold font-bold text-xl">{formatPrice(route.priceUSD, currency)}</p>
                <p className="text-gray-500 text-xs">round trip</p>
              </div>
              <button onClick={() => searchGoogleFlights(route)}
                className="bg-sunset hover:bg-sunset/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                Find Flight <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <Plane className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No routes found from "{origin}"</p>
          <p className="text-sm mt-1">Try searching for a major city like Lagos, Nairobi, or London</p>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-800 text-center">
        <button onClick={() => window.open('https://www.google.com/travel/flights?q=Flights+to+Entebbe', '_blank')}
          className="text-sunset hover:underline text-sm flex items-center gap-1 mx-auto">
          <Star className="w-4 h-4" /> Search more options on Google Flights
        </button>
      </div>
    </div>
  )
}
