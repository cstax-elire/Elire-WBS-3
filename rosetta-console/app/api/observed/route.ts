import { query } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  unitCode: z.string().min(1),
  roleCode: z.string().min(1),
  orgCode: z.string().min(1),
  notes: z.string().optional(),
  actorPerson: z.string().optional(),
  actorRole: z.string().optional()
});

export async function POST(req: Request) {
  const body = await req.json();
  const parse = schema.safeParse(body);
  if (!parse.success) return new Response(JSON.stringify(parse.error.flatten()), { status: 400 });
  const { unitCode, roleCode, orgCode, notes, actorPerson, actorRole } = parse.data;

  // 1) Insert observed ownership (append-only; latest wins)
  await query(`
    INSERT INTO unit_observed_ownership
      (unit_id, observed_as_of, accountable_role_id, accountable_org_unit_id, source, confidence_pct, notes)
    SELECT u.unit_id, now(), r.role_id, o.org_unit_id, 'UI', 1.00, $4
    FROM atomic_unit u, org_role r, org_unit o
    WHERE u.code=$1 AND r.code=$2 AND o.code=$3;
  `, [unitCode, roleCode, orgCode, notes ?? ""]);

  // 2) Auto-log evidence (natural key guard requires ux_evidence_natural index from SQL patch)
  await query(`
    INSERT INTO evidence_log (unit_id, subject_ref, evidence_type, system_ref, actor_person_id, actor_role_id, org_unit_id, notes)
    SELECT u.unit_id, 'ownership_update', 'ownership_update', 'UI', ap.person_id, ar.role_id, o.org_unit_id,
           CONCAT('Observed owner set to ', $2, '@', $3)
    FROM atomic_unit u
    LEFT JOIN person ap ON ap.full_name = $5
    LEFT JOIN org_role ar ON ar.code = $6
    JOIN org_unit o ON o.code = $3
    WHERE u.code=$1
    ON CONFLICT (unit_id, subject_ref, evidence_type) DO NOTHING;
  `, [unitCode, roleCode, orgCode, actorPerson ?? null, actorRole ?? null]);

  return new Response("ok");
}
