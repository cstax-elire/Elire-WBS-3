"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Filter, FileText, User, Building } from "lucide-react";

interface EvidenceRow {
  evidence_id: number;
  unit_id: number;
  unit_code: string;
  unit_name: string;
  stream_code: string;
  stream_name: string;
  subject_ref: string;
  evidence_type: string;
  system_ref: string;
  occurred_at: string;
  notes: string;
  actor_person_id: number | null;
  actor_name: string | null;
  actor_role: string | null;
  actor_org: string | null;
}

const evidenceTypeConfig: Record<string, { label: string; color: string }> = {
  ownership_update: { label: "Ownership Update", color: "bg-blue-100 text-blue-800" },
  kpi_measurement: { label: "KPI Measurement", color: "bg-green-100 text-green-800" },
  pricing_decision: { label: "Pricing Decision", color: "bg-purple-100 text-purple-800" },
  solution_outline: { label: "Solution Outline", color: "bg-yellow-100 text-yellow-800" },
  proposal_redline: { label: "Proposal Redline", color: "bg-red-100 text-red-800" },
  recruit_req: { label: "Recruitment Request", color: "bg-indigo-100 text-indigo-800" },
  scope_change: { label: "Scope Change", color: "bg-orange-100 text-orange-800" },
  milestone_complete: { label: "Milestone Complete", color: "bg-emerald-100 text-emerald-800" },
  invoice_adjustment: { label: "Invoice Adjustment", color: "bg-pink-100 text-pink-800" },
};

export default function EvidencePage() {
  const [filters, setFilters] = useState({
    stream: "",
    type: "",
    unit: "",
  });

  // Fetch evidence data using v_observed_from_evidence (ui-fix.md Section E)
  const { data: evidence, isLoading } = useQuery<EvidenceRow[]>({
    queryKey: ["evidence", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.stream) params.append("stream", filters.stream);
      if (filters.type) params.append("type", filters.type);
      if (filters.unit) params.append("unit", filters.unit);
      params.append("limit", "200");

      const response = await fetch(`/api/evidence?${params}`);
      if (!response.ok) throw new Error("Failed to fetch evidence");
      return response.json();
    },
  });

  // Get unique streams for filter
  const streams = [...new Set(evidence?.map((e) => e.stream_code) || [])];
  const types = Object.keys(evidenceTypeConfig);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Evidence Log</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evidence Log</h1>
        <p className="text-muted-foreground mt-2">
          Complete audit trail of ownership changes and system events (using v_observed_from_evidence)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.stream}
              onValueChange={(value) =>
                setFilters({ ...filters, stream: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Streams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Streams</SelectItem>
                {streams.map((stream) => (
                  <SelectItem key={stream} value={stream}>
                    {stream}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type}
              onValueChange={(value) =>
                setFilters({ ...filters, type: value === "all" ? "" : value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {evidenceTypeConfig[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setFilters({ stream: "", type: "", unit: "" })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{evidence?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {evidence?.filter((e) => e.evidence_type === "ownership_update").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ownership Updates</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {[...new Set(evidence?.map((e) => e.unit_code) || [])].length}
            </div>
            <p className="text-xs text-muted-foreground">Units Affected</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {[...new Set(evidence?.map((e) => e.actor_person_id) || [])].length}
            </div>
            <p className="text-xs text-muted-foreground">Active Actors</p>
          </CardContent>
        </Card>
      </div>

      {/* Evidence List */}
      <div className="space-y-4">
        {evidence?.map((item) => {
          const typeConfig = evidenceTypeConfig[item.evidence_type] || {
            label: item.evidence_type,
            color: "bg-gray-100 text-gray-800",
          };

          return (
            <Card key={item.evidence_id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={typeConfig.color}>
                        {typeConfig.label}
                      </Badge>
                      <Badge variant="outline">{item.system_ref}</Badge>
                      <Badge variant="secondary">{item.stream_code}</Badge>
                    </div>
                    <h3 className="font-semibold">
                      {item.unit_code}: {item.unit_name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Subject: {item.subject_ref}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.occurred_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(item.occurred_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {item.notes && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-sm">{item.notes}</p>
                  </div>
                )}

                {item.actor_name && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {item.actor_name}
                    </div>
                    {item.actor_role && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {item.actor_role}
                      </div>
                    )}
                    {item.actor_org && (
                      <div className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {item.actor_org}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {(!evidence || evidence.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No evidence entries found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}