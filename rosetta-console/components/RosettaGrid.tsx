"use client";
import React, { useState, useMemo } from "react";
import { Badge, InlineEdit, StatusBadge, Tooltip } from "./ui";

type Row = {
  unit_id: string;
  unit_code: string;
  unit_name: string;
  description?: string;
  stream_code: string;
  stream_name: string;
  parent_stream?: string;
  expected_role?: string;
  expected_role_name?: string;
  expected_org?: string;
  expected_org_name?: string;
  observed_role?: string;
  observed_role_name?: string;
  observed_org?: string;
  observed_org_name?: string;
  status?: string;
  systems?: string;
  leading_kpis?: string;
  evidence_count?: number;
  misattribution_cost?: number;
};

type RosettaGridProps = {
  data: Row[];
};

export default function RosettaGrid({ data: initialData }: RosettaGridProps) {
  const [rows, setRows] = useState<Row[]>(initialData);
  const [expandedRows, setExpandedRows] = useState(new Set<string>());
  const [filter, setFilter] = useState<{ stream?: string; status?: string }>({});

  const filtered = useMemo(() => 
    rows.filter(r => 
      (!filter.stream || r.stream_code === filter.stream) &&
      (!filter.status || r.status === filter.status)
    ), [rows, filter]
  );

  async function updateObserved(unitId: string, roleCode: string, orgCode: string) {
    try {
      const res = await fetch("/api/observed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          unitId, 
          roleCode, 
          orgCode,
          notes: "Updated via Rosetta Grid"
        })
      });
      
      if (res.ok) {
        // Update local state immediately for responsiveness
        setRows(rows.map(r => 
          r.unit_id === unitId 
            ? { 
                ...r, 
                observed_role: roleCode, 
                observed_org: orgCode, 
                status: calculateStatus(r.expected_role, r.expected_org, roleCode, orgCode)
              }
            : r
        ));
      }
    } catch (error) {
      console.error("Failed to update observed ownership:", error);
    }
  }

  function calculateStatus(expectedRole?: string, expectedOrg?: string, observedRole?: string, observedOrg?: string): string {
    if (!observedRole || !observedOrg) return "Not Observed";
    if (expectedRole === observedRole && expectedOrg === observedOrg) return "Aligned";
    return "Misattributed";
  }

  function toggleRow(unitId: string) {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(unitId)) {
        next.delete(unitId);
      } else {
        next.add(unitId);
      }
      return next;
    });
  }

  const getRowColorClass = (status?: string) => {
    switch (status) {
      case "Aligned": return "bg-green-50 hover:bg-green-100";
      case "Misattributed": return "bg-red-50 hover:bg-red-100";
      case "Not Observed": return "bg-yellow-50 hover:bg-yellow-100";
      default: return "hover:bg-gray-50";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-lg">Rosetta Stone - Complete Ownership Map</h2>
            <p className="text-sm text-gray-600">Click any cell to edit. Colored by status. Expand rows for details.</p>
          </div>
          <div className="flex gap-2">
            <select 
              className="px-3 py-1 border rounded text-sm"
              onChange={(e) => setFilter(f => ({ ...f, stream: e.target.value || undefined }))}
            >
              <option value="">All Streams</option>
              {Array.from(new Set(rows.map(r => r.stream_code))).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select 
              className="px-3 py-1 border rounded text-sm"
              onChange={(e) => setFilter(f => ({ ...f, status: e.target.value || undefined }))}
            >
              <option value="">All Status</option>
              <option value="Aligned">Aligned</option>
              <option value="Misattributed">Misattributed</option>
              <option value="Not Observed">Not Observed</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto max-h-[calc(100vh-250px)]">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white border-b">
            <tr>
              <th className="text-left p-2 font-medium text-gray-700">Unit</th>
              <th className="text-left p-2 font-medium text-gray-700">Stream</th>
              <th className="text-left p-2 font-medium text-gray-700">Expected Owner</th>
              <th className="text-left p-2 font-medium text-gray-700">Observed Owner</th>
              <th className="text-left p-2 font-medium text-gray-700">Status</th>
              <th className="text-left p-2 font-medium text-gray-700">Systems</th>
              <th className="text-center p-2 font-medium text-gray-700">Evidence</th>
              <th className="text-right p-2 font-medium text-gray-700">Impact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => (
              <React.Fragment key={row.unit_id}>
                <tr 
                  className={`border-b cursor-pointer transition-colors ${getRowColorClass(row.status)}`}
                  onClick={() => toggleRow(row.unit_id)}
                >
                  <td className="p-2">
                    <div className="font-medium">{row.unit_code}</div>
                    <div className="text-gray-600 text-xs">{row.unit_name}</div>
                  </td>
                  <td className="p-2">
                    {row.parent_stream && (
                      <div className="text-xs text-gray-500">{row.parent_stream} →</div>
                    )}
                    <Badge>{row.stream_code}</Badge>
                  </td>
                  <td className="p-2">
                    <Tooltip content={`${row.expected_role_name || row.expected_role} at ${row.expected_org_name || row.expected_org}`}>
                      <div className="font-mono text-xs">
                        {row.expected_role}@{row.expected_org}
                      </div>
                    </Tooltip>
                  </td>
                  <td className="p-2" onClick={(e) => e.stopPropagation()}>
                    <InlineEdit
                      value={row.observed_role && row.observed_org ? `${row.observed_role}@${row.observed_org}` : ""}
                      onSave={(val) => {
                        const [role, org] = val.split("@");
                        if (role && org) {
                          updateObserved(row.unit_id, role, org);
                        }
                      }}
                      placeholder="Click to set"
                      className="text-xs font-mono"
                    />
                  </td>
                  <td className="p-2">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1 flex-wrap">
                      {(row.systems || "").split(",").filter(Boolean).map(s => 
                        <Badge key={s} variant="outline">{s.trim()}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <span className="text-gray-700">{row.evidence_count || 0}</span>
                  </td>
                  <td className="p-2 text-right">
                    {row.misattribution_cost && row.misattribution_cost > 0 && (
                      <span className="text-red-600 font-medium">
                        ${(row.misattribution_cost / 1000).toFixed(0)}k
                      </span>
                    )}
                  </td>
                </tr>
                
                {expandedRows.has(row.unit_id) && (
                  <tr>
                    <td colSpan={8} className="bg-gray-50 p-4 border-b">
                      <UnitDetails unit={row} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UnitDetails({ unit }: { unit: Row }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h4 className="font-semibold mb-2 text-gray-900">Description</h4>
        <p className="text-sm text-gray-700">{unit.description || "No description available"}</p>
        
        <h4 className="font-semibold mt-4 mb-2 text-gray-900">What Ownership Means Here</h4>
        <p className="text-sm text-gray-700">
          The <strong>Accountable</strong> person has single-threaded ownership. 
          They make decisions without escalation, own the outcome, and are the 
          single point of failure/success.
        </p>
      </div>
      
      <div>
        <h4 className="font-semibold mb-2 text-gray-900">Leading KPIs</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {(unit.leading_kpis || "").split(",").filter(Boolean).map(kpi => 
            <Badge key={kpi}>{kpi.trim()}</Badge>
          )}
        </div>
        
        <h4 className="font-semibold mb-2 text-gray-900">Expected vs Observed</h4>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-gray-600">Expected:</span>{" "}
            <span className="font-mono">{unit.expected_role}@{unit.expected_org}</span>
          </div>
          <div>
            <span className="text-gray-600">Observed:</span>{" "}
            <span className="font-mono">
              {unit.observed_role && unit.observed_org 
                ? `${unit.observed_role}@${unit.observed_org}`
                : "Not Set"}
            </span>
          </div>
        </div>
        
        {unit.misattribution_cost && unit.misattribution_cost > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded">
            <h5 className="font-medium text-red-900">Misattribution Impact</h5>
            <p className="text-sm text-red-700 mt-1">
              ${(unit.misattribution_cost / 1000).toFixed(0)}k revenue leakage
            </p>
          </div>
        )}
      </div>
    </div>
  );
}