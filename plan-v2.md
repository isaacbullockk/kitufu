# Pamoja Residences v2 — Tourist Attractions Feature Plan

## New Features
1. **Explore Uganda page** (`/explore`) — Dedicated page showcasing 15+ tourist attractions across Uganda with filtering by category (Wildlife, Adventure, Culture, Nature), location (Kampala area, Hoima area, Western Uganda, Eastern Uganda), and proximity to stadiums
2. **"Nearby Attractions" section** on Property Detail pages — Shows 4-6 attractions near each specific residence with distance and travel time
3. **Attraction cards** on the Listings page — Quick preview of top attractions near each property
4. **Attraction detail modal/card** — When clicked, shows description, best time to visit, how to get there, photos, and tips
5. **Navbar update** — Add "Explore" link to main navigation

## Categories
- Wildlife Safaris (Murchison Falls, Queen Elizabeth NP, Bwindi Gorillas)
- Adventure (White-water rafting, Sipi Falls hiking, Rwenzori trekking)
- Culture & History (Kasubi Tombs, Uganda Museum, Ndere Centre, Bahai Temple)
- Nature & Scenery (Lake Victoria, Botanical Gardens, Crater Lakes)
- City Life (Kampala markets, nightlife, restaurants)

## Implementation
- Create `src/pages/Explore.tsx` — main attractions page
- Update `src/pages/PropertyDetail.tsx` — add Nearby Attractions section
- Update `src/pages/Listings.tsx` — add attraction preview on cards
- Update `src/components/Navbar.tsx` — add Explore link
- Generate attraction images (15 images)
- Commit, build, deploy
