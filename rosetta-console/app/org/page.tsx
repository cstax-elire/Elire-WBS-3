import SectionHeader from "@/components/SectionHeader";
import OrgTree from "@/components/OrgTree";
import { query } from "@/lib/db";

export default async function OrgPage() {
  const data = await query(`SELECT * FROM v_org_tree ORDER BY path_codes;`);
  return (
    <div className="grid gap-4">
      <SectionHeader
        title="Organization"
        subtitle="Pillars → COEs/Departments → Practices → People (direct metrics shown)"
      />
      <OrgTree data={data as any[]} />
    </div>
  );
}
