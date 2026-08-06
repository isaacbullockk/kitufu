import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router"
import { motion, AnimatePresence } from "framer-motion"
import { trpc } from "../providers/trpc"
import { useAuth } from "../hooks/useAuth"
import {
  Building2, Upload, X, Check, ChevronLeft, ChevronRight,
  MapPin, DollarSign, Users, Bed, Bath, Wifi, Wind, UtensilsCrossed,
  Tv, Waves, Dumbbell, Car, Shield, LayoutGrid, Bus, UsersRound,
  AlertCircle, Save, Eye, Star, Image as ImageIcon
} from "lucide-react"

const LOCATIONS = ["Kampala", "Hoima", "Entebbe", "Jinja", "Gulu", "Mbarara", "Fort Portal", "Arua"]

const AMENITY_OPTIONS = [
  { key: "WiFi", icon: Wifi, label: "WiFi" },
  { key: "Air Conditioning", icon: Wind, label: "AC" },
  { key: "Kitchen", icon: UtensilsCrossed, label: "Kitchen" },
  { key: "TV", icon: Tv, label: "TV" },
  { key: "Pool", icon: Waves, label: "Pool" },
  { key: "Gym", icon: Dumbbell, label: "Gym" },
  { key: "Parking", icon: Car, label: "Parking" },
  { key: "Security", icon: Shield, label: "Security" },
  { key: "Balcony", icon: LayoutGrid, label: "Balcony" },
  { key: "Shuttle", icon: Bus, label: "Shuttle" },
]

const DRAFT_KEY = "kitufu_property_draft"

const steps = [
  { label: "Basics", icon: Building2 },
  { label: "Photos", icon: ImageIcon },
  { label: "Details", icon: Star },
  { label: "Review", icon: Eye },
]

interface FormData {
  title: string
  location: string
  address: string
  description: string
  distanceToStadium: string
  images: string[]
  pricePerNight: string
  capacity: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  hasShuttle: boolean
  isGroupFriendly: boolean
  isKitufu: boolean
}

const defaultForm: FormData = {
  title: "",
  location: "Kampala",
  address: "",
  description: "",
  distanceToStadium: "",
  images: [],
  pricePerNight: "",
  capacity: 2,
  bedrooms: 1,
  bathrooms: 1,
  amenities: [],
  hasShuttle: false,
  isGroupFriendly: false,
  isKitufu: false,
}

