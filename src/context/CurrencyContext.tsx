import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type CurrencyCode = 'UGX' | 'USD' | 'EUR' | 'GBP' | 'KES' | 'NGN'

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  UGX: 1,
  USD: 0.00027,
  EUR: 0.00025,
  GBP: 0.00021,
  KES: 0.036,
  NGN: 0.42,
}

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  UGX: 'USh',
  USD: '$',
  EUR: '€',
  GBP: '£',
  KES: 'KSh',
  NGN: '₦',
}

export const CURRENCIES: CurrencyCode[] = ['UGX', 'USD', 'EUR', 'GBP', 'KES', 'NGN']

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  formatPrice: (ugxAmount: number) => string
  toUgx: (amount: number, fromCurrency: CurrencyCode) => number
}

const CurrencyContext = createContext<CurrencyContextType | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('kitufu-currency')
    if (saved && (saved in EXCHANGE_RATES)) {
      return saved as CurrencyCode
    }
    return 'UGX'
  })

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c)
    localStorage.setItem('kitufu-currency', c)
  }, [])

  const toUgx = useCallback((amount: number, fromCurrency: CurrencyCode): number => {
    if (fromCurrency === 'UGX') return amount
    const rate = EXCHANGE_RATES[fromCurrency]
    return Math.round(amount / rate)
  }, [])

  const formatPrice = useCallback(
    (ugxAmount: number): string => {
      const rate = EXCHANGE_RATES[currency]
      const symbol = CURRENCY_SYMBOLS[currency]
      const converted = ugxAmount * rate

      if (currency === 'UGX') {
        return `${symbol} ${converted.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`
      }
      if (currency === 'USD' || currency === 'EUR' || currency === 'GBP') {
        return `${symbol}${converted.toFixed(2)}`
      }
      // KES, NGN
      return `${symbol} ${converted.toLocaleString('en-UG', { maximumFractionDigits: 0 })}`
    },
    [currency]
  )

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, toUgx }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency(): CurrencyContextType {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return ctx
}
