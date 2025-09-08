"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";

interface TruthRow {
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

interface DropdownOption {
  value: string;
  label: string;
  code: string;
  depth?: number;
}

export default function StreamDetailClient({ streamCode }: { streamCode: string }) {
  const queryClient = useQueryClient();

  // Fetch units for this stream using v_rosetta_truth
  const { data: units, isLoading: unitsLoading } = useQuery<TruthRow[]>({
    queryKey: ['stream-units', streamCode],
    queryFn: async () => {
      const response = await fetch(`/api/streams/${streamCode}/units`);
      if (!response.ok) throw new Error('Failed to fetch units');
      return response.json();
    },
  });

  // Fetch role options
  const { data: roleOptions } = useQuery<DropdownOption[]>({
    queryKey: ['role-options'],
    queryFn: async () => {
      const response = await fetch('/api/options/role');
      if (!response.ok) throw new Error('Failed to fetch role options');
      return response.json();
    },
  });

  // Fetch org options
  const { data: orgOptions } = useQuery<DropdownOption[]>({
    queryKey: ['org-options'],
    queryFn: async () => {
      const response = await fetch('/api/options/org');
      if (!response.ok) throw new Error('Failed to fetch org options');
      return response.json();
    },
  });

  // Mutation to update ownership
  const updateOwnership = useMutation({
    mutationFn: async ({ 
      unitId, 
      field, 
      value 
    }: { 
      unitId: number; 
      field: 'role' | 'org'; 
      value: number | null;
    }) => {
      const payload = {
        unit_id: unitId,
        ...(field === 'role' 
          ? { accountable_role_id: value }
          : { accountable_org_unit_id: value }
        ),
        source: 'UI',
        confidence_pct: 1.0,
        notes: `Updated ${field} via Stream detail page`
      };

      const response = await fetch('/api/observed-ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ownership');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refetch the units to get updated data
      queryClient.invalidateQueries({ queryKey: ['stream-units', streamCode] });
      queryClient.invalidateQueries({ queryKey: ['ownership-summary'] });
    },
  });

  if (unitsLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!units || units.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{streamCode} Stream</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No units found for this stream</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alignedCount = units.filter(u => u.status === 'Aligned').length;
  const misattributedCount = units.filter(u => u.status === 'Misattributed').length;
  const notObservedCount = units.filter(u => u.status === 'Not Observed').length;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{streamCode} Stream Units</h1>
        <div className="flex gap-4">
          <Badge variant="outline">
            Total: {units.length}
          </Badge>
          <Badge variant="success">
            Aligned: {alignedCount}
          </Badge>
          <Badge variant="destructive">
            Misattributed: {misattributedCount}
          </Badge>
          <Badge variant="secondary">
            Not Observed: {notObservedCount}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {units.map((unit) => (
          <Card key={unit.unit_id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {unit.unit_code}: {unit.unit_name}
                </CardTitle>
                <StatusBadge status={unit.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Expected Ownership */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Expected Ownership
                  </label>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-sm font-mono">
                    {unit.expected_role || 'UNDEFINED'}@{unit.expected_org || 'UNDEFINED'}
                  </div>
                </div>

                {/* Observed Role */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Observed Role
                  </label>
                  <Select
                    value={unit.observed_role_id?.toString() || 'null'}
                    onValueChange={(value) => {
                      const numValue = value === 'null' ? null : parseInt(value);
                      updateOwnership.mutate({
                        unitId: unit.unit_id,
                        field: 'role',
                        value: numValue,
                      });
                    }}
                    disabled={updateOwnership.isPending}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role">
                        {unit.observed_role || 'Not Set'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Clear</SelectItem>
                      {roleOptions?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Observed Org */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Observed Org
                  </label>
                  <Select
                    value={unit.observed_org_id?.toString() || 'null'}
                    onValueChange={(value) => {
                      const numValue = value === 'null' ? null : parseInt(value);
                      updateOwnership.mutate({
                        unitId: unit.unit_id,
                        field: 'org',
                        value: numValue,
                      });
                    }}
                    disabled={updateOwnership.isPending}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select org">
                        {unit.observed_org || 'Not Set'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Clear</SelectItem>
                      {orgOptions?.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className={option.depth ? `pl-${4 + option.depth * 4}` : ''}
                        >
                          {"  ".repeat(option.depth || 0)}{option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Evidence Info */}
              {unit.evidence_count > 0 && (
                <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                  {unit.evidence_count} evidence entries • 
                  Last updated: {unit.last_evidence_at ? 
                    new Date(unit.last_evidence_at).toLocaleDateString() : 
                    'Never'
                  }
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}