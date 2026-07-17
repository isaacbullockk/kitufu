import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Listings from './pages/Listings'
import PropertyDetail from './pages/PropertyDetail'
import Booking from './pages/Booking'
import GroupBooking from './pages/GroupBooking'
import Dashboard from './pages/Dashboard'
import Host from './pages/Host'
import AfconInfo from './pages/AfconInfo'
import Explore from './pages/Explore'
import Dining from './pages/Dining'
import Nightlife from './pages/Nightlife'
import AddProperty from './pages/AddProperty'
import AdminDashboard from './pages/AdminDashboard'
import AdminSettings from './pages/AdminSettings'
import PaymentPage from './pages/PaymentPage'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/booking/:id" element={<Booking />} />
        <Route path="/group-booking" element={<GroupBooking />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/host" element={<Host />} />
        <Route path="/afcon-2027" element={<AfconInfo />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/nightlife" element={<Nightlife />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
