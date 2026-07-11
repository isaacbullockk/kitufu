import { Link } from 'react-router'
import { MapPin, Phone, Mail, Shield, Check } from 'lucide-react'

const quickLinks = [
  { label: 'Browse Listings', href: '/listings' },
  { label: 'Group Booking', href: '/group-booking' },
  { label: 'AFCON 2027 Info', href: '/afcon-2027' },
  { label: 'Become a Host', href: '/host' },
]

const supportLinks = [
  { label: 'Help Center', href: '#' },
  { label: 'Contact Us', href: '#' },
  { label: 'UTB Certification', href: '#' },
  { label: 'Safety Standards', href: '#' },
]

export default function Footer() {
  return (
    <footer className="bg-deep-forest text-white relative overflow-hidden">
      {/* Lubugo pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'url(/lubugo-pattern.svg)', backgroundRepeat: 'repeat', backgroundSize: '400px 400px' }}
      />

      <div className="container-kitufu relative z-10 pt-16 pb-8">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Column */}
          <div>
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="font-display font-bold text-xl text-white">
                Kitufu Residences
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-savanna-gold">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 6c-2 3-4 4.5-4 7a4 4 0 008 0c0-2.5-2-4-4-7z" fill="currentColor" />
              </svg>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Pop-up fan residences for AFCON 2027 in Uganda. Secure, affordable, and minutes from the stadium.
            </p>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-teal-depth shrink-0" />
                <span>Kampala & Hoima, Uganda</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-teal-depth shrink-0" />
                <span>+256 700 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-teal-depth shrink-0" />
                <span>hello@kitufu.ug</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-sunset transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4">Support</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/70 hover:text-sunset transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-semibold text-base mb-4">Get AFCON 2027 Updates</h4>
            <p className="text-sm text-white/60 mb-4">
              Stay updated on new residences, early bird deals, and tournament news.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-sunset transition-colors"
              />
              <button className="bg-sunset hover:bg-[#E55A2B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 py-6 border-t border-white/10 mb-6">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Shield size={14} className="text-teal-depth" />
            <span>UTB Certified</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Check size={14} className="text-teal-depth" />
            <span>CAF Partner</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Shield size={14} className="text-teal-depth" />
            <span>SSL Secure</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Check size={14} className="text-teal-depth" />
            <span>Money-Back Guarantee</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10">
          <p className="text-xs text-white/50">
            &copy; 2027 Kitufu Residences. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-white/50">
            <Link to="#" className="hover:text-white/80 transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white/80 transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white/80 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
