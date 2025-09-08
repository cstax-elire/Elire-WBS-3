import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const { unitId, kpiCode, value } = await request.json();
  
  // Get the KPI ID
  const kpis = await query(`
    SELECT k.kpi_id 
    FROM kpi k
    JOIN unit_kpi uk ON uk.kpi_id = k.kpi_id
    WHERE uk.unit_id = $1 AND k.code = $2
  `, [unitId, kpiCode]);
  
  if (kpis.length === 0) {
    return NextResponse.json({ error: "KPI not found" }, { status: 404 });
  }
  
  const kpiId = kpis[0].kpi_id;
  
  // Insert KPI measurement
  await query(`
    INSERT INTO kpi_measurement (kpi_id, value_numeric, measured_at, measured_by)
    VALUES ($1, $2, NOW(), 'system')
  `, [kpiId, value]);
  
  // Log to evidence
  await query(`
    INSERT INTO evidence_log (
      evidence_type, occurred_at, unit_id, 
      description, metadata, created_by
    )
    VALUES (
      'kpi_measurement', NOW(), $1,
      $2 || ' updated to ' || $3,
      jsonb_build_object('kpi_code', $2, 'value', $3),
      'system'
    )
  `, [unitId, kpiCode, value]);
  
  return NextResponse.json({ success: true });
}