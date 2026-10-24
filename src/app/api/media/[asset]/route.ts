import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export const dynamic = "force-dynamic";

const MEDIA_COLUMNS: Record<string, { column: string; query: "passport" | "welcome" | "route" | "stamp" | "certificate" | "completion" }> = {
  passport: { column: "passport_image", query: "passport" },
  welcome: { column: "welcome_image", query: "welcome" },
  route: { column: "route_image", query: "route" },
  stamp: { column: "stamp_image", query: "stamp" },
  certificate: { column: "certificate_image", query: "certificate" },
  completion: { column: "completion_image", query: "completion" },
};

export async function GET(
  request: Request,
  props: { params: Promise<{ asset: string }> },
) {
  try {
    await ensureDbInitialized();
    const { asset } = await props.params;
    if (!Object.hasOwn(MEDIA_COLUMNS, asset)) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    let result;
    switch (asset) {
      case "passport":
        result = await db.execute(sql`SELECT passport_image as source, updated_at as "updatedAt" FROM app_custom_media ORDER BY id DESC LIMIT 1;`);
        break;
      case "welcome":
        result = await db.execute(sql`SELECT welcome_image as source, updated_at as "updatedAt" FROM app_custom_media ORDER BY id DESC LIMIT 1;`);
        break;
      case "route":
        result = await db.execute(sql`SELECT route_image as source, updated_at as "updatedAt" FROM app_custom_media ORDER BY id DESC LIMIT 1;`);
        break;
      case "stamp":
        result = await db.execute(sql`SELECT stamp_image as source, updated_at as "updatedAt" FROM app_custom_media ORDER BY id DESC LIMIT 1;`);
        break;
      case "certificate":
        result = await db.execute(sql`SELECT certificate_image as source, updated_at as "updatedAt" FROM app_custom_media ORDER BY id DESC LIMIT 1;`);
        break;
      default:
        result = await db.execute(sql`SELECT completion_image as source, updated_at as "updatedAt" FROM app_custom_media ORDER BY id DESC LIMIT 1;`);
        break;
    }

    const row = result.rows?.[0] as { source?: string | null; updatedAt?: Date | string | null } | undefined;
    const match = row?.source?.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([\s\S]+)$/i);
    if (!match) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    const imageBytes = Buffer.from(match[2], "base64");
    const version = row?.updatedAt ? new Date(row.updatedAt).getTime() : 0;
    const etag = `"${asset}-${version}-${imageBytes.length}"`;
    const headers = new Headers({
      "Content-Type": match[1].toLowerCase() === "image/jpg" ? "image/jpeg" : match[1].toLowerCase(),
      "Content-Length": String(imageBytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      ETag: etag,
      "X-Content-Type-Options": "nosniff",
    });

    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers });
    }
    return new Response(imageBytes, { headers });
  } catch (error) {
    console.error("Failed to serve custom media:", error);
    return NextResponse.json({ error: "Image unavailable" }, { status: 500 });
  }
}
