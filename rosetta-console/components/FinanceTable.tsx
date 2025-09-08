"use client";
import { useState } from "react";

type Row = { org_unit: string; category: string; amount_2025: number };

export default function FinanceTable({ direct, allocated }: { direct: Row[]; allocated: Row[] }) {
  const [tab, setTab] = useState<"direct"|"allocated">("direct");
  const rows = tab==="direct" ? direct : allocated;
  const totals = rows.reduce((acc, r) => acc + (r.amount_2025 || 0), 0);

  return (
    <div className="card">
      <div className="card-header flex items-center gap-3">
        <button onClick={()=>setTab("direct")} className={tab==="direct"?"font-semibold":""}>Direct</button>
        <span className="text-gray-400">|</span>
        <button onClick={()=>setTab("allocated")} className={tab==="allocated"?"font-semibold":""}>Allocated (with SG&A)</button>
      </div>
      <div className="card-body overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-3">Org Unit</th>
              <th className="py-2 pr-3">Category</th>
              <th className="py-2 pr-3">Amount (2025)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2 pr-3">{r.org_unit}</td>
                <td className="py-2 pr-3">{r.category}</td>
                <td className="py-2 pr-3">${Math.round(r.amount_2025).toLocaleString()}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-2 pr-3">Total</td>
              <td className="py-2 pr-3">—</td>
              <td className="py-2 pr-3">${Math.round(totals).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
