import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Building, MapPin, DollarSign, Users, Bed, Bath, Wifi, Shield, Bus, Check } from 'lucide-react'
import { trpc } from '../providers/trpc'

export default function AddProperty() {
  const navigate = useNavigate()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', description: '', location: 'Kampala', address: '',
    pricePerNight: '', capacity: '2', bedrooms: '1', bathrooms: '1',
    hasShuttle: false, isGroupFriendly: false, isKitufu: true,
    distanceToStadium: '',
    amenities: [] as string[],
  })

  const createProperty = trpc.property.create.useMutation({
    onSuccess: (data) => {
      setSuccess('Property "' + data.title + '" submitted for approval! It will appear in listings once approved.')
      setTimeout(() => navigate('/host'), 2000)
    },
    onError: (err) => setError(err.message),
  })

  const toggleAmenity = (a: string) => {
    setForm(f => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const price = parseInt(form.pricePerNight)
    if (!price || price < 1000) { setError('Price must be at least 1,000 UGX'); return }
    createProperty.mutate({
      title: form.title,
      description: form.description,
      location: form.location,
      address: form.address || undefined,
      pricePerNight: price,
      capacity: parseInt(form.capacity) || 2,
      bedrooms: parseInt(form.bedrooms) || 1,
      bathrooms: parseInt(form.bathrooms) || 1,
      amenities: JSON.stringify(form.amenities),
      hasShuttle: form.hasShuttle,
      isGroupFriendly: form.isGroupFriendly,
      isKitufu: form.isKitufu,
      distanceToStadium: form.distanceToStadium || undefined,
      ownerId: 1,
    })
  }

  const amenityOptions = ['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Washer', 'Free Parking', 'Security', 'Pool', 'Gym', 'Balcony', 'Shuttle']

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-midnight rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-8 h-8 text-sunset" />
            <h1 className="text-2xl font-bold text-white">Add Your Property</h1>
          </div>
          <p className="text-gray-400 mb-6">List your accommodation for AFCON 2027 fans</p>

          {success && <div className="bg-green-500/20 border border-green-500 text-green-400 rounded-lg p-4 mb-6">{success}</div>}
          {error && <div className="bg-red-500/20 border border-red-500 text-red-400 rounded-lg p-4 mb-6">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Property Name *</label>
              <input type="text" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="e.g. Kampala Central Suites" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description *</label>
              <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="Describe your property..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">City *</label>
                <select value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none">
                  <option value="Kampala">Kampala</option>
                  <option value="Hoima">Hoima</option>
                  <option value="Entebbe">Entebbe</option>
                  <option value="Jinja">Jinja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Price per Night (UGX) *</label>
                <input type="number" required min="1000" value={form.pricePerNight} onChange={e => setForm(f => ({ ...f, pricePerNight: e.target.value }))} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="85000" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
                <input type="number" min="1" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bedrooms</label>
                <input type="number" min="0" value={form.bedrooms} onChange={e => setForm(f => ({ ...f, bedrooms: e.target.value }))} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bathrooms</label>
                <input type="number" min="0" value={form.bathrooms} onChange={e => setForm(f => ({ ...f, bathrooms: e.target.value }))} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Distance to Stadium</label>
              <input type="text" value={form.distanceToStadium} onChange={e => setForm(f => ({ ...f, distanceToStadium: e.target.value }))} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="e.g. 2.1 km" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map(a => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)} className={(form.amenities.includes(a) ? 'bg-sunset text-white' : 'bg-deep-forest text-gray-400 border-gray-700') + ' border rounded-full px-3 py-1.5 text-sm transition-colors'}>
                    {form.amenities.includes(a) && <Check className="w-3 h-3 inline mr-1" />}{a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.hasShuttle} onChange={e => setForm(f => ({ ...f, hasShuttle: e.target.checked }))} className="w-4 h-4" />
                <Bus className="w-4 h-4" /> Stadium Shuttle
              </label>
              <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.isGroupFriendly} onChange={e => setForm(f => ({ ...f, isGroupFriendly: e.target.checked }))} className="w-4 h-4" />
                <Users className="w-4 h-4" /> Group Friendly
              </label>
            </div>

            <button type="submit" disabled={createProperty.isPending} className="w-full bg-sunset hover:bg-sunset/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50">
              {createProperty.isPending ? 'Submitting...' : 'Submit Property for Approval'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
