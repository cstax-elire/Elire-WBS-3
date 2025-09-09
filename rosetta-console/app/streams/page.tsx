"use client";

import { useQuery } from "@tanstack/react-query";
import StreamGrid from "@/components/StreamGrid";
import { Skeleton } from "@/components/ui/skeleton";

export default function StreamsPage() {
  // Use API endpoint to honor view-only contract
  const { data, isLoading, error } = useQuery({
    queryKey: ["streams"],
    queryFn: async () => {
      const response = await fetch("/api/streams");
      if (!response.ok) throw new Error("Failed to fetch streams");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Value Streams</h1>
          <p className="text-muted-foreground">Loading streams...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Value Streams</h1>
          <p className="text-red-500">Failed to load streams. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Value Streams</h1>
        <p className="text-muted-foreground">
          Navigate all six value streams including the EXPAND stream. Click any stream to see its atomic units and ownership details.
        </p>
      </div>
      <StreamGrid streams={data || []} />
    </div>
  );
}