import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
  DollarSign,
  Image,
  Check,
  BedDouble,
  Bath,
  Users,
  Bus,
  Shield,
  Loader2,
} from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { trpc } from '@/providers/trpc'

/* ------------------------------------------------------------------ */
/*  Step configuration                                                  */
/* ------------------------------------------------------------------ */
const steps = [
  { id: 1, label: 'Location', icon: MapPin },
  { id: 2, label: 'Details', icon: Home },
  { id: 3, label: 'Pricing', icon: DollarSign },
  { id: 4, label: 'Photos', icon: Image },
  { id: 5, label: 'Review', icon: Check },
]

/* ------------------------------------------------------------------ */
/*  Form state                                                          */
/* ------------------------------------------------------------------ */
interface PropertyForm {
  title: string
  description: string
  location: string
  address: string
  pricePerNight: string
  capacity: string
  bedrooms: string
  bathrooms: string
  amenities: string
  images: string[]
  hasShuttle: boolean
  isGroupFriendly: boolean
  distanceToStadium: string
}

const initialForm: PropertyForm = {
  title: '',
  description: '',
  location: '',
  address: '',
  pricePerNight: '',
  capacity: '2',
  bedrooms: '1',
  bathrooms: '1',
  amenities: '',
  images: ['', '', '', '', '', ''],
  hasShuttle: false,
  isGroupFriendly: false,
  distanceToStadium: '',
}

