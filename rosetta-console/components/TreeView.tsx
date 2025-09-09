"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string | number;
  name: string;
  code: string;
  parentId: string | number | null;
  depth: number;
  children?: TreeNode[];
  metadata?: any;
}

interface TreeViewProps {
  nodes: TreeNode[];
  selectedNode?: string | number;
  onNodeSelect: (node: TreeNode) => void;
  className?: string;
}

export function TreeView({ nodes, selectedNode, onNodeSelect, className }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string | number>>(new Set());

  // Build tree structure from flat list
  const buildTree = (flatNodes: TreeNode[]): TreeNode[] => {
    const nodeMap = new Map<string | number, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    flatNodes.forEach(node => {
      nodeMap.set(node.id, { ...node, children: [] });
    });

    // Second pass: build hierarchy
    flatNodes.forEach(node => {
      const currentNode = nodeMap.get(node.id)!;
      if (node.parentId === null || node.parentId === undefined) {
        rootNodes.push(currentNode);
      } else {
        const parent = nodeMap.get(node.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(currentNode);
        }
      }
    });

    return rootNodes;
  };

  const toggleExpanded = (nodeId: string | number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderNode = (node: TreeNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id || selectedNode === node.code;

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 hover:bg-accent rounded cursor-pointer",
            isSelected && "bg-accent font-medium",
            "transition-colors"
          )}
          style={{ paddingLeft: `${node.depth * 16 + 8}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(node.id);
            }
            onNodeSelect(node);
          }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5" />
          )}
          
          {hasChildren ? (
            isExpanded ? (
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Folder className="h-4 w-4 text-muted-foreground" />
            )
          ) : null}
          
          <span className="text-sm truncate">{node.name}</span>
          
          {node.metadata?.unit_count !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground">
              ({node.metadata.unit_count})
            </span>
          )}
          
          {node.metadata?.headcount !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground">
              {node.metadata.headcount} people
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(nodes);

  return (
    <div className={cn("overflow-auto", className)}>
      {tree.map(node => renderNode(node))}
    </div>
  );
}