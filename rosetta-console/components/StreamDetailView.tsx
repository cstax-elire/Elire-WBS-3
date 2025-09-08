"use client";
import { useState } from "react";

export default function StreamDetailView({ units, streamCode }) {
  const [data, setData] = useState(units);

  async function setObserved(unitId, role, org) {
    await fetch('/api/observed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId, role, org })
    });
    // Update local state
    setData(data.map(u => 
      u.unit_id === unitId 
        ? { ...u, observed_role: role, observed_org: org }
        : u
    ));
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{streamCode} Stream Units</h1>
      
      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4">Unit</th>
              <th className="text-left p-4">Expected</th>
              <th className="text-left p-4">Observed</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map(unit => {
              const status = !unit.observed_role ? 'Not Set' :
                unit.expected_role === unit.observed_role && 
                unit.expected_org === unit.observed_org ? 'Aligned' : 'Misattributed';
              
              return (
                <tr key={unit.unit_id} className={
                  status === 'Aligned' ? 'bg-green-50' :
                  status === 'Misattributed' ? 'bg-red-50' :
                  ''
                }>
                  <td className="p-4">
                    <div className="font-medium">{unit.code}</div>
                    <div className="text-sm text-gray-600">{unit.name}</div>
                  </td>
                  
                  <td className="p-4 font-mono text-sm">
                    {unit.expected_role}@{unit.expected_org}
                  </td>
                  
                  <td className="p-4">
                    <ObservedOwnerEdit 
                      unit={unit}
                      onSave={(role, org) => setObserved(unit.unit_id, role, org)}
                    />
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      status === 'Aligned' ? 'bg-green-200 text-green-800' :
                      status === 'Misattributed' ? 'bg-red-200 text-red-800' :
                      'bg-gray-200 text-gray-800'
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
    </div>
  );
}

// Simple inline edit - NO DROPDOWNS UNLESS CLICKED
function ObservedOwnerEdit({ unit, onSave }) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState(unit.observed_role || '');
  const [org, setOrg] = useState(unit.observed_org || '');

  if (!editing) {
    return (
      <div 
        onClick={() => setEditing(true)}
        className="cursor-pointer hover:bg-gray-100 p-1 rounded font-mono text-sm"
      >
        {unit.observed_role && unit.observed_org 
          ? `${unit.observed_role}@${unit.observed_org}`
          : <span className="text-gray-400">Click to set</span>
        }
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <input 
        className="border rounded px-2 py-1 text-sm w-32"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <input 
        className="border rounded px-2 py-1 text-sm w-32"
        placeholder="Org"
        value={org}
        onChange={(e) => setOrg(e.target.value)}
      />
      <button 
        onClick={() => {
          onSave(role, org);
          setEditing(false);
        }}
        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        Save
      </button>
    </div>
  );
}