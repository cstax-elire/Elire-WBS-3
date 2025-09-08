import { query } from "@/lib/db";
import StreamDetailView from "@/components/StreamDetailView";

export default async function StreamPage({ params }) {
  const units = await query(`
    SELECT au.*, 
           er.code as expected_role, eo.code as expected_org,
           obsr.code as observed_role, obso.code as observed_org
    FROM atomic_unit au
    JOIN stream s ON s.stream_id = au.stream_id
    LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
    LEFT JOIN org_role er ON er.role_id = ueo.accountable_role_id
    LEFT JOIN org_unit eo ON eo.org_unit_id = ueo.accountable_org_unit_id
    LEFT JOIN LATERAL (
      SELECT * FROM unit_observed_ownership 
      WHERE unit_id = au.unit_id 
      ORDER BY observed_as_of DESC LIMIT 1
    ) obs ON true
    LEFT JOIN org_role obsr ON obsr.role_id = obs.accountable_role_id
    LEFT JOIN org_unit obso ON obso.org_unit_id = obs.accountable_org_unit_id
    WHERE s.code = $1
    ORDER BY au.order_in_stream
  `, [params.code]);

  return <StreamDetailView units={units} streamCode={params.code} />;
}