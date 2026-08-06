import { useState } from 'react'
import { motion } from 'framer-motion'
import { UtensilsCrossed, MapPin, Star, ExternalLink, Clock, DollarSign, Phone, Search, Filter } from 'lucide-react'
import { useNavigate } from 'react-router'

const CUISINES = ['All', 'Ugandan', 'Nigerian', 'East African', 'Indian', 'Chinese', 'Italian', 'Ethiopian', 'Continental', 'Seafood', 'BBQ']

const RESTAURANTS = [
  // Kampala
  { name: "Cafe Javas", location: "Kampala", cuisine: "Continental", rating: 4.5, price: "$$", distance: "2.1 km from stadium", phone: "+256 414 251 563", hours: "7AM - 11PM", specialty: "Breakfast, Burgers, Coffee", map: "https://maps.google.com/?q=Cafe+Javas+Kampala" },
  { name: "The Lawns", location: "Kampala", cuisine: "Continental", rating: 4.7, price: "$$$", distance: "3.5 km from stadium", phone: "+256 414 344 286", hours: "12PM - 11PM", specialty: "Steak, Grill, Sundowners", map: "https://maps.google.com/?q=The+Lawns+Kampala" },
  { name: "Mythos Greek Taverna", location: "Kampala", cuisine: "Italian", rating: 4.6, price: "$$$", distance: "4.2 km from stadium", phone: "+256 757 000 111", hours: "12PM - 10:30PM", specialty: "Greek, Mediterranean", map: "https://maps.google.com/?q=Mythos+Kampala" },
  { name: "2K Restaurant", location: "Kampala", cuisine: "Ugandan", rating: 4.3, price: "$", distance: "1.8 km from stadium", phone: "+256 772 468 272", hours: "10AM - 10PM", specialty: "Local dishes, Matoke, Luwombo", map: "https://maps.google.com/?q=2K+Restaurant+Kampala" },
  { name: "Faze 2", location: "Kampala", cuisine: "Nigerian", rating: 4.4, price: "$$", distance: "2.8 km from stadium", phone: "+256 701 234 567", hours: "11AM - 11PM", specialty: "Jollof Rice, Suya, Pepper Soup", map: "https://maps.google.com/?q=Faze+2+Kampala" },
  { name: "Khana Khazana", location: "Kampala", cuisine: "Indian", rating: 4.5, price: "$$", distance: "3.0 km from stadium", phone: "+256 414 340 340", hours: "11AM - 10:30PM", specialty: "Butter Chicken, Biryani, Naan", map: "https://maps.google.com/?q=Khana+Khazana+Kampala" },
  { name: "Yujo Izakaya", location: "Kampala", cuisine: "Chinese", rating: 4.2, price: "$$$", distance: "4.5 km from stadium", phone: "+256 758 888 999", hours: "12PM - 10PM", specialty: "Sushi, Ramen, Japanese", map: "https://maps.google.com/?q=Yujo+Izakaya+Kampala" },
  { name: "KFC Kampala", location: "Kampala", cuisine: "Continental", rating: 4.0, price: "$", distance: "2.5 km from stadium", phone: "+256 312 123 456", hours: "10AM - 10PM", specialty: "Fast Food, Fried Chicken", map: "https://maps.google.com/?q=KFC+Kampala" },
  // Entebbe
  { name: "Goretti's Pizza", location: "Entebbe", cuisine: "Italian", rating: 4.3, price: "$", distance: "5 min from airport", phone: "+256 772 444 555", hours: "10AM - 10PM", specialty: "Pizza, Pasta, Lake View", map: "https://maps.google.com/?q=Gorettis+Pizza+Entebbe" },
  { name: "4 Points Restaurant", location: "Entebbe", cuisine: "Seafood", rating: 4.6, price: "$$$", distance: "8 min from airport", phone: "+256 414 321 000", hours: "12PM - 10PM", specialty: "Fresh Fish, Lake Victoria Perch", map: "https://maps.google.com/?q=4+Points+Entebbe" },
  // Jinja
  { name: "The Source Cafe", location: "Jinja", cuisine: "Continental", rating: 4.4, price: "$$", distance: "Near Source of the Nile", phone: "+256 701 888 777", hours: "8AM - 9PM", specialty: "River View, Coffee, Brunch", map: "https://maps.google.com/?q=Source+Cafe+Jinja" },
  { name: "Two Friends Bar & Grill", location: "Jinja", cuisine: "BBQ", rating: 4.5, price: "$$", distance: "Near Nile River", phone: "+256 772 333 444", hours: "12PM - 12AM", specialty: "BBQ Ribs, Cold Beer, Live Music", map: "https://maps.google.com/?q=Two+Friends+Jinja" },
  // Hoima
  { name: "Kiko Gardens", location: "Hoima", cuisine: "Ugandan", rating: 4.1, price: "$", distance: "Near Bunyoro Kingdom", phone: "+256 751 222 333", hours: "8AM - 9PM", specialty: "Local Food, Fresh Juice, Garden", map: "https://maps.google.com/?q=Kiko+Gardens+Hoima" },
  // Ethiopian
  { name: "Addis Ababa Restaurant", location: "Kampala", cuisine: "Ethiopian", rating: 4.3, price: "$$", distance: "3.8 km from stadium", phone: "+256 701 999 888", hours: "11AM - 10PM", specialty: "Injera, Doro Wat, Kitfo", map: "https://maps.google.com/?q=Addis+Ababa+Restaurant+Kampala" },
  // East African
  { name: "Nyama Choma Spot", location: "Kampala", cuisine: "East African", rating: 4.2, price: "$", distance: "4.0 km from stadium", phone: "+256 772 111 222", hours: "12PM - 11PM", specialty: "Nyama Choma, Ugali, Kachumbari", map: "https://maps.google.com/?q=Nyama+Choma+Kampala" },
]

