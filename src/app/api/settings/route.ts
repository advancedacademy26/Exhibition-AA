import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";
import { DEFAULT_MEDIA_SETTINGS } from "@/lib/constants";
import { AppCustomMediaSettings } from "@/lib/types";

export const dynamic = "force-dynamic";
const MAX_IMAGE_SOURCE_LENGTH = 3_000_000;
const MEDIA_ROUTE_KEYS: Record<keyof Pick<AppCustomMediaSettings, "passportImage" | "welcomeImage" | "routeImage" | "stampImage" | "certificateImage" | "completionImage">, string> = {
  passportImage: "passport",
  welcomeImage: "welcome",
  routeImage: "route",
  stampImage: "stamp",
  certificateImage: "certificate",
  completionImage: "completion",
};

type MediaRow = AppCustomMediaSettings & { updatedAt?: Date | string | null };

function validateImageSource(value: unknown, field: string): string {
  if (typeof value !== "string") return "";
  const source = value.trim();
  if (source.length > MAX_IMAGE_SOURCE_LENGTH) throw new Error(`${field} is too large. Choose a smaller image.`);
  if (!source) return "";
  if (source.startsWith("/") || /^https?:\/\//i.test(source) || /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(source)) return source;
  throw new Error(`${field} must be an image URL or an uploaded image.`);
}

function exposeSettings(row: MediaRow): AppCustomMediaSettings {
  const version = row.updatedAt ? new Date(row.updatedAt).getTime() : Date.now();
  const output = { ...DEFAULT_MEDIA_SETTINGS, ...row } as AppCustomMediaSettings;
  for (const key of Object.keys(MEDIA_ROUTE_KEYS) as Array<keyof typeof MEDIA_ROUTE_KEYS>) {
    const source = output[key];
    if (source.startsWith("data:image/")) {
      output[key] = `/api/media/${MEDIA_ROUTE_KEYS[key]}?v=${version}`;
    }
  }
  return output;
}

export async function GET() {
  try {
    await ensureDbInitialized();
    const result = await db.execute(sql`
      SELECT
        school_name as "schoolName", event_name as "eventName",
        passport_image as "passportImage", welcome_image as "welcomeImage",
        route_image as "routeImage", stamp_image as "stampImage",
        certificate_image as "certificateImage", completion_image as "completionImage",
        updated_at as "updatedAt"
      FROM app_custom_media ORDER BY id DESC LIMIT 1;
    `);
    const row = result.rows?.[0] as unknown as MediaRow | undefined;
    return NextResponse.json({ settings: row ? exposeSettings(row) : DEFAULT_MEDIA_SETTINGS }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } });
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return NextResponse.json({ settings: DEFAULT_MEDIA_SETTINGS });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const body = await req.json();
    const settings: AppCustomMediaSettings = {
      schoolName: typeof body.schoolName === "string" ? body.schoolName.trim().slice(0, 160) : DEFAULT_MEDIA_SETTINGS.schoolName,
      eventName: typeof body.eventName === "string" ? body.eventName.trim().slice(0, 200) : DEFAULT_MEDIA_SETTINGS.eventName,
      passportImage: validateImageSource(body.passportImage, "Passport image"),
      welcomeImage: validateImageSource(body.welcomeImage, "Welcome image"),
      routeImage: validateImageSource(body.routeImage, "Route map"),
      stampImage: validateImageSource(body.stampImage, "Stamp sheet"),
      certificateImage: validateImageSource(body.certificateImage, "Certificate template"),
      completionImage: validateImageSource(body.completionImage, "Route-complete image"),
    };

    const existingResult = await db.execute(sql`
      SELECT passport_image as "passportImage", welcome_image as "welcomeImage",
        route_image as "routeImage", stamp_image as "stampImage",
        certificate_image as "certificateImage", completion_image as "completionImage"
      FROM app_custom_media ORDER BY id DESC LIMIT 1;
    `);
    const existing = existingResult.rows?.[0] as unknown as Partial<AppCustomMediaSettings> | undefined;
    const stored = { ...settings };
    for (const key of Object.keys(MEDIA_ROUTE_KEYS) as Array<keyof typeof MEDIA_ROUTE_KEYS>) {
      if (settings[key].startsWith(`/api/media/${MEDIA_ROUTE_KEYS[key]}`) && existing?.[key]) {
        stored[key] = existing[key] as string;
      }
    }

    const updated = await db.execute(sql`
      UPDATE app_custom_media
      SET school_name = ${stored.schoolName || DEFAULT_MEDIA_SETTINGS.schoolName},
          event_name = ${stored.eventName || DEFAULT_MEDIA_SETTINGS.eventName},
          passport_image = ${stored.passportImage},
          welcome_image = ${stored.welcomeImage},
          route_image = ${stored.routeImage},
          stamp_image = ${stored.stampImage},
          certificate_image = ${stored.certificateImage},
          completion_image = ${stored.completionImage},
          updated_at = NOW()
      RETURNING updated_at as "updatedAt";
    `);

    const row = { ...stored, updatedAt: updated.rows?.[0]?.updatedAt } as MediaRow;
    return NextResponse.json({ success: true, settings: exposeSettings(row) });
  } catch (error) {
    console.error("Failed to update settings:", error);
    const message = error instanceof Error ? error.message : "Failed to update settings.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
