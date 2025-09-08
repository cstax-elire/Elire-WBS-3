"use client";
import { useState } from "react";

export default function EditablePeopleGrid({ people, roles, orgs }: any) {
  const [data, setData] = useState(people);

  async function save(personId: string, field: string, value: string) {
    await fetch('/api/person', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personId, field, value })
    });
    setData(data.map((p: any) => p.person_id === personId ? { ...p, [field]: value } : p));
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Org Unit</th>
            <th className="p-2 text-left">Billable Hours</th>
            <th className="p-2 text-left">Bill Rate</th>
            <th className="p-2 text-left">Cost Rate</th>
            <th className="p-2 text-left">Revenue</th>
            <th className="p-2 text-left">Cost</th>
            <th className="p-2 text-left">Margin</th>
          </tr>
        </thead>
        <tbody>
          {data.map((person: any) => {
            const revenue = (person.billable_hours || 0) * (person.bill_rate || 0);
            const cost = (person.billable_hours || 0) * (person.cost_rate || 0);
            const margin = revenue - cost;
            const marginPct = revenue > 0 ? Math.round(margin / revenue * 100) : 0;
            
            return (
              <tr key={person.person_id}>
                <td className="p-2">
                  <input
                    className="w-full px-1 border rounded"
                    value={person.full_name}
                    onChange={(e) => {
                      setData(data.map((p: any) => 
                        p.person_id === person.person_id ? { ...p, full_name: e.target.value } : p
                      ));
                    }}
                    onBlur={(e) => save(person.person_id, 'full_name', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <select
                    className="w-full border rounded px-1"
                    value={person.role_id || ''}
                    onChange={(e) => save(person.person_id, 'role_id', e.target.value)}
                  >
                    <option value="">-</option>
                    {roles.map((r: any) => <option key={r.role_id} value={r.role_id}>{r.name}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <select
                    className="w-full border rounded px-1"
                    value={person.org_unit_id || ''}
                    onChange={(e) => save(person.person_id, 'org_unit_id', e.target.value)}
                  >
                    <option value="">-</option>
                    {orgs.map((o: any) => <option key={o.org_unit_id} value={o.org_unit_id}>{o.name}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="w-20 px-1 border rounded"
                    value={person.billable_hours || 0}
                    onChange={(e) => {
                      setData(data.map((p: any) => 
                        p.person_id === person.person_id ? { ...p, billable_hours: Number(e.target.value) } : p
                      ));
                    }}
                    onBlur={(e) => save(person.person_id, 'billable_hours', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="w-20 px-1 border rounded"
                    value={person.bill_rate || 0}
                    onChange={(e) => {
                      setData(data.map((p: any) => 
                        p.person_id === person.person_id ? { ...p, bill_rate: Number(e.target.value) } : p
                      ));
                    }}
                    onBlur={(e) => save(person.person_id, 'bill_rate', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="w-20 px-1 border rounded"
                    value={person.cost_rate || 0}
                    onChange={(e) => {
                      setData(data.map((p: any) => 
                        p.person_id === person.person_id ? { ...p, cost_rate: Number(e.target.value) } : p
                      ));
                    }}
                    onBlur={(e) => save(person.person_id, 'cost_rate', e.target.value)}
                  />
                </td>
                <td className="p-2 text-right">${Math.round(revenue).toLocaleString()}</td>
                <td className="p-2 text-right text-red-600">${Math.round(cost).toLocaleString()}</td>
                <td className="p-2 text-right">
                  <span className={margin > 0 ? 'text-green-600' : 'text-red-600'}>
                    ${Math.round(margin).toLocaleString()} ({marginPct}%)
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}