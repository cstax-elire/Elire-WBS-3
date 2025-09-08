"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OwnershipSummary as OwnershipSummaryType } from "@/types/database";

// Implementation from v4 spec lines 449-486 with clickable filters (ui-fix.md Usability)
export function OwnershipSummary({ 
  onFilterChange 
}: { 
  onFilterChange?: (filters: { stream?: string; status?: string }) => void 
}) {
  const { data, isLoading, error } = useQuery<OwnershipSummaryType[]>({
    queryKey: ['ownership-summary'],
    queryFn: async () => {
      const response = await fetch('/api/summary/ownership');
      if (!response.ok) {
        throw new Error('Failed to fetch ownership summary');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        Failed to load ownership summary
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No ownership data available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {data.map((stream) => (
        <Card key={stream.stream} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {stream.stream_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className="cursor-pointer hover:opacity-80"
                onClick={() => onFilterChange?.({ stream: stream.stream, status: "Aligned" })}
                title="Click to filter aligned units"
              >
                <div className="text-2xl font-bold">
                  {Number(stream.alignment_pct).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground hover:underline">
                  {Number(stream.aligned)} of {Number(stream.total_units)} aligned
                </div>
              </div>
              
              {Number(stream.misattributed) > 0 && (
                <Badge 
                  variant="destructive" 
                  className="text-xs cursor-pointer hover:opacity-80"
                  onClick={() => onFilterChange?.({ stream: stream.stream, status: "Misattributed" })}
                  title="Click to filter misattributed units"
                >
                  {Number(stream.misattributed)} misattributed
                </Badge>
              )}
              
              {Number(stream.not_observed) > 0 && (
                <Badge 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:opacity-80"
                  onClick={() => onFilterChange?.({ stream: stream.stream, status: "Not Observed" })}
                  title="Click to filter not observed units"
                >
                  {Number(stream.not_observed)} not observed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Dashboard wrapper component for server-side rendering support
export function OwnershipSummaryDashboard({ 
  initialData 
}: { 
  initialData?: OwnershipSummaryType[] 
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ownership Alignment Summary</h2>
        <Badge variant="outline" className="text-xs">
          Auto-refreshes every minute
        </Badge>
      </div>
      <OwnershipSummary />
    </div>
  );
}