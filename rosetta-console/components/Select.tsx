"use client";
import { useId } from "react";

type Opt = { value: string; label: string; };
export default function Select({ label, value, onChange, options, placeholder }:
  { label?: string; value?: string; onChange: (v: string) => void; options: Opt[]; placeholder?: string; }) {
  const id = useId();
  return (
    <div className="flex flex-col">
      {label && <label htmlFor={id} className="text-sm text-gray-600 mb-1">{label}</label>}
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}
        className="border rounded px-2 py-2 bg-white">
        <option value="">{placeholder || "Select..."}</option>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