/* ------------------------------------------------------------------ */
/*  Helper: stepper validation                                          */
/* ------------------------------------------------------------------ */
function getStepError(step: number, form: PropertyForm): string | null {
  switch (step) {
    case 1:
      if (!form.title.trim()) return 'Property name is required'
      if (!form.location.trim()) return 'Location is required'
      if (!form.address.trim()) return 'Address is required'
      return null
    case 2:
      if (!form.description.trim()) return 'Description is required'
      if (!form.bedrooms || Number(form.bedrooms) < 1) return 'Bedrooms must be at least 1'
      if (!form.bathrooms || Number(form.bathrooms) < 1) return 'Bathrooms must be at least 1'
      if (!form.capacity || Number(form.capacity) < 1) return 'Capacity must be at least 1'
      return null
    case 3:
      if (!form.pricePerNight || Number(form.pricePerNight) <= 0) return 'Price per night is required'
      return null
    case 4:
      if (form.images.filter(Boolean).length === 0) return 'Upload at least one photo'
      return null
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export default function AddProperty() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<PropertyForm>(initialForm)
  const [error, setError] = useState<string | null>(null)

  const createProperty = trpc.property.create.useMutation({
    onSuccess: () => {
      setStep(6) // success screen
    },
    onError: (err) => {
      setError(err.message || 'Failed to create property. Please try again.')
    },
  })

  const canProceed = !getStepError(step, form)

  const handleNext = () => {
    const err = getStepError(step, form)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (step < 5) setStep((s) => s + 1)
  }

  const handleBack = () => {
    setError(null)
    if (step > 1) setStep((s) => s - 1)
  }

  const handleSubmit = () => {
    setError(null)
    createProperty.mutate({
      title: form.title,
      description: form.description,
      location: form.location,
      address: form.address,
      pricePerNight: Number(form.pricePerNight),
      capacity: Number(form.capacity),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      amenities: form.amenities,
      images: JSON.stringify(form.images.filter(Boolean)),
      isKitufu: 0,
      hasShuttle: form.hasShuttle ? 1 : 0,
      isGroupFriendly: form.isGroupFriendly ? 1 : 0,
      distanceToStadium: form.distanceToStadium,
      ownerId: 1, // TODO: use actual user id
    })
  }

  const updateForm = (partial: Partial<PropertyForm>) => {
    setForm((prev) => ({ ...prev, ...partial }))
    setError(null)
  }

  /* ---------------------------------------------------------------- */
  /*  Renderers for each step                                         */
  /* ---------------------------------------------------------------- */

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Property Name <span className="text-earth-red">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateForm({ title: e.target.value })}
          placeholder="e.g. Kampala Central Hub"
          className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-deep-forest mb-1.5">
            Location / City <span className="text-earth-red">*</span>
          </label>
          <select
            value={form.location}
            onChange={(e) => updateForm({ location: e.target.value })}
            className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset outline-none bg-white"
          >
            <option value="">Select location</option>
            <option value="Kampala">Kampala</option>
            <option value="Namboole">Namboole</option>
            <option value="Hoima">Hoima</option>
            <option value="Kireka">Kireka</option>
            <option value="Entebbe">Entebbe</option>
            <option value="Jinja">Jinja</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-deep-forest mb-1.5">
            Distance to Stadium
          </label>
          <input
            type="text"
            value={form.distanceToStadium}
            onChange={(e) => updateForm({ distanceToStadium: e.target.value })}
            placeholder="e.g. 2.5 km"
            className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Full Address <span className="text-earth-red">*</span>
        </label>
        <textarea
          value={form.address}
          onChange={(e) => updateForm({ address: e.target.value })}
          placeholder="Street address, district, nearest landmark"
          rows={3}
          className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none resize-none"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Description <span className="text-earth-red">*</span>
        </label>
        <textarea
          value={form.description}
          onChange={(e) => updateForm({ description: e.target.value })}
          placeholder="Describe your property, what's unique about it, nearby attractions..."
          rows={4}
          className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-deep-forest mb-1.5 flex items-center gap-1.5">
            <BedDouble size={14} /> Bedrooms
          </label>
          <input
            type="number"
            min={1}
            value={form.bedrooms}
            onChange={(e) => updateForm({ bedrooms: e.target.value })}
            className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep-forest mb-1.5 flex items-center gap-1.5">
            <Bath size={14} /> Bathrooms
          </label>
          <input
            type="number"
            min={1}
            value={form.bathrooms}
            onChange={(e) => updateForm({ bathrooms: e.target.value })}
            className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep-forest mb-1.5 flex items-center gap-1.5">
            <Users size={14} /> Capacity
          </label>
          <input
            type="number"
            min={1}
            value={form.capacity}
            onChange={(e) => updateForm({ capacity: e.target.value })}
            className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Amenities (comma-separated)
        </label>
        <input
          type="text"
          value={form.amenities}
          onChange={(e) => updateForm({ amenities: e.target.value })}
          placeholder="WiFi, Kitchen, Parking, AC, Security, Hot Water..."
          className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-4 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasShuttle}
            onChange={(e) => updateForm({ hasShuttle: e.target.checked })}
            className="w-4 h-4 accent-sunset rounded"
          />
          <span className="text-sm text-deep-forest flex items-center gap-1.5">
            <Bus size={14} className="text-sunset" /> Stadium Shuttle
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isGroupFriendly}
            onChange={(e) => updateForm({ isGroupFriendly: e.target.checked })}
            className="w-4 h-4 accent-sunset rounded"
          />
          <span className="text-sm text-deep-forest flex items-center gap-1.5">
            <Users size={14} className="text-sunset" /> Group Friendly
          </span>
        </label>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Price per Night (USD) <span className="text-earth-red">*</span>
        </label>
        <div className="relative">
          <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="number"
            min={1}
            value={form.pricePerNight}
            onChange={(e) => updateForm({ pricePerNight: e.target.value })}
            placeholder="e.g. 85"
            className="w-full border border-light-grey rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
        <p className="text-xs text-slate mt-1">
          Suggested range: $50 – $200 per night for AFCON 2027
        </p>
      </div>

      <div className="bg-warm-sand rounded-xl p-5 space-y-3">
        <h4 className="font-display font-semibold text-deep-forest text-sm flex items-center gap-2">
          <Shield size={16} className="text-teal-depth" />
          Kitufu Compliance Info
        </h4>
        <p className="text-xs text-slate">
          Your property will be reviewed by UTB (Uganda Tourism Board) before going live.
          Ensure all details are accurate and photos are clear.
        </p>
        <ul className="text-xs text-slate space-y-1">
          <li className="flex items-center gap-1.5">
            <Check size={12} className="text-teal-depth" /> Security clearance required
          </li>
          <li className="flex items-center gap-1.5">
            <Check size={12} className="text-teal-depth" /> Sanitation inspection
          </li>
          <li className="flex items-center gap-1.5">
            <Check size={12} className="text-teal-depth" /> Fire safety compliance
          </li>
        </ul>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-display font-semibold text-deep-forest mb-1">Property Photos</h3>
        <p className="text-sm text-slate mb-4">
          Upload up to 6 photos. The first image will be used as the cover photo.
        </p>
      </div>

      <ImageUpload
        maxFiles={6}
        images={form.images.filter(Boolean)}
        onUpload={(url) => {
          const imgs = [...form.images]
          const idx = imgs.findIndex((i) => !i)
          if (idx >= 0) imgs[idx] = url
          setForm((prev) => ({ ...prev, images: imgs }))
          setError(null)
        }}
        onRemove={(removeIdx) => {
          const imgs = form.images.filter(Boolean)
          imgs.splice(removeIdx, 1)
          // Rebuild with empty slots
          const newImages = [...imgs, '', '', '', '', '', ''].slice(0, 6)
          setForm((prev) => ({ ...prev, images: newImages }))
        }}
      />
    </div>
  )

  const renderStep5 = () => {
    const uploadedImages = form.images.filter(Boolean)
    return (
      <div className="space-y-5">
        <h3 className="font-display font-semibold text-deep-forest">Review Your Listing</h3>

        <div className="bg-warm-sand rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-display font-semibold text-lg text-deep-forest">{form.title}</h4>
              <p className="text-sm text-slate flex items-center gap-1 mt-0.5">
                <MapPin size={14} /> {form.location} &middot; {form.address}
              </p>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-xl text-sunset">${form.pricePerNight}</div>
              <div className="text-xs text-slate">per night</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-slate">
            <span className="bg-white px-2.5 py-1 rounded-full border border-light-grey">
              {form.bedrooms} Bedrooms
            </span>
            <span className="bg-white px-2.5 py-1 rounded-full border border-light-grey">
              {form.bathrooms} Bathrooms
            </span>
            <span className="bg-white px-2.5 py-1 rounded-full border border-light-grey">
              Capacity: {form.capacity}
            </span>
            {form.hasShuttle && (
              <span className="bg-white px-2.5 py-1 rounded-full border border-light-grey text-sunset">
                Stadium Shuttle
              </span>
            )}
            {form.isGroupFriendly && (
              <span className="bg-white px-2.5 py-1 rounded-full border border-light-grey text-sunset">
                Group Friendly
              </span>
            )}
          </div>

          <p className="text-sm text-deep-forest">{form.description}</p>

          {form.amenities && (
            <div className="flex flex-wrap gap-1.5">
              {form.amenities.split(',').map((a) => (
                <span key={a} className="text-[11px] bg-teal-depth/10 text-teal-depth px-2 py-0.5 rounded-full">
                  {a.trim()}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Photo preview */}
        {uploadedImages.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-deep-forest mb-2">
              Photos ({uploadedImages.length})
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {uploadedImages.map((url, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-light-grey">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate bg-[#E8F5E9] text-[#27AE60] rounded-lg px-4 py-3">
          <Shield size={14} />
          Your property will be reviewed by UTB before going live. This usually takes 1-2 business days.
        </div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Success screen                                                  */
  /* ---------------------------------------------------------------- */
  if (step === 6) {
    return (
      <div className="min-h-screen bg-warm-sand flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 md:p-12 max-w-md w-full text-center shadow-sm border border-light-grey"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-6"
          >
            <Check size={32} className="text-[#27AE60]" />
          </motion.div>
          <h2 className="font-display font-bold text-2xl text-deep-forest mb-2">
            Property Submitted!
          </h2>
          <p className="text-slate text-sm mb-8">
            Your property <strong>{form.title}</strong> has been submitted for UTB review.
            You will be notified once it is approved.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/host')}
              className="btn-primary w-full"
            >
              Go to Host Dashboard
            </button>
            <button
              onClick={() => {
                setForm(initialForm)
                setStep(1)
              }}
              className="w-full border-2 border-sunset text-sunset hover:bg-sunset hover:text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Add Another Property
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ---------------------------------------------------------------- */
  /*  Main layout                                                     */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-warm-sand">
      {/* Header */}
      <div className="bg-white border-b border-light-grey">
        <div className="container-kitufu py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/host')}
            className="p-2 hover:bg-warm-sand rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-deep-forest" />
          </button>
          <h1 className="font-display font-bold text-xl text-deep-forest">Add New Property</h1>
        </div>
      </div>

      <div className="container-kitufu py-6 md:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, i) => {
              const Icon = s.icon
              const isActive = step === s.id
              const isCompleted = step > s.id
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.div
                      animate={{
                        backgroundColor: isActive
                          ? '#FF6B35'
                          : isCompleted
                            ? '#E8F5E9'
                            : '#F5F5F5',
                        borderColor: isActive
                          ? '#FF6B35'
                          : isCompleted
                            ? '#27AE60'
                            : '#E2E8F0',
                      }}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors"
                    >
                      {isCompleted ? (
                        <Check size={18} className="text-[#27AE60]" />
                      ) : (
                        <Icon
                          size={16}
                          className={isActive ? 'text-white' : 'text-slate'}
                        />
                      )}
                    </motion.div>
                    <span
                      className={`text-[10px] font-medium hidden sm:block ${
                        isActive ? 'text-sunset' : isCompleted ? 'text-[#27AE60]' : 'text-slate'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 bg-light-grey rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: step > s.id ? '100%' : '0%' }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-[#27AE60]"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl border border-light-grey p-5 md:p-8"
          >
            {/* Step title */}
            <div className="mb-6">
              <h2 className="font-display font-semibold text-lg text-deep-forest">
                Step {step}: {steps[step - 1]?.label}
              </h2>
              <p className="text-xs text-slate mt-0.5">
                {step === 1 && 'Where is your property located?'}
                {step === 2 && 'Tell guests about your property'}
                {step === 3 && 'Set your pricing'}
                {step === 4 && 'Add photos to attract guests'}
                {step === 5 && 'Review everything before submitting'}
              </p>
            </div>

            {/* Step content */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-600"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-light-grey">
              <button
                onClick={handleBack}
                disabled={step === 1}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  step === 1
                    ? 'text-slate/40 cursor-not-allowed'
                    : 'text-slate hover:text-deep-forest hover:bg-warm-sand'
                }`}
              >
                <ChevronLeft size={16} /> Back
              </button>

              {step < 5 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={`flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    canProceed
                      ? 'bg-sunset hover:bg-[#E55A2B] text-white'
                      : 'bg-slate/20 text-slate/40 cursor-not-allowed'
                  }`}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={createProperty.isPending}
                  className="flex items-center gap-2 bg-sunset hover:bg-[#E55A2B] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {createProperty.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Submit Property
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
