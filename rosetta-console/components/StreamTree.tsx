"use client";
import { useState, useMemo } from "react";
import Button from "./Button";

type Node = {
  stream_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  is_enabler: boolean;
  order_in_parent: number;
  depth: number;
  path: string;
  path_codes: string;
  direct_unit_count: number;
  linked_child_units: number;
};

export default function StreamTree({ data }: { data: Node[] }) {
  const [selected, setSelected] = useState<Node | null>(null);

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
    const kids = children.get(node.stream_id) || [];
    return (
      <li key={node.stream_id} className="ml-4">
        <div className="mb-2 p-3 border rounded bg-white cursor-pointer hover:bg-blue-50"
             onClick={()=>setSelected(node)}>
          <div className="font-semibold">{node.name} <span className="text-gray-500">({node.code})</span></div>
          <div className="text-sm text-gray-700 flex gap-4">
            <span>Units: {node.direct_unit_count}</span>
            <span>Linked children: {node.linked_child_units}</span>
            <span>{node.is_enabler ? "Enabler" : "Customer-facing"}</span>
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
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <ul>{roots.map(r => render(r))}</ul>
      </div>
      <div>
        {selected ? (
          <div className="card">
            <div className="card-header">{selected.name} ({selected.code})</div>
            <div className="card-body">
              <p className="text-gray-700 mb-3">
                Drill into this stream via the Truth/Evidence pages to set Observed owners and log proof for units.
              </p>
              <Button onClick={()=>window.location.assign(`/truth?stream=${selected.code}`)}>Open Truth</Button>
            </div>
          </div>
        ) : (
          <div className="text-gray-600">Select a stream to see actions.</div>
        )}
      </div>
    </div>
  );
}
