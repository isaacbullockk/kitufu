# Kitufu Phase 2 — Full Feature Integration Plan

## Goal: Wire all remaining frontend pages to real backend APIs + add payments + host onboarding

## Stage 1: Create branches
- `booking-flow` — Wire booking wizard to trpc.booking.create
- `dashboards-wire` — Wire user + host dashboards to APIs
- `payments` — Add Flutterwave payment integration
- `host-onboard` — Build property submission form

## Stage 2: Parallel Development (4 agents)

### Agent 1: Booking Flow Wire
- Wire Booking.tsx to trpc.booking.create
- Add booking validation, error handling, success state
- Store booking in DB, show confirmation with bookingRef

### Agent 2: Dashboards Wire
- Wire Dashboard.tsx to trpc.booking.listByUser
- Wire Host.tsx to trpc.host.* and trpc.property.*
- Add admin page with trpc.admin.*
- Real data: upcoming stays, past bookings, receipts

### Agent 3: Payment Integration
- Add Flutterwave payment gateway
- MTN Mobile Money / Airtel Money support
- Payment confirmation webhook
- Update booking status on payment

### Agent 4: Host Onboarding
- Build /host/register page
- Property submission form with image upload
- UTB certification upload
- Host approval workflow

## Stage 3: Merge, Build, Deploy
- Octopus merge all 4 branches
- Build
- Deploy
