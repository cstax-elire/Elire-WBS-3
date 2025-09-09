"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import { DropdownOption } from "@/types/database";

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

interface UnitEditorProps {
  unit: UnitRow;
  onUpdate?: () => void;
}

export function UnitEditor({ unit, onUpdate }: UnitEditorProps) {
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState<"role" | "org" | null>(null);
  const [tempValue, setTempValue] = useState<number | null>(null);

  // Fetch role options
  const { data: roleOptions } = useQuery<DropdownOption[]>({
    queryKey: ["options", "role"],
    queryFn: async () => {
      const response = await fetch("/api/options/role");
      if (!response.ok) throw new Error("Failed to fetch role options");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch org options
  const { data: orgOptions } = useQuery<DropdownOption[]>({
    queryKey: ["options", "org"],
    queryFn: async () => {
      const response = await fetch("/api/options/org");
      if (!response.ok) throw new Error("Failed to fetch org options");
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update ownership mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      field,
      value,
    }: {
      field: "role" | "org";
      value: number | null;
    }) => {
      const response = await fetch("/api/observed-ownership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unit_id: unit.unit_id,
          [`accountable_${field}_id`]: value,
          source: "UI",
          notes: `Updated ${field} via Workbench`,
          idempotency_key: `${unit.unit_id}-${field}-${value}-${Math.floor(Date.now() / 60000)}`, // Round to minute
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update ownership");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workbench-units"] });
      queryClient.invalidateQueries({ queryKey: ["ownership-summary"] });
      queryClient.invalidateQueries({ queryKey: ["truth-data"] });
      setEditingField(null);
      onUpdate?.();
    },
  });

  const handleSave = () => {
    if (editingField && tempValue !== undefined) {
      updateMutation.mutate({ field: editingField, value: tempValue });
    }
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aligned":
        return "default";
      case "Misattributed":
        return "destructive";
      case "Not Observed":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="grid grid-cols-7 gap-2 p-2 border-b hover:bg-muted/30 items-center">
      {/* Unit Info */}
      <div className="col-span-2">
        <div className="font-medium text-sm">{unit.unit_code}</div>
        <div className="text-xs text-muted-foreground">{unit.unit_name}</div>
      </div>

      {/* Expected */}
      <div className="text-sm text-muted-foreground">
        {unit.expected_role}@{unit.expected_org}
      </div>

      {/* Observed Role */}
      <div>
        {editingField === "role" ? (
          <div className="flex items-center gap-1">
            <Select
              value={tempValue?.toString() || ""}
              onValueChange={(val) => setTempValue(val ? parseInt(val) : null)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {roleOptions?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 cursor-pointer hover:bg-accent rounded px-2 py-1"
            onClick={() => {
              setEditingField("role");
              setTempValue(unit.observed_role_id);
            }}
          >
            <span className="text-sm">
              {unit.observed_role || <span className="text-muted-foreground italic">Click to set</span>}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Observed Org */}
      <div>
        {editingField === "org" ? (
          <div className="flex items-center gap-1">
            <Select
              value={tempValue?.toString() || ""}
              onValueChange={(val) => setTempValue(val ? parseInt(val) : null)}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Select org..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {orgOptions?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value.toString()}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="ghost" onClick={handleSave}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div
            className="flex items-center gap-1 cursor-pointer hover:bg-accent rounded px-2 py-1"
            onClick={() => {
              setEditingField("org");
              setTempValue(unit.observed_org_id);
            }}
          >
            <span className="text-sm">
              {unit.observed_org || <span className="text-muted-foreground italic">Click to set</span>}
            </span>
            <Pencil className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <Badge variant={getStatusColor(unit.status)} className="text-xs">
          {unit.status}
        </Badge>
      </div>

      {/* Evidence */}
      <div className="text-xs text-muted-foreground">
        {unit.evidence_count || 0} entries
        {unit.last_evidence_at && (
          <div>{new Date(unit.last_evidence_at).toLocaleDateString()}</div>
        )}
      </div>
    </div>
  );
}