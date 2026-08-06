import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { CurrencyProvider } from '@/context/CurrencyContext'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <TRPCProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </TRPCProvider>
  </BrowserRouter>,
)
