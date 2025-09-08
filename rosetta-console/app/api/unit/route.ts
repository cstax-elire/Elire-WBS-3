import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { unitId, field, value } = await req.json();
  await query(
    `UPDATE atomic_unit SET ${field} = $1 WHERE unit_id = $2`,
    [value, unitId]
  );
  return NextResponse.json({ success: true });
}