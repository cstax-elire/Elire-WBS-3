import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const { unitId } = await request.json();
  
  // Get unit info before deletion
  const unitInfo = await query(`
    SELECT code, name FROM atomic_unit WHERE unit_id = $1
  `, [unitId]);
  
  if (unitInfo.length === 0) {
    return NextResponse.json({ error: "Unit not found" }, { status: 404 });
  }
  
  // Log to evidence before deletion
  await query(`
    INSERT INTO evidence_log (
      evidence_type, occurred_at, unit_id, 
      description, metadata, created_by
    )
    VALUES (
      'other', NOW(), $1,
      'Unit deleted: ' || $2,
      jsonb_build_object('code', $2, 'name', $3),
      'system'
    )
  `, [unitId, unitInfo[0].code, unitInfo[0].name]);
  
  // Delete related records first
  await query(`DELETE FROM unit_kpi WHERE unit_id = $1`, [unitId]);
  await query(`DELETE FROM unit_expected_ownership WHERE unit_id = $1`, [unitId]);
  await query(`DELETE FROM unit_observed_ownership WHERE unit_id = $1`, [unitId]);
  
  // Delete the unit
  await query(`DELETE FROM atomic_unit WHERE unit_id = $1`, [unitId]);
  
  return NextResponse.json({ success: true });
}