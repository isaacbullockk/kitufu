import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { trpc } from '../providers/trpc'

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookingRef = searchParams.get("ref") || ""
  const txRef = searchParams.get("tx_ref") || ""
  const txId = searchParams.get("transaction_id") || ""
  const status = searchParams.get("status") || ""

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  // Verify payment if returning from Flutterwave
  const verifyPayment = trpc.payment.verify.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setVerified(true)
        setPaymentStatus("success")
      } else {
        setPaymentStatus("failed")
      }
    },
    onError: () => setPaymentStatus("failed"),
  })

  // Get booking details
  const { data: booking } = trpc.booking.byRef.useQuery(
    { bookingRef },
    { enabled: !!bookingRef }
  )

  const initializePayment = trpc.payment.initialize.useMutation({
    onSuccess: (data) => {
      if (data.paymentLink) {
        window.location.href = data.paymentLink
      }
    },
  })

  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [verified, setVerified] = useState(false)

  // Auto-verify on redirect back from Flutterwave
  useEffect(() => {
    if (status && txId && bookingRef && paymentStatus === "pending") {
      verifyPayment.mutate({ transactionId: txId, bookingRef })
    }
  }, [status, txId, bookingRef])

  const handlePay = () => {
    if (!booking) return
    const redirectUrl = window.location.origin + "/payment?ref=" + bookingRef
    initializePayment.mutate({
      bookingRef,
      propertyId: booking.propertyId,
      amount: booking.totalPrice,
      currency: "UGX",
      email,
      name,
      phone: phone || undefined,
      redirectUrl,
    })
  }

  // Payment success state
  if (paymentStatus === "success") {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-midnight rounded-2xl p-10 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h1>
          <p className="text-gray-400 mb-2">Your booking <strong className="text-savanna-gold">{bookingRef}</strong> is confirmed.</p>
          <p className="text-gray-500 text-sm mb-6">A confirmation has been sent to your email.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/dashboard")} className="bg-sunset hover:bg-sunset/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              My Bookings
            </button>
            <button onClick={() => navigate("/")} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Home
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Payment failed state
  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-midnight rounded-2xl p-10 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-gray-400 mb-6">We could not process your payment. Please try again.</p>
          <button onClick={() => setPaymentStatus("pending")} className="bg-sunset hover:bg-sunset/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            Try Again
          </button>
        </motion.div>
      </div>
    )
  }

  // Loading booking
  if (!booking) {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-10 h-10 text-sunset animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-midnight rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Complete Your Booking</h1>
          <p className="text-gray-400 text-sm mb-6">Booking reference: <span className="text-savanna-gold font-mono">{bookingRef}</span></p>

          {/* Price summary */}
          <div className="bg-deep-forest rounded-xl p-5 mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Accommodation</span>
              <span className="text-white">USh {booking.totalPrice?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Service fee</span>
              <span className="text-white">USh {Math.round((booking.totalPrice || 0) * 0.05).toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-700 pt-2 flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-savanna-gold font-bold text-lg">USh {Math.round((booking.totalPrice || 0) * 1.05).toLocaleString()}</span>
            </div>
          </div>

          {/* Payment method icons */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 bg-deep-forest rounded-lg px-3 py-2">
              <Smartphone className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300 text-sm">MTN/Airtel</span>
            </div>
            <div className="flex items-center gap-2 bg-deep-forest rounded-lg px-3 py-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              <span className="text-gray-300 text-sm">Visa/MC</span>
            </div>
          </div>

          {/* Customer details form */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="john@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone (for Mobile Money)</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="+256 772 123 456" />
            </div>
          </div>

          <button
            onClick={handlePay}
            disabled={initializePayment.isPending || !name || !email}
            className="w-full bg-sunset hover:bg-sunset/90 text-white font-semibold py-3.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {initializePayment.isPending ? (
              <><Loader className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <>Pay USh {Math.round((booking.totalPrice || 0) * 1.05).toLocaleString()}</>
            )}
          </button>

          <p className="text-gray-500 text-xs text-center mt-4">Secured by Flutterwave. Your payment information is encrypted.</p>
        </motion.div>
      </div>
    </div>
  )
}
