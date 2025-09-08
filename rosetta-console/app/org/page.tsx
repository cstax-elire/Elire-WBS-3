import ComingSoon from "@/components/ComingSoon";

export default function OrgPage() {
  return (
    <ComingSoon
      title="Organization Structure"
      description="Navigate the hierarchical org structure with headcount and financial rollups"
      features={[
        "Hierarchical tree view from Pillars to People",
        "Headcount rollups at each level",
        "Direct P&L metrics by org unit",
        "Practice-level detail views",
        "Person allocation and utilization tracking",
        "Export org chart and metrics"
      ]}
    />
  );
}
