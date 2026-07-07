# Kitufu Residences AFCON 2027 Booking Platform - QA Audit Report

**Audit Date:** 2025  
**Auditor:** Senior QA Engineer  
**Build Status:** PASS (Builds successfully, zero TypeScript errors)  
**Total Files Audited:** 18 files across 7 task areas

---

## Executive Summary

The Kitufu Residences platform is well-architected with clean component separation, proper use of React 19 hooks, Framer Motion animations, and shadcn/ui components. **No CRITICAL-severity bugs were found.** The build compiles cleanly with zero TypeScript errors.

**Issues Found by Severity:**
| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 6 |
| LOW | 7 |

---

## TASK 1: Home Page Feature Audit

### Verifications
1. **Hero search bar with location dropdown** - PASS. SearchBar component has working dropdown for Kampala/Hoima/All Uganda. Click-outside handler properly implemented via mousedown listener. Navigate to /listings on search.
2. **Countdown timer calculates correctly** - PASS. Target date is `2027-06-15T00:00:00`. Correctly calculates days/hours/minutes/seconds with `Math.max(0, diff)` to prevent negative values. Updates every 1000ms.
3. **Featured property cards have correct mock data** - PASS. 3 properties with complete data: badges, prices ($22-$65/night), ratings, amenities, images.
4. **How It Works section has 4 steps with icons** - PASS. Search, Calendar, Bus, Trophy icons. Animated connecting line on desktop.
5. **Testimonials carousel has navigation controls** - PASS. Prev/Next buttons, dot indicators, auto-scroll (5s interval), keyboard-like navigation via `goTo`/`goPrev`/`goNext`. Responsive: shows 1 card on mobile, 3 on desktop.
6. **All CTAs link to valid routes** - PASS. /listings, /group-booking, /nightlife all exist in App.tsx routing.

### Issues Found: NONE

---

## TASK 2: Listings Page Feature Audit

### Verifications
1. **Filter chips work** - PASS. Kitufu Residences Only, Shuttle Included, Group Friendly all toggle correctly with useState.
2. **Search bar filters properties** - PASS. Location toggle between Kampala/Hoima filters correctly.
3. **Sort dropdown works** - PASS. Opens/closes correctly with AnimatePresence.
4. **List/Map view toggle functions** - PASS. Animated transition between list and map views.
5. **Property cards show all required info** - PASS. Price, rating, amenities, badges, urgency text, viewing counts.
6. **Pagination works** - PASS. Correct page calculation with ellipsis for gaps.
7. **"Only X rooms left" urgency indicators** - PASS. Animated pulse on urgency text.

### Issues Found

#### Issue LIST-1 (MEDIUM)
- **File:** `src/pages/Listings.tsx`
- **Line:** 382-387
- **Issue:** Sort option "Distance to Stadium" exists in dropdown but has NO implementation in the sort switch statement. Falls through to `default: break` and does nothing.
- **Fix:** Add a distance sort case:
```tsx
case 'Distance to Stadium': result.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); break
```
*(Note: `distance` field would need to be numeric or parsed from string like '2.1km')*

#### Issue LIST-2 (MEDIUM)
- **File:** `src/pages/Listings.tsx`
- **Line:** 519-524
- **Issue:** The amenities checkboxes in the expandable Filter Panel (AC, WiFi, Security, Shuttle) are NOT wired to any state. They render as static `<input type="checkbox">` elements with no `checked` or `onChange` handlers.
- **Fix:** Wire them to the existing `activeAmenities` state or create dedicated filter state:
```tsx
// Connect to existing filter state
<input 
  type="checkbox" 
  checked={activeAmenities.includes('AC')}
  onChange={() => toggleAmenity('AC')}
  className="accent-sunset w-4 h-4" 
/>
```

#### Issue LIST-3 (MEDIUM)
- **File:** `src/pages/Listings.tsx`
- **Line:** 532-538
- **Issue:** The "Minimum Beds" filter buttons (1, 2, 3, 4) are not wired to any state. Purely decorative.
- **Fix:** Add a `minBeds` state and filter logic:
```tsx
const [minBeds, setMinBeds] = useState(1)
// In filtered useMemo:
// result = result.filter(p => p.beds >= minBeds)
```

#### Issue LIST-4 (LOW)
- **File:** `src/pages/Listings.tsx`
- **Line:** 373-375
- **Issue:** The city filter contains dead code: `searchCity === 'All Uganda'` will never be true because `searchCity` is initialized to `'Kampala'` and the toggle only offers Kampala/Hoima options. The `All Uganda` option from Hero.tsx doesn't exist on this page.
- **Fix:** Remove the dead condition or add an "All Uganda" option to the city toggle.

