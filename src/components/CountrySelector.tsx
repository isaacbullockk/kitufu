import { useState } from 'react';
import { useCountry } from '@/context/CountryContext';
import { COUNTRY_LIST } from '@/config/countries';
import { Globe, ChevronDown, Check } from 'lucide-react';

export default function CountrySelector() {
  const { country, setCountry } = useCountry();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Select country"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{country.name}</span>
        <img
          src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
          alt={country.name}
          className="w-5 h-3.5 object-cover rounded-sm"
        />
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl
            border border-gray-100 overflow-hidden z-50 py-2">
            <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Select Country
            </p>
            {COUNTRY_LIST.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCountry(c.id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:bg-warm-sand transition-colors
                  ${country.id === c.id ? 'bg-warm-sand' : ''}`}
              >
                <img
                  src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                  alt={c.name}
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-deep-forest">{c.name}</p>
                  <p className="text-xs text-slate truncate">{c.event.name}</p>
                </div>
                {country.id === c.id && (
                  <Check className="w-4 h-4 text-deep-forest flex-shrink-0" />
                )}
              </button>
            ))}

            <div className="border-t border-gray-100 mt-2 pt-2 px-4 py-2">
              <p className="text-xs text-slate-500">
                Hosting a tournament? <a href="mailto:partners@kitufu.com" className="text-african-sunset hover:underline">Contact us</a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
