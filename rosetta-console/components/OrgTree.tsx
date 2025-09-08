"use client";
import { useMemo, useState } from "react";
import Button from "./Button";

type Node = {
  org_unit_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  depth: number;
  path: string;
  path_codes: string;
  direct_headcount: number;
  direct_revenue: number;
  direct_cos: number;
  direct_sga: number;
  direct_gross_margin: number;
  direct_gm_pct: number;
};

export default function OrgTree({ data }: { data: Node[] }) {
  const [showAllocated, setShowAllocated] = useState(false);

  // group children by parent
  const children = useMemo(() => {
    const map = new Map<number, Node[]>();
    data.forEach(n => {
      const key = n.parent_id ?? -1;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    });
    return map;
  }, [data]);

  function render(node: Node) {
    const kids = children.get(node.org_unit_id) || [];
    return (
      <li key={node.org_unit_id} className="ml-4">
        <div className="mb-2 p-3 border rounded bg-white">
          <div className="font-semibold">{node.name} <span className="text-gray-500">({node.code})</span></div>
          <div className="text-sm text-gray-700 flex gap-4">
            <span>Headcount: {node.direct_headcount}</span>
            <span>Revenue: ${Math.round(node.direct_revenue).toLocaleString()}</span>
            <span>COS: ${Math.round(node.direct_cos).toLocaleString()}</span>
            <span>GM%: {node.direct_gm_pct}%</span>
          </div>
        </div>
        {kids.length>0 && (
          <ul className="border-l border-gray-200 ml-4 pl-4">
            {kids.map(k => render(k))}
          </ul>
        )}
      </li>
    );
  }

  const roots = children.get(-1) || [];
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <div className="text-gray-700">Tree shows **direct** metrics. Toggle to view **allocated SG&A** on Finance page.</div>
        <Button variant="ghost" onClick={()=>setShowAllocated(!showAllocated)}>
          {showAllocated ? "Hide Allocated (see Finance)" : "See Allocated on Finance"}
        </Button>
      </div>
      <ul>{roots.map(r => render(r))}</ul>
    </div>
  );
}