---

## TASK 3: Property Detail Feature Audit

### Verifications
1. **Image gallery displays correctly** - PARTIAL. Desktop grid layout works. Mobile carousel uses embla-carousel.
2. **Nearby restaurants section shows 4 cards** - PASS. 4 restaurant cards with cuisine badges, ratings, distances.
3. **Nearby attractions section shows 4 cards** - PASS. 4 attraction cards with category badges, descriptions, distances.
4. **Sticky booking panel is present** - PASS. `sticky top-[120px]` with price breakdown, shuttle toggle, Reserve CTA.
5. **Amenity icons display correctly** - PASS. 12 amenities with correct Lucide icon mapping.
6. **Reviews section renders** - PASS. Rating breakdown with animated bars, 3 review cards.

### Issues Found

#### Issue PD-1 (HIGH)
- **File:** `src/pages/PropertyDetail.tsx`
- **Line:** 181
- **Issue:** The embla carousel `onSelect` is incorrectly attached as a DOM event (`onSelect={onSelect}`) on the div element. Embla carousel's `select` event must be registered via the API (`emblaApi.on('select', callback)`). As a result, the slide indicator dots on mobile will NOT update when the user swipes.
- **Fix:** Replace the div's `onSelect` with a useEffect that registers the callback via embla's API:
```tsx
useEffect(() => {
  if (!emblaApi) return
  emblaApi.on('select', onSelect)
  emblaApi.on('reInit', onSelect)
  return () => {
    emblaApi.off('select', onSelect)
    emblaApi.off('reInit', onSelect)
  }
}, [emblaApi, onSelect])
```

#### Issue PD-2 (MEDIUM)
- **File:** `src/pages/PropertyDetail.tsx`
- **Line:** 926
- **Issue:** The `id` URL parameter is immediately voided (`void id`), meaning ALL property URLs (`/property/1`, `/property/2`, `/property/abc`) display the same mock data for "Kampala Central Hub". The page is not actually parameterized.
- **Fix:** In a real implementation, fetch property data based on `id`. For mock purposes, use a lookup:
```tsx
const property = PROPERTIES.find(p => p.id.toString() === id) || PROPERTIES[0]
```

#### Issue PD-3 (LOW)
- **File:** `src/pages/PropertyDetail.tsx`
- **Line:** 167-170
- **Issue:** The "Show All Photos" overlay always opens the lightbox at index 0 (`onOpenLightbox(0)`) instead of showing all photos. The 5th grid cell shows a duplicate of `images[4] || images[0]` but clicking it always starts at photo 1.
- **Fix:** Change to `onOpenLightbox(4)` to start at the 5th photo, or implement a gallery view.

---

## TASK 4: Booking Flow Feature Audit

### Verifications
1. **4-step wizard has correct progression** - PASS. Dates (1) → Guests (2) → Add-ons (3) → Review (4) → Confirmation (5). Progress indicator with animated connecting line.
2. **Date selection calendar works** - PASS. Two-month view, month navigation, range selection, quick date chips. Past dates are disabled.
3. **Guest steppers function** - PASS. Adults (1-10), Children (0-6) with proper disabled states at min/max.
4. **Room type cards are selectable** - PASS. 3 room types with visual selection feedback (border color change, check icon).
5. **Shuttle toggle adds to total price** - PASS. $8/person/day correctly calculated in `usePriceSummary`.
6. **Season Pass card calculates savings** - PASS. Shows $1,350 → $1,080 (20% savings = $270).
7. **Price summary updates in real-time** - PASS. `BookingSummarySidebar` uses `usePriceSummary` hook with `useMemo`. Animated total with `motion.span` key animation.
8. **Confirmation screen shows booking reference** - PASS. Displays "PAM-2027-78432" with animated checkmark, next steps, and CTA to dashboard.

### Issues Found

#### Issue BK-1 (MEDIUM)
- **File:** `src/pages/Booking.tsx`
- **Line:** 978-1010
- **Issue:** The booking confirmation screen hardcodes ALL values: dates show "Jun 15 — Jul 2, 2027", guests show "2 Adults", total shows "$434" regardless of what the user actually selected in the wizard. The confirmation does not reflect the actual booking state.
- **Fix:** Use the actual booking state to display confirmation details:
```tsx
const prices = usePriceSummary(state)
// Display actual selected dates, guests, room type, and calculated total
```

