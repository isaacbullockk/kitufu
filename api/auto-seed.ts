import { getDb } from "./queries/connection";
// Using process.env directly to avoid esbuild resolve issue
import { properties, bookings, users, hostProfiles, availability, groupEnquiries, emailLogs } from "../db/schema";
import { sql } from "drizzle-orm";
import mysql from "mysql2/promise";

async function getRawConnection() {
  return mysql.createConnection(process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL || "");
}

async function ensureTable(tableName: string, createSql: string) {
  const conn = await getRawConnection();
  try {
    await conn.execute(`SELECT 1 FROM \`${tableName}\` LIMIT 1`);
    console.log("[DB] Table exists: " + tableName);
  } catch {
    console.log("[DB] Creating table: " + tableName);
    await conn.execute(createSql);
    console.log("[DB] Created table: " + tableName);
  } finally {
    await conn.end();
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
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
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
  roomType ENUM('multi_share', 'twin', 'private') DEFAULT 'private',
  totalPrice INT UNSIGNED NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
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
  email VARCHAR(320),
  passwordHash VARCHAR(255),
  avatar VARCHAR(500),
  role ENUM('user', 'host', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignInAt TIMESTAMP NULL DEFAULT NULL
)`;

// Add a column to an existing table if it is missing (idempotent migration).
async function ensureColumn(table: string, column: string, ddl: string) {
  const conn = await getRawConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column],
    );
    if ((rows as any[]).length === 0) {
      await conn.execute(`ALTER TABLE \`${table}\` ADD COLUMN ${ddl}`);
      console.log(`[DB] Added column: ${table}.${column}`);
    }
  } finally {
    await conn.end();
  }
}

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
  status ENUM('new', 'contacted', 'quoted', 'confirmed', 'declined') DEFAULT 'new',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_REVIEWS = `CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  propertyId BIGINT UNSIGNED NOT NULL,
  userId BIGINT UNSIGNED NOT NULL,
  userName VARCHAR(255) NOT NULL,
  userType ENUM('guest', 'host') NOT NULL,
  rating INT NOT NULL,
  comment TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

const CREATE_SITECONFIG = `CREATE TABLE IF NOT EXISTS siteConfig (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`;

const CREATE_PROPERTY_TYPES = `CREATE TABLE IF NOT EXISTS propertyTypes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  isActive TINYINT DEFAULT 1,
  sortOrder INT DEFAULT 0
)`;

const CREATE_EMAIL_LOGS = `CREATE TABLE IF NOT EXISTS emailLogs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  to_email VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  bookingId BIGINT UNSIGNED,
  status ENUM('sent', 'failed') DEFAULT 'sent',
  messageId VARCHAR(100),
  sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`;

export async function autoSeed() {
  console.log("[AUTO-SEED] Checking database...");

  await ensureTable("properties", CREATE_PROPERTIES);
  await ensureTable("bookings", CREATE_BOOKINGS);
  await ensureTable("users", CREATE_USERS);
  // Idempotent column migrations for deployments created before local auth
  await ensureColumn("users", "email", "email VARCHAR(320)");
  await ensureColumn("users", "passwordHash", "passwordHash VARCHAR(255)");
  await ensureColumn("users", "updatedAt", "updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
  await ensureColumn("users", "lastSignInAt", "lastSignInAt TIMESTAMP NULL DEFAULT NULL");
  await ensureTable("hostProfiles", CREATE_HOST_PROFILES);
  await ensureTable("availability", CREATE_AVAILABILITY);
  await ensureTable("groupEnquiries", CREATE_GROUP_ENQUIRIES);
  await ensureTable("emailLogs", CREATE_EMAIL_LOGS);
  await ensureTable("siteConfig", CREATE_SITECONFIG);
  await ensureTable("propertyTypes", CREATE_PROPERTY_TYPES);
  await ensureTable("reviews", CREATE_REVIEWS);

  const db = getDb();

  const existing = await db.select({ count: sql<number>`count(*)` }).from(properties);
  if ((existing[0]?.count || 0) > 0) {
    console.log("[AUTO-SEED] Already seeded (" + (existing[0]?.count || 0) + " properties).");
    return;
  }

  console.log("[AUTO-SEED] Seeding 12 AFCON 2027 properties...");

  await db.insert(properties).values([
    { title: "Kampala Central Hub", description: "Modern serviced apartments in the heart of Kampala. Walking distance to shops, restaurants, and nightlife. Perfect for fans who want to be close to the action.", location: "Kampala", address: "Plot 42, Kampala Road, Central Business District", pricePerNight: 85000, capacity: 4, bedrooms: 2, bathrooms: 2, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","TV","Washer","Free Parking","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688"]), isKitufu: 0, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "2.1 km", status: "approved", ownerId: 1 },
    { title: "Mandela Walk Suites", description: "Elegant suites on Mandela National Stadium Walk. Wake up to views of the stadium and enjoy premium match-day access with dedicated shuttle service.", location: "Kampala", address: "Mandela National Stadium Walk, Namboole", pricePerNight: 120000, capacity: 6, bedrooms: 3, bathrooms: 2, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","TV","Gym","Pool","Shuttle"]), images: JSON.stringify(["https://images.unsplash.com/photo-1613490493576-7fde63acd811","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]), isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "0.5 km", status: "approved", ownerId: 1 },
    { title: "Nakasero Heights", description: "Quiet residential neighborhood with panoramic city views. Spacious rooms with private balconies. 10-minute drive to Mandela Stadium with regular shuttle service.", location: "Kampala", address: "15 Nakasero Hill Road, Nakasero", pricePerNight: 95000, capacity: 2, bedrooms: 1, bathrooms: 1, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Balcony","City View","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6","https://images.unsplash.com/photo-1484154218962-a1c002085d2f"]), isKitufu: 0, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "3.2 km", status: "approved", ownerId: 1 },
    { title: "Kololo View Apartments", description: "Premium apartments in upscale Kololo. Rooftop terrace with city views, modern furnishings, and concierge service. Ideal for VIP guests and corporate delegations.", location: "Kampala", address: "8 Prince Charles Drive, Kololo", pricePerNight: 150000, capacity: 8, bedrooms: 4, bathrooms: 3, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Rooftop Terrace","Concierge","Gym","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c"]), isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "4.5 km", status: "approved", ownerId: 1 },
    { title: "Namboole Fan Lodge", description: "Purpose-built fan accommodation next to Mandela Stadium. Shared lounges, match-day BBQs, and 24/7 fan zone atmosphere. The ultimate football experience.", location: "Kampala", address: "Plot 1, Stadium Road, Namboole", pricePerNight: 45000, capacity: 12, bedrooms: 6, bathrooms: 4, amenities: JSON.stringify(["WiFi","Fan","Shared Kitchen","BBQ Area","Fan Zone","Locker Storage"]), images: JSON.stringify(["https://images.unsplash.com/photo-1555854877-bab0e564b8d5","https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf"]), isKitufu: 1, hasShuttle: 0, isGroupFriendly: 1, distanceToStadium: "0.3 km", status: "approved", ownerId: 1 },
    { title: "Bugolobi Riverside", description: "Tranquil riverside apartments in Bugolobi. Lush gardens, outdoor seating, and peaceful environment. Regular shuttle to stadium and city center.", location: "Kampala", address: "23 Spring Road, Bugolobi", pricePerNight: 78000, capacity: 3, bedrooms: 2, bathrooms: 1, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Garden View","Outdoor Seating","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1600585154340-be6161a56a0c","https://images.unsplash.com/photo-1600607687644-c7171b42498f"]), isKitufu: 0, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "5.0 km", status: "approved", ownerId: 1 },
    { title: "Entebbe Airport Stay", description: "Convenient stopover near Entebbe International Airport. Perfect for early arrivals and late departures. 45 minutes to Mandela Stadium with shuttle.", location: "Entebbe", address: "12 Airport Road, Entebbe", pricePerNight: 65000, capacity: 2, bedrooms: 1, bathrooms: 1, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Airport Transfer","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3","https://images.unsplash.com/photo-1600573472591-ee6b68d14c68"]), isKitufu: 0, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "45 km", status: "approved", ownerId: 1 },
    { title: "Muyenga Breeze", description: "Hillside apartments in Muyenga with stunning lake views. Quiet neighborhood, secure compound, and premium furnishings. 15 minutes to stadium.", location: "Kampala", address: "7 Tank Hill Road, Muyenga", pricePerNight: 110000, capacity: 4, bedrooms: 2, bathrooms: 2, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Lake View","Gym","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1600585154526-990dced4db0d","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea"]), isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "4.8 km", status: "approved", ownerId: 1 },
    { title: "Kira Family Homes", description: "Spacious family homes in Kira with large gardens and parking. Perfect for groups and families. 20 minutes to stadium with shuttle service.", location: "Kira", address: "34 Kira Road, Kira Town Council", pricePerNight: 70000, capacity: 8, bedrooms: 4, bathrooms: 3, amenities: JSON.stringify(["WiFi","Kitchen","Garden","Parking","BBQ","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde","https://images.unsplash.com/photo-1600585154363-67eb9e2e2099"]), isKitufu: 0, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "8.5 km", status: "approved", ownerId: 1 },
    { title: "Bukoto Creative Lofts", description: "Stylish lofts in the trendy Bukoto neighborhood. Close to cafes, art galleries, and nightlife. 10 minutes to stadium with regular shuttle.", location: "Kampala", address: "19 Bukoto Street, Bukoto", pricePerNight: 88000, capacity: 3, bedrooms: 1, bathrooms: 1, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Workspace","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1600210492493-0946911123ea","https://images.unsplash.com/photo-1600585153490-76fb20a32601"]), isKitufu: 0, hasShuttle: 1, isGroupFriendly: 0, distanceToStadium: "3.8 km", status: "approved", ownerId: 1 },
    { title: "Lubowa Golf Estate", description: "Luxury estate homes near Uganda Golf Club in Lubowa. Private pools, expansive gardens, and 24/7 security. Premium experience for VIP guests.", location: "Lubowa", address: "1 Lubowa Estate Drive, Lubowa", pricePerNight: 200000, capacity: 10, bedrooms: 5, bathrooms: 4, amenities: JSON.stringify(["WiFi","Air Conditioning","Kitchen","Private Pool","Gym","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1613977257363-707ba9348227","https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"]), isKitufu: 1, hasShuttle: 1, isGroupFriendly: 1, distanceToStadium: "12 km", status: "approved", ownerId: 1 },
    { title: "Kyaliwajjala Junction", description: "Affordable apartments near Kyaliwajjala Junction with easy access to taxi and boda transport. Clean, secure, and budget-friendly for fans.", location: "Kyaliwajjala", address: "89 Kampala-Jinja Road, Kyaliwajjala", pricePerNight: 35000, capacity: 4, bedrooms: 2, bathrooms: 1, amenities: JSON.stringify(["WiFi","Fan","Kitchen","Parking","Security"]), images: JSON.stringify(["https://images.unsplash.com/photo-1598928506311-c55ded91a20c","https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6"]), isKitufu: 0, hasShuttle: 0, isGroupFriendly: 0, distanceToStadium: "10 km", status: "approved", ownerId: 1 },
  ]);

  console.log("[AUTO-SEED] Seeded 12 properties.");
}
