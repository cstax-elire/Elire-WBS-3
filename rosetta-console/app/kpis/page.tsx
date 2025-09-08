import SectionHeader from "@/components/SectionHeader";
import KpiTable from "@/components/KpiTable";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function KpiPage() {
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
  return (
    <div className="grid gap-4">
      <SectionHeader title="KPI Dashboard" subtitle="Judge leaders by outcomes; manage causes via leading dials" />
      <KpiTable data={data as any[]} />
    </div>
  );
}
