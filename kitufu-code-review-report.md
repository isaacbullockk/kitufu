# Kitufu Residences - AFCON 2027 Booking Platform
## Comprehensive Code Review Report

---

## TASK 1: Code Quality Review

### CRITICAL

#### Issue 1: Memory Leak in Testimonials Auto-Scroll
- **File**: `src/sections/Testimonials.tsx`, line 50
- **Severity**: CRITICAL
- **Issue**: `useEffect` creating an interval has NO dependency array. The interval is recreated on every render, causing multiple overlapping timers and a memory leak.
- **Fix**:
```tsx
// BEFORE
useEffect(() => {
  const timer = setInterval(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, 5000)
  return () => clearInterval(timer)
})

// AFTER
useEffect(() => {
  const timer = setInterval(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, 5000)
  return () => clearInterval(timer)
}, []) // <-- empty dependency array
```

#### Issue 2: Hydration Mismatch from Math.random() in Render
- **File**: `src/pages/Dashboard.tsx`, line 175
- **Severity**: CRITICAL
- **Issue**: `Math.random() > 0.5` is called inside JSX render, causing SSR/CSR hydration mismatches and inconsistent QR code appearance across re-renders.
- **Fix**:
```tsx
// BEFORE
{Array.from({ length: 25 }).map((_, i) => (
  <div key={i} className={`${Math.random() > 0.5 ? 'bg-deep-forest' : 'bg-white'} rounded-[1px]`} />
))}

// AFTER
const QR_PATTERN = useMemo(() => 
  Array.from({ length: 25 }).map(() => Math.random() > 0.5), 
[])
// Then use QR_PATTERN[i] in render
{QR_PATTERN.map((filled, i) => (
  <div key={i} className={`${filled ? 'bg-deep-forest' : 'bg-white'} rounded-[1px]`} />
))}
```

---

### HIGH

#### Issue 3: `any` Type in ScrollReveal Component
- **File**: `src/pages/AfconInfo.tsx`, line 63
- **Severity**: HIGH
- **Issue**: `variants?: any` uses explicit `any`, bypassing TypeScript type checking.
- **Fix**:
```tsx
// BEFORE
variants?: any

// AFTER  
import type { Variants } from 'framer-motion'
variants?: Variants
```

#### Issue 4: Booking Confirmation Uses Old Brand Code "PAM"
- **File**: `src/pages/Booking.tsx`, line 985
- **Severity**: HIGH
- **Issue**: The booking confirmation reference code is `PAM-2027-78432` — "PAM" is a "Pamoja" brand remnant.
- **Fix**:
```tsx
// BEFORE
<span className="font-mono text-h3 text-deep-forest font-bold">PAM-2027-78432</span>

// AFTER
<span className="font-mono text-h3 text-deep-forest font-bold">KIT-2027-78432</span>
```

#### Issue 5: Dashboard Booking IDs Use Old "PAM" Prefix
- **File**: `src/pages/Dashboard.tsx`, lines 58, 74, 88, 104
- **Severity**: HIGH
- **Issue**: All booking IDs use `PAM-2027-` prefix (e.g., `PAM-2027-78432`, `PAM-2027-78433`, `PAM-2026-001`).
- **Fix**:
```tsx
// BEFORE
id: 'PAM-2027-78432'

// AFTER
id: 'KIT-2027-78432'
```

#### Issue 6: Incorrect Group Booking Email Domain
- **File**: `src/pages/GroupBooking.tsx`, line 696
- **Severity**: HIGH
- **Issue**: Email address uses `groups@kitufuresidences.com` instead of `groups@kitufu.ug`.
- **Fix**:
```tsx
// BEFORE
Or email us directly: <span className="text-savanna-gold">groups@kitufuresidences.com</span>

// AFTER
Or email us directly: <span className="text-savanna-gold">groups@kitufu.ug</span>
```

---

### MEDIUM

#### Issue 7: Missing `aria-label` on Icon-Only Buttons
- **File**: `src/pages/PropertyDetail.tsx`, lines 1004-1012
- **Severity**: MEDIUM
- **Issue**: Save/Share buttons have no accessible labels for screen readers.
- **Fix**:
```tsx
// BEFORE
<button onClick={() => setSaved(!saved)} className="...">
  <Heart size={20} className={...} />
</button>
<button className="...">
  <Share2 size={20} className="text-slate" />
</button>

// AFTER
<button onClick={() => setSaved(!saved)} className="..." aria-label={saved ? 'Remove from saved' : 'Save property'}>
  <Heart size={20} className={...} />
</button>
<button className="..." aria-label="Share property">
  <Share2 size={20} className="text-slate" />
</button>
```

