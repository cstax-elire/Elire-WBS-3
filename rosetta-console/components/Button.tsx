"use client";
import { cn } from "@/lib/utils";

export default function Button({ children, onClick, variant="primary", disabled=false }:
  { children: React.ReactNode; onClick?: () => void; variant?: "primary"|"ghost"; disabled?: boolean; }) {
  return (
    <button disabled={disabled} onClick={onClick}
      className={cn("rounded px-3 py-2 text-sm font-medium",
        variant==="primary" ? "bg-brand-600 text-white hover:bg-brand-700" : "bg-white border border-gray-300 hover:bg-gray-50",
        disabled && "opacity-60 cursor-not-allowed"
      )}>
      {children}
    </button>
  );
}
