import { statusClass } from "@/lib/utils";

export default function StatusChip({ status }: { status?: string }) {
  return <span className={statusClass(status)}>{status || "Unknown"}</span>;
}