#### Issue 8: Missing `aria-label` on Favorite Button (Listings)
- **File**: `src/pages/Listings.tsx`, line 120
- **Severity**: MEDIUM
- **Issue**: Heart/favorite button has no aria-label.
- **Fix**:
```tsx
// BEFORE
<button onClick={() => setFav(!fav)} className="...">
  <Heart size={16} className={...} />
</button>

// AFTER
<button onClick={() => setFav(!fav)} className="..." aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}>
  <Heart size={16} className={...} />
</button>
```

#### Issue 9: Missing `aria-label` on Image Carousel Dots
- **File**: `src/pages/Listings.tsx`, lines 143-148
- **Severity**: MEDIUM
- **Issue**: Image navigation dots have no aria-label.
- **Fix**:
```tsx
// BEFORE
<button key={i} onClick={(e) => { ... }} className="..." />

// AFTER
<button key={i} onClick={(e) => { ... }} className="..." aria-label={`View image ${i + 1} of 3`} />
```

#### Issue 10: Empty `alt` Text on Property Images (Booking Page)
- **File**: `src/pages/Booking.tsx`, lines 690, 844, 1150
- **Severity**: MEDIUM
- **Issue**: Property images use empty `alt=""` when they should have descriptive alt text.
- **Fix**:
```tsx
// BEFORE
<img src={PROPERTY.image} alt="" className="..." />

// AFTER
<img src={PROPERTY.image} alt={PROPERTY.name} className="..." />
```

#### Issue 11: Images Without `loading="lazy"` (Below the fold)
- **File**: `src/sections/SeasonPass.tsx`, line 42; `src/sections/GroupBookingCTA.tsx`, line 107
- **Severity**: MEDIUM
- **Issue**: Below-the-fold images lack lazy loading.
- **Fix**:
```tsx
// BEFORE
<img src="/property-kampala-2.jpg" alt="Premium room interior" className="w-full h-auto object-cover" />

// AFTER
<img src="/property-kampala-2.jpg" alt="Premium room interior" className="w-full h-auto object-cover" loading="lazy" />
```

#### Issue 12: Heavy Components Not Memoized
- **File**: `src/pages/Listings.tsx` (PropertyCard), `src/sections/FeaturedResidences.tsx` (PropertyCard)
- **Severity**: MEDIUM
- **Issue**: PropertyCard components with complex animations and state should be wrapped in `React.memo` to prevent unnecessary re-renders when parent updates.
- **Fix**:
```tsx
// BEFORE
function PropertyCard({ property, index }: { property: Property; index: number }) {

// AFTER
const PropertyCard = React.memo(function PropertyCard({ property, index }: { property: Property; index: number }) {
// ...
})
```

#### Issue 13: Missing `aria-label` on Guest Counter Buttons
- **File**: `src/pages/Booking.tsx`, lines 430-445; `src/sections/Hero.tsx`, lines 153-164
- **Severity**: MEDIUM
- **Issue**: Plus/minus buttons for guest counts have no aria-label.
- **Fix**:
```tsx
// BEFORE
<button onClick={() => update({ adults: Math.max(1, state.adults - 1) })} className="...">
  <Minus size={16} />
</button>

// AFTER
<button onClick={() => update({ adults: Math.max(1, state.adults - 1) })} className="..." aria-label="Decrease adults">
  <Minus size={16} />
</button>
```

---

### LOW

#### Issue 14: Unused Import `React` Type in Booking.tsx
- **File**: `src/pages/Booking.tsx`, line 1
- **Severity**: LOW
- **Issue**: `import type React from 'react'` is imported but `React.ReactElement` usage on line 173 could use `ReactElement` from direct import instead. Minor inconsistency.
- **Fix**: Either remove and use `ReactElement` directly, or keep for JSX namespace (React 19 may not need it).

#### Issue 15: Generic Alt Text on Gallery Images
- **File**: `src/pages/PropertyDetail.tsx`, lines 145, 157, 168, 185
- **Severity**: LOW
- **Issue**: Alt texts like "Main", "Thumbnail 1", "Slide 1" are generic. Could be more descriptive.
- **Fix**: Use property-specific alt text: `alt={\`${PROPERTY.name} - main view\`}` etc.

#### Issue 16: Dining Page Hero Alt Text Too Generic
- **File**: `src/pages/Dining.tsx`, line 214
- **Severity**: LOW
- **Issue**: `alt="Uganda"` is too generic for the hero background.
- **Fix**: `alt="Ugandan cuisine and dining scene"`

---

## TASK 2: Branding Consistency Check

### HIGH

#### Issue 17: Booking Confirmation Code Uses "PAM" (Pamoja Remnant)
- **File**: `src/pages/Booking.tsx`, line 985
- **Severity**: HIGH
- **Issue**: Confirmation code prefix "PAM" = old "Pamoja" brand name.
- **Fix**: Change to "KIT" prefix throughout.

