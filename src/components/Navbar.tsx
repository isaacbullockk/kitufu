import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { Menu, X, UtensilsCrossed, Music } from 'lucide-react'

const navLinks = [
  { label: 'Listings', href: '/listings' },
  { label: 'Explore', href: '/explore' },
  { label: 'Dining', href: '/dining', icon: UtensilsCrossed },
  { label: 'Nightlife', href: '/nightlife', icon: Music },
  { label: 'Group Booking', href: '/group-booking' },
  { label: 'AFCON 2027', href: '/afcon-2027' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 w-full h-16 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md border-b border-light-grey shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="container-kitufu h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span
            className={`font-display font-bold text-xl transition-colors duration-300 ${
              scrolled ? 'text-deep-forest' : 'text-white'
            }`}
          >
            Kitufu Residences
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-colors duration-300 ${scrolled ? 'text-sunset' : 'text-savanna-gold'}`}
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 6c-2 3-4 4.5-4 7a4 4 0 008 0c0-2.5-2-4-4-7z"
              fill="currentColor"
            />
            <line x1="12" y1="2" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="20" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`font-body font-medium text-sm transition-colors duration-200 relative group flex items-center gap-1.5 ${
                scrolled
                  ? 'text-slate hover:text-deep-forest'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              {link.icon && <link.icon size={14} />}
              {link.label}
              <span
                className={`absolute -bottom-1 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-200 ${
                  scrolled ? 'bg-sunset' : 'bg-white'
                }`}
              />
            </Link>
          ))}
        </div>

        {/* Desktop CTA + Dashboard */}
        <div className="hidden lg:flex items-center gap-4 ml-4">
          <Link
            to="/dashboard"
            className={`font-body font-medium text-sm transition-colors duration-200 ${
              scrolled ? 'text-slate hover:text-deep-forest' : 'text-white/90 hover:text-white'
            }`}
          >
            My Dashboard
          </Link>
          <Link
            to="/admin"
            className={`font-body font-medium text-sm transition-colors duration-200 ${
              scrolled ? 'text-slate hover:text-deep-forest' : 'text-white/90 hover:text-white'
            }`}
          >
            Admin
          </Link>
          <Link
            to="/host"
            className={`font-body font-semibold text-sm px-5 py-2.5 rounded-lg border-2 transition-all duration-200 ${
              scrolled
                ? 'border-sunset text-sunset hover:bg-sunset hover:text-white'
                : 'border-white/60 text-white hover:bg-white hover:text-deep-forest'
            }`}
          >
            List Your Building
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 transition-colors ${
            scrolled ? 'text-deep-forest' : 'text-white'
          }`}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white z-40">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-body font-medium text-base text-deep-forest py-3 border-b border-light-grey flex items-center gap-2"
              >
                {link.icon && <link.icon size={18} className="text-sunset" />}
                {link.label}
              </Link>
            ))}
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="font-body font-medium text-base text-deep-forest py-3 border-b border-light-grey"
            >
              My Dashboard
            </Link>
            <Link
              to="/host"
              onClick={() => setMobileOpen(false)}
              className="mt-4 btn-secondary text-center"
            >
              List Your Building
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
