import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  props: { params: Promise<{ code: string }> }
) {
  try {
    await ensureDbInitialized();
    const { code } = await props.params;

    if (!code) {
      return NextResponse.json({ error: "Passport code is required" }, { status: 400 });
    }

    const result = await db.execute(sql`
      SELECT 
        id,
        passport_code as "passportCode",
        name,
        student_name as "studentName",
        class_grade as "classGrade",
        section,
        relation,
        phone,
        stamps_collected as "stampsCollected",
        certificate_id as "certificateId",
        completed_at as "completedAt",
        created_at as "createdAt",
        avatar_url as "avatarUrl"
      FROM visitors
      WHERE UPPER(passport_code) = UPPER(${code})
      LIMIT 1;
    `);

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json({ error: "Visitor not found" }, { status: 404 });
    }

    return NextResponse.json({ visitor: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch visitor:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
