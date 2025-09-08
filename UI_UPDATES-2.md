You're right - I completely missed the point. The **VALUE STREAM is the core organizing principle**, not random tables. Let me redesign this properly:

## The Real Design: Value Stream Centric

### Main Dashboard: Stream → Units → Ownership

```typescript
// app/page.tsx
export default async function Dashboard() {
  const streams = await query(`
    SELECT 
      s.*,
      -- Stream-level KPIs
      (SELECT json_agg(json_build_object(
        'code', k.code,
        'name', k.name,
        'target', kt.target_value,
        'actual', km.value_numeric,
        'status', CASE 
          WHEN km.value_numeric >= kt.target_value THEN 'green'
          WHEN km.value_numeric >= kt.threshold_yellow THEN 'yellow'
          ELSE 'red'
        END
      ))
      FROM kpi k
      LEFT JOIN kpi_target kt ON kt.kpi_id = k.kpi_id
      LEFT JOIN kpi_measurement km ON km.kpi_id = k.kpi_id
      WHERE k.stream_id = s.stream_id AND k.scope = 'stream'
      ) as stream_kpis,
      
      -- Atomic units with ownership
      (SELECT json_agg(json_build_object(
        'unit_id', au.unit_id,
        'code', au.code,
        'name', au.name,
        'expected_role', er.code,
        'expected_org', eo.code,
        'observed_role', obsr.code,
        'observed_org', obso.code,
        'status', CASE
          WHEN obsr.code IS NULL THEN 'not_observed'
          WHEN er.code = obsr.code AND eo.code = obso.code THEN 'aligned'
          ELSE 'misattributed'
        END,
        'unit_kpis', (
          SELECT json_agg(json_build_object(
            'code', k2.code,
            'value', km2.value_numeric
          ))
          FROM unit_kpi uk2
          JOIN kpi k2 ON k2.kpi_id = uk2.kpi_id
          LEFT JOIN kpi_measurement km2 ON km2.kpi_id = k2.kpi_id
          WHERE uk2.unit_id = au.unit_id
        )
      ) ORDER BY au.order_in_stream)
      FROM atomic_unit au
      LEFT JOIN unit_expected_ownership ueo ON ueo.unit_id = au.unit_id
      LEFT JOIN org_role er ON er.role_id = ueo.accountable_role_id
      LEFT JOIN org_unit eo ON eo.org_unit_id = ueo.accountable_org_unit_id
      LEFT JOIN LATERAL (
        SELECT * FROM unit_observed_ownership 
        WHERE unit_id = au.unit_id 
        ORDER BY observed_as_of DESC LIMIT 1
      ) obs ON true
      LEFT JOIN org_role obsr ON obsr.role_id = obs.accountable_role_id
      LEFT JOIN org_unit obso ON obso.org_unit_id = obs.accountable_org_unit_id
      WHERE au.stream_id = s.stream_id
      ) as units
      
    FROM stream s
    WHERE s.parent_id IS NULL
    ORDER BY s.order_in_parent
  `);

  return <ValueStreamDashboard streams={streams} />;
}
```

### Value Stream Dashboard Component

