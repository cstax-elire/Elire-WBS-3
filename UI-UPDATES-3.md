// app/stream/[code]/page.tsx
export default async function StreamPage({ params }) {
  const units = await query(`
    SELECT au.*, 
           er.code as expected_role, eo.code as expected_org,
           or.code as observed_role, oo.code as observed_org
    FROM atomic_unit au
    JOIN stream s ON s.stream_id = au.stream_id
    LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
    LEFT JOIN org_role er ON er.role_id = ueo.accountable_role_id
    LEFT JOIN org_unit eo ON eo.org_unit_id = ueo.accountable_org_unit_id
    LEFT JOIN LATERAL (
      SELECT * FROM unit_observed_ownership 
      WHERE unit_id = au.unit_id 
      ORDER BY observed_as_of DESC LIMIT 1
    ) obs ON true
    LEFT JOIN org_role or ON or.role_id = obs.accountable_role_id
    LEFT JOIN org_unit oo ON oo.org_unit_id = obs.accountable_org_unit_id
    WHERE s.code = $1
    ORDER BY au.order_in_stream
  `, [params.code]);

  return <StreamDetailView units={units} streamCode={params.code} />;
}

// components/StreamDetailView.tsx
"use client";
export default function StreamDetailView({ units, streamCode }) {
  const [data, setData] = useState(units);

  async function setObserved(unitId, role, org) {
    await fetch('/api/observed', {
      method: 'POST',
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