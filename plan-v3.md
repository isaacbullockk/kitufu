# Pamoja Residences v3 — Restaurants & Nightlife Feature Plan

## New Pages
1. **Dining page** (`/dining`) — 15+ restaurants across Kampala, Hoima, Entebbe with filtering by cuisine, price range, location, and proximity to stadiums
2. **Nightlife & Events page** (`/nightlife`) — Bars, clubs, live music venues, AFCON watch parties, cultural events with filtering by type, location, date

## New Components/Integrations
3. **Restaurant cards** on Property Detail pages — Show 4 nearby restaurants per property
4. **Events ticker/section** on Home page — Upcoming AFCON-related events and watch parties
5. **Food & Nightlife section** on Explore page — Teaser cards linking to new pages
6. **Navbar update** — Add "Dining" and "Nightlife" links
7. **App.tsx update** — Add new routes

## Restaurant Categories
- Ugandan/Local Cuisine (Luweero, Rolex stalls, Matoke dishes)
- Pan-African (Ethiopian, Nigerian, Kenyan, Rwandese)
- International (Italian, Indian, Chinese, Continental)
- Street Food & Quick Bites (Rolex, Chapati, Samosas)
- Fine Dining (Special occasion, rooftop)
- Cafes & Bakeries

## Nightlife Categories
- Sports Bars & AFCON Watch Parties
- Nightclubs & Dance Halls
- Live Music Venues (Afrobeat, Reggae, Kadongo Kamu)
- Cultural Shows & Theatres
- Lounges & Rooftop Bars
- Daytime Events (Markets, Festivals, Pop-ups)

## Implementation
- Create `src/pages/Dining.tsx` — main dining page
- Create `src/pages/Nightlife.tsx` — main nightlife page
- Update `src/pages/Home.tsx` — add events section
- Update `src/pages/PropertyDetail.tsx` — add nearby restaurants
- Update `src/pages/Explore.tsx` — add food & nightlife teaser
- Update `src/components/Navbar.tsx` — add Dining and Nightlife links
- Update `src/App.tsx` — add routes
