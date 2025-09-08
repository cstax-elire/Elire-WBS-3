"use client";
import { useState } from "react";

export default function EditableKpiGrid({ kpis }: any) {
  const [data, setData] = useState(kpis);

  async function save(kpiId: string, field: string, value: string) {
    await fetch('/api/kpi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kpiId, field, value })
    });
    setData(data.map((k: any) => k.kpi_id === kpiId ? { ...k, [field]: value } : k));
  }

  function getStatus(actual: number, target: number, yellowThreshold: number, redThreshold: number) {
    if (!actual || !target) return 'gray';
    const performance = (actual / target) * 100;
    if (performance >= 100) return 'green';
    if (performance >= yellowThreshold) return 'yellow';
    if (performance >= redThreshold) return 'orange';
    return 'red';
  }

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Code</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Scope</th>
            <th className="p-2 text-left">Kind</th>
            <th className="p-2 text-left">Target</th>
            <th className="p-2 text-left">Yellow</th>
            <th className="p-2 text-left">Red</th>
            <th className="p-2 text-left">Latest Value</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Measured</th>
          </tr>
        </thead>
        <tbody>
          {data.map((kpi: any) => {
            const status = getStatus(
              kpi.latest_value, 
              kpi.target_value, 
              kpi.threshold_yellow || 90, 
              kpi.threshold_red || 70
            );
            
            return (
              <tr key={kpi.kpi_id}>
                <td className="p-2 font-mono">{kpi.code}</td>
                <td className="p-2">
                  <input
                    className="w-full px-1 border rounded"
                    value={kpi.name}
                    onChange={(e) => {
                      setData(data.map((k: any) => 
                        k.kpi_id === kpi.kpi_id ? { ...k, name: e.target.value } : k
                      ));
                    }}
                    onBlur={(e) => save(kpi.kpi_id, 'name', e.target.value)}
                  />
                </td>
                <td className="p-2">{kpi.scope}</td>
                <td className="p-2">{kpi.kind}</td>
                <td className="p-2">
                  <input
                    type="number"
                    className="w-20 px-1 border rounded"
                    value={kpi.target_value || ''}
                    onChange={(e) => {
                      setData(data.map((k: any) => 
                        k.kpi_id === kpi.kpi_id ? { ...k, target_value: Number(e.target.value) } : k
                      ));
                    }}
                    onBlur={(e) => save(kpi.kpi_id, 'target_value', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="w-16 px-1 border rounded"
                    value={kpi.threshold_yellow || ''}
                    onChange={(e) => {
                      setData(data.map((k: any) => 
                        k.kpi_id === kpi.kpi_id ? { ...k, threshold_yellow: Number(e.target.value) } : k
                      ));
                    }}
                    onBlur={(e) => save(kpi.kpi_id, 'threshold_yellow', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="w-16 px-1 border rounded"
                    value={kpi.threshold_red || ''}
                    onChange={(e) => {
                      setData(data.map((k: any) => 
                        k.kpi_id === kpi.kpi_id ? { ...k, threshold_red: Number(e.target.value) } : k
                      ));
                    }}
                    onBlur={(e) => save(kpi.kpi_id, 'threshold_red', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    className="w-20 px-1 border rounded"
                    value={kpi.latest_value || ''}
                    onChange={(e) => {
                      setData(data.map((k: any) => 
                        k.kpi_id === kpi.kpi_id ? { ...k, latest_value: Number(e.target.value) } : k
                      ));
                    }}
                    onBlur={(e) => save(kpi.kpi_id, 'latest_value', e.target.value)}
                  />
                </td>
                <td className="p-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    status === 'green' ? 'bg-green-200 text-green-800' :
                    status === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
                    status === 'orange' ? 'bg-orange-200 text-orange-800' :
                    status === 'red' ? 'bg-red-200 text-red-800' :
                    'bg-gray-200 text-gray-800'
                  }`}>
                    {kpi.latest_value && kpi.target_value 
                      ? `${Math.round((kpi.latest_value / kpi.target_value) * 100)}%`
                      : '-'
                    }
                  </span>
                </td>
                <td className="p-2 text-xs text-gray-500">
                  {kpi.measured_at ? new Date(kpi.measured_at).toLocaleDateString() : '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}