```typescript
// components/ValueStreamDashboard.tsx
"use client";
import { useState } from "react";

export default function ValueStreamDashboard({ streams }) {
  const [selectedStream, setSelectedStream] = useState(streams[0]);
  const [editingUnit, setEditingUnit] = useState(null);

  return (
    <div className="h-screen flex">
      {/* Left: Stream Navigator */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto">
        <h2 className="font-bold mb-4">Value Streams</h2>
        {streams.map(stream => {
          const stats = calculateStreamStats(stream);
          return (
            <div
              key={stream.stream_id}
              onClick={() => setSelectedStream(stream)}
              className={`p-3 mb-2 rounded cursor-pointer ${
                selectedStream.stream_id === stream.stream_id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{stream.name}</div>
              <div className="text-xs mt-1">
                <div>Units: {stream.units?.length || 0}</div>
                <div className={`${stats.alignedPct < 50 ? 'text-red-600' : 'text-green-600'}`}>
                  Aligned: {stats.alignedPct}%
                </div>
              </div>
              {/* Stream KPIs */}
              <div className="mt-2 space-y-1">
                {stream.stream_kpis?.map(kpi => (
                  <div key={kpi.code} className="flex justify-between text-xs">
                    <span>{kpi.code}</span>
                    <span className={
                      kpi.status === 'green' ? 'text-green-600' :
                      kpi.status === 'yellow' ? 'text-yellow-600' :
                      'text-red-600'
                    }>
                      {kpi.actual || 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Center: Units Grid */}
      <div className="flex-1 p-4">
        <h2 className="text-xl font-bold mb-4">
          {selectedStream.name} - Atomic Units
        </h2>
        
        <div className="bg-white rounded shadow">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Unit</th>
                <th className="p-2 text-left">Expected Owner</th>
                <th className="p-2 text-left">Observed Owner</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Unit KPIs</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedStream.units?.map(unit => (
                <tr key={unit.unit_id} className={
                  unit.status === 'aligned' ? 'bg-green-50' :
                  unit.status === 'misattributed' ? 'bg-red-50' :
                  'bg-yellow-50'
                }>
                  <td className="p-2">
                    <div className="font-medium">{unit.code}</div>
                    <div className="text-xs text-gray-600">{unit.name}</div>
                  </td>
                  
                  <td className="p-2">
                    {editingUnit === unit.unit_id ? (
                      <EditOwnership 
                        type="expected"
                        unit={unit}
                        onSave={() => setEditingUnit(null)}
                      />
                    ) : (
                      <div 
                        className="cursor-pointer hover:bg-white p-1 rounded"
                        onClick={() => setEditingUnit(unit.unit_id)}
                      >
                        {unit.expected_role}@{unit.expected_org}
                      </div>
                    )}
                  </td>
                  
                  <td className="p-2">
                    <EditOwnership 
                      type="observed"
                      unit={unit}
                      inline={true}
                    />
                  </td>
                  
                  <td className="p-2">
                    <StatusBadge status={unit.status} />
                  </td>
                  
                  <td className="p-2">
                    <div className="space-y-1">
                      {unit.unit_kpis?.map(kpi => (
                        <div key={kpi.code} className="flex justify-between text-xs">
                          <span>{kpi.code}</span>
                          <input
                            type="number"
                            className="w-16 px-1 border rounded"
                            value={kpi.value || ''}
                            onChange={(e) => updateUnitKpi(unit.unit_id, kpi.code, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td className="p-2 text-center">
                    <button className="text-red-600 hover:bg-red-50 p-1 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Add new unit row */}
              <tr>
                <td colSpan={6} className="p-2 text-center">
                  <button className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded">
                    + Add Unit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: KPI Cascade */}
      <div className="w-80 bg-white p-4 border-l">
        <h3 className="font-bold mb-4">KPI Cascade</h3>
        
        <div className="space-y-4">
          {/* Unit KPIs → Stream KPIs */}
          <div className="border rounded p-3">
            <h4 className="font-medium mb-2">Unit → Stream</h4>
            <div className="text-xs space-y-1">
              <div>QUALIFICATION_COMPLETENESS → WIN_RATE</div>
              <div>DISCOUNT_CYCLE → AVG_SOLD_MARGIN</div>
              <div>PROPOSAL_REUSE → WIN_RATE</div>
            </div>
          </div>
          
          {/* Stream KPIs → Firm KPIs */}
          <div className="border rounded p-3">
            <h4 className="font-medium mb-2">Stream → Firm</h4>
            <div className="text-xs space-y-1">
              <div>WIN_RATE → REVENUE</div>
              <div>AVG_SOLD_MARGIN → GROSS_MARGIN</div>
              <div>UTILIZATION → EBITDA</div>
            </div>
          </div>
          
          {/* Financial Impact */}
          <div className="border rounded p-3 bg-red-50">
            <h4 className="font-medium mb-2">Misattribution Cost</h4>
            <div className="text-2xl font-bold text-red-600">
              $2.4M
            </div>
            <div className="text-xs text-gray-600">
              Annual impact from {selectedStream.name}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateStreamStats(stream) {
  if (!stream.units) return { alignedPct: 0 };
  const aligned = stream.units.filter(u => u.status === 'aligned').length;
  const total = stream.units.length;
  return {
    alignedPct: total > 0 ? Math.round((aligned / total) * 100) : 0
  };
}
```

### Hierarchical People View (Org Structure)

```typescript
// components/PeopleOrgTree.tsx
export default function PeopleOrgTree({ orgData }) {
  return (
    <div className="p-4">
      {renderOrgNode(orgData.root)}
    </div>
  );
  
  function renderOrgNode(node, depth = 0) {
    return (
      <div key={node.org_unit_id} style={{ marginLeft: depth * 20 }}>
        <div className="border rounded p-3 mb-2">
          <div className="flex justify-between">
            <div>
              <span className="font-medium">{node.name}</span>
              <span className="ml-2 text-gray-500">({node.code})</span>
            </div>
            <button className="text-blue-600">+ Add Person</button>
          </div>
          
          {/* People in this org */}
          <div className="mt-2 space-y-1">
            {node.people?.map(person => (
              <div key={person.person_id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                <input 
                  className="border rounded px-1"
                  value={person.full_name}
                  onChange={(e) => updatePerson(person.person_id, 'name', e.target.value)}
                />
                <input 
                  type="number"
                  className="w-20 border rounded px-1"
                  value={person.bill_rate}
                  onChange={(e) => updatePerson(person.person_id, 'bill_rate', e.target.value)}
                />
                <button className="text-red-600">×</button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Child orgs */}
        {node.children?.map(child => renderOrgNode(child, depth + 1))}
      </div>
    );
  }
}
```

The key insight: **VALUE STREAMS are the organizing principle**. Everything else (ownership, KPIs, finances) flows from that. The UI should make it crystal clear:

1. **Which streams have misattribution** (left nav shows %)
2. **Which specific units are misattributed** (center grid)
3. **How KPIs cascade** (right panel)
4. **The financial impact** (bottom line number)

And yes, you need ADD/DELETE everywhere. This is a data management tool, not just a viewer.