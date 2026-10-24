import { pgTable, serial, text, timestamp, integer, jsonb, index } from "drizzle-orm/pg-core";

export const visitors = pgTable(
  "visitors",
  {
    id: serial("id").primaryKey(),
    passportCode: text("passport_code").notNull().unique(),
    name: text("name").notNull(),
    studentName: text("student_name"),
    classGrade: text("class_grade").notNull(),
    section: text("section").notNull(),
    relation: text("relation").default("Student"),
    phone: text("phone"),
    stampsCollected: jsonb("stamps_collected").$type<string[]>().default([]),
    certificateId: text("certificate_id").unique(),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    avatarUrl: text("avatar_url"),
  },
  (table) => ({ createdAtIdx: index("visitors_created_at_idx").on(table.createdAt) }),
);

export const exhibitionZones = pgTable("exhibition_zones", {
  id: text("id").primaryKey(),
  zoneNumber: integer("zone_number").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  category: text("category").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  secretCode: text("secret_code").notNull(),
  badgeIcon: text("badge_icon").notNull(),
  badgeTitle: text("badge_title").notNull(),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  imageUrl: text("image_url"),
});

export const appCustomMedia = pgTable("app_custom_media", {
  id: serial("id").primaryKey(),
  schoolName: text("school_name").default("Advanced Academy Indore"),
  eventName: text("event_name").default("Spectra Annual Exhibition 2026-27 • Theme: Future India 2047"),
  passportImage: text("passport_image").default("/images/spectra-passport-art.jpg"),
  welcomeImage: text("welcome_image").default("/images/spectra-welcome-art.jpg"),
  routeImage: text("route_image").default(""),
  stampImage: text("stamp_image").default("/images/spectra-stamp-sheet.jpg"),
  certificateImage: text("certificate_image").default("/images/spectra-certificate-template.jpg"),
  completionImage: text("completion_image").default("/images/spectra-route-complete.jpg"),
  mediaRevision: text("media_revision").default("spectra-reference-v2"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
