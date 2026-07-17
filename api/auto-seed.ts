import { getDb } from "./queries/connection";
import { properties, bookings, users, hostProfiles, availability, groupEnquiries, emailLogs } from "../db/schema";
import { sql } from "drizzle-orm";

async function ensureTable(db: any, tableName: string, createSql: string) {
  try {
    await db.execute(sql`SELECT 1 FROM ${sql.raw(tableName)} LIMIT 1`);
  } catch {
    console.log("[DB] Creating table: " + tableName);
    await db.execute(sql.raw(createSql));
  }
}

const CREATE_PROPERTIES = `CREATE TABLE IF NOT EXISTS properties (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  pricePerNight INT UNSIGNED NOT NULL,
  capacity INT UNSIGNED NOT NULL DEFAULT 1,
  bedrooms INT UNSIGNED DEFAULT 0,
  bathrooms INT UNSIGNED DEFAULT 0,
  amenities TEXT,
  images TEXT,
  isKitufu TINYINT DEFAULT 0,
  hasShuttle TINYINT DEFAULT 0,
  isGroupFriendly TINYINT DEFAULT 0,
  distanceToStadium VARCHAR(50),
  status ENUM(\'pending\', \'approved\', \'rejected\') DEFAULT \'pending\',
  ownerId BIGINT UNSIGNED,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const CREATE_BOOKINGS = `CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  propertyId BIGINT UNSIGNED NOT NULL,
  userId BIGINT UNSIGNED NOT NULL,
  checkIn DATE NOT NULL,
  checkOut DATE NOT NULL,
  adults INT UNSIGNED DEFAULT 1,
  children INT UNSIGNED DEFAULT 0,
  roomType ENUM(\'multi_share\', \'twin\', \'private\') DEFAULT \'private\',
  totalPrice INT UNSIGNED NOT NULL,
  status ENUM(\'pending\', \'confirmed\', \'cancelled\', \'completed\') DEFAULT \'pending\',
  addShuttle INT DEFAULT 0,
  seasonPass INT DEFAULT 0,
  bookingRef VARCHAR(50) UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const CREATE_USERS = `CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  unionId VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar VARCHAR(500),
  role ENUM(\'user\', \'host\', \'admin\') DEFAULT \'user\',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_HOST_PROFILES = `CREATE TABLE IF NOT EXISTS hostProfiles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  userId BIGINT UNSIGNED NOT NULL UNIQUE,
  companyName VARCHAR(255) NOT NULL,
  utbNumber VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  verified TINYINT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_AVAILABILITY = `CREATE TABLE IF NOT EXISTS availability (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  propertyId BIGINT UNSIGNED NOT NULL,
  date DATE NOT NULL,
  isBooked TINYINT DEFAULT 0,
  bookingId BIGINT UNSIGNED
)`;

const CREATE_GROUP_ENQUIRIES = `CREATE TABLE IF NOT EXISTS groupEnquiries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  groupName VARCHAR(255) NOT NULL,
  contactName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  groupSize INT NOT NULL,
  preferredCity VARCHAR(100),
  checkIn DATE,
  checkOut DATE,
  budgetPerPerson INT,
  requirements TEXT,
  status ENUM(\'new\', \'contacted\', \'quoted\', \'confirmed\', \'declined\') DEFAULT \'new\',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;



const CREATE_REVIEWS = `CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  propertyId BIGINT UNSIGNED NOT NULL,
  userId BIGINT UNSIGNED NOT NULL,
  userName VARCHAR(255) NOT NULL,
  userType ENUM(\'guest\', \'host\') NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_EMAIL_LOGS = `CREATE TABLE IF NOT EXISTS emailLogs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  bookingId BIGINT UNSIGNED,
  status ENUM(\'sent\', \'failed\') DEFAULT \'sent\',
  messageId VARCHAR(100),
  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

export async function autoSeed() {
  const db = getDb();
  console.log("[AUTO-SEED] Checking database...");

  // Create tables if they don't exist
  await ensureTable(db, "properties", CREATE_PROPERTIES);
  await ensureTable(db, "bookings", CREATE_BOOKINGS);
  await ensureTable(db, "users", CREATE_USERS);
  await ensureTable(db, "hostProfiles", CREATE_HOST_PROFILES);
  await ensureTable(db, "availability", CREATE_AVAILABILITY);
  await ensureTable(db, "groupEnquiries", CREATE_GROUP_ENQUIRIES);
  await ensureTable(db, "emailLogs", CREATE_EMAIL_LOGS);
  await ensureTable(db, "reviews", CREATE_REVIEWS);

  // Check if properties already seeded
  const existing = await db.select({ count: sql<number>`count(*)` }).from(properties);
  if ((existing[0]?.count || 0) > 0) {
    console.log("[AUTO-SEED] Database already seeded (" + (existing[0]?.count || 0) + " properties). Skipping.");
    return;
  }

  console.log("[AUTO-SEED] Seeding 12 AFCON 2027 properties...");

  await db.insert(properties).values([
    {
      title: "Kampala Central Hub",
      description: "Modern serviced apartments in the heart of Kampala. Walking distance to shops, restaurants, and nightlife. Perfect for fans who want to be close to the action.",
      location: "Kampala",
      address: "Plot 42, Kampala Road, Central Business District",
      pricePerNight: 85000, capacity: 4, bedrooms: 2, bathrooms: 2,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","TV","Washer","Free Parking","Security"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]),
      isKitufu: 0, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "2.1 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Mandela Walk Suites",
      description: "Elegant suites on Mandela National Stadium Walk. Wake up to views of the stadium and enjoy premium match-day access with dedicated shuttle service.",
      location: "Kampala",
      address: "Mandela National Stadium Walk, Namboole",
      pricePerNight: 120000, capacity: 6, bedrooms: 3, bathrooms: 2,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","TV","Gym","Pool","Shuttle"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1613490493576-7fde63acd811","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]),
      isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "0.5 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Nakasero Heights",
      description: "Quiet residential neighborhood with panoramic city views. Spacious rooms with private balconies. 10-minute drive to Mandela Stadium with regular shuttle service.",
      location: "Kampala",
      address: "15 Nakasero Hill Road, Nakasero",
      pricePerNight: 95000, capacity: 2, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Balcony","City View","Security"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6","https://images.unsplash.com/photo-1484154218962-a1c002085d2f"]),
      isKitufu: 0, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "3.2 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Kololo View Apartments",
      description: "Premium apartments in upscale Kololo. Rooftop terrace with city views, modern furnishings, and concierge service. Ideal for VIP guests and corporate delegations.",
      location: "Kampala",
      address: "8 Prince Charles Drive, Kololo",
      pricePerNight: 150000, capacity: 8, bedrooms: 4, bathrooms: 3,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Rooftop Terrace","Concierge","Gym","Security"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"]),
      isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "4.5 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Namboole Fan Lodge",
      description: "Purpose-built fan accommodation next to Mandela Stadium. Shared lounges, match-day BBQs, and 24/7 fan zone atmosphere. The ultimate football experience.",
      location: "Kampala",
      address: "Plot 1, Stadium Road, Namboole",
      pricePerNight: 45000, capacity: 12, bedrooms: 6, bathrooms: 4,
      amenities: JSON.stringify(["WiFi","Fan","Shared Kitchen","BBQ Area","Fan Zone","Locker Storage"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1555854877-bab0e564b8d5","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf"]),
      isKitufu: 1, hasShuttle: 0, isGroupFriendly: 1, distanceToStadium: "0.3 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Bugolobi Riverside",
      description: "Tranquil riverside apartments in Bugolobi. Lush gardens, outdoor seating, and peaceful environment. Regular shuttle to stadium and city center.",
      location: "Kampala",
      address: "23 Spring Road, Bugolobi",
      pricePerNight: 78000, capacity: 3, bedrooms: 2, bathrooms: 1,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Garden","Riverside","Parking"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1512917774080-9991f1c4c750","https://images.unsplash.com/photo-1600585154340-be6161a56a0c"]),
      isKitufu: 0, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "5.8 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Hoima Stadium Residence",
      description: "Brand new residence overlooking Hoima Stadium. Modern construction with all amenities. The closest accommodation to the western venue.",
      location: "Hoima",
      address: "Plot 7, Stadium Avenue, Hoima",
      pricePerNight: 55000, capacity: 4, bedrooms: 2, bathrooms: 2,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","TV","Free Parking","Security"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3"]),
      isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "0.8 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Bunyoro Cultural Inn",
      description: "Stay in a traditional Bunyoro-inspired guesthouse. Cultural experiences, local cuisine, and warm hospitality. Authentic Uganda experience for football fans.",
      location: "Hoima",
      address: "12 Cultural Heritage Road, Hoima Town",
      pricePerNight: 35000, capacity: 2, bedrooms: 1, bathrooms: 1,
      amenities: JSON.stringify(["WiFi","Fan","Traditional Decor","Cultural Tours","Local Cuisine","Garden"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6","https://images.unsplash.com/photo-1600585154526-990dced4db0d"]),
      isKitufu: 0, hasShuttle: 0, isGroupFriendly: 0, distanceToStadium: "2.4 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Lake Albert View Lodge",
      description: "Stunning views of Lake Albert from every room. Peaceful retreat 15 minutes from Hoima Stadium. Perfect for fans who want nature and football.",
      location: "Hoima",
      address: "45 Lake View Drive, Kigorobya",
      pricePerNight: 68000, capacity: 4, bedrooms: 2, bathrooms: 2,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Lake View","Balcony","Parking","Nature Trails"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1615880484746-a134be9a6ecf","https://images.unsplash.com/photo-1600607687644-c7171b42498b"]),
      isKitufu: 0, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "6.2 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Kigaaya Fan Village",
      description: "Purpose-built fan village with communal spaces, shared kitchens, and vibrant atmosphere. Budget-friendly with group discounts. Match-day shuttles every hour.",
      location: "Hoima",
      address: "Kigaaya Trading Centre, Hoima-Kampala Road",
      pricePerNight: 25000, capacity: 20, bedrooms: 10, bathrooms: 6,
      amenities: JSON.stringify(["WiFi","Fan","Shared Kitchen","Common Area","BBQ","Laundry","24/7 Reception"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1555854877-bab0e564b8d5","https://images.unsplash.com/photo-1571896349842-33c89424de2d"]),
      isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "1.2 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Mparo Royal Suites",
      description: "Luxury suites near the historic Mparo Tombs. Premium accommodation with king beds, ensuite bathrooms, and personal butler service. For the discerning football fan.",
      location: "Hoima",
      address: "1 Royal Mile, Mparo Hill, Hoima",
      pricePerNight: 130000, capacity: 4, bedrooms: 2, bathrooms: 2,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","King Beds","Ensuite","Butler Service","Gym"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea","https://images.unsplash.com/photo-1600210492493-0946911123ea"]),
      isKitufu: 1, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "3.5 km",
      status: "approved", ownerId: 1,
    },
    {
      title: "Hoima Hills Retreat",
      description: "Hillside retreat with panoramic views of Hoima and the stadium in the distance. Quiet, spacious, and perfect for families or small groups.",
      location: "Hoima",
      address: "78 Hilltop Road, Kibanjwa, Hoima",
      pricePerNight: 62000, capacity: 6, bedrooms: 3, bathrooms: 2,
      amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Panoramic View","Garden","Parking","Family Friendly"]),
      images: JSON.stringify(["https://images.unsplash.com/photo-1600585154340-be6161a56a0c","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"]),
      isKitufu: 0, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "4.1 km",
      status: "approved", ownerId: 1,
    },
  ]);

  console.log("[AUTO-SEED] Seeded 12 properties successfully!");
}
