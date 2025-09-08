import SectionHeader from "@/components/SectionHeader";
import TruthTable from "@/components/TruthTable";
import { query, queryWithFallback } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TruthPage({ searchParams }: { searchParams?: { stream?: string } }) {
  const primary = `SELECT * FROM v_rosetta_truth ORDER BY stream_code, unit_code;`;
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
  FROM v_misattribution_delta
  ORDER BY stream, unit_code;`;

  const data = await queryWithFallback(primary, fallback);
  const roles = await query(`SELECT code as value, name as label FROM org_role ORDER BY name;`);
  const orgs  = await query(`SELECT code as value, name as label FROM org_unit ORDER BY name;`);

  // Optionally pre-filter by stream
  let filtered = data as any[];
  const stream = searchParams?.stream;
  if (stream) filtered = filtered.filter(r => r.stream_code === stream);

  return (
    <div className="grid gap-4">
      <SectionHeader title="Truth: Expected vs Observed" subtitle="See fiction vs reality, status, and evidence counts. Set observed owner with dropdowns." />
      <TruthTable data={filtered} roles={roles as any[]} orgs={orgs as any[]} />
    </div>
  );
}
