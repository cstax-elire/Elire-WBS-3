"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, Layers, Box, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StreamNode {
  stream_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  depth: number;
  total_units: number;
  aligned_units: number;
  misattributed_units: number;
  not_observed_units: number;
  alignment_pct: number;
  children?: StreamNode[];
  units?: UnitOwnership[];
}

interface UnitOwnership {
  unit_id: number;
  unit_code: string;
  unit_name: string;
  expected_role: string;
  expected_org: string;
  expected_role_id: number | null;
  expected_org_id: number | null;
  observed_role: string;
  observed_org: string;
  observed_role_id: number | null;
  observed_org_id: number | null;
  status: string;
  evidence_count: number;
  last_evidence_at: string | null;
}

interface OrgOption {
  value: number;
  label: string;
  code: string;
}

interface RoleOption {
  value: number;
  label: string;
  code: string;
}

export function StreamTreeWithUnits() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingUnit, setEditingUnit] = useState<number | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Fetch stream tree
  const { data: streamData, isLoading } = useQuery<StreamNode[]>({
    queryKey: ["stream-tree-with-ownership"],
    queryFn: async () => {
      const response = await fetch("/api/tree/streams-with-ownership");
      if (!response.ok) throw new Error("Failed to fetch stream tree");
      return response.json();
    },
  });

  // Fetch units for a stream
  const fetchUnits = async (streamCode: string): Promise<UnitOwnership[]> => {
    const response = await fetch(`/api/streams/${streamCode}/units`);
    if (!response.ok) throw new Error("Failed to fetch units");
    return response.json();
  };

  // Fetch org options
  const { data: orgOptions } = useQuery<OrgOption[]>({
    queryKey: ["org-options"],
    queryFn: async () => {
      const response = await fetch("/api/options/org");
      if (!response.ok) throw new Error("Failed to fetch org options");
      return response.json();
    },
  });

  // Fetch role options
  const { data: roleOptions } = useQuery<RoleOption[]>({
    queryKey: ["role-options"],
    queryFn: async () => {
      const response = await fetch("/api/options/role");
      if (!response.ok) throw new Error("Failed to fetch role options");
      return response.json();
    },
  });

  // Update ownership mutation
  const updateOwnership = useMutation({
    mutationFn: async (params: {
      unitId: number;
      orgId: number | null;
      roleId: number | null;
    }) => {
      const response = await fetch("/api/observed-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_id: params.unitId,
          accountable_org_unit_id: params.orgId,
          accountable_role_id: params.roleId,
          notes: "Updated via Stream Tree UI",
        }),
      });
      if (!response.ok) throw new Error("Failed to update ownership");
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["stream-tree-with-ownership"] });
      queryClient.invalidateQueries({ queryKey: ["stream-units"] });
      queryClient.invalidateQueries({ queryKey: ["ownership-summary"] });
      setEditingUnit(null);
      setSelectedOrg(null);
      setSelectedRole(null);
    },
  });

  const toggleNode = async (nodeKey: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(nodeKey)) {
      newExpanded.delete(nodeKey);
    } else {
      newExpanded.add(nodeKey);
      
      // Load units for this stream if not already loaded
      const node = findNode(streamData || [], nodeKey);
      if (node && !node.units && node.total_units > 0) {
        const units = await fetchUnits(node.code);
        node.units = units;
        queryClient.setQueryData(["stream-tree-with-ownership"], [...(streamData || [])]);
      }
    }
    setExpanded(newExpanded);
  };

  const findNode = (nodes: StreamNode[], key: string): StreamNode | null => {
    for (const node of nodes) {
      if (`${node.stream_id}` === key) return node;
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const buildTree = (nodes: StreamNode[]): StreamNode[] => {
    const nodeMap = new Map<number, StreamNode>();
    const rootNodes: StreamNode[] = [];

    nodes.forEach(node => {
      nodeMap.set(node.stream_id, { ...node, children: [] });
    });

    nodes.forEach(node => {
      const currentNode = nodeMap.get(node.stream_id)!;
      if (node.parent_id === null) {
        rootNodes.push(currentNode);
      } else {
        const parent = nodeMap.get(node.parent_id);
        if (parent) {
          parent.children!.push(currentNode);
        }
      }
    });

    return rootNodes;
  };

  const renderUnit = (unit: UnitOwnership) => (
    <div
      key={unit.unit_id}
      className="ml-12 px-4 py-2 hover:bg-accent rounded-lg border-l-2 border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Box className="h-3.5 w-3.5 text-gray-400" />
          <div>
            <span className="text-sm font-medium">{unit.unit_name}</span>
            <Badge variant="outline" className="ml-2 text-xs">
              {unit.unit_code}
            </Badge>
          </div>
        </div>

        {editingUnit === unit.unit_id ? (
          <div className="flex items-center gap-2">
            <Select
              value={selectedOrg?.toString() || ""}
              onValueChange={(v) => setSelectedOrg(Number(v))}
            >
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {orgOptions?.map(org => (
                  <SelectItem key={org.value} value={org.value.toString()}>
                    {org.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedRole?.toString() || ""}
              onValueChange={(v) => setSelectedRole(Number(v))}
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions?.map(role => (
                  <SelectItem key={role.value} value={role.value.toString()}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              size="sm"
              className="h-8 text-xs"
              onClick={() => updateOwnership.mutate({
                unitId: unit.unit_id,
                orgId: selectedOrg,
                roleId: selectedRole,
              })}
              disabled={updateOwnership.isPending}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                setEditingUnit(null);
                setSelectedOrg(null);
                setSelectedRole(null);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Expected: </span>
              <span className="font-medium">{unit.expected_org || "Not set"}</span>
              {unit.expected_role && (
                <span className="text-muted-foreground ml-1">({unit.expected_role})</span>
              )}
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Observed: </span>
              {unit.observed_org ? (
                <span className="font-medium">{unit.observed_org}</span>
              ) : (
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    setEditingUnit(unit.unit_id);
                    setSelectedOrg(unit.observed_org_id);
                    setSelectedRole(unit.observed_role_id);
                  }}
                >
                  Click to set
                </button>
              )}
              {unit.observed_role && (
                <span className="text-muted-foreground ml-1">({unit.observed_role})</span>
              )}
            </div>
            <Badge
              variant={
                unit.status === "Aligned" ? "default" :
                unit.status === "Misattributed" ? "destructive" :
                "outline"
              }
              className="text-xs"
            >
              {unit.status}
            </Badge>
          </div>
        )}
      </div>
    </div>
  );

  const renderNode = (node: StreamNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const hasUnits = node.total_units > 0;
    const isExpanded = expanded.has(`${node.stream_id}`);
    const nodeKey = `${node.stream_id}`;

    return (
      <div key={nodeKey}>
        <div
          className={cn(
            "flex items-center justify-between px-4 py-3 hover:bg-accent rounded-lg cursor-pointer",
            node.depth === 0 && "bg-blue-50 hover:bg-blue-100 font-semibold",
            node.depth === 1 && "ml-6",
            node.depth === 2 && "ml-12"
          )}
          onClick={() => (hasChildren || hasUnits) && toggleNode(nodeKey)}
        >
          <div className="flex items-center gap-3">
            {hasChildren || hasUnits ? (
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

            <Layers className={cn(
              "h-4 w-4",
              node.depth === 0 && "text-blue-600"
            )} />

            <div>
              <span className="text-sm">{node.name}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {node.code}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {node.total_units > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span>{node.aligned_units}</span>
                  <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                  <span>{node.misattributed_units}</span>
                  <XCircle className="h-3.5 w-3.5 text-gray-400" />
                  <span>{node.not_observed_units}</span>
                </div>
                <Badge
                  variant={
                    Number(node.alignment_pct) >= 80 ? "default" :
                    Number(node.alignment_pct) >= 50 ? "secondary" :
                    "destructive"
                  }
                  className="text-xs"
                >
                  {Number(node.alignment_pct).toFixed(0)}% aligned
                </Badge>
              </>
            )}
          </div>
        </div>

        {isExpanded && (
          <>
            {node.units?.map(unit => renderUnit(unit))}
            {node.children?.map(child => renderNode(child))}
          </>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading stream tree...</div>;
  }

  const tree = streamData ? buildTree(streamData) : [];

  return (
    <div className="space-y-2">
      {tree.map(node => renderNode(node))}
    </div>
  );
}