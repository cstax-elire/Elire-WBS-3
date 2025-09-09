"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Users, DollarSign, TrendingUp, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrgTreeNode {
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
  direct_gross_margin: number;
  direct_gm_pct: number;
  expected_units: number;
  aligned_units: number;
  misattributed_units: number;
  not_observed_units: number;
  alignment_pct: number;
  children?: OrgTreeNode[];
  // Computed rollups
  total_headcount?: number;
  total_revenue?: number;
  total_margin?: number;
  total_expected?: number;
  total_aligned?: number;
  total_misattributed?: number;
  total_not_observed?: number;
}

function buildTree(nodes: OrgTreeNode[]): OrgTreeNode[] {
  const nodeMap = new Map<number, OrgTreeNode>();
  const rootNodes: OrgTreeNode[] = [];

  // First pass: create all nodes with empty children arrays
  nodes.forEach(node => {
    nodeMap.set(node.org_unit_id, { 
      ...node, 
      children: [],
      total_headcount: Number(node.direct_headcount) || 0,
      total_revenue: Number(node.direct_revenue) || 0,
      total_margin: Number(node.direct_gross_margin) || 0,
      total_expected: Number(node.expected_units) || 0,
      total_aligned: Number(node.aligned_units) || 0,
      total_misattributed: Number(node.misattributed_units) || 0,
      total_not_observed: Number(node.not_observed_units) || 0
    });
  });

  // Second pass: build hierarchy and calculate rollups
  nodes.forEach(node => {
    const currentNode = nodeMap.get(node.org_unit_id)!;
    if (node.parent_id === null) {
      rootNodes.push(currentNode);
    } else {
      const parent = nodeMap.get(node.parent_id);
      if (parent) {
        parent.children!.push(currentNode);
      }
    }
  });

  // Third pass: calculate rollups (bottom-up)
  function calculateRollups(node: OrgTreeNode): void {
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => calculateRollups(child));
      
      // Add children's totals to this node's totals
      const childTotals = node.children.reduce((acc, child) => ({
        headcount: acc.headcount + (child.total_headcount || 0),
        revenue: acc.revenue + (child.total_revenue || 0),
        margin: acc.margin + (child.total_margin || 0),
        expected: acc.expected + (child.total_expected || 0),
        aligned: acc.aligned + (child.total_aligned || 0),
        misattributed: acc.misattributed + (child.total_misattributed || 0),
        not_observed: acc.not_observed + (child.total_not_observed || 0)
      }), { headcount: 0, revenue: 0, margin: 0, expected: 0, aligned: 0, misattributed: 0, not_observed: 0 });

      node.total_headcount = (Number(node.direct_headcount) || 0) + childTotals.headcount;
      node.total_revenue = (Number(node.direct_revenue) || 0) + childTotals.revenue;
      node.total_margin = (Number(node.direct_gross_margin) || 0) + childTotals.margin;
      node.total_expected = (Number(node.expected_units) || 0) + childTotals.expected;
      node.total_aligned = (Number(node.aligned_units) || 0) + childTotals.aligned;
      node.total_misattributed = (Number(node.misattributed_units) || 0) + childTotals.misattributed;
      node.total_not_observed = (Number(node.not_observed_units) || 0) + childTotals.not_observed;
    }
  }

  rootNodes.forEach(root => calculateRollups(root));
  return rootNodes;
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function OrgTreeItem({ 
  node, 
  expanded, 
  onToggle 
}: { 
  node: OrgTreeNode; 
  expanded: Set<number>;
  onToggle: (id: number) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(node.org_unit_id);
  const marginPct = node.total_revenue ? (node.total_margin / node.total_revenue * 100) : 0;

  // Determine node type for styling
  const isPillar = node.depth === 0;
  const isDepartment = node.depth === 1;
  const isPractice = node.depth === 2;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 hover:bg-accent rounded-lg cursor-pointer transition-colors",
          isPillar && "bg-blue-50 hover:bg-blue-100 font-semibold",
          isDepartment && "ml-6",
          isPractice && "ml-12"
        )}
        onClick={() => hasChildren && onToggle(node.org_unit_id)}
      >
        {/* Expand/Collapse Icon */}
        {hasChildren ? (
          <button className="p-0.5 hover:bg-muted rounded">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {/* Node Icon */}
        <Building2 className={cn(
          "h-4 w-4",
          isPillar && "text-blue-600",
          isDepartment && "text-green-600",
          isPractice && "text-purple-600"
        )} />

        {/* Name and Code */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm",
              isPillar && "text-base"
            )}>
              {node.name}
            </span>
            <Badge variant="outline" className="text-xs">
              {node.code}
            </Badge>
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-6 text-sm">
          {/* Headcount */}
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-medium">
              {node.total_headcount}
            </span>
            {hasChildren && node.direct_headcount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({node.direct_headcount} direct)
              </span>
            )}
          </div>

          {/* Ownership Alignment */}
          {node.total_expected > 0 && (
            <div className="flex items-center gap-2">
              <Badge 
                variant={
                  node.total_expected === 0 ? "outline" :
                  (node.total_aligned / node.total_expected) >= 0.8 ? "default" :
                  (node.total_aligned / node.total_expected) >= 0.5 ? "secondary" :
                  "destructive"
                }
                className="text-xs"
              >
                {node.total_aligned}/{node.total_expected} aligned
              </Badge>
              {node.total_misattributed > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  {node.total_misattributed} misattributed
                </span>
              )}
              {node.total_not_observed > 0 && (
                <span className="text-xs text-gray-500">
                  {node.total_not_observed} unobserved
                </span>
              )}
            </div>
          )}

          {/* Revenue */}
          {node.total_revenue > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium text-green-600">
                {formatCurrency(node.total_revenue)}
              </span>
            </div>
          )}

          {/* Margin */}
          {node.total_revenue > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              <span className={cn(
                "font-medium",
                marginPct >= 30 ? "text-green-600" : 
                marginPct >= 20 ? "text-yellow-600" : "text-red-600"
              )}>
                {marginPct.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="mt-1">
          {node.children!.map(child => (
            <OrgTreeItem
              key={child.org_unit_id}
              node={child}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgPage() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const { data: orgData, isLoading } = useQuery<OrgTreeNode[]>({
    queryKey: ["org-tree"],
    queryFn: async () => {
      const response = await fetch("/api/tree/org-with-ownership");
      if (!response.ok) throw new Error("Failed to fetch org tree");
      return response.json();
    },
  });

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpanded(newExpanded);
  };

  const expandAll = () => {
    if (!orgData) return;
    const allIds = new Set(orgData.map(n => n.org_unit_id));
    setExpanded(allIds);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Organization Structure</h1>
          <p className="text-muted-foreground">Loading organizational hierarchy...</p>
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const tree = orgData ? buildTree(orgData) : [];
  
  // Calculate totals
  const totals = tree.reduce((acc, node) => ({
    headcount: acc.headcount + (node.total_headcount || 0),
    revenue: acc.revenue + (node.total_revenue || 0),
    margin: acc.margin + (node.total_margin || 0),
    expected: acc.expected + (node.total_expected || 0),
    aligned: acc.aligned + (node.total_aligned || 0),
    misattributed: acc.misattributed + (node.total_misattributed || 0),
    not_observed: acc.not_observed + (node.total_not_observed || 0)
  }), { headcount: 0, revenue: 0, margin: 0, expected: 0, aligned: 0, misattributed: 0, not_observed: 0 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Organization Structure</h1>
        <p className="text-muted-foreground">
          Navigate the organizational hierarchy with headcount and financial rollups at each level
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Headcount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-2xl font-bold">{totals.headcount}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ownership Alignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-600">Aligned</span>
                <span className="text-sm font-bold">{totals.aligned}/{totals.expected}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-red-600">Misattributed</span>
                <span className="text-sm font-bold">{totals.misattributed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Not Observed</span>
                <span className="text-sm font-bold">{totals.not_observed}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-2xl font-bold">
                {formatCurrency(totals.revenue)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gross Margin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-2xl font-bold">
                {totals.revenue ? (totals.margin / totals.revenue * 100).toFixed(0) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tree Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="text-sm px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Collapse All
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tree View */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="space-y-1">
          {tree.map(node => (
            <OrgTreeItem
              key={node.org_unit_id}
              node={node}
              expanded={expanded}
              onToggle={toggleNode}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Understanding the Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div>
            <strong>Headcount:</strong> Shows total people in this unit and all children.
            Direct count shown in parentheses.
          </div>
          <div>
            <strong>Revenue:</strong> Total revenue generated by this unit and all children.
            Only shown for revenue-generating units.
          </div>
          <div>
            <strong>Margin %:</strong> Gross margin percentage (revenue - costs) / revenue.
            Color coded: Green ≥30%, Yellow ≥20%, Red &lt;20%.
          </div>
        </div>
      </div>
    </div>
  );
}