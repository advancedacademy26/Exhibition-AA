import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";
import { INITIAL_ZONES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbInitialized();
    const result = await db.execute(sql`
      SELECT id, zone_number as "zoneNumber", title, subtitle, category, location, description, secret_code as "secretCode", badge_icon as "badgeIcon", badge_title as "badgeTitle", highlights
      FROM exhibition_zones
      ORDER BY zone_number ASC;
    `);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ zones: INITIAL_ZONES }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } });
    }

    return NextResponse.json({ zones: result.rows }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } });
  } catch (error) {
    console.error("Failed to fetch zones:", error);
    return NextResponse.json({ zones: INITIAL_ZONES }, { headers: { "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600" } });
  }
}
