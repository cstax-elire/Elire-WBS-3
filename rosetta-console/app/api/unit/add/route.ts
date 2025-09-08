import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: Request) {
  const { streamId, code, name, description } = await request.json();
  
  // Get the next order in stream
  const maxOrder = await query(`
    SELECT COALESCE(MAX(order_in_stream), 0) as max_order
    FROM atomic_unit
    WHERE stream_id = $1
  `, [streamId]);
  
  const nextOrder = maxOrder[0].max_order + 1;
  
  // Insert new unit
  const result = await query(`
    INSERT INTO atomic_unit (stream_id, code, name, description, order_in_stream)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING unit_id
  `, [streamId, code, name, description, nextOrder]);
  
  // Log to evidence
  await query(`
    INSERT INTO evidence_log (
      evidence_type, occurred_at, unit_id, 
      description, metadata, created_by
    )
    VALUES (
      'other', NOW(), $1,
      'Unit created: ' || $2,
      jsonb_build_object('code', $2, 'name', $3),
      'system'
    )
  `, [result[0].unit_id, code, name]);
  
  return NextResponse.json({ success: true, unitId: result[0].unit_id });
}