#### Issue BK-2 (LOW)
- **File:** `src/pages/Booking.tsx`
- **Line:** 631
- **Issue:** The `dangerouslySetInnerHTML` is used for rendering season pass benefits. While the content is hardcoded and safe, this is unnecessary and could introduce XSS if the content source changes in the future.
- **Fix:** Replace with standard JSX rendering:
```tsx
<span>Same room for all 30 nights</span>
// etc.
```

---

## TASK 5: Group Booking Feature Audit

### Verifications
1. **3 pricing tiers display correctly** - PASS. Fan Squad ($25/person/night), Supporters' Club ($20 - featured), Mega Delegation ($15). Each with correct feature lists and savings percentages.
2. **"Buy Out Building" cards show building details** - PASS. 4 buildings with capacity badges, location, specs, shuttle info, pricing.
3. **Enquiry form has all required fields** - PASS. 13+ fields including required (*), selects, dates, textarea, checkboxes. Form state managed with useState.
4. **FAQ accordion works** - PASS. Expand/collapse with AnimatePresence, rotating chevron icon. 8 FAQ items.

### Issues Found

#### Issue GB-1 (MEDIUM)
- **File:** `src/pages/GroupBooking.tsx`
- **Line:** 522
- **Issue:** The enquiry form's `onSubmit` handler only calls `e.preventDefault()` with no actual submission logic. No API call, no success/confirmation state, no form validation. Users clicking "Submit Group Enquiry" receive no feedback.
- **Fix:** Add submission logic with at minimum a success state:
```tsx
const [submitted, setSubmitted] = useState(false)
// In onSubmit:
if (validateForm(formData)) {
  setSubmitted(true)
  // API call here
}
```

#### Issue GB-2 (LOW)
- **File:** `src/pages/GroupBooking.tsx`
- **Line:** 395-399
- **Issue:** The "Watch Video" button in the hero section is decorative - clicking it does nothing. No video modal or player is implemented.
- **Fix:** Add a video modal or remove the button until video content is available.

---

## TASK 6: Dashboard & Host Feature Audit

### Verifications
1. **Tabs switch correctly** - PASS (both pages). Dashboard: Upcoming/Past/Receipts/Shuttle/Profile. Host: Properties/Bookings/Earnings/Compliance/Profile. All use shadcn Tabs with badge counts.
2. **Booking cards display property info, dates, status** - PASS. Complete info with image, property name, location, dates, nights, guests, room type, status badge, booking reference.
3. **Shuttle schedule shows QR codes** - PASS. QRPlaceholder component present.
4. **Host compliance checklist shows Four S's** - PASS. Security, Sanitation, Safety, Service with accordion expand/collapse. Progress bar calculates percentage correctly.
5. **Earnings charts render** - PASS. Bar chart (monthly earnings) and SVG line chart (occupancy trend) both render with animations.

### Issues Found

#### Issue DB-1 (MEDIUM)
- **File:** `src/pages/Dashboard.tsx`
- **Line:** 170-183
- **Issue:** The `QRPlaceholder` component uses `Math.random()` inside the render function to generate the QR pattern. This causes the QR code to **randomly change on every render** (e.g., when parent state updates), creating a flickering effect.
- **Fix:** Use `useMemo` to stabilize the pattern:
```tsx
function QRPlaceholder() {
  const pattern = useMemo(() => 
    Array.from({ length: 25 }).map(() => Math.random() > 0.5),
    []
  )
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-20 h-20 bg-white border-2 border-dashed border-[#E2E8F0] rounded-lg flex items-center justify-center">
        <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-14 h-14">
          {pattern.map((filled, i) => (
            <div key={i} className={`${filled ? 'bg-deep-forest' : 'bg-white'} rounded-[1px]`} />
          ))}
        </div>
      </div>
      <span className="text-[10px] text-slate">Show at boarding</span>
    </div>
  )
}
```

#### Issue DB-2 (LOW)
- **File:** `src/pages/Dashboard.tsx`
- **Line:** 881-905
- **Issue:** The `AnimatePresence` wrapping the TabsContent doesn't fully coordinate with shadcn Tabs switching. The exit animation may cause brief visual glitches during rapid tab switching.
- **Fix:** Remove AnimatePresence or use controlled motion.div outside TabsContent:
```tsx
// Simpler approach - remove AnimatePresence wrapper
<TabsContent value="upcoming"><UpcomingStays /></TabsContent>
// etc.
```

#### Issue HOST-1 (LOW)
- **File:** `src/pages/Host.tsx`
- **Line:** Multiple
- **Issue:** All action buttons (View Details, Edit Listing, Pause Bookings, Download Receipt, Contact Support, etc.) are non-functional. They render as `<button>` elements with no onClick handlers. This is expected for a mock/prototype but noted for completeness.
- **Fix:** Add route navigation or modal triggers for each action.

