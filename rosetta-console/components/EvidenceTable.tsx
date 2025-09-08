"use client";
import { useState } from "react";
import Button from "./Button";
import Select from "./Select";

type Row = {
  unit_code: string;
  unit_name: string;
  evidence_type: string;
  system_ref?: string;
  actor?: string;
  actor_role?: string;
  actor_org?: string;
  occurred_at?: string;
  notes?: string;
};

export default function EvidenceTable({ data, unitOptions, typeOptions, orgOptions }:
  { data: Row[]; unitOptions: {value:string; label:string}[]; typeOptions: {value:string; label:string}[]; orgOptions: {value:string; label:string}[]; }) {

  const [rows, setRows] = useState<Row[]>(data);
  const [form, setForm] = useState<any>({ unitCode: "", subject: "", type: "", system: "UI", notes: "", actorPerson: "", actorRole: "", actorOrg: "" });

  async function addEvidence() {
    if (!form.unitCode || !form.subject || !form.type) { alert("Unit, subject and type are required."); return; }
    await fetch("/api/evidence", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(form)
    });
    // refresh evidence after insert
    const res = await fetch("/api/evidence?latest=1");
    const latest = await res.json();
    setRows(latest);
    setForm({ unitCode: "", subject: "", type: "", system: "UI", notes: "", actorPerson: "", actorRole: "", actorOrg: "" });
  }

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="card-header">Recent Evidence</div>
        <div className="card-body overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="py-2 pr-3">Unit</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3">Actor</th>
                <th className="py-2 pr-3">Org</th>
                <th className="py-2 pr-3">When</th>
                <th className="py-2 pr-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-3">{r.unit_code} — <span className="text-gray-600">{r.unit_name}</span></td>
                  <td className="py-2 pr-3">{r.evidence_type}</td>
                  <td className="py-2 pr-3">{r.actor || "—"} <span className="text-gray-500">({r.actor_role || "?"})</span></td>
                  <td className="py-2 pr-3">{r.actor_org || "—"}</td>
                  <td className="py-2 pr-3">{r.occurred_at ? new Date(r.occurred_at).toLocaleString() : "—"}</td>
                  <td className="py-2 pr-3">{r.notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Add Evidence</div>
        <div className="card-body grid md:grid-cols-3 gap-3">
          <Select placeholder="Unit" options={unitOptions} onChange={(v)=>setForm({...form, unitCode:v})} />
          <input className="border rounded px-2 py-2" placeholder="Subject Ref (e.g., Opp-123)" value={form.subject} onChange={(e)=>setForm({...form, subject:e.target.value})} />
          <Select placeholder="Type" options={typeOptions} onChange={(v)=>setForm({...form, type:v})} />
          <input className="border rounded px-2 py-2 md:col-span-3" placeholder="Notes" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          <input className="border rounded px-2 py-2" placeholder="Actor (name)" value={form.actorPerson} onChange={(e)=>setForm({...form, actorPerson:e.target.value})} />
          <input className="border rounded px-2 py-2" placeholder="Actor Role Code" value={form.actorRole} onChange={(e)=>setForm({...form, actorRole:e.target.value})} />
          <Select placeholder="Actor Org" options={orgOptions} onChange={(v)=>setForm({...form, actorOrg:v})} />
          <div className="md:col-span-3">
            <Button onClick={addEvidence}>Save Evidence</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
