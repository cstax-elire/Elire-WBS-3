"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Calculator,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPIRow {
  kpi_id: number;
  kpi_code: string;
  kpi_name: string;
  kpi_description: string;
  kpi_type: "leading" | "lagging";
  agg_type: "SUM" | "RATIO_OF_SUMS" | "WEIGHTED_AVG";
  unit_of_measure: string;
  current_value: number | null;
  target_value: number | null;
  threshold_yellow: number | null;
  threshold_red: number | null;
  status: "green" | "yellow" | "red" | "unknown";
  last_measured: string | null;
  stream_code: string | null;
  unit_code: string | null;
}

const aggTypeExplanations = {
  SUM: "Values are added together across all units",
  RATIO_OF_SUMS: "Ratio calculated as sum(numerator)/sum(denominator)",
  WEIGHTED_AVG: "Weighted average based on unit importance",
};

const statusColors = {
  green: "bg-green-100 text-green-800 border-green-300",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
  red: "bg-red-100 text-red-800 border-red-300",
  unknown: "bg-gray-100 text-gray-800 border-gray-300",
};

export default function KpiPage() {
  const [selectedType, setSelectedType] = useState<"all" | "leading" | "lagging">("all");
  const [showSQL, setShowSQL] = useState<number | null>(null);

  // Fetch KPI data from v_kpi_rollup (ui-fix.md Section E)
  const { data: kpis, isLoading } = useQuery<KPIRow[]>({
    queryKey: ["kpis"],
    queryFn: async () => {
      const response = await fetch("/api/kpis");
      if (!response.ok) throw new Error("Failed to fetch KPIs");
      return response.json();
    },
  });

  const filteredKPIs = kpis?.filter(
    (kpi) => selectedType === "all" || kpi.kpi_type === selectedType
  );

  // Group KPIs by type
  const leadingKPIs = filteredKPIs?.filter((k) => k.kpi_type === "leading") || [];
  const laggingKPIs = filteredKPIs?.filter((k) => k.kpi_type === "lagging") || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const renderKPICard = (kpi: KPIRow) => {
    const percentage = kpi.target_value && kpi.current_value
      ? (kpi.current_value / kpi.target_value) * 100
      : null;

    return (
      <Card key={kpi.kpi_id} className={`border-2 ${statusColors[kpi.status]}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{kpi.kpi_name}</CardTitle>
              <CardDescription className="mt-1">
                {kpi.kpi_description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={kpi.kpi_type === "leading" ? "default" : "secondary"}>
                {kpi.kpi_type === "leading" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {kpi.kpi_type}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="cursor-help">
                      {kpi.agg_type}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{aggTypeExplanations[kpi.agg_type]}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current vs Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Current Value</p>
                <p className="text-2xl font-bold">
                  {kpi.current_value !== null ? (
                    <>
                      {Number(kpi.current_value).toLocaleString()}
                      {kpi.unit_of_measure && (
                        <span className="text-sm ml-1">{kpi.unit_of_measure}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">Not measured</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target</p>
                <p className="text-2xl font-bold">
                  {kpi.target_value !== null ? (
                    <>
                      {Number(kpi.target_value).toLocaleString()}
                      {kpi.unit_of_measure && (
                        <span className="text-sm ml-1">{kpi.unit_of_measure}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {percentage !== null && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      kpi.status === "green"
                        ? "bg-green-500"
                        : kpi.status === "yellow"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Thresholds */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded" />
                <span className="text-muted-foreground">Yellow:</span>
                <span>{kpi.threshold_yellow || "N/A"}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded" />
                <span className="text-muted-foreground">Red:</span>
                <span>{kpi.threshold_red || "N/A"}</span>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>
                {kpi.stream_code && `Stream: ${kpi.stream_code}`}
                {kpi.unit_code && ` • Unit: ${kpi.unit_code}`}
              </span>
              {kpi.last_measured && (
                <span>Last: {new Date(kpi.last_measured).toLocaleDateString()}</span>
              )}
            </div>

            {/* Show SQL Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSQL(showSQL === kpi.kpi_id ? null : kpi.kpi_id)}
              className="w-full"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {showSQL === kpi.kpi_id ? "Hide" : "Show"} Aggregation SQL
            </Button>

            {/* SQL Display */}
            {showSQL === kpi.kpi_id && (
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>
                  {`-- ${kpi.agg_type} Aggregation for ${kpi.kpi_name}
SELECT 
  kpi_id,
  ${kpi.agg_type === "SUM" 
    ? "SUM(measured_value) as current_value"
    : kpi.agg_type === "RATIO_OF_SUMS"
    ? `SUM(numerator) / NULLIF(SUM(denominator), 0) as current_value`
    : `SUM(measured_value * weight) / NULLIF(SUM(weight), 0) as current_value`
  }
FROM kpi_measurement
WHERE kpi_id = ${kpi.kpi_id}
  AND measured_as_of >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY kpi_id;

-- Data flows through: 
-- kpi_measurement → v_kpi_rollup → UI`}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KPI Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Driver and outcome metrics with{" "}
          <span className="font-semibold">SUM/RATIO_OF_SUMS/WEIGHTED_AVG</span> transparency
          (ui-fix.md Section E)
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={selectedType === "all" ? "default" : "outline"}
          onClick={() => setSelectedType("all")}
        >
          All KPIs ({kpis?.length || 0})
        </Button>
        <Button
          variant={selectedType === "leading" ? "default" : "outline"}
          onClick={() => setSelectedType("leading")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Leading ({leadingKPIs.length})
        </Button>
        <Button
          variant={selectedType === "lagging" ? "default" : "outline"}
          onClick={() => setSelectedType("lagging")}
        >
          <TrendingDown className="h-4 w-4 mr-2" />
          Lagging ({laggingKPIs.length})
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {kpis?.filter((k) => k.status === "green").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">On Track</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {kpis?.filter((k) => k.status === "yellow").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">At Risk</p>
              </div>
              <Activity className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {kpis?.filter((k) => k.status === "red").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Off Track</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {kpis?.filter((k) => k.status === "unknown").length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Not Measured</p>
              </div>
              <Activity className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leading KPIs */}
      {leadingKPIs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Leading KPIs (Drivers)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Leading KPIs are predictive metrics that drive future outcomes
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadingKPIs.map(renderKPICard)}
          </div>
        </div>
      )}

      {/* Lagging KPIs */}
      {laggingKPIs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Lagging KPIs (Outcomes)
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Lagging KPIs are outcome metrics that measure past performance
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {laggingKPIs.map(renderKPICard)}
          </div>
        </div>
      )}

      {(!filteredKPIs || filteredKPIs.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No KPIs found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}