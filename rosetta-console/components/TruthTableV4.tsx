"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTablePagination } from "@/components/DataTablePagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  RosettaTruthRow, 
  PaginatedResult, 
  DropdownOption,
  HierarchicalOption 
} from "@/types/database";

// Implementation from v4 spec lines 169-211
function OwnershipCell({ 
  value, 
  expected,
  type,
  unitId,
  field
}: {
  value: string;
  expected: string;
  type: 'role' | 'org';
  unitId: number;
  field: 'role' | 'org';
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: options } = useQuery<DropdownOption[] | HierarchicalOption[]>({
    queryKey: ['options', type],
    queryFn: async () => {
      const response = await fetch(`/api/options/${type}`);
      if (!response.ok) throw new Error('Failed to fetch options');
      return response.json();
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (newValue: number | null) => {
      const response = await fetch('/api/observed-ownership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: unitId,
          [`accountable_${field}_id`]: newValue,
          source: 'UI',
          notes: `Updated ${field} via Truth page`,
          idempotency_key: `${unitId}-${field}-${newValue}-${Math.floor(Date.now() / 60000)}` // Round to minute
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update ownership');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['truth-data'] });
      queryClient.invalidateQueries({ queryKey: ['ownership-summary'] });
      queryClient.invalidateQueries({ queryKey: ['stream-units'] });
      queryClient.invalidateQueries({ queryKey: ['workbench-units'] });
      setIsEditing(false);
    }
  });

  // Handle UNDEFINED expected ownership (v4 spec lines 182-189)
  if (expected === 'UNDEFINED') {
    return (
      <div className="text-muted-foreground italic text-sm">
        Not defined
      </div>
    );
  }

  // Handle NOT_SET observed ownership (v4 spec lines 191-201)
  if (value === 'NOT_SET' || !value) {
    if (isEditing) {
      return (
        <Select
          onValueChange={(val) => {
            const numVal = val === 'null' ? null : parseInt(val);
            updateMutation.mutate(numVal);
          }}
        >
          <SelectTrigger className="w-full h-8 text-sm">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">None</SelectItem>
            {options?.map(opt => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="text-muted-foreground italic text-sm hover:text-primary hover:underline"
      >
        Click to set
      </button>
    );
  }

  // Regular value display/edit
  if (isEditing) {
    const currentOption = options?.find(opt => opt.code === value);
    
    return (
      <Select
        defaultValue={currentOption?.value.toString()}
        onValueChange={(val) => {
          const numVal = val === 'null' ? null : parseInt(val);
          updateMutation.mutate(numVal);
        }}
      >
        <SelectTrigger className="w-full h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="null">None</SelectItem>
          {options?.map(opt => (
            <SelectItem key={opt.value} value={opt.value.toString()}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const isMatch = value === expected;
  
  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`text-sm text-left hover:underline ${
        isMatch ? 'text-green-600' : 'text-red-600 font-medium'
      }`}
    >
      {value}
    </button>
  );
}

interface TruthTableProps {
  initialPage?: number;
  initialFilters?: {
    stream?: string;
    status?: string;
  };
}

export default function TruthTableV4({ 
  initialPage = 1, 
  initialFilters = {} 
}: TruthTableProps) {
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState(initialFilters);
  
  const { data, isLoading, error } = useQuery<PaginatedResult<RosettaTruthRow>>({
    queryKey: ['truth-data', page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '50',
        ...(filters.stream && { stream: filters.stream }),
        ...(filters.status && { status: filters.status })
      });
      
      const response = await fetch(`/api/truth/paginated?${params}`);
      if (!response.ok) throw new Error('Failed to fetch truth data');
      return response.json();
    },
    keepPreviousData: true
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load truth data: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No data available. Try adjusting your filters.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={filters.stream || 'all'}
          onValueChange={(val) => {
            setFilters({ ...filters, stream: val === 'all' ? undefined : val });
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All streams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Streams</SelectItem>
            <SelectItem value="WIN">WIN</SelectItem>
            <SelectItem value="DELIVER">DELIVER</SelectItem>
            <SelectItem value="COLLECT">COLLECT</SelectItem>
            <SelectItem value="EXPAND">EXPAND</SelectItem>
            <SelectItem value="TALENT">TALENT</SelectItem>
            <SelectItem value="OPERATE">OPERATE</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(val) => {
            setFilters({ ...filters, status: val === 'all' ? undefined : val });
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Aligned">Aligned</SelectItem>
            <SelectItem value="Misattributed">Misattributed</SelectItem>
            <SelectItem value="Not Observed">Not Observed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Stream</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Unit</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Expected Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Observed Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Expected Org</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Observed Org</th>
              <th className="px-4 py-3 text-left text-sm font-medium">
                <div className="flex items-center gap-1">
                  Status
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold">Misattribution Status Rules:</p>
                          <ul className="space-y-1 list-disc list-inside">
                            <li><strong>Aligned:</strong> Both observed role and org match expected values</li>
                            <li><strong>Misattributed:</strong> Either observed role OR org differs from expected (or both)</li>
                            <li><strong>Not Observed:</strong> No observed ownership has been set yet</li>
                          </ul>
                          <p className="text-xs text-muted-foreground mt-2">
                            Status is computed by v_rosetta_truth view using these rules
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.data.map((row, idx) => {
              // Parse unit_id from unit_code if needed
              const unitId = parseInt(row.unit_code.split('-')[1]) || idx;
              
              return (
                <tr key={`${row.unit_code}-${idx}`} className="hover:bg-muted/30">
                  <td className="px-4 py-2">
                    <Badge variant="outline" className="text-xs">
                      {row.stream_code}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium text-sm">{row.unit_code}</div>
                      <div className="text-xs text-muted-foreground">{row.unit_name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">{row.expected_role}</td>
                  <td className="px-4 py-2">
                    <OwnershipCell
                      value={row.observed_role}
                      expected={row.expected_role}
                      type="role"
                      unitId={unitId}
                      field="role"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm">{row.expected_org}</td>
                  <td className="px-4 py-2">
                    <OwnershipCell
                      value={row.observed_org}
                      expected={row.expected_org}
                      type="org"
                      unitId={unitId}
                      field="org"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Badge
                      variant={
                        row.status === 'Aligned' ? 'default' :
                        row.status === 'Not Observed' ? 'secondary' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-xs">
                      <div>{row.evidence_count || 0} entries</div>
                      {row.last_evidence_at && (
                        <div className="text-muted-foreground">
                          {new Date(row.last_evidence_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <DataTablePagination
        pageCount={data.pageCount}
        currentPage={data.currentPage}
        onPageChange={setPage}
        pageSize={data.pageSize}
        totalCount={data.totalCount}
      />
    </div>
  );
}