---

## TASK 7: Explore, Dining, Nightlife Feature Audit

### Verifications
1. **Category filter chips work** - PASS (all 3 pages). Explore: 6 categories. Dining: 12 cuisine types with multi-select. Nightlife: 8 categories.
2. **Cards display correctly** - PASS. All pages render appropriate cards with gradients as image placeholders, ratings, descriptions, distances.
3. **FAQ accordions function** - PASS. Explore page FAQ uses shadcn Accordion with 6 items.
4. **Event timeline renders** - PASS. Nightlife TimelineSection with vertical line, colored dots, 6 AFCON events with type badges.

### Issues Found

#### Issue EXP-1 (LOW)
- **File:** `src/pages/Nightlife.tsx`
- **Line:** 336, 402, 464, 523
- **Issue:** `VENUE_GRADIENTS[venue.id - 1]` assumes sequential IDs starting from 1. Venue IDs in data start at 4 (clubs), causing `VENUE_GRADIENTS[3]`, `VENUE_GRADIENTS[4]`, etc. This works by coincidence with the current data but will break if IDs change.
- **Fix:** Use a modulo or hash-based lookup that's ID-independent:
```tsx
const gradientIndex = (venue.id - 1) % VENUE_GRADIENTS.length
// or use venue.name.charCodeAt(0) % VENUE_GRADIENTS.length
```

#### Issue EXP-2 (LOW)
- **File:** `src/pages/Explore.tsx`
- **Line:** 887-905
- **Issue:** The "All Attractions" section excludes featured attractions (`filter((a) => !a.featured)`), which means 6 featured items never appear in the "All Attractions" grid. If a user searches for "Murchison Falls" (which is featured), it won't appear in the "All Attractions" filtered results.
- **Fix:** Remove the `!a.featured` filter and show all attractions in the "All Attractions" section, or include featured items in the search/filter logic.

#### Issue EXP-3 (LOW)
- **File:** `src/pages/Dining.tsx`
- **Line:** 547-567
- **Issue:** The cuisine filter shows `allRestaurants.length === 0` empty state when no restaurants match, but the featured/non-featured split could result in both sections being empty individually while the overall message says "No restaurants found" - this is acceptable behavior but could be clearer.
- **Fix:** Minor UX improvement - display the empty state section more prominently when both featured and non-featured are empty.

---

## Routing Verification

All routes in `App.tsx` are properly defined and match CTA links across all pages:

| Route | Component | Status |
|-------|-----------|--------|
| `/` | Home | OK |
| `/listings` | Listings | OK |
| `/property/:id` | PropertyDetail | OK |
| `/booking/:id` | Booking | OK |
| `/group-booking` | GroupBooking | OK |
| `/dashboard` | Dashboard | OK |
| `/host` | Host | OK |
| `/afcon-2027` | AfconInfo | OK |
| `/explore` | Explore | OK |
| `/dining` | Dining | OK |
| `/nightlife` | Nightlife | OK |

---

## Build Status

```
vite v7.3.0 building client environment for production...
...transforming (2185 modules)...
dist/assets/index-DPykb8EH.css  119.13 kB | gzip:  19.67 kB
dist/assets/index-CJc8hSDw.js   920.54 kB | gzip: 245.31 kB
Build completed in 12.11s - SUCCESS
```

- Zero TypeScript compilation errors
- Zero Vite build errors
- Chunk size warning for JS bundle (>500KB) - recommend code splitting for production

---

## Recommendations

### High Priority
1. **Fix the embla carousel `onSelect` event** (PD-1) - Mobile image gallery dots won't update on swipe
2. **Wire the booking confirmation to actual state** (BK-1) - Confirmation shows wrong data

### Medium Priority
3. **Implement the "Distance to Stadium" sort** (LIST-1) or remove from dropdown
4. **Wire filter panel checkboxes** (LIST-2) and minimum beds buttons (LIST-3)
5. **Add form submission handling** (GB-1) with success/error states
6. **Stabilize QR code pattern** (DB-1) with useMemo
7. **Parameterize property detail** (PD-2) for different property IDs

### Low Priority
8. Remove dead code in city filter (LIST-4)
9. Make "Show All Photos" open at correct index (PD-3)
10. Remove `dangerouslySetInnerHTML` (BK-2)
11. Add "Watch Video" modal or hide button (GB-2)
12. Make venue gradient lookup ID-independent (EXP-1)
13. Include featured attractions in search results (EXP-2)
14. Implement functional action buttons on Host dashboard (HOST-1)

---

*End of Report*