export default function AddProperty() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDraftPrompt, setShowDraftPrompt] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const createProperty = trpc.property.create.useMutation({
    onSuccess: () => {
      setSuccess(true)
      setIsSubmitting(false)
      localStorage.removeItem(DRAFT_KEY)
    },
    onError: () => {
      setIsSubmitting(false)
    },
  })

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      try {
        setShowDraftPrompt(true)
      } catch {}
    }
  }, [])

  const loadDraft = () => {
    const draft = localStorage.getItem(DRAFT_KEY)
    if (draft) {
      setForm(JSON.parse(draft))
    }
    setShowDraftPrompt(false)
  }

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    setShowDraftPrompt(false)
  }

  // Auto-save draft
  useEffect(() => {
    if (!success) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    }
  }, [form, success])

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  const toggleAmenity = (key: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }))
  }

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {}
    if (s === 0) {
      if (!form.title.trim()) e.title = "Property name is required"
      if (!form.location) e.location = "Location is required"
      if (!form.description.trim()) e.description = "Description is required"
    }
    if (s === 1) {
      if (form.images.length === 0) e.images = "At least 1 photo is required"
    }
    if (s === 2) {
      const price = Number(form.pricePerNight)
      if (!form.pricePerNight || price < 1000) e.pricePerNight = "Price must be at least 1,000 USh"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 3))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    handleFiles(files)
  }, [])

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (form.images.length >= 10) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          setForm((prev) => ({ ...prev, images: [...prev.images, result] }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }

  const submit = () => {
    if (!validateStep(2)) return
    setIsSubmitting(true)
    createProperty.mutate({
      title: form.title,
      description: form.description,
      location: form.location,
      pricePerNight: Number(form.pricePerNight),
      capacity: form.capacity,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      amenities: JSON.stringify(form.amenities),
      images: JSON.stringify(form.images),
      isKitufu: form.isKitufu,
      hasShuttle: form.hasShuttle,
      isGroupFriendly: form.isGroupFriendly,
      distanceToStadium: form.distanceToStadium,
      ownerId: user?.id ? Number(user.id) : 1,
    })
  }

  const totalPrice = Number(form.pricePerNight) || 0

  if (success) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-deep-forest mb-3">
            Property Submitted!
          </h1>
          <p className="text-slate mb-6">
            Your property is now live and ready for bookings. Manage it from your Host Dashboard.
          </p>
          <button
            onClick={() => navigate("/host")}
            className="bg-deep-forest text-white font-body px-8 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            Go to Host Dashboard
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-deep-forest mb-2">
            List Your Property
          </h1>
          <p className="text-slate font-body">
            Fill in your property details step by step. Your progress auto-saves.
          </p>
        </div>

        {/* Draft prompt */}
        {showDraftPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Save className="w-5 h-5 text-amber-600" />
              <span className="text-amber-800 font-body text-sm">
                You have a saved draft. Resume where you left off?
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadDraft}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-body hover:bg-amber-700"
              >
                Resume Draft
              </button>
              <button
                onClick={clearDraft}
                className="px-4 py-2 text-amber-700 text-sm font-body hover:underline"
              >
                Start Fresh
              </button>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < step
                      ? "bg-green-500 text-white"
                      : i === step
                      ? "bg-deep-forest text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span
                  className={`hidden sm:block text-sm font-body ${
                    i === step ? "text-deep-forest font-bold" : "text-slate"
                  }`}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-1 rounded ${
                      i < step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-deep-forest h-full"
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-light-grey overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="p-6 sm:p-8"
              >
                <h2 className="font-display text-xl font-bold text-deep-forest mb-6">
                  Basic Information
                </h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-body text-deep-forest mb-1.5">
                      Property Name *
                    </label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      placeholder="e.g. Kampala Central Suites"
                      className="w-full px-4 py-3 border border-light-grey rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-deep-forest"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-body text-deep-forest mb-1.5">
                        Location *
                      </label>
                      <select
                        value={form.location}
                        onChange={(e) => update("location", e.target.value)}
                        className="w-full px-4 py-3 border border-light-grey rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-deep-forest bg-white"
                      >
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-body text-deep-forest mb-1.5">
                        Address
                      </label>
                      <input
                        type="text"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="Street address"
                        className="w-full px-4 py-3 border border-light-grey rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-deep-forest"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-body text-deep-forest mb-1.5">
                      Description *
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      placeholder="Tell guests what makes your place special..."
                      rows={4}
                      className="w-full px-4 py-3 border border-light-grey rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-deep-forest resize-none"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-body text-deep-forest mb-1.5">
                      Distance to Mandela Stadium
                    </label>
                    <input
                      type="text"
                      value={form.distanceToStadium}
                      onChange={(e) => update("distanceToStadium", e.target.value)}
                      placeholder="e.g. 2.1 km"
                      className="w-full px-4 py-3 border border-light-grey rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-deep-forest"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="p-6 sm:p-8"
              >
                <h2 className="font-display text-xl font-bold text-deep-forest mb-6">
                  Photos
                </h2>

                {/* Drag & Drop */}
                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                    dragActive ? "border-deep-forest bg-sage/10" : "border-light-grey"
                  }`}
                >
                  <Upload className="w-10 h-10 text-sage mx-auto mb-3" />
                  <p className="font-body text-deep-forest mb-1">
                    Drag & drop photos here
                  </p>
                  <p className="text-xs text-slate mb-3">or</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) handleFiles(Array.from(e.target.files))
                    }}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="inline-block px-6 py-2 bg-deep-forest text-white rounded-lg font-body text-sm cursor-pointer hover:bg-opacity-90"
                  >
                    Browse Files
                  </label>
                  <p className="text-xs text-slate mt-3">
                    Up to 10 images. JPG, PNG, WebP. Max 5MB each.
                  </p>
                </div>

                {errors.images && (
                  <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.images}
                  </p>
                )}

                {/* Thumbnails */}
                {form.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="p-6 sm:p-8"
              >
                <h2 className="font-display text-xl font-bold text-deep-forest mb-6">
                  Details & Pricing
                </h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-body text-deep-forest mb-1.5">
                        Price per Night (USh) *
                      </label>
                      <input
                        type="number"
                        value={form.pricePerNight}
                        onChange={(e) => update("pricePerNight", e.target.value)}
                        placeholder="85000"
                        min="1000"
                        className="w-full px-4 py-3 border border-light-grey rounded-lg font-body focus:outline-none focus:ring-2 focus:ring-deep-forest"
                      />
                      {errors.pricePerNight && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.pricePerNight}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-body text-deep-forest mb-1.5">
                        Capacity (guests)
                      </label>
                      <div className="flex items-center border border-light-grey rounded-lg">
                        <button
                          onClick={() => update("capacity", Math.max(1, form.capacity - 1))}
                          className="px-3 py-3 text-slate hover:text-deep-forest"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-body">{form.capacity}</span>
                        <button
                          onClick={() => update("capacity", Math.min(50, form.capacity + 1))}
                          className="px-3 py-3 text-slate hover:text-deep-forest"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-body text-deep-forest mb-1.5">
                        Bedrooms
                      </label>
                      <div className="flex items-center border border-light-grey rounded-lg">
                        <button
                          onClick={() => update("bedrooms", Math.max(0, form.bedrooms - 1))}
                          className="px-3 py-3 text-slate hover:text-deep-forest"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-body">{form.bedrooms}</span>
                        <button
                          onClick={() => update("bedrooms", Math.min(20, form.bedrooms + 1))}
                          className="px-3 py-3 text-slate hover:text-deep-forest"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-body text-deep-forest mb-1.5">
                        Bathrooms
                      </label>
                      <div className="flex items-center border border-light-grey rounded-lg">
                        <button
                          onClick={() => update("bathrooms", Math.max(0, form.bathrooms - 1))}
                          className="px-3 py-3 text-slate hover:text-deep-forest"
                        >
                          -
                        </button>
                        <span className="flex-1 text-center font-body">{form.bathrooms}</span>
                        <button
                          onClick={() => update("bathrooms", Math.min(20, form.bathrooms + 1))}
                          className="px-3 py-3 text-slate hover:text-deep-forest"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-body text-deep-forest mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AMENITY_OPTIONS.map(({ key, icon: Icon, label }) => (
                        <button
                          key={key}
                          onClick={() => toggleAmenity(key)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors font-body text-sm ${
                            form.amenities.includes(key)
                              ? "bg-deep-forest text-white border-deep-forest"
                              : "bg-white text-slate border-light-grey hover:border-sage"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      form.hasShuttle ? "bg-sage/20 border-deep-forest" : "bg-white border-light-grey"
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.hasShuttle}
                        onChange={(e) => update("hasShuttle", e.target.checked)}
                        className="w-5 h-5 accent-deep-forest"
                      />
                      <div>
                        <p className="font-body text-sm font-bold text-deep-forest">Stadium Shuttle</p>
                        <p className="text-xs text-slate">Offer match-day transport</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      form.isGroupFriendly ? "bg-sage/20 border-deep-forest" : "bg-white border-light-grey"
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.isGroupFriendly}
                        onChange={(e) => update("isGroupFriendly", e.target.checked)}
                        className="w-5 h-5 accent-deep-forest"
                      />
                      <div>
                        <p className="font-body text-sm font-bold text-deep-forest">Group Friendly</p>
                        <p className="text-xs text-slate">Suitable for 10+ guests</p>
                      </div>
                    </label>
                    <label className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                      form.isKitufu ? "bg-sage/20 border-deep-forest" : "bg-white border-light-grey"
                    }`}>
                      <input
                        type="checkbox"
                        checked={form.isKitufu}
                        onChange={(e) => update("isKitufu", e.target.checked)}
                        className="w-5 h-5 accent-deep-forest"
                      />
                      <div>
                        <p className="font-body text-sm font-bold text-deep-forest">Kitufu Verified</p>
                        <p className="text-xs text-slate">Quality checked property</p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="p-6 sm:p-8"
              >
                <h2 className="font-display text-xl font-bold text-deep-forest mb-6">
                  Preview & Submit
                </h2>

                {/* Preview Card */}
                <div className="bg-cream rounded-xl p-4 mb-6 border border-light-grey">
                  <div className="flex gap-4">
                    <div className="w-32 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {form.images[0] ? (
                        <img src={form.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate text-xs">No image</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-lg font-bold text-deep-forest truncate">
                        {form.title || "Property Name"}
                      </h3>
                      <p className="text-sm text-slate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {form.location}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {form.capacity} guests</span>
                        <span className="flex items-center gap-1"><Bed className="w-3 h-3" /> {form.bedrooms} bed</span>
                        <span className="flex items-center gap-1"><Bath className="w-3 h-3" /> {form.bathrooms} bath</span>
                      </div>
                      {form.distanceToStadium && (
                        <p className="text-xs text-sage mt-1">{form.distanceToStadium} from stadium</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-lg font-bold text-deep-forest">
                        USh {totalPrice.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate">per night</p>
                    </div>
                  </div>
                  {form.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.amenities.map((a) => (
                        <span key={a} className="text-xs bg-white px-2 py-1 rounded-full border border-light-grey text-slate">
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-light-grey">
                    <span className="text-slate text-sm">Property</span>
                    <span className="font-body text-deep-forest font-bold">{form.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-light-grey">
                    <span className="text-slate text-sm">Location</span>
                    <span className="font-body text-deep-forest">{form.location}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-light-grey">
                    <span className="text-slate text-sm">Price</span>
                    <span className="font-body text-deep-forest">USh {totalPrice.toLocaleString()} / night</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-light-grey">
                    <span className="text-slate text-sm">Capacity</span>
                    <span className="font-body text-deep-forest">{form.capacity} guests</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-light-grey">
                    <span className="text-slate text-sm">Photos</span>
                    <span className="font-body text-deep-forest">{form.images.length} uploaded</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="px-6 sm:px-8 py-5 border-t border-light-grey flex items-center justify-between bg-gray-50">
            <button
              onClick={back}
              disabled={step === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-body text-sm transition-colors ${
                step === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-deep-forest border border-deep-forest hover:bg-deep-forest hover:text-white"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < 3 ? (
              <button
                onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 bg-deep-forest text-white rounded-lg font-body text-sm hover:bg-opacity-90 transition-colors"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    localStorage.setItem(DRAFT_KEY, JSON.stringify(form))
                    alert("Draft saved!")
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 text-deep-forest border border-deep-forest rounded-lg font-body text-sm hover:bg-deep-forest hover:text-white transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Draft
                </button>
                <button
                  onClick={submit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-deep-forest text-white rounded-lg font-body text-sm hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Submit Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
