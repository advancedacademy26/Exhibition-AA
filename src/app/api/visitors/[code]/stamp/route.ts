import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";
import { INITIAL_ZONES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function generateCertificateId(): string {
  return `SPECTRA-2026-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function extractStampCode(value: string): string {
  try {
    if (value.startsWith("http://") || value.startsWith("https://")) {
      const parsed = new URL(value);
      return parsed.searchParams.get("stamp") || parsed.searchParams.get("zone") || value;
    }
  } catch {
    // Keep the original value if it is not a valid URL.
  }
  return value;
}

export async function POST(req: Request, props: { params: Promise<{ code: string }> }) {
  try {
    await ensureDbInitialized();
    const { code } = await props.params;
    const body = await req.json();
    const rawQrInput = typeof body.qrCode === "string"
      ? body.qrCode.trim()
      : typeof body.zoneId === "string"
        ? body.zoneId.trim()
        : "";

    if (!code || !rawQrInput) {
      return NextResponse.json({ error: "Passport code and QR scan data are required." }, { status: 400 });
    }

    const stampCode = extractStampCode(rawQrInput).trim();
    const zoneResult = await db.execute(sql`
      SELECT id, zone_number as "zoneNumber", title, subtitle, category,
        location, description, secret_code as "secretCode", badge_icon as "badgeIcon",
        badge_title as "badgeTitle", highlights
      FROM exhibition_zones
      WHERE UPPER(secret_code) = UPPER(${stampCode}) OR UPPER(id) = UPPER(${stampCode})
      LIMIT 1;
    `);

    if (!zoneResult.rows?.length) {
      return NextResponse.json({ error: "Invalid Spectra station QR code. Please scan one of the six official station posters." }, { status: 400 });
    }

    const zone = zoneResult.rows[0] as {
      id: string;
      zoneNumber: number;
      title: string;
      subtitle: string;
      category: string;
      location: string;
      description: string;
      secretCode: string;
      badgeIcon: string;
      badgeTitle: string;
      highlights: string[];
    };

    const outcome = await db.transaction(async (tx) => {
      const visitorResult = await tx.execute(sql`
        SELECT id, passport_code as "passportCode", stamps_collected as "stampsCollected",
          certificate_id as "certificateId", completed_at as "completedAt"
        FROM visitors
        WHERE UPPER(passport_code) = UPPER(${code})
        LIMIT 1
        FOR UPDATE;
      `);

      if (!visitorResult.rows?.length) return { notFound: true as const };

      const visitor = visitorResult.rows[0] as {
        id: number;
        passportCode: string;
        stampsCollected: string[] | null;
        certificateId: string | null;
        completedAt: Date | string | null;
      };
      const stamps = Array.isArray(visitor.stampsCollected) ? [...visitor.stampsCollected] : [];

      if (stamps.includes(zone.id)) {
        return {
          alreadyStamped: true as const,
          stampsCollected: stamps,
          certificateId: visitor.certificateId,
          completedAt: visitor.completedAt,
        };
      }

      stamps.push(zone.id);
      const totalZones = INITIAL_ZONES.length;
      const certificateUnlocked = stamps.length >= totalZones && !visitor.certificateId;
      const certificateId = visitor.certificateId || (certificateUnlocked ? generateCertificateId() : null);
      const completedAt = certificateUnlocked ? new Date() : visitor.completedAt;

      await tx.execute(sql`
        UPDATE visitors
        SET stamps_collected = ${JSON.stringify(stamps)}::jsonb,
            certificate_id = ${certificateId},
            completed_at = ${completedAt ? new Date(completedAt) : null}
        WHERE id = ${visitor.id};
      `);

      return { alreadyStamped: false as const, stampsCollected: stamps, totalZones, certificateUnlocked, certificateId, completedAt };
    });

    if (outcome.notFound) {
      return NextResponse.json({ error: "Visitor passport not found." }, { status: 404 });
    }

    if (outcome.alreadyStamped) {
      return NextResponse.json({
        success: true,
        alreadyStamped: true,
        message: `You have already collected the ${zone.badgeTitle} stamp.`,
        zone,
        stampsCollected: outcome.stampsCollected,
        certificateId: outcome.certificateId,
        completedAt: outcome.completedAt,
      });
    }

    return NextResponse.json({
      success: true,
      alreadyStamped: false,
      isNew: true,
      zone,
      stampsCollected: outcome.stampsCollected,
      totalZones: outcome.totalZones,
      certificateUnlocked: outcome.certificateUnlocked,
      certificateId: outcome.certificateId,
      completedAt: outcome.completedAt,
      message: `Mission completed! You unlocked the ${zone.badgeTitle} stamp!`,
    });
  } catch (error) {
    console.error("Failed to process Spectra QR stamp:", error);
    return NextResponse.json({ error: "Could not process that QR scan. Please try again." }, { status: 500 });
  }
}
