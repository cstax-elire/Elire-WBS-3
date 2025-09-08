import { Badge } from "./badge";

type StatusBadgeProps = {
  status?: string | null;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return <Badge variant="outline">Unknown</Badge>;

  const variants: Record<string, "success" | "error" | "warning"> = {
    "Aligned": "success",
    "Misattributed": "error",
    "Not Observed": "warning",
  };

  return (
    <Badge variant={variants[status] || "outline"}>
      {status}
    </Badge>
  );
}