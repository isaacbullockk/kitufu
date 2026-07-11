import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
  tinyint,
  bigint,
  date,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id"),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const properties = mysqlTable("properties", {
  id: serial("id"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 100 }).notNull(),
  address: text("address"),
  pricePerNight: int("pricePerNight").notNull(),
  capacity: int("capacity").notNull().default(2),
  bedrooms: int("bedrooms").default(1),
  bathrooms: int("bathrooms").default(1),
  amenities: text("amenities"),
  images: text("images"),
  isKitufu: tinyint("isKitufu").default(0),
  hasShuttle: tinyint("hasShuttle").default(0),
  isGroupFriendly: tinyint("isGroupFriendly").default(0),
  distanceToStadium: varchar("distanceToStadium", { length: 50 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  ownerId: bigint("ownerId", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

export const bookings = mysqlTable("bookings", {
  id: serial("id"),
  propertyId: bigint("propertyId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  checkIn: date("checkIn").notNull(),
  checkOut: date("checkOut").notNull(),
  adults: int("adults").notNull().default(1),
  children: int("children").default(0),
  roomType: mysqlEnum("roomType", ["multi_share", "twin", "private"]).default("private"),
  totalPrice: int("totalPrice").notNull(),
  status: mysqlEnum("status", ["confirmed", "pending", "cancelled", "completed"]).default("pending").notNull(),
  addShuttle: tinyint("addShuttle").default(0),
  seasonPass: tinyint("seasonPass").default(0),
  bookingRef: varchar("bookingRef", { length: 20 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export const hostProfiles = mysqlTable("hostProfiles", {
  id: serial("id"),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  companyName: varchar("companyName", { length: 255 }),
  utbNumber: varchar("utbNumber", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  verified: tinyint("verified").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HostProfile = typeof hostProfiles.$inferSelect;
export type InsertHostProfile = typeof hostProfiles.$inferInsert;
