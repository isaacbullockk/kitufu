import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type CountryConfig, getCountry, UGANDA } from '@/config/countries';

interface CountryContextType {
  country: CountryConfig;
  setCountry: (id: string) => void;
  isLoading: boolean;
}

const CountryContext = createContext<CountryContextType>({
  country: UGANDA,
  setCountry: () => {},
  isLoading: false,
});

export function CountryProvider({ children }: { children: ReactNode }) {
  // Detect country from URL or localStorage
  const detectCountry = (): CountryConfig => {
    if (typeof window === 'undefined') return UGANDA;

    // 1. Check localStorage
    const saved = localStorage.getItem('kitufu-country');
    if (saved) return getCountry(saved);

    // 2. Check URL subdomain or path
    const host = window.location.host;
    if (host.includes('.ma') || host.includes('morocco')) return getCountry('morocco');
    if (host.includes('.ci') || host.includes('ivoire') || host.includes('cote')) return getCountry('ivory-coast');

    // 3. Default
    return UGANDA;
  };

  const [country, setCountryState] = useState<CountryConfig>(detectCountry);
  const [isLoading] = useState(false);

  const setCountry = useCallback((id: string) => {
    const config = getCountry(id);
    setCountryState(config);
    localStorage.setItem('kitufu-country', id);
    // Update document title
    document.title = `${config.branding.brandName} Residences | ${config.event.name} ${config.name === 'Uganda' ? '' : config.name}`;
  }, []);

  return (
    <CountryContext.Provider value={{ country, setCountry, isLoading }}>
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) throw new Error('useCountry must be used within CountryProvider');
  return context;
}

export { CountryContext };
