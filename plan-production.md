# Kitufu Production Deployment Plan

## 1. Real Flutterwave Integration
- Add flutterwave-react-native or direct API integration
- Create payment initiation that calls real Flutterwave API
- Handle payment callback/webhook
- Update booking status on payment success

## 2. Cloudinary Image Upload
- Sign up for Cloudinary free tier
- Create server-side signature generation
- Frontend upload via Cloudinary widget or direct upload
- Store returned URLs in database

## 3. SendGrid Email Delivery
- Create email service that calls SendGrid API
- Templates for: booking confirmation, host alert, reminder
- Add API key to .env

## 4. SEO Optimization
- Update index.html with proper meta tags, OG tags, Twitter cards
- Create robots.txt
- Create sitemap.xml
- Add structured data (JSON-LD) for hotels/booking
- Add canonical URLs

## 5. Analytics
- Add Google Analytics 4 script
- Add page view tracking
- Add conversion events (booking, payment)

## 6. Domain Configuration
- Document DNS setup for kitufu.com
