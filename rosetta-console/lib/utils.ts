import { clsx } from "clsx";

export function cn(...inputs: any[]) {
  return clsx(inputs);
}

export function statusClass(status?: string) {
  if (!status) return "badge badge-yellow";
  switch (status) {
    case "Aligned": return "badge badge-green";
    case "Misattributed":
    case "Role Mismatch":
    case "Org Mismatch": return "badge badge-red";
    case "Not Observed": return "badge badge-yellow";
    default: return "badge badge-yellow";
  }
}
