import { query } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  unitCode: z.string().min(1),
  subject: z.string().min(1),
  type: z.string().min(1),
  system: z.string().optional(),
  notes: z.string().optional(),
  actorPerson: z.string().optional(),
  actorRole: z.string().optional(),
  actorOrg: z.string().optional()
});

export async function POST(req: Request) {
  const body = await req.json();
  const parse = schema.safeParse(body);
  if (!parse.success) return new Response(JSON.stringify(parse.error.flatten()), { status: 400 });
  const { unitCode, subject, type, system, notes, actorPerson, actorRole, actorOrg } = parse.data;

  await query(`
    INSERT INTO evidence_log (unit_id, subject_ref, evidence_type, system_ref, actor_person_id, actor_role_id, org_unit_id, notes)
    SELECT u.unit_id, $2, $3, $4, ap.person_id, ar.role_id, ao.org_unit_id, $5
    FROM atomic_unit u
    LEFT JOIN person ap ON ap.full_name = $6
    LEFT JOIN org_role ar ON ar.code = $7
    LEFT JOIN org_unit ao ON ao.code = $8
    WHERE u.code = $1
    ON CONFLICT (unit_id, subject_ref, evidence_type) DO NOTHING;
  `, [unitCode, subject, type, system ?? "UI", notes ?? "", actorPerson ?? null, actorRole ?? null, actorOrg ?? null]);

  return new Response("ok");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("latest")) {
    const data = await query(`SELECT * FROM v_observed_from_evidence ORDER BY occurred_at DESC LIMIT 200;`);
    return Response.json(data);
  }
  return new Response("ok");
}
