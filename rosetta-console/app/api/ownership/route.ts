import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { unitId, observedRole, observedOrg } = await req.json();
  
  await query(
    `INSERT INTO unit_observed_ownership (unit_id, accountable_role_id, accountable_org_unit_id, observed_as_of)
     VALUES ($1, 
       (SELECT role_id FROM org_role WHERE code = $2),
       (SELECT org_unit_id FROM org_unit WHERE code = $3),
       NOW())`,
    [unitId, observedRole, observedOrg]
  );
  
  // Also log to evidence
  await query(
    `INSERT INTO evidence_log (event_type, entity_id, details, user_id, created_at)
     VALUES ('ownership_update', $1, 
       jsonb_build_object('role', $2, 'org', $3, 'type', 'observed'),
       'system', NOW())`,
    [unitId, observedRole, observedOrg]
  );
  
  return NextResponse.json({ success: true });
}