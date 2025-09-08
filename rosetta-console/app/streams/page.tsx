import SectionHeader from "@/components/SectionHeader";
import StreamTree from "@/components/StreamTree";
import { query } from "@/lib/db";

export default async function StreamsPage() {
  const data = await query(`SELECT * FROM v_stream_tree ORDER BY path_codes;`);
  return (
    <div className="grid gap-4">
      <SectionHeader title="Value Streams" subtitle="Navigate customer-facing and enabler streams and their unit counts" />
      <StreamTree data={data as any[]} />
    </div>
  );
}
