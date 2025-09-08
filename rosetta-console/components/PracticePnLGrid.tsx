"use client";

export default function PracticePnLGrid({ finances }: any) {
  // Build tree structure for rollups
  const tree = buildOrgTree(finances);
  
  function buildOrgTree(flat: any[]) {
    const map: Record<string, any> = {};
    const roots: any[] = [];
    
    flat.forEach(node => {
      map[node.org_unit_id] = { ...node, children: [] };
    });
    
    flat.forEach(node => {
      if (node.parent_id) {
        if (map[node.parent_id]) {
          map[node.parent_id].children.push(map[node.org_unit_id]);
        }
      } else {
        roots.push(map[node.org_unit_id]);
      }
    });
    
    return roots;
  }
  
  function calculateRollup(node: any): any {
    let rollup = {
      headcount: node.headcount || 0,
      revenue: node.revenue || 0,
      cos: node.cos || 0,
      sga: node.sga || 0,
      gross_margin: 0,
      gm_pct: 0,
      operating_income: 0,
      oi_pct: 0
    };
    
    if (node.children) {
      node.children.forEach((child: any) => {
        const childRollup = calculateRollup(child);
        rollup.headcount += childRollup.headcount;
        rollup.revenue += childRollup.revenue;
        rollup.cos += childRollup.cos;
        rollup.sga += childRollup.sga;
      });
    }
    
    rollup.gross_margin = rollup.revenue - rollup.cos;
    rollup.gm_pct = rollup.revenue > 0 ? Math.round(rollup.gross_margin / rollup.revenue * 100) : 0;
    rollup.operating_income = rollup.gross_margin - rollup.sga;
    rollup.oi_pct = rollup.revenue > 0 ? Math.round(rollup.operating_income / rollup.revenue * 100) : 0;
    
    return rollup;
  }
  
  function renderNode(node: any, depth: number = 0): JSX.Element {
    const rollup = calculateRollup(node);
    
    return (
      <>
        <tr key={node.org_unit_id} className={depth === 0 ? 'font-bold bg-gray-100' : depth === 1 ? 'bg-gray-50' : ''}>
          <td className="p-2" style={{ paddingLeft: `${depth * 20 + 8}px` }}>
            {node.name} ({node.code})
          </td>
          <td className="p-2 text-right">{rollup.headcount}</td>
          <td className="p-2 text-right">${Math.round(rollup.revenue / 1000).toLocaleString()}k</td>
          <td className="p-2 text-right text-red-600">-${Math.round(rollup.cos / 1000).toLocaleString()}k</td>
          <td className="p-2 text-right">${Math.round(rollup.gross_margin / 1000).toLocaleString()}k</td>
          <td className="p-2 text-right">{rollup.gm_pct}%</td>
          <td className="p-2 text-right text-red-600">-${Math.round(rollup.sga / 1000).toLocaleString()}k</td>
          <td className="p-2 text-right font-medium">
            <span className={rollup.operating_income > 0 ? 'text-green-600' : 'text-red-600'}>
              ${Math.round(rollup.operating_income / 1000).toLocaleString()}k
            </span>
          </td>
          <td className="p-2 text-right">{rollup.oi_pct}%</td>
        </tr>
        {node.children?.map((child: any) => renderNode(child, depth + 1))}
      </>
    );
  }
  
  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-left">Organization</th>
            <th className="p-2 text-right">People</th>
            <th className="p-2 text-right">Revenue</th>
            <th className="p-2 text-right">COS</th>
            <th className="p-2 text-right">Gross Margin</th>
            <th className="p-2 text-right">GM%</th>
            <th className="p-2 text-right">SGA</th>
            <th className="p-2 text-right">Operating Inc</th>
            <th className="p-2 text-right">OI%</th>
          </tr>
        </thead>
        <tbody>
          {tree.map((root: any) => renderNode(root))}
        </tbody>
      </table>
    </div>
  );
}