# Kitufu Phase 3 — The Final Push

## 6 Features in Parallel

### 1. Admin Dashboard (`/admin`) — admin-dash branch
- New page: pending properties table, approve/reject buttons
- All bookings table with pagination
- Platform stats cards (revenue, bookings, properties)
- Route guard: admin only

### 2. Real-Time Availability — availability branch
- Add availability table: propertyId, date, isBooked
- Check availability in booking.create before confirming
- Return "dates unavailable" error if overlap
- Show unavailable dates on calendar

### 3. Email Notifications — email branch
- Add email service (Resend/SendGrid simulation)
- booking.create sends confirmation email
- booking.create alerts host
- 24h reminder email
- Email templates for each type

### 4. Group Booking Backend — group-booking-api branch
- Create groupEnquiries table
- Create group-booking-router.ts
- Wire /group-booking form to API
- Admin view of group enquiries

### 5. Working Filters — filters branch
- Wire all filter chips to trpc.property.list
- Price range → minPrice/maxPrice
- Amenities → filter by amenities JSON
- Sort dropdown → sort by price/rating
- Kitufu Only / Shuttle / Group Friendly

### 6. Image Upload — image-upload branch
- Cloudinary integration (simulated)
- Drag-and-drop upload component
- Replace URL inputs with upload
- Thumbnail generation
