"use client";
import { useState } from "react";

export default function EditableOwnershipGrid({ units, roles, orgs }: any) {
  const [data, setData] = useState(units);
  const [editing, setEditing] = useState<Record<string, boolean>>({});

  async function save(unitId: string, field: string, value: string) {
    // Save to database
    if (field === 'observed_role' || field === 'observed_org') {
      await fetch('/api/ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          unitId, 
          observedRole: field === 'observed_role' ? value : data.find((d: any) => d.unit_id === unitId).observed_role,
          observedOrg: field === 'observed_org' ? value : data.find((d: any) => d.unit_id === unitId).observed_org
        })
      });
    } else if (field === 'expected_role' || field === 'expected_org') {
      await fetch('/api/expected', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          unitId,
          expectedRole: field === 'expected_role' ? value : data.find((d: any) => d.unit_id === unitId).expected_role,
          expectedOrg: field === 'expected_org' ? value : data.find((d: any) => d.unit_id === unitId).expected_org
        })
      });
    } else if (field === 'description' || field === 'name') {
      await fetch('/api/unit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, field, value })
      });
    }

    // Update local state
    setData(data.map((d: any) => d.unit_id === unitId ? { ...d, [field]: value } : d));
    setEditing({ ...editing, [`${unitId}-${field}`]: false });
  }

  function getStatus(row: any) {
    if (!row.observed_role) return 'Not Observed';
    if (row.expected_role === row.observed_role && row.expected_org === row.observed_org) return 'Aligned';
    return 'Misattributed';
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Unit Code</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Description</th>
            <th className="p-2 text-left">Stream</th>
            <th className="p-2 text-left">Expected</th>
            <th className="p-2 text-left">Observed</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any) => {
            const status = getStatus(row);
            return (
              <tr key={row.unit_id} className={
                status === 'Aligned' ? 'bg-green-50' :
                status === 'Misattributed' ? 'bg-red-50' :
                'bg-yellow-50'
              }>
                <td className="p-2 font-mono">{row.code}</td>
                
                <td className="p-2">
                  {editing[`${row.unit_id}-name`] ? (
                    <input
                      className="w-full px-1 border rounded"
                      defaultValue={row.name}
                      onBlur={(e) => save(row.unit_id, 'name', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && save(row.unit_id, 'name', (e.target as HTMLInputElement).value)}
                      autoFocus
                    />
                  ) : (
                    <div onClick={() => setEditing({ ...editing, [`${row.unit_id}-name`]: true })}>
                      {row.name || <span className="text-gray-400">Click to edit</span>}
                    </div>
                  )}
                </td>

                <td className="p-2">
                  {editing[`${row.unit_id}-description`] ? (
                    <textarea
                      className="w-full px-1 border rounded"
                      defaultValue={row.description}
                      onBlur={(e) => save(row.unit_id, 'description', e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <div onClick={() => setEditing({ ...editing, [`${row.unit_id}-description`]: true })}>
                      {row.description || <span className="text-gray-400">Click to edit</span>}
                    </div>
                  )}
                </td>

                <td className="p-2">{row.stream_code}</td>

                <td className="p-2">
                  <div className="flex gap-1">
                    <select
                      className="text-xs border rounded px-1"
                      value={row.expected_role || ''}
                      onChange={(e) => save(row.unit_id, 'expected_role', e.target.value)}
                    >
                      <option value="">-</option>
                      {roles.map((r: any) => <option key={r.code} value={r.code}>{r.code}</option>)}
                    </select>
                    @
                    <select
                      className="text-xs border rounded px-1"
                      value={row.expected_org || ''}
                      onChange={(e) => save(row.unit_id, 'expected_org', e.target.value)}
                    >
                      <option value="">-</option>
                      {orgs.map((o: any) => <option key={o.code} value={o.code}>{o.code}</option>)}
                    </select>
                  </div>
                </td>

                <td className="p-2">
                  <div className="flex gap-1">
                    <select
                      className="text-xs border rounded px-1"
                      value={row.observed_role || ''}
                      onChange={(e) => save(row.unit_id, 'observed_role', e.target.value)}
                    >
                      <option value="">-</option>
                      {roles.map((r: any) => <option key={r.code} value={r.code}>{r.code}</option>)}
                    </select>
                    @
                    <select
                      className="text-xs border rounded px-1"
                      value={row.observed_org || ''}
                      onChange={(e) => save(row.unit_id, 'observed_org', e.target.value)}
                    >
                      <option value="">-</option>
                      {orgs.map((o: any) => <option key={o.code} value={o.code}>{o.code}</option>)}
                    </select>
                  </div>
                </td>

                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    status === 'Aligned' ? 'bg-green-200 text-green-800' :
                    status === 'Misattributed' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {status}
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