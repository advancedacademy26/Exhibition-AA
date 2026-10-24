import { db } from "@/db";
import { sql } from "drizzle-orm";
import { INITIAL_ZONES, DEFAULT_MEDIA_SETTINGS } from "./constants";

let initializationPromise: Promise<void> | null = null;

async function initializeDatabase() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS visitors (
      id SERIAL PRIMARY KEY,
      passport_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      student_name TEXT,
      class_grade TEXT NOT NULL,
      section TEXT NOT NULL,
      relation TEXT DEFAULT 'Student',
      phone TEXT,
      stamps_collected JSONB DEFAULT '[]'::jsonb,
      certificate_id TEXT UNIQUE,
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      avatar_url TEXT
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS exhibition_zones (
      id TEXT PRIMARY KEY,
      zone_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      secret_code TEXT NOT NULL,
      badge_icon TEXT NOT NULL,
      badge_title TEXT NOT NULL,
      highlights JSONB DEFAULT '[]'::jsonb,
      image_url TEXT
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS app_custom_media (
      id SERIAL PRIMARY KEY,
      school_name TEXT DEFAULT 'Advanced Academy Indore',
      event_name TEXT DEFAULT 'Spectra Annual Exhibition 2026-27 • Theme: Future India 2047',
      passport_image TEXT DEFAULT '/images/spectra-passport-art.jpg',
      welcome_image TEXT DEFAULT '/images/spectra-welcome-art.jpg',
      route_image TEXT DEFAULT '',
      stamp_image TEXT DEFAULT '/images/spectra-stamp-sheet.jpg',
      certificate_image TEXT DEFAULT '/images/spectra-certificate-template.jpg',
      completion_image TEXT DEFAULT '/images/spectra-route-complete.jpg',
      media_revision TEXT DEFAULT 'spectra-reference-v2',
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Upgrade databases created by earlier versions of the app.
  await db.execute(sql`ALTER TABLE app_custom_media ADD COLUMN IF NOT EXISTS certificate_image TEXT DEFAULT '';`);
  await db.execute(sql`ALTER TABLE app_custom_media ADD COLUMN IF NOT EXISTS completion_image TEXT DEFAULT '';`);
  await db.execute(sql`ALTER TABLE app_custom_media ADD COLUMN IF NOT EXISTS media_revision TEXT DEFAULT '';`);
  await db.execute(sql`ALTER TABLE visitors ALTER COLUMN relation SET DEFAULT 'Parent';`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON visitors (created_at DESC);`);
  await db.execute(sql`CREATE INDEX IF NOT EXISTS exhibition_zones_number_idx ON exhibition_zones (zone_number);`);

  // Upsert the six current mission descriptions while preserving visitor stamp IDs.
  for (const zone of INITIAL_ZONES) {
    await db.execute(sql`
      INSERT INTO exhibition_zones (
        id, zone_number, title, subtitle, category, location, description,
        secret_code, badge_icon, badge_title, highlights, image_url
      ) VALUES (
        ${zone.id}, ${zone.zoneNumber}, ${zone.title}, ${zone.subtitle},
        ${zone.category}, ${zone.location}, ${zone.description}, ${zone.secretCode},
        ${zone.badgeIcon}, ${zone.badgeTitle}, ${JSON.stringify(zone.highlights)}::jsonb, NULL
      )
      ON CONFLICT (id) DO UPDATE SET
        zone_number = EXCLUDED.zone_number,
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        category = EXCLUDED.category,
        location = EXCLUDED.location,
        description = EXCLUDED.description,
        secret_code = EXCLUDED.secret_code,
        badge_icon = EXCLUDED.badge_icon,
        badge_title = EXCLUDED.badge_title,
        highlights = EXCLUDED.highlights,
        image_url = EXCLUDED.image_url;
    `);
  }

  await db.execute(sql`
    INSERT INTO app_custom_media (
      school_name, event_name, passport_image, welcome_image, route_image,
      stamp_image, certificate_image, completion_image
    )
    SELECT
      ${DEFAULT_MEDIA_SETTINGS.schoolName}, ${DEFAULT_MEDIA_SETTINGS.eventName},
      ${DEFAULT_MEDIA_SETTINGS.passportImage}, ${DEFAULT_MEDIA_SETTINGS.welcomeImage},
      ${DEFAULT_MEDIA_SETTINGS.routeImage}, ${DEFAULT_MEDIA_SETTINGS.stampImage},
      ${DEFAULT_MEDIA_SETTINGS.certificateImage}, ${DEFAULT_MEDIA_SETTINGS.completionImage}
    WHERE NOT EXISTS (SELECT 1 FROM app_custom_media);
  `);

  // One-time refresh: replace old uploaded/sample art with the new Spectra interpretation.
  // Once marked, future organizer-uploaded artwork is preserved on later server starts.
  await db.execute(sql`
    UPDATE app_custom_media
    SET school_name = CASE
          WHEN school_name IS NULL OR school_name ILIKE '%St. Xavier%' THEN ${DEFAULT_MEDIA_SETTINGS.schoolName}
          ELSE school_name
        END,
        event_name = CASE
          WHEN event_name IS NULL OR event_name ILIKE '%Children%Day%' THEN ${DEFAULT_MEDIA_SETTINGS.eventName}
          ELSE event_name
        END,
        passport_image = ${DEFAULT_MEDIA_SETTINGS.passportImage},
        welcome_image = ${DEFAULT_MEDIA_SETTINGS.welcomeImage},
        route_image = ${DEFAULT_MEDIA_SETTINGS.routeImage},
        stamp_image = ${DEFAULT_MEDIA_SETTINGS.stampImage},
        certificate_image = ${DEFAULT_MEDIA_SETTINGS.certificateImage},
        completion_image = ${DEFAULT_MEDIA_SETTINGS.completionImage},
        media_revision = 'spectra-reference-v2',
        updated_at = NOW()
    WHERE media_revision IS DISTINCT FROM 'spectra-reference-v2';
  `);

  // Replace any remaining known legacy sample paths without overwriting custom media.
  await db.execute(sql`
    UPDATE app_custom_media
    SET
      school_name = CASE
        WHEN school_name IS NULL OR school_name ILIKE '%St. Xavier%' THEN ${DEFAULT_MEDIA_SETTINGS.schoolName}
        ELSE school_name
      END,
      event_name = CASE
        WHEN event_name IS NULL OR event_name ILIKE '%Children%Day%' THEN ${DEFAULT_MEDIA_SETTINGS.eventName}
        ELSE event_name
      END,
      passport_image = CASE
        WHEN passport_image = '/images/passport-cover.jpg' THEN ${DEFAULT_MEDIA_SETTINGS.passportImage}
        ELSE COALESCE(passport_image, ${DEFAULT_MEDIA_SETTINGS.passportImage})
      END,
      welcome_image = CASE
        WHEN welcome_image = '/images/welcome-banner.jpg' THEN ${DEFAULT_MEDIA_SETTINGS.welcomeImage}
        ELSE COALESCE(welcome_image, ${DEFAULT_MEDIA_SETTINGS.welcomeImage})
      END,
      route_image = CASE
        WHEN route_image = '/images/exhibition-route-map.jpg' THEN ''
        ELSE COALESCE(route_image, '')
      END,
      stamp_image = CASE
        WHEN stamp_image = '/images/stamp-collection-hero.jpg' THEN ${DEFAULT_MEDIA_SETTINGS.stampImage}
        ELSE COALESCE(stamp_image, ${DEFAULT_MEDIA_SETTINGS.stampImage})
      END,
      certificate_image = CASE
        WHEN (event_name IS NULL OR event_name ILIKE '%Children%Day%') AND COALESCE(certificate_image, '') = '' THEN ${DEFAULT_MEDIA_SETTINGS.certificateImage}
        ELSE COALESCE(certificate_image, '')
      END,
      completion_image = CASE
        WHEN (event_name IS NULL OR event_name ILIKE '%Children%Day%') AND COALESCE(completion_image, '') = '' THEN ${DEFAULT_MEDIA_SETTINGS.completionImage}
        ELSE COALESCE(completion_image, '')
      END,
      updated_at = NOW()
    WHERE school_name IS NULL
       OR school_name ILIKE '%St. Xavier%'
       OR event_name IS NULL
       OR event_name ILIKE '%Children%Day%'
       OR passport_image = '/images/passport-cover.jpg'
       OR welcome_image = '/images/welcome-banner.jpg'
       OR route_image = '/images/exhibition-route-map.jpg'
       OR stamp_image = '/images/stamp-collection-hero.jpg'
       OR certificate_image IS NULL
       OR completion_image IS NULL;
  `);
}

export async function ensureDbInitialized() {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase().catch((error) => {
      initializationPromise = null;
      console.error("Error initializing database tables:", error);
      throw error;
    });
  }
  await initializationPromise;
}
