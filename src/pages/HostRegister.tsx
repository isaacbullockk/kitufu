import { useState } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  Shield,
  Check,
  Upload,
  MapPin,
  Phone,
  Mail,
  FileText,
  Loader2,
} from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { trpc } from '@/providers/trpc'

/* ------------------------------------------------------------------ */
/*  Step configuration                                                  */
/* ------------------------------------------------------------------ */
const steps = [
  { id: 1, label: 'Personal', icon: User },
  { id: 2, label: 'Business', icon: Building2 },
  { id: 3, label: 'Documents', icon: FileText },
  { id: 4, label: 'Verify', icon: Shield },
]

/* ------------------------------------------------------------------ */
/*  Form state                                                          */
/* ------------------------------------------------------------------ */
interface HostForm {
  fullName: string
  email: string
  phone: string
  idNumber: string
  companyName: string
  businessReg: string
  taxId: string
  address: string
  city: string
  documents: string[]
}

const initialForm: HostForm = {
  fullName: '',
  email: '',
  phone: '',
  idNumber: '',
  companyName: '',
  businessReg: '',
  taxId: '',
  address: '',
  city: '',
  documents: ['', '', '', ''],
}

/* ------------------------------------------------------------------ */
/*  Step validation                                                     */
/* ------------------------------------------------------------------ */
function getStepError(step: number, form: HostForm): string | null {
  switch (step) {
    case 1:
      if (!form.fullName.trim()) return 'Full name is required'
      if (!form.email.trim()) return 'Email is required'
      if (!form.phone.trim()) return 'Phone number is required'
      if (!form.idNumber.trim()) return 'National ID / Passport is required'
      return null
    case 2:
      if (!form.companyName.trim()) return 'Company or business name is required'
      if (!form.address.trim()) return 'Business address is required'
      if (!form.city.trim()) return 'City is required'
      return null
    case 3:
      if (form.documents.filter(Boolean).length === 0) return 'Upload at least one document'
      return null
    default:
      return null
  }
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                      */
/* ------------------------------------------------------------------ */
export default function HostRegister() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<HostForm>(initialForm)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  const registerHost = trpc.host.register.useMutation({
    onSuccess: () => {
      setCompleted(true)
    },
    onError: (err) => {
      setError(err.message || 'Failed to register. Please try again.')
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
    if (step < 4) setStep((s) => s + 1)
  }

  const handleBack = () => {
    setError(null)
    if (step > 1) setStep((s) => s - 1)
  }

  const handleSubmit = () => {
    setError(null)
    registerHost.mutate({
      userId: 1, // TODO: use actual user id
      companyName: form.companyName,
      utbNumber: form.businessReg || undefined,
      phone: form.phone,
    })
  }

  const updateForm = (partial: Partial<HostForm>) => {
    setForm((prev) => ({ ...prev, ...partial }))
    setError(null)
  }

  /* ---------------------------------------------------------------- */
  /*  Step renderers                                                  */
  /* ---------------------------------------------------------------- */

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Full Name <span className="text-earth-red">*</span>
        </label>
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => updateForm({ fullName: e.target.value })}
            placeholder="As shown on your ID"
            className="w-full border border-light-grey rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Email <span className="text-earth-red">*</span>
        </label>
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateForm({ email: e.target.value })}
            placeholder="your@email.com"
            className="w-full border border-light-grey rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Phone Number <span className="text-earth-red">*</span>
        </label>
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateForm({ phone: e.target.value })}
            placeholder="+256 700 000 000"
            className="w-full border border-light-grey rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          National ID / Passport Number <span className="text-earth-red">*</span>
        </label>
        <input
          type="text"
          value={form.idNumber}
          onChange={(e) => updateForm({ idNumber: e.target.value })}
          placeholder="e.g. CM12345678"
          className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Company / Business Name <span className="text-earth-red">*</span>
        </label>
        <div className="relative">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => updateForm({ companyName: e.target.value })}
            placeholder="e.g. Mugisha Properties Ltd"
            className="w-full border border-light-grey rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-deep-forest mb-1.5">
            Business Registration (UTB)
          </label>
          <input
            type="text"
            value={form.businessReg}
            onChange={(e) => updateForm({ businessReg: e.target.value })}
            placeholder="UTB-TTA-2025-XXXXX"
            className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-deep-forest mb-1.5">
            Tax ID (TIN)
          </label>
          <input
            type="text"
            value={form.taxId}
            onChange={(e) => updateForm({ taxId: e.target.value })}
            placeholder="TIN-XXXXXXXXXX"
            className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          Business Address <span className="text-earth-red">*</span>
        </label>
        <textarea
          value={form.address}
          onChange={(e) => updateForm({ address: e.target.value })}
          placeholder="Street, building, district"
          rows={3}
          className="w-full border border-light-grey rounded-lg px-4 py-2.5 text-sm focus:border-sunset focus:ring-2 focus:ring-sunset/15 outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-deep-forest mb-1.5">
          City <span className="text-earth-red">*</span>
        </label>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <select
            value={form.city}
            onChange={(e) => updateForm({ city: e.target.value })}
            className="w-full border border-light-grey rounded-lg pl-9 pr-4 py-2.5 text-sm focus:border-sunset outline-none bg-white"
          >
            <option value="">Select city</option>
            <option value="Kampala">Kampala</option>
            <option value="Namboole">Namboole</option>
            <option value="Hoima">Hoima</option>
            <option value="Entebbe">Entebbe</option>
            <option value="Jinja">Jinja</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <h3 className="font-display font-semibold text-deep-forest mb-1">Upload Documents</h3>
        <p className="text-sm text-slate mb-4">
          Please upload your ID, business registration, and any other relevant documents. These are required for UTB verification.
        </p>
      </div>

      <ImageUpload
        maxFiles={4}
        images={form.documents.filter(Boolean)}
        onUpload={(url) => {
          const docs = [...form.documents]
          const idx = docs.findIndex((d) => !d)
          if (idx >= 0) docs[idx] = url
          setForm((prev) => ({ ...prev, documents: docs }))
          setError(null)
        }}
        onRemove={(removeIdx) => {
          const docs = form.documents.filter(Boolean)
          docs.splice(removeIdx, 1)
          const newDocs = [...docs, '', '', '', ''].slice(0, 4)
          setForm((prev) => ({ ...prev, documents: newDocs }))
        }}
      />

      <div className="bg-[#FFF8E1] rounded-lg p-4 text-xs text-deep-forest space-y-1.5">
        <p className="font-medium flex items-center gap-1.5">
          <Shield size={14} className="text-savanna-gold" />
          Required Documents:
        </p>
        <ul className="list-disc list-inside text-slate space-y-0.5 ml-1">
          <li>Government-issued ID or Passport</li>
          <li>UTB Temporary Tourism Accommodation certificate (if available)</li>
          <li>Business registration certificate</li>
          <li>Proof of property ownership or lease</li>
        </ul>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-5">
      <h3 className="font-display font-semibold text-deep-forest">Review & Submit</h3>

      <div className="bg-warm-sand rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-light-grey">
          <div className="w-10 h-10 rounded-full bg-deep-forest/10 flex items-center justify-center">
            <User size={18} className="text-deep-forest" />
          </div>
          <div>
            <div className="font-medium text-deep-forest text-sm">{form.fullName}</div>
            <div className="text-xs text-slate">{form.email} &middot; {form.phone}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-slate">Company</div>
            <div className="font-medium text-deep-forest">{form.companyName}</div>
          </div>
          <div>
            <div className="text-xs text-slate">Business Reg</div>
            <div className="font-medium text-deep-forest">{form.businessReg || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-slate">Tax ID</div>
            <div className="font-medium text-deep-forest">{form.taxId || 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-slate">ID / Passport</div>
            <div className="font-medium text-deep-forest">{form.idNumber}</div>
          </div>
        </div>

        <div className="text-sm">
          <div className="text-xs text-slate">Address</div>
          <div className="font-medium text-deep-forest">{form.address}, {form.city}</div>
        </div>

        {form.documents.filter(Boolean).length > 0 && (
          <div>
            <div className="text-xs text-slate mb-1.5">
              Documents Uploaded ({form.documents.filter(Boolean).length})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {form.documents.filter(Boolean).map((url, i) => (
                <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden border border-light-grey bg-white">
                  <img src={url} alt={`Document ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-sunset rounded mt-0.5" defaultChecked />
        <span className="text-xs text-slate">
          I confirm that all information provided is accurate and I agree to Kitufu's
          Terms of Service and Host Agreement. I understand my application will be reviewed
          by UTB before approval.
        </span>
      </label>
    </div>
  )

  /* ---------------------------------------------------------------- */
  /*  Success screen                                                  */
  /* ---------------------------------------------------------------- */
  if (completed) {
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
            Application Submitted!
          </h2>
          <p className="text-slate text-sm mb-8">
            Thank you, <strong>{form.fullName}</strong>! Your host application has been received.
            We will review your documents and notify you within 2-3 business days.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/host')}
              className="btn-primary w-full"
            >
              Go to Host Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-sunset text-sunset hover:bg-sunset hover:text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Back to Home
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
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-warm-sand rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-deep-forest" />
          </button>
          <h1 className="font-display font-bold text-xl text-deep-forest">Become a Host</h1>
        </div>
      </div>

      <div className="container-kitufu py-6 md:py-10">
        <div className="max-w-2xl mx-auto">
          {/* Hero text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-deep-forest mb-2">
              Turn Your Property Into AFCON Revenue
            </h2>
            <p className="text-slate text-sm max-w-lg mx-auto">
              Join thousands of hosts earning income during AFCON 2027. Complete the
              onboarding to get verified and start listing your property.
            </p>
          </motion.div>

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
            <div className="mb-6">
              <h2 className="font-display font-semibold text-lg text-deep-forest">
                Step {step}: {steps[step - 1]?.label} Info
              </h2>
              <p className="text-xs text-slate mt-0.5">
                {step === 1 && 'Tell us about yourself'}
                {step === 2 && 'Your business details'}
                {step === 3 && 'Upload verification documents'}
                {step === 4 && 'Review and submit your application'}
              </p>
            </div>

            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

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

            {/* Buttons */}
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

              {step < 4 ? (
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
                  disabled={registerHost.isPending}
                  className="flex items-center gap-2 bg-sunset hover:bg-[#E55A2B] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {registerHost.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Submit Application
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
