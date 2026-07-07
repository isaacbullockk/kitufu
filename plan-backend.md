# Kitufu Backend — Real Platform Plan

## Phase 1: Graft Backend (Main Agent)
- Create `backend` branch from master
- Create backend worktree with backend node_modules
- Run init.sh --features auth (tRPC + Drizzle + MySQL + OAuth)
- Merge backend into master

## Phase 2: Database Schema (Backend Agent)
- Properties table (id, title, location, description, pricePerNight, capacity, amenities, images, ownerId, status, createdAt)
- Bookings table (id, propertyId, userId, checkIn, checkOut, guests, totalPrice, status, shuttle, seasonPass, createdAt)
- HostProfiles table (id, userId, companyName, utbNumber, phone, verified)
- PropertyImages table (id, propertyId, url, order)
- Push schema to DB

## Phase 3: tRPC Routers (Parallel Agents)
- **Property Router** — CRUD, list, filter, search, byId
- **Booking Router** — create, listByUser, listByHost, cancel, confirm
- **Host Router** — register, getProfile, listMyProperties, earnings
- **Admin Router** — listAllProperties (approve/reject), listAllBookings, stats

## Phase 4: Frontend Integration (Parallel Agents)
- **Listings Page** — Wire to tRPC property.list with real filters
- **Property Detail** — Wire to tRPC property.byId
- **Booking Flow** — Wire to tRPC booking.create
- **Host Dashboard** — Wire to tRPC host routers
- **Admin Dashboard** — Wire to tRPC admin routers (new page)
- **User Dashboard** — Wire to tRPC booking.listByUser

## Phase 5: Build & Deploy
- Merge all branches
- Build (dynamic type)
- Deploy
