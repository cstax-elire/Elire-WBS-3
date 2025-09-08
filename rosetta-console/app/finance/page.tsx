import SectionHeader from "@/components/SectionHeader";
import FinanceTable from "@/components/FinanceTable";
import { query } from "@/lib/db";

export default async function FinancePage() {
  const direct = await query(`SELECT * FROM v_financial_rollup ORDER BY org_unit, category;`);
  let allocated: any[] = [];
  try {
    allocated = await query(`SELECT * FROM v_financial_rollup_with_sga ORDER BY org_unit, category;`);
  } catch {
    allocated = direct;
  }

  return (
    <div className="grid gap-4">
      <SectionHeader title="Finance" subtitle="Direct vs Allocated SG&A view (firm reconciles: sources negative, targets positive)" />
      <FinanceTable direct={direct as any[]} allocated={allocated as any[]} />
    </div>
  );
}
