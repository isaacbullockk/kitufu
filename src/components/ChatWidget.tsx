import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Bot,
} from 'lucide-react'

interface Message {
  id: string
  role: 'bot' | 'user'
  text: string
  faqIndex?: number
}

const FAQS = [
  {
    q: 'Pricing & Availability',
    a: 'Prices range from USh 35,000 to USh 200,000 per night. All properties are available for AFCON 2027 (Jan 2027). Use the search bar to filter by price, location, and amenities.',
  },
  {
    q: 'How to Book',
    a: "1. Browse listings and pick a property. 2. Select your dates and number of guests. 3. Click 'Reserve' and choose your payment method (Mobile Money or Card). 4. Receive instant confirmation via email!",
  },
  {
    q: 'Payment Methods',
    a: 'We accept MTN Mobile Money, Airtel Money (via Flutterwave), and all major credit/debit cards (via Stripe). All payments are secure and encrypted.',
  },
  {
    q: 'Stadium Shuttle',
    a: "Many properties offer a match-day shuttle to Mandela National Stadium for a small fee (USh 8,000/person). Look for the '🚌 Shuttle' badge on listings!",
  },
  {
    q: 'Group Bookings',
    a: 'For groups of 10+, use our Group Booking form or contact us directly at groups@kitufu.com. We offer discounted rates and custom packages for teams, fan clubs, and corporate groups.',
  },
  {
    q: 'Host Your Property',
    a: "List your building for free! Go to 'List Your Building' in the menu, fill in your property details, upload photos, and set your price. We handle marketing and bookings — you just host!",
  },
  {
    q: 'Cancellation Policy',
    a: 'Free cancellation up to 48 hours before check-in. Cancellations within 48 hours receive a 50% refund. No-shows are non-refundable. Contact support for special circumstances.',
  },
  {
    q: 'Contact Support',
    a: '📧 Email: support@kitufu.com\n📱 WhatsApp: +256 700 123 456\n⏰ Available: 24/7 during AFCON 2027\nWe typically respond within 15 minutes!',
  },
]

const WELCOME_TEXT =
  'Hi there! How can we help you with your AFCON 2027 stay?'

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: generateId(), role: 'bot', text: WELCOME_TEXT },
  ])
  const [input, setInput] = useState('')
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'up' | 'down' | null>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200)
    }
  }, [isOpen])

  const handleFaqClick = (index: number) => {
    const faq = FAQS[index]
    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text: faq.q,
    }
    const botMsg: Message = {
      id: generateId(),
      role: 'bot',
      text: faq.a,
      faqIndex: index,
    }
    setMessages((prev) => [...prev, userMsg, botMsg])
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      text,
    }

    // Simple keyword matching for free-text questions
    const lower = text.toLowerCase()
    let answer =
      "I'm not sure about that. Try one of the quick options above, or contact support@kitufu.com for help!"
    let faqIndex: number | undefined

    for (let i = 0; i < FAQS.length; i++) {
      const keywords = FAQS[i].q.toLowerCase().split(/\s+/)
      if (keywords.some((k) => lower.includes(k))) {
        answer = FAQS[i].a
        faqIndex = i
        break
      }
    }

    const botMsg: Message = {
      id: generateId(),
      role: 'bot',
      text: answer,
      faqIndex,
    }

    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
  }

  const handleFeedback = (messageId: string, type: 'up' | 'down') => {
    setFeedbackMap((prev) => ({ ...prev, [messageId]: type }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <>
      {/* Floating Button - z-40 to stay below mobile nav */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#1a3c27] text-white shadow-lg hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#1a3c27] focus:ring-offset-2"
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel - z-40 to stay below mobile nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-40 flex flex-col rounded-xl border border-light-grey bg-white shadow-2xl"
            style={{ width: 380, maxHeight: 500 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between rounded-t-xl bg-[#1a3c27] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold text-sm">Kitufu Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 340 }}>
              {messages.map((msg) => (
                <div key={msg.id}>
                  <div
                    className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-line ${
                      msg.role === 'bot'
                        ? 'bg-[#1B4332]/10 text-[#1a3c27]'
                        : 'bg-[#1a3c27] text-white'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Feedback */}
                  {msg.role === 'bot' && msg.id !== messages[0].id && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-slate/70">
                        Was this helpful?
                      </span>
                      <button
                        onClick={() => handleFeedback(msg.id, 'up')}
                        className={`rounded-full p-1 transition-colors ${
                          feedbackMap[msg.id] === 'up'
                            ? 'bg-[#1a3c27]/20 text-[#1a3c27]'
                            : 'hover:bg-[#1a3c27]/10 text-slate/60'
                        }`}
                        aria-label="Thumbs up"
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'down')}
                        className={`rounded-full p-1 transition-colors ${
                          feedbackMap[msg.id] === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-red-50 text-slate/60'
                        }`}
                        aria-label="Thumbs down"
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Chips */}
            <div className="border-t border-light-grey/60 px-4 py-2">
              <div className="flex flex-wrap gap-1.5">
                {FAQS.map((faq, i) => (
                  <button
                    key={faq.q}
                    onClick={() => handleFaqClick(i)}
                    className="rounded-full bg-[#1B4332]/15 px-3 py-1 text-xs font-medium text-[#1a3c27] hover:bg-[#1B4332]/30 transition-colors"
                  >
                    {faq.q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-light-grey/60 px-3 py-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="flex-1 rounded-lg border border-light-grey bg-warm-sand px-3 py-2 text-sm text-charcoal placeholder:text-slate/50 focus:outline-none focus:ring-1 focus:ring-[#1a3c27]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a3c27] text-white hover:bg-[#143021] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
