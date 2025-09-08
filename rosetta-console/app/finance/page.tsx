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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  Calculator,
  Info,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FinancialRow {
  org_unit_id: number;
  org_code: string;
  org_name: string;
  org_type: string;
  parent_org_id: number | null;
  parent_org_code: string | null;
  parent_org_name: string | null;
  headcount: number;
  revenue: number;
  direct_cost: number;
  gross_margin: number;
  gross_margin_pct: number;
  sga_allocation: number | null;
  operating_income: number | null;
  operating_margin_pct: number | null;
  period_month: string;
  fact_type: string;
}

export default function FinancePage() {
  const [viewMode, setViewMode] = useState<"direct" | "allocated">("direct");
  const [selectedOrgType, setSelectedOrgType] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");

  // Fetch financial data from v_financial_rollup or v_financial_rollup_with_sga (ui-fix.md Section E)
  const { data: financials, isLoading } = useQuery<FinancialRow[]>({
    queryKey: ["financials", viewMode, selectedOrgType, selectedPeriod],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("view", viewMode);
      if (selectedOrgType) params.append("org_type", selectedOrgType);
      if (selectedPeriod) params.append("period", selectedPeriod);

      const response = await fetch(`/api/finance?${params}`);
      if (!response.ok) throw new Error("Failed to fetch financial data");
      return response.json();
    },
  });

  // Group data by org type
  const pillars = financials?.filter((f) => f.org_type === "pillar") || [];
  const coes = financials?.filter((f) => f.org_type === "coe") || [];
  const practices = financials?.filter((f) => f.org_type === "practice") || [];

  // Calculate totals
  const totals = financials?.reduce(
    (acc, curr) => {
      if (!curr.parent_org_id) {
        // Only sum top-level orgs to avoid double counting
        acc.revenue += curr.revenue || 0;
        acc.direct_cost += curr.direct_cost || 0;
        acc.gross_margin += curr.gross_margin || 0;
        acc.sga_allocation += curr.sga_allocation || 0;
        acc.operating_income += curr.operating_income || 0;
        acc.headcount += curr.headcount || 0;
      }
      return acc;
    },
    {
      revenue: 0,
      direct_cost: 0,
      gross_margin: 0,
      sga_allocation: 0,
      operating_income: 0,
      headcount: 0,
    }
  ) || {
    revenue: 0,
    direct_cost: 0,
    gross_margin: 0,
    sga_allocation: 0,
    operating_income: 0,
    headcount: 0,
  };

  // Get unique periods
  const periods = [...new Set(financials?.map((f) => f.period_month) || [])].sort();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return "—";
    return `${value.toFixed(1)}%`;
  };

  const renderOrgCard = (org: FinancialRow) => {
    const marginColor = 
      org.gross_margin_pct >= 30 ? "text-green-600" :
      org.gross_margin_pct >= 20 ? "text-yellow-600" :
      "text-red-600";

    const opMarginColor = 
      (org.operating_margin_pct || 0) >= 20 ? "text-green-600" :
      (org.operating_margin_pct || 0) >= 10 ? "text-yellow-600" :
      "text-red-600";

    return (
      <Card key={org.org_unit_id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{org.org_name}</CardTitle>
              <CardDescription>
                {org.parent_org_name && (
                  <span className="text-xs">
                    {org.parent_org_name} • 
                  </span>
                )}
                {org.org_type === "pillar" && <Badge variant="default">Pillar</Badge>}
                {org.org_type === "coe" && <Badge variant="secondary">COE</Badge>}
                {org.org_type === "practice" && <Badge variant="outline">Practice</Badge>}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-semibold">{org.headcount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Revenue & Direct Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-lg font-bold">{formatCurrency(org.revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Direct Cost</p>
              <p className="text-lg font-bold">{formatCurrency(org.direct_cost)}</p>
            </div>
          </div>

          {/* Gross Margin */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground">Gross Margin</p>
                <p className="text-lg font-bold">{formatCurrency(org.gross_margin)}</p>
              </div>
              <Badge className={marginColor}>
                {formatPercent(org.gross_margin_pct)}
              </Badge>
            </div>
          </div>

          {/* SG&A and Operating Income (only in allocated view) */}
          {viewMode === "allocated" && (
            <>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">SG&A Allocation</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formatCurrency(org.sga_allocation)}
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          SG&A allocated based on revenue contribution
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Operating Income</p>
                    <p className="text-lg font-bold">{formatCurrency(org.operating_income)}</p>
                  </div>
                  <Badge className={opMarginColor}>
                    {formatPercent(org.operating_margin_pct)}
                  </Badge>
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            <span>{org.period_month} • {org.fact_type}</span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Direct vs Allocated P&L with SG&A distribution toggle (ui-fix.md Section E)
        </p>
      </div>

      {/* View Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              P&L View Mode
            </span>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "direct" | "allocated")}
            >
              <ToggleGroupItem value="direct" aria-label="Direct P&L">
                Direct P&L
              </ToggleGroupItem>
              <ToggleGroupItem value="allocated" aria-label="Allocated P&L">
                Allocated P&L (with SG&A)
              </ToggleGroupItem>
            </ToggleGroup>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm">
              {viewMode === "direct" ? (
                <>
                  <strong>Direct P&L:</strong> Shows revenue and direct costs only, 
                  calculating gross margin without SG&A allocation. Uses <code>v_financial_rollup</code>.
                </>
              ) : (
                <>
                  <strong>Allocated P&L:</strong> Includes SG&A distribution based on revenue 
                  contribution, showing operating income. Uses <code>v_financial_rollup_with_sga</code>.
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          value={selectedOrgType}
          onValueChange={(value) => setSelectedOrgType(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Org Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Org Types</SelectItem>
            <SelectItem value="pillar">Pillars Only</SelectItem>
            <SelectItem value="coe">COEs Only</SelectItem>
            <SelectItem value="practice">Practices Only</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Periods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Periods</SelectItem>
            {periods.map((period) => (
              <SelectItem key={period} value={period}>
                {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => {
            setSelectedOrgType("");
            setSelectedPeriod("");
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.revenue)}
                </p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.direct_cost)}
                </p>
                <p className="text-xs text-muted-foreground">Direct Cost</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(totals.gross_margin)}
                </p>
                <p className="text-xs text-muted-foreground">Gross Margin</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {viewMode === "allocated" && (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totals.sga_allocation)}
                    </p>
                    <p className="text-xs text-muted-foreground">SG&A</p>
                  </div>
                  <Calculator className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(totals.operating_income)}
                    </p>
                    <p className="text-xs text-muted-foreground">Op Income</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totals.headcount}</p>
                <p className="text-xs text-muted-foreground">Headcount</p>
              </div>
              <Users className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pillars Section */}
      {pillars.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Pillars
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pillars.map(renderOrgCard)}
          </div>
        </div>
      )}

      {/* COEs Section */}
      {coes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Centers of Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coes.map(renderOrgCard)}
          </div>
        </div>
      )}

      {/* Practices Section */}
      {practices.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Practices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {practices.map(renderOrgCard)}
          </div>
        </div>
      )}

      {(!financials || financials.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No financial data found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}