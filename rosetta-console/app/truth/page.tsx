"use client";

import { useState } from "react";
import { OwnershipSummary } from "@/components/OwnershipSummary";
import TruthTableV4 from "@/components/TruthTableV4";

// Updated Truth page with clickable summary filters (ui-fix.md Usability)
export default function TruthPage({ 
  searchParams 
}: { 
  searchParams?: { 
    stream?: string;
    status?: string;
    page?: string;
  } 
}) {
  const initialPage = searchParams?.page ? parseInt(searchParams.page) : 1;
  const [filters, setFilters] = useState({
    stream: searchParams?.stream,
    status: searchParams?.status
  });

  // Handle filter changes from summary cards
  const handleFilterChange = (newFilters: { stream?: string; status?: string }) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Truth: Expected vs Observed</h1>
        <p className="text-muted-foreground mt-2">
          Compare expected ownership (fiction) with observed reality. 
          Click any cell to update observed ownership. 
          Evidence is automatically logged for all changes.
        </p>
      </div>

      {/* Ownership Summary Dashboard with clickable filters */}
      <OwnershipSummary onFilterChange={handleFilterChange} />

      {/* Truth Table with Pagination */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ownership Details</h2>
          <TruthTableV4 
            initialPage={initialPage}
            initialFilters={filters}
          />
        </div>
      </div>
    </div>
  );
}