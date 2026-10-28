import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { CreditCard, Smartphone, CheckCircle, AlertCircle, Loader, Globe, ArrowLeft } from 'lucide-react'
import { trpc } from '../providers/trpc'
import { useAuth } from '../hooks/useAuth'

export default function PaymentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const bookingRef = searchParams.get("ref") || ""
  const txId = searchParams.get("transaction_id") || ""
  const sessionId = searchParams.get("session_id") || ""
  const status = searchParams.get("status") || ""
  const cancelled = searchParams.get("cancelled") === "1"
  const [method, setMethod] = useState<"flutterwave" | "stripe">("flutterwave")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [paymentError, setPaymentError] = useState("")
  const [verificationRetry, setVerificationRetry] = useState(0)
  const verificationStarted = useRef("")

  const { data: booking, isLoading: isBookingLoading, error: bookingError } = trpc.booking.byRef.useQuery(
    { bookingRef },
    { enabled: !!bookingRef, retry: false }
  )

  const initializeFlutterwave = trpc.payment.initialize.useMutation({
    onSuccess: (data) => { if (data.paymentLink) window.location.href = data.paymentLink },
  })

  const initializeStripe = trpc.stripe.createSession.useMutation({
    onSuccess: (data) => { if (data.sessionUrl) window.location.href = data.sessionUrl },
  })

  const verifyFlutterwave = trpc.payment.verify.useMutation({
    onSuccess: (d) => {
      if (d.success) {
        setPaymentStatus("success")
      } else {
        setPaymentError(("message" in d && d.message) || "We couldn't confirm the Flutterwave payment.")
        setPaymentStatus("failed")
      }
    },
    onError: (error) => { setPaymentError(error.message); setPaymentStatus("failed") },
  })

  const verifyStripe = trpc.stripe.verify.useMutation({
    onSuccess: (d) => {
      if (d.success) {
        setPaymentStatus("success")
      } else {
        setPaymentError(("message" in d && d.message) || "We couldn't confirm the Stripe payment.")
        setPaymentStatus("failed")
      }
    },
    onError: (error) => { setPaymentError(error.message); setPaymentStatus("failed") },
  })

  useEffect(() => {
    if (user) {
      setName((current) => current || user.name || "")
      setEmail((current) => current || user.email || "")
    }
  }, [user])

  useEffect(() => {
    if (!user || !booking) return
    if (status && txId && bookingRef) {
      const key = `flutterwave:${bookingRef}:${txId}`
      if (verificationStarted.current !== key) {
        verificationStarted.current = key
        verifyFlutterwave.mutate({ transactionId: txId, bookingRef })
      }
    } else if (sessionId && bookingRef && !cancelled) {
      const key = `stripe:${bookingRef}:${sessionId}`
      if (verificationStarted.current !== key) {
        verificationStarted.current = key
        verifyStripe.mutate({ sessionId, bookingRef })
      }
    }
  }, [user, booking, status, txId, sessionId, bookingRef, cancelled, verificationRetry, verifyFlutterwave.mutate, verifyStripe.mutate])

  const handlePay = () => {
    if (!booking) return
    const redirectUrl = window.location.origin + "/payment?ref=" + bookingRef

    // Server derives the charge from the booking record — no client-side math
    if (method === "flutterwave") {
      initializeFlutterwave.mutate({
        bookingRef, propertyId: booking.propertyId,
        currency: "UGX", email, name, phone: phone || undefined, redirectUrl,
      })
    } else {
      initializeStripe.mutate({
        bookingRef, propertyName: "Kitufu Booking " + bookingRef,
        customerEmail: email, successUrl: redirectUrl, cancelUrl: redirectUrl + "&cancelled=1",
      })
    }
  }

  const isPending = initializeFlutterwave.isPending || initializeStripe.isPending
  const totalAmount = booking?.totalPrice || 0
  const hasPaymentCallback = Boolean((status && txId) || sessionId)
  const paymentInitError = method === "flutterwave"
    ? initializeFlutterwave.error
    : initializeStripe.error

  // Success state
  if (paymentStatus === "success" || booking?.status === "confirmed") {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-midnight rounded-2xl p-10 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Confirmed!</h1>
          <p className="text-gray-400 mb-2">Booking <strong className="text-savanna-gold">{bookingRef}</strong> is confirmed.</p>
          <p className="text-gray-500 text-sm mb-6">Save your booking reference for your records.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/dashboard")} className="bg-sunset hover:bg-sunset/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">My Bookings</button>
            <button onClick={() => navigate("/")} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">Home</button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Failed state
  if (paymentStatus === "failed") {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-midnight rounded-2xl p-10 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
          <p className="text-gray-400 mb-6">{paymentError || "We could not confirm your payment. Please try again or use a different method."}</p>
          <div className="flex flex-col gap-3 justify-center sm:flex-row">
            <button
              onClick={() => {
                setPaymentError("")
                setPaymentStatus("pending")
                if (hasPaymentCallback) {
                  verificationStarted.current = ""
                  setVerificationRetry((attempt) => attempt + 1)
                }
              }}
              className="bg-sunset hover:bg-sunset/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              {hasPaymentCallback ? "Check payment again" : "Try Again"}
            </button>
            {hasPaymentCallback && (
              <button
                onClick={() => navigate(`/payment?ref=${encodeURIComponent(bookingRef)}`)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Return to payment options
              </button>
            )}
          </div>
        </motion.div>
      </div>
    )
  }

  if (isBookingLoading || (!booking && !bookingError && bookingRef)) {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center">
        <Loader className="w-10 h-10 text-sunset animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-midnight rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Booking unavailable</h1>
          <p role="alert" className="text-gray-400 mb-6">
            {!bookingRef ? "This payment link is missing a booking reference." : bookingError?.message || "We couldn't load this booking."}
          </p>
          <Link
            to={`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`}
            className="text-savanna-gold underline underline-offset-4"
          >
            Sign in
          </Link>
          <span className="text-gray-500 mx-3">or</span>
          <Link to="/listings" className="text-savanna-gold underline underline-offset-4">Browse stays</Link>
        </div>
      </div>
    )
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return (
      <div className="min-h-screen bg-deep-forest pt-24 pb-16 flex items-center justify-center px-4">
        <div className="bg-midnight rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Booking not payable</h1>
          <p role="status" className="text-gray-400 mb-6">
            This booking is {booking.status}. It can&apos;t accept a payment.
          </p>
          <button onClick={() => navigate("/dashboard")} className="bg-sunset hover:bg-sunset/90 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
            View my bookings
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-forest pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-midnight rounded-2xl p-8">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm mb-4 flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> Back</button>
          <h1 className="text-2xl font-bold text-white mb-1">Complete Your Booking</h1>
          <p className="text-gray-400 text-sm mb-6">Ref: <span className="text-savanna-gold font-mono">{bookingRef}</span></p>
          {cancelled && <p role="status" className="text-amber-300 text-sm mb-4">Checkout was cancelled. Your booking is still pending; you can choose a payment method to try again.</p>}

          {/* Price summary */}
          <div className="bg-deep-forest rounded-xl p-5 mb-6">
            <div className="flex justify-between mb-2"><span className="text-gray-400">Booking total (incl. service fee & 18% VAT)</span><span className="text-white">USh {booking.totalPrice?.toLocaleString()}</span></div>
            <div className="border-t border-gray-700 pt-2 flex justify-between"><span className="text-white font-semibold">Total due</span><span className="text-savanna-gold font-bold text-lg">USh {totalAmount.toLocaleString()}</span></div>
          </div>

          {/* Payment method selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">Choose Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setMethod("flutterwave")} className={(method === "flutterwave" ? "border-sunset bg-sunset/10" : "border-gray-700 bg-deep-forest") + " border rounded-xl p-4 text-center transition-colors"}>
                <Smartphone className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Mobile Money</p>
                <p className="text-gray-500 text-xs mt-1">MTN, Airtel</p>
              </button>
              <button onClick={() => setMethod("stripe")} className={(method === "stripe" ? "border-sunset bg-sunset/10" : "border-gray-700 bg-deep-forest") + " border rounded-xl p-4 text-center transition-colors"}>
                <Globe className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-white text-sm font-medium">Card</p>
                <p className="text-gray-500 text-xs mt-1">Visa, Mastercard</p>
              </button>
            </div>
          </div>

          {/* Customer form */}
          <div className="space-y-4 mb-6">
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Full Name *</label><input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="John Doe" /></div>
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Email *</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="john@example.com" /></div>
            {method === "flutterwave" && (
              <div><label className="block text-sm font-medium text-gray-300 mb-1">Phone (for Mobile Money)</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-deep-forest border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-sunset focus:outline-none" placeholder="+256 772 123 456" /></div>
            )}
          </div>

          <button onClick={handlePay} disabled={isPending || !name || !email}
            className="w-full bg-sunset hover:bg-sunset/90 text-white font-semibold py-3.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {isPending ? <><Loader className="w-5 h-5 animate-spin" /> Processing...</> : <>
              {method === "flutterwave" ? <Smartphone className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
              Pay USh {totalAmount.toLocaleString()}
            </>}
          </button>

          {paymentInitError && (
            <p role="alert" className="text-red-400 text-sm text-center mt-3">
              {paymentInitError.message}
            </p>
          )}

          <p className="text-gray-600 text-xs text-center mt-4">
            {method === "flutterwave" ? "Secured by Flutterwave." : "Secured by Stripe."} Your payment is encrypted.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
