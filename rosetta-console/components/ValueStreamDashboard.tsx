"use client";
import { useState } from "react";
import EditOwnership from "./EditOwnership";
import StatusBadge from "./StatusBadge";

export default function ValueStreamDashboard({ streams }) {
  const [selectedStream, setSelectedStream] = useState(streams[0]);
  const [editingUnit, setEditingUnit] = useState(null);

  const updateUnitKpi = async (unitId, kpiCode, value) => {
    await fetch('/api/unit-kpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitId, kpiCode, value })
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Stream Navigator */}
      <div className="w-64 bg-gray-100 p-4 overflow-y-auto flex-shrink-0">
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
      <div className="flex-1 p-4 overflow-x-auto">
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
      <div className="w-80 bg-gray-50 p-4 border-l flex-shrink-0">
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