#### Issue 18: Dashboard Mock Data Uses "PAM" Prefix
- **File**: `src/pages/Dashboard.tsx`, lines 58, 74, 88, 104
- **Severity**: HIGH
- **Issue**: All mock booking IDs use `PAM-2027-` prefix.
- **Fix**: Change all to `KIT-2027-` prefix.

#### Issue 19: Group Booking Email Domain Wrong
- **File**: `src/pages/GroupBooking.tsx`, line 696
- **Severity**: HIGH
- **Issue**: `groups@kitufuresidences.com` should be `groups@kitufu.ug`.
- **Fix**: Update email domain.

### MEDIUM

#### Issue 20: CSS Class Naming Inconsistent
- **File**: `src/index.css`
- **Severity**: MEDIUM
- **Issue**: `container-kitufu` uses the brand name which is good, but `hero-gradient-overlay` and `dark-overlay` are generic. Consider `kitufu-hero-overlay` for consistency.
- **Fix**: Consider adding `kitufu-` prefix to generic utility classes.

---

## TASK 3: Accessibility Audit

### HIGH

#### Issue 21: Icon-Only Buttons Missing `aria-label` (PropertyDetail)
- **File**: `src/pages/PropertyDetail.tsx`, lines 1004-1012
- **Fix**: Add aria-label attributes to save and share buttons.

#### Issue 22: Icon-Only Buttons Missing `aria-label` (Listings)
- **File**: `src/pages/Listings.tsx`, lines 120, 143-148
- **Fix**: Add aria-label to favorite and image dot buttons.

### MEDIUM

