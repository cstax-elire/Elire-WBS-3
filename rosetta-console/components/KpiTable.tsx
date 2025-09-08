"use client";
import { useState } from "react";
import Button from "./Button";

type Row = {
  code: string;
  name: string;
  kind: "leading"|"lagging";
  scope: "unit"|"stream"|"firm";
  unit_of_measure?: string;
  north_star?: string;
  target_value?: number;
  threshold_yellow?: number;
  threshold_red?: number;
  value_numeric?: number;
  measured_at?: string;
};

export default function KpiTable({ data }: { data: Row[] }) {
  const [rows, setRows] = useState<Row[]>(data);
  const [pending, setPending] = useState<Record<string, number>>({});

  async function update(code: string) {
    const v = pending[code];
    if (v==null || Number.isNaN(v)) return;
    await fetch("/api/kpi", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ code, value: v })
    });
    const res = await fetch("/api/kpi?latest=1");
    const all = await res.json();
    setRows(all);
    setPending(p=>({ ...p, [code]: undefined as any }));
  }

  return (
    <div className="card">
      <div className="card-header">KPI Catalog</div>
      <div className="card-body overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-3">Code</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Kind</th>
              <th className="py-2 pr-3">Scope</th>
              <th className="py-2 pr-3">Target</th>
              <th className="py-2 pr-3">Latest</th>
              <th className="py-2 pr-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.code} className="border-b last:border-0">
                <td className="py-2 pr-3 font-mono">{r.code}</td>
                <td className="py-2 pr-3">{r.name}</td>
                <td className="py-2 pr-3">{r.kind}</td>
                <td className="py-2 pr-3">{r.scope}</td>
                <td className="py-2 pr-3">{r.target_value ?? "—"}</td>
                <td className="py-2 pr-3">{r.value_numeric ?? "—"} {r.measured_at ? `(${new Date(r.measured_at).toLocaleDateString()})` : ""}</td>
                <td className="py-2 pr-3">
                  <div className="flex items-center gap-2">
                    <input type="number" className="border rounded px-2 py-1 w-28"
                      placeholder="new value"
                      value={pending[r.code] ?? ""}
                      onChange={(e)=>setPending(p=>({...p, [r.code]: parseFloat(e.target.value)}))}
                    />
                    <Button onClick={()=>update(r.code)}>Save</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
