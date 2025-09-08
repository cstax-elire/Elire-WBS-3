import SectionHeader from "@/components/SectionHeader";
import EvidenceTable from "@/components/EvidenceTable";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EvidencePage() {
  const data = await query(`
    SELECT * FROM v_observed_from_evidence ORDER BY occurred_at DESC LIMIT 200;
  `);
  const unitOptions = await query(`SELECT code as value, CONCAT(code,' — ',name) as label FROM atomic_unit ORDER BY code;`);
  const typeOptions = [
    { value:"kpi_measurement", label:"kpi_measurement" },
    { value:"ownership_update", label:"ownership_update" },
    { value:"pricing_decision", label:"pricing_decision" },
    { value:"proposal_redline", label:"proposal_redline" },
    { value:"recruit_req", label:"recruit_req" },
    { value:"change_order", label:"change_order" },
    { value:"handoff_check", label:"handoff_check" },
    { value:"invoice_error", label:"invoice_error" },
    { value:"other", label:"other" }
  ];
  const orgOptions = await query(`SELECT code as value, name as label FROM org_unit ORDER BY name;`);

  return (
    <div className="grid gap-4">
      <SectionHeader title="Evidence" subtitle="Small, high-value proof that ties ownership and decisions to outcomes" />
      <EvidenceTable data={data as any[]} unitOptions={unitOptions as any[]} typeOptions={typeOptions as any[]} orgOptions={orgOptions as any[]} />
    </div>
  );
}
