import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { ACTIVE_MARKETS, type CountryConfig, getCountry, UGANDA } from '@/config/countries';

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
    const savedMarket = ACTIVE_MARKETS.find((market) => market.id === saved);
    if (savedMarket) return savedMarket;
    if (saved) localStorage.removeItem('kitufu-country');

    // 2. Check URL subdomain or path
    const host = window.location.host;
    if (host.endsWith('.ke') || host.includes('kenya')) return getCountry('kenya');
    if (host.endsWith('.tz') || host.includes('tanzania')) return getCountry('tanzania');

    // 3. Default
    return UGANDA;
  };

  const [country, setCountryState] = useState<CountryConfig>(detectCountry);
  const [isLoading] = useState(false);

  const setCountry = useCallback((id: string) => {
    const config = ACTIVE_MARKETS.find((market) => market.id === id);
    if (!config) throw new Error(`Unsupported Kitufu market: ${id}`);
    setCountryState(config);
    localStorage.setItem('kitufu-country', id);
    // Update document title
    document.title = `${config.branding.name} | ${config.event.name}`;
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