#### Issue 23: Color Contrast — Savanna Gold on White
- **File**: Various files using `text-savanna-gold`
- **Severity**: MEDIUM
- **Issue**: `#F5A623` (savanna-gold) on white `#FFFFFF` has approx 2.8:1 contrast ratio — fails WCAG AA (requires 4.5:1 for normal text).
- **Fix**: Use a darker gold variant for text on light backgrounds: `#C4810A` or use `text-sunset` (#FF6B35) which has better contrast.

#### Issue 24: `text-white/60` May Fail Contrast on Light Gradients
- **File**: Various hero sections
- **Severity**: MEDIUM
- **Issue**: `text-white/60` (60% opacity white) on gradient backgrounds may fall below 4.5:1 contrast depending on the background color beneath.
- **Fix**: Use `text-white/90` for body text on gradient overlays, or add a semi-transparent dark backdrop.

#### Issue 25: Empty Alt on Meaningful Images
- **File**: `src/pages/Booking.tsx`, lines 690, 844, 1150
- **Severity**: MEDIUM
- **Fix**: Use property name as alt text.

### LOW

#### Issue 26: Carousel Navigation Buttons Lack `aria-label` (Hero)
- **File**: `src/sections/Hero.tsx`, lines 153-164
- **Severity**: LOW
- **Issue**: Guest counter +/- buttons lack aria-label.
- **Fix**: Add `aria-label="Increase adults"` etc.

#### Issue 27: Dining Filter Buttons Lack `aria-label`
- **File**: `src/pages/Dining.tsx`, line 263
- **Severity**: LOW
- **Issue**: Cuisine filter buttons have text content but the active state isn't announced to screen readers.
- **Fix**: Add `aria-pressed={isActive}` to filter toggle buttons.

---

## TASK 4: Performance Audit

### MEDIUM

#### Issue 28: Heavy PropertyCard Components Not Memoized
- **File**: `src/pages/Listings.tsx`, `src/sections/FeaturedResidences.tsx`
- **Severity**: MEDIUM
- **Issue**: PropertyCard re-renders unnecessarily when parent state changes (e.g., filters).
- **Fix**: Wrap with `React.memo` and memoize callbacks where needed.

#### Issue 29: Testimonials Auto-Scroll Recreates Interval on Every Render
- **File**: `src/sections/Testimonials.tsx`, line 50
- **Severity**: MEDIUM
- **Issue**: Missing dependency array causes performance degradation alongside the memory leak.
- **Fix**: Add `[]` dependency array.

#### Issue 30: Below-Fold Images Without `loading="lazy"`
- **File**: `src/sections/SeasonPass.tsx`, `src/sections/GroupBookingCTA.tsx`, `src/sections/Locations.tsx`
- **Severity**: MEDIUM
- **Issue**: Images below the fold should use native lazy loading.
- **Fix**: Add `loading="lazy"` to all below-the-fold `<img>` tags.

#### Issue 31: Dashboard QR Code Math.random() Causes Re-render Thrashing
- **File**: `src/pages/Dashboard.tsx`, line 175
- **Severity**: MEDIUM
- **Issue**: `Math.random()` in render causes the QR pattern to regenerate on every render.
- **Fix**: Memoize the random pattern with `useMemo`.

---

## TASK 5: Responsive Design Check

### Overall Assessment: GOOD

The codebase generally follows responsive design best practices:
- Mobile-first Tailwind approach with consistent breakpoints (`sm:`, `md:`, `lg:`)
- `container-kitufu` provides consistent max-width and padding
- `dvh` units used for viewport heights (`min-h-[100dvh]`) — excellent for mobile browsers
- `scrollbar-hide` utility for consistent cross-browser scrollbars
- Grid layouts properly collapse: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### LOW

#### Issue 32: Hero Section Uses `-mt-16` for Navbar Offset
- **File**: `src/sections/Hero.tsx`, line 187
- **Severity**: LOW
- **Issue**: Negative margin to offset fixed navbar may cause layout issues if navbar height changes.
- **Fix**: Consider using CSS custom property `--navbar-height` for dynamic adjustment.

#### Issue 33: Testimonials Carousel Resize Handler Could Debounce
- **File**: `src/sections/Testimonials.tsx`, lines 75-87
- **Severity**: LOW
- **Issue**: `window.addEventListener('resize', handleResize)` fires continuously during resize without debouncing.
- **Fix**: Add a debounce or use `ResizeObserver` instead.

---

## Summary Table

| # | Severity | Task | File | Line | Issue |
|---|----------|------|------|------|-------|
| 1 | CRITICAL | Code Quality | `src/sections/Testimonials.tsx` | 50 | Memory leak: useEffect interval has no dependency array |
| 2 | CRITICAL | Code Quality | `src/pages/Dashboard.tsx` | 175 | Hydration mismatch: Math.random() in JSX render |
| 3 | HIGH | Code Quality | `src/pages/AfconInfo.tsx` | 63 | `variants?: any` uses explicit any type |
| 4 | HIGH | Branding | `src/pages/Booking.tsx` | 985 | Booking code "PAM-2027-78432" uses old brand "Pamoja" |
| 5 | HIGH | Branding | `src/pages/Dashboard.tsx` | 58,74,88,104 | Booking IDs use "PAM-" prefix (old brand) |
| 6 | HIGH | Branding | `src/pages/GroupBooking.tsx` | 696 | Email uses wrong domain: kitufuresidences.com |
| 7 | MEDIUM | Accessibility | `src/pages/PropertyDetail.tsx` | 1004-1012 | Icon-only buttons missing aria-label |
| 8 | MEDIUM | Accessibility | `src/pages/Listings.tsx` | 120,143 | Favorite/image dot buttons missing aria-label |
| 9 | MEDIUM | Accessibility | `src/pages/Booking.tsx` | 690,844,1150 | Empty alt text on meaningful property images |
| 10 | MEDIUM | Performance | `src/pages/Listings.tsx` | 95 | PropertyCard not memoized, unnecessary re-renders |
| 11 | MEDIUM | Performance | `src/sections/FeaturedResidences.tsx` | 77 | PropertyCard not memoized |
| 12 | MEDIUM | Accessibility | Various | - | Color contrast: savanna-gold (#F5A623) on white fails WCAG AA |
| 13 | MEDIUM | Performance | `src/sections/SeasonPass.tsx` | 42 | Below-fold image missing loading="lazy" |
| 14 | MEDIUM | Performance | `src/sections/GroupBookingCTA.tsx` | 107 | Below-fold image missing loading="lazy" |
| 15 | MEDIUM | Accessibility | `src/pages/Booking.tsx` | 430-445 | Guest counter buttons missing aria-label |
| 16 | LOW | Code Quality | `src/pages/Booking.tsx` | 1 | Unused React type import style |
| 17 | LOW | Accessibility | `src/pages/PropertyDetail.tsx` | 145,157,168,185 | Generic alt text on gallery images |
| 18 | LOW | Accessibility | `src/pages/Dining.tsx` | 214 | Hero alt text too generic |
| 19 | LOW | Accessibility | `src/pages/Dining.tsx` | 263 | Filter buttons missing aria-pressed |
| 20 | LOW | Responsive | `src/sections/Testimonials.tsx` | 75-87 | Resize handler not debounced |
| 21 | LOW | Responsive | `src/sections/Hero.tsx` | 187 | Negative margin for navbar offset |

---

## Issue Count by Severity

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 4 |
| MEDIUM | 9 |
| LOW | 6 |
| **Total** | **21** |

## Issue Count by Task

| Task | Count |
|------|-------|
| Task 1: Code Quality | 5 |
| Task 2: Branding | 4 |
| Task 3: Accessibility | 8 |
| Task 4: Performance | 4 |
| Task 5: Responsive | 2 |
