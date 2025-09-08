import { query } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { unitId, expectedRole, expectedOrg } = await req.json();
  await query(
    `INSERT INTO unit_expected_ownership (unit_id, accountable_role_id, accountable_org_unit_id)
     VALUES ($1, 
       (SELECT role_id FROM org_role WHERE code = $2),
       (SELECT org_unit_id FROM org_unit WHERE code = $3))
     ON CONFLICT (unit_id) 
     DO UPDATE SET 
       accountable_role_id = (SELECT role_id FROM org_role WHERE code = $2),
       accountable_org_unit_id = (SELECT org_unit_id FROM org_unit WHERE code = $3)`,
    [unitId, expectedRole, expectedOrg]
  );
  return NextResponse.json({ success: true });
}