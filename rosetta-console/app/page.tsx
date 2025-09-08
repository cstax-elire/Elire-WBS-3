import { query } from "@/lib/db";
import ValueStreamDashboard from "@/components/ValueStreamDashboard";

export default async function Dashboard() {
  const streams = await query(`
    SELECT 
      s.*,
      -- Stream-level KPIs
      (SELECT json_agg(json_build_object(
        'code', k.code,
        'name', k.name,
        'target', kt.target_value,
        'actual', km.value_numeric,
        'status', CASE 
          WHEN km.value_numeric >= kt.target_value THEN 'green'
          WHEN km.value_numeric >= kt.threshold_yellow THEN 'yellow'
          ELSE 'red'
        END
      ))
      FROM kpi k
      LEFT JOIN kpi_target kt ON kt.kpi_id = k.kpi_id AND kt.stream_id = s.stream_id
      LEFT JOIN kpi_measurement km ON km.kpi_id = k.kpi_id AND km.stream_id = s.stream_id
      WHERE k.scope = 'stream'
      ) as stream_kpis,
      
      -- Atomic units with ownership
      (SELECT json_agg(json_build_object(
        'unit_id', au.unit_id,
        'code', au.code,
        'name', au.name,
        'expected_role', er.code,
        'expected_org', eo.code,
        'observed_role', obsr.code,
        'observed_org', obso.code,
        'status', CASE
          WHEN obsr.code IS NULL THEN 'not_observed'
          WHEN er.code = obsr.code AND eo.code = obso.code THEN 'aligned'
          ELSE 'misattributed'
        END,
        'unit_kpis', (
          SELECT json_agg(json_build_object(
            'code', k2.code,
            'value', km2.value_numeric
          ))
          FROM unit_kpi uk2
          JOIN kpi k2 ON k2.kpi_id = uk2.kpi_id
          LEFT JOIN kpi_measurement km2 ON km2.kpi_id = k2.kpi_id
          WHERE uk2.unit_id = au.unit_id
        )
      ) ORDER BY au.order_in_stream)
      FROM atomic_unit au
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
      WHERE au.stream_id = s.stream_id
      ) as units
      
    FROM stream s
    WHERE s.parent_id IS NULL
    ORDER BY s.order_in_parent
  `);

  return <ValueStreamDashboard streams={streams} />;
}