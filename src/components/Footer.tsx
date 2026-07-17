import { Link } from 'react-router'
import { MapPin, Mail, Phone } from 'lucide-react'
import { useSiteConfig } from '../hooks/useSiteConfig'

export default function Footer() {
  const c = useSiteConfig();

  return (
    <footer className="bg-midnight border-t border-gray-800 pt-12 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-2">{c.brandName}</h3>
            <p className="text-gray-400 text-sm mb-4">{c.brandTagline}</p>
            <div className="flex gap-4 text-sm">
              {c.supportEmail && (
                <a href={"mailto:" + c.supportEmail} className="text-gray-400 hover:text-sunset transition-colors flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {c.supportEmail}
                </a>
              )}
              {c.supportPhone && (
                <a href={"tel:" + c.supportPhone} className="text-gray-400 hover:text-sunset transition-colors flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {c.supportPhone}
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Platform</h4>
            <div className="space-y-2 text-sm">
              <Link to="/listings" className="block text-gray-400 hover:text-sunset transition-colors">Browse Residences</Link>
              <Link to="/add-property" className="block text-gray-400 hover:text-sunset transition-colors">List Your Property</Link>
              <Link to="/host" className="block text-gray-400 hover:text-sunset transition-colors">Host Dashboard</Link>
              <Link to="/admin/settings" className="block text-gray-400 hover:text-sunset transition-colors">Site Settings</Link>
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Support</h4>
            <div className="space-y-2 text-sm">
              <Link to="/afcon-2027" className="block text-gray-400 hover:text-sunset transition-colors">About {c.eventName}</Link>
              <Link to="/explore" className="block text-gray-400 hover:text-sunset transition-colors">Explore {c.countryName}</Link>
              <Link to="/group-booking" className="block text-gray-400 hover:text-sunset transition-colors">Group Booking</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm"> {c.eventYear} {c.brandName}. All rights reserved.</p>
          <div className="flex gap-4">
            {c.facebookUrl && <a href={c.facebookUrl} target="_blank" rel="noopener" className="text-gray-500 hover:text-sunset text-sm">Facebook</a>}
            {c.twitterUrl && <a href={c.twitterUrl} target="_blank" rel="noopener" className="text-gray-500 hover:text-sunset text-sm">Twitter</a>}
            {c.instagramUrl && <a href={c.instagramUrl} target="_blank" rel="noopener" className="text-gray-500 hover:text-sunset text-sm">Instagram</a>}
          </div>
        </div>
      </div>
    </footer>
  )
}
