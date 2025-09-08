import { query, queryWithFallback } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const unitCode = searchParams.get("unitCode");
  if (!unitCode) return new Response("unitCode required", { status: 400 });

  const primary = `SELECT * FROM v_rosetta_truth WHERE unit_code=$1;`;
  const fallback = `SELECT
    stream        AS stream_code,
    unit_code,
    unit_name,
    expected_role AS expected_role,
    expected_org  AS expected_org,
    observed_role AS observed_role,
    observed_org  AS observed_org,
    attribution_status AS status,
    NULL::int as evidence_count,
    NULL::timestamp as last_evidence_at
  FROM v_misattribution_delta WHERE unit_code=$1;`;

  const rows = await queryWithFallback(primary, fallback, [unitCode]);
  if (!rows.length) return new Response("Not found", { status: 404 });
  return Response.json(rows[0]);
}