export default function RestaurantGuide() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cuisine, setCuisine] = useState('All')
  const [location, setLocation] = useState('All')

  const filtered = RESTAURANTS.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.specialty.toLowerCase().includes(search.toLowerCase())
    const matchesCuisine = cuisine === 'All' || r.cuisine === cuisine
    const matchesLocation = location === 'All' || r.location === location
    return matchesSearch && matchesCuisine && matchesLocation
  })

  const locations = ['All', ...Array.from(new Set(RESTAURANTS.map(r => r.location)))]

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Dining Guide</h1>
            <p className="text-gray-400">{filtered.length} restaurants recommended for AFCON 2027 visitors</p>
          </div>
          <button onClick={() => navigate('/listings')} className="bg-sunset hover:bg-sunset/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Back to Stays
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-midnight rounded-xl p-4 mb-8 border border-gray-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" placeholder="Search restaurants or dishes..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-deep-forest text-white pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 focus:border-sunset focus:outline-none text-sm" />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={location} onChange={e => setLocation(e.target.value)}
                className="bg-deep-forest text-white px-4 py-2.5 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-sunset">
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={cuisine} onChange={e => setCuisine(e.target.value)}
                className="bg-deep-forest text-white px-4 py-2.5 rounded-lg border border-gray-700 text-sm focus:outline-none focus:border-sunset">
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.5) }}
              className="bg-midnight rounded-xl p-5 border border-gray-800 hover:border-gray-600 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg group-hover:text-sunset transition-colors">{r.name}</h3>
                  <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-sage" /> {r.location} • {r.distance}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-savanna-gold/20 px-2 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-savanna-gold fill-current" />
                  <span className="text-savanna-gold text-sm font-bold">{r.rating}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs bg-deep-forest text-gray-300 px-2 py-1 rounded">{r.cuisine}</span>
                <span className="text-xs bg-deep-forest text-gray-300 px-2 py-1 rounded">{r.price}</span>
                <span className="text-xs bg-deep-forest text-gray-300 px-2 py-1 rounded flex items-center gap-1"><Clock className="w-3 h-3" /> {r.hours}</span>
              </div>

              <p className="text-gray-400 text-sm mb-3">
                <span className="text-sage font-medium">Specialty:</span> {r.specialty}
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
                <a href={`tel:${r.phone}`} className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition-colors">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <button onClick={() => window.open(r.map, '_blank')}
                  className="flex items-center gap-1 text-sunset hover:text-sunset/80 text-sm transition-colors ml-auto">
                  <MapPin className="w-3.5 h-3.5" /> Directions <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <UtensilsCrossed className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No restaurants found</p>
            <button onClick={() => { setSearch(''); setCuisine('All'); setLocation('All'); }} className="text-sunset hover:underline mt-2">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  )
}
