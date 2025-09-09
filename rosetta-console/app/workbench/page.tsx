"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { TreeView, TreeNode } from "@/components/TreeView";
import { UnitEditor } from "@/components/UnitEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Building2, GitBranch, RefreshCw } from "lucide-react";

interface StreamTreeNode {
  stream_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  depth: number;
  direct_unit_count: number;
  linked_child_units: number;
}

interface OrgTreeNode {
  org_unit_id: number;
  code: string;
  name: string;
  parent_id: number | null;
  depth: number;
  direct_headcount: number;
}

interface UnitRow {
  unit_id: number;
  unit_code: string;
  unit_name: string;
  stream_code: string;
  expected_role: string;
  expected_role_id: number | null;
  expected_org: string;
  expected_org_id: number | null;
  observed_role: string;
  observed_role_id: number | null;
  observed_org: string;
  observed_org_id: number | null;
  status: string;
  evidence_count: number;
  last_evidence_at: string | null;
}

export default function WorkbenchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL state management
  const mode = (searchParams.get("mode") || "streams") as "streams" | "org";
  const selectedNode = searchParams.get("node") || "";
  
  const [treeMode, setTreeMode] = useState<"streams" | "org">(mode);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(selectedNode);

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("mode", treeMode);
    if (selectedNodeId) params.set("node", selectedNodeId);
    router.push(`/workbench?${params.toString()}`);
  }, [treeMode, selectedNodeId, router]);

  // Fetch stream tree
  const { data: streamTree, isLoading: streamTreeLoading } = useQuery<StreamTreeNode[]>({
    queryKey: ["tree", "streams"],
    queryFn: async () => {
      const response = await fetch("/api/tree/streams");
      if (!response.ok) throw new Error("Failed to fetch stream tree");
      return response.json();
    },
    enabled: treeMode === "streams",
  });

  // Fetch org tree
  const { data: orgTree, isLoading: orgTreeLoading } = useQuery<OrgTreeNode[]>({
    queryKey: ["tree", "org"],
    queryFn: async () => {
      const response = await fetch("/api/tree/org");
      if (!response.ok) throw new Error("Failed to fetch org tree");
      return response.json();
    },
    enabled: treeMode === "org",
  });

  // Fetch units based on selection
  const { data: units, isLoading: unitsLoading, refetch: refetchUnits } = useQuery<UnitRow[]>({
    queryKey: ["workbench-units", treeMode, selectedNodeId],
    queryFn: async () => {
      if (!selectedNodeId) return [];
      
      if (treeMode === "streams") {
        const response = await fetch(`/api/streams/${selectedNodeId}/units`);
        if (!response.ok) throw new Error("Failed to fetch units");
        return response.json();
      } else {
        // For org mode, use truth API with expected_org filter
        const response = await fetch(`/api/truth/paginated?expected_org=${selectedNodeId}&pageSize=100`);
        if (!response.ok) throw new Error("Failed to fetch units");
        const result = await response.json();
        return result.data;
      }
    },
    enabled: !!selectedNodeId,
  });

  // Convert tree data to TreeNode format
  const convertToTreeNodes = (data: any[]): TreeNode[] => {
    if (!data) return [];
    
    if (treeMode === "streams") {
      return (data as StreamTreeNode[]).map(node => ({
        id: node.code,
        name: node.name,
        code: node.code,
        parentId: node.parent_id ? data.find(n => n.stream_id === node.parent_id)?.code : null,
        depth: node.depth,
        metadata: { unit_count: node.direct_unit_count + node.linked_child_units }
      }));
    } else {
      return (data as OrgTreeNode[]).map(node => ({
        id: node.code,
        name: node.name,
        code: node.code,
        parentId: node.parent_id ? data.find(n => n.org_unit_id === node.parent_id)?.code : null,
        depth: node.depth,
        metadata: { headcount: node.direct_headcount }
      }));
    }
  };

  const handleNodeSelect = (node: TreeNode) => {
    setSelectedNodeId(node.code);
  };

  const treeNodes = convertToTreeNodes(treeMode === "streams" ? streamTree : orgTree);
  const isTreeLoading = treeMode === "streams" ? streamTreeLoading : orgTreeLoading;

  // Calculate summary stats
  const stats = units?.reduce(
    (acc, unit) => {
      acc.total++;
      if (unit.status === "Aligned") acc.aligned++;
      else if (unit.status === "Misattributed") acc.misattributed++;
      else if (unit.status === "Not Observed") acc.notObserved++;
      return acc;
    },
    { total: 0, aligned: 0, misattributed: 0, notObserved: 0 }
  ) || { total: 0, aligned: 0, misattributed: 0, notObserved: 0 };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left Panel - Tree */}
      <div className="w-80 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b bg-background">
          <ToggleGroup
            type="single"
            value={treeMode}
            onValueChange={(value) => value && setTreeMode(value as "streams" | "org")}
            className="w-full"
          >
            <ToggleGroupItem value="streams" aria-label="Streams" className="flex-1">
              <GitBranch className="h-4 w-4 mr-2" />
              Streams
            </ToggleGroupItem>
            <ToggleGroupItem value="org" aria-label="Organization" className="flex-1">
              <Building2 className="h-4 w-4 mr-2" />
              Organization
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex-1 overflow-auto p-2">
          {isTreeLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <TreeView
              nodes={treeNodes}
              selectedNode={selectedNodeId}
              onNodeSelect={handleNodeSelect}
            />
          )}
        </div>
      </div>

      {/* Right Panel - Unit Editor */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Workbench</h1>
              {selectedNodeId && (
                <p className="text-sm text-muted-foreground mt-1">
                  {treeMode === "streams" ? "Stream" : "Org"}: {selectedNodeId}
                </p>
              )}
            </div>
            
            {selectedNodeId && (
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <Badge variant="default">{stats.aligned} Aligned</Badge>
                  <Badge variant="destructive">{stats.misattributed} Misattributed</Badge>
                  <Badge variant="secondary">{stats.notObserved} Not Observed</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchUnits()}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {!selectedNodeId ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a {treeMode === "streams" ? "stream" : "org unit"} from the tree to view units
            </div>
          ) : unitsLoading ? (
            <div className="p-4 space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : units && units.length > 0 ? (
            <div>
              {/* Header */}
              <div className="grid grid-cols-7 gap-2 p-2 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-2">Unit</div>
                <div>Expected</div>
                <div>Observed Role</div>
                <div>Observed Org</div>
                <div>Status</div>
                <div>Evidence</div>
              </div>
              
              {/* Units */}
              <div>
                {units.map(unit => (
                  <UnitEditor
                    key={unit.unit_id}
                    unit={unit}
                    onUpdate={() => refetchUnits()}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No units found for selected {treeMode === "streams" ? "stream" : "org unit"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}