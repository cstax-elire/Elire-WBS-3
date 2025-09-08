import { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  variant?: "default" | "outline" | "success" | "warning" | "error" | "secondary" | "destructive";
  className?: string;
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
  
  const variantClasses = {
    default: "bg-brand-100 text-brand-800",
    outline: "border border-gray-300 text-gray-700",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    secondary: "bg-gray-100 text-gray-800",
    destructive: "bg-red-100 text-red-800",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
}