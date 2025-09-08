import { query } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  value: z.number()
});

export async function POST(req: Request) {
  const body = await req.json();
  const parse = schema.safeParse(body);
  if (!parse.success) return new Response(JSON.stringify(parse.error.flatten()), { status: 400 });
  const { code, value } = parse.data;

  // 1) Insert measurement
  await query(`
    INSERT INTO kpi_measurement (kpi_id, measured_at, value_numeric, source)
    SELECT k.kpi_id, CURRENT_DATE, $2, 'UI'
    FROM kpi k WHERE k.code=$1;
  `, [code, value]);

  // 2) Auto-evidence (unit-scoped if linked; else firm/stream note)
  await query(`
    INSERT INTO evidence_log (unit_id, subject_ref, evidence_type, system_ref, notes)
    SELECT uk.unit_id, $1, 'kpi_measurement', 'UI', CONCAT('KPI ', k.code, ' measured at ', $2)
    FROM kpi k JOIN unit_kpi uk ON uk.kpi_id=k.kpi_id
    WHERE k.code=$1
    UNION ALL
    SELECT NULL, $1, 'kpi_measurement', 'UI', CONCAT('Firm/stream KPI ', k.code, ' measured at ', $2)
    FROM kpi k
    WHERE k.code=$1
      AND NOT EXISTS (SELECT 1 FROM unit_kpi uk WHERE uk.kpi_id=k.kpi_id);
  `, [code, value]);

  return new Response("ok");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("latest")) {
    const data = await query(`
      SELECT k.code, k.name, k.kind, k.scope, k.unit_of_measure, k.north_star,
             t.target_value, t.threshold_yellow, t.threshold_red,
             m.value_numeric, m.measured_at
      FROM kpi k
      LEFT JOIN kpi_target t ON t.kpi_id=k.kpi_id AND t.valid_to IS NULL
      LEFT JOIN LATERAL (
        SELECT km.value_numeric, km.measured_at
        FROM kpi_measurement km
        WHERE km.kpi_id=k.kpi_id
        ORDER BY measured_at DESC
        LIMIT 1
      ) m ON TRUE
      ORDER BY k.scope, k.code;
    `);
    return Response.json(data);
  }
  return new Response("ok");
}
