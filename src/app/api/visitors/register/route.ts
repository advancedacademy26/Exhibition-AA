import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { ensureDbInitialized } from "@/lib/db-init";

export const dynamic = "force-dynamic";
const VALID_CLASSES = new Set(Array.from({ length: 7 }, (_, index) => `Class ${index + 6}`));
const VALID_SECTIONS = new Set(["A", "B", "C", "D", "E", "F"]);

function textValue(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function generatePassportCode(): string {
  return `SP-${randomBytes(5).toString("hex").toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    await ensureDbInitialized();
    const body = await req.json();
    const visitorName = textValue(body.name, 120);
    const studentName = textValue(body.studentName, 120) || null;
    const classGrade = textValue(body.classGrade, 40);
    const section = textValue(body.section, 16).toUpperCase();
    const relation = textValue(body.relation, 60) || "Parent / Visitor";
    const phone = textValue(body.phone, 40) || null;

    if (!visitorName) return NextResponse.json({ error: "Your visitor name is required." }, { status: 400 });
    if (!VALID_CLASSES.has(classGrade)) return NextResponse.json({ error: "Please choose a class from 6 to 12." }, { status: 400 });
    if (!VALID_SECTIONS.has(section)) return NextResponse.json({ error: "Please choose a section from A to F." }, { status: 400 });

    const result = await db.execute(sql`
      INSERT INTO visitors (
        passport_code, name, student_name, class_grade, section, relation, phone, stamps_collected
      ) VALUES (
        ${generatePassportCode()}, ${visitorName}, ${studentName}, ${classGrade}, ${section},
        ${relation}, ${phone}, '[]'::jsonb
      )
      RETURNING
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
        avatar_url as "avatarUrl";
    `);

    return NextResponse.json({ success: true, visitor: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Failed to register Spectra visitor:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
