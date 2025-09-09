"use client";

import { OwnershipSummary } from "@/components/OwnershipSummary";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  FileText, 
  BarChart3, 
  Building2, 
  DollarSign,
  Layers,
  GitBranch,
  Grid3x3,
  Wrench
} from "lucide-react";

const navigationCards = [
  {
    title: "🆕 Workbench",
    description: "Tree-based navigation with inline ownership editing - single page for everything",
    href: "/workbench",
    status: "working",
    icon: Wrench,
    color: "text-purple-600",
    badge: "NEW"
  },
  {
    title: "Truth Table", 
    description: "Compare expected vs observed ownership with pagination and filtering",
    href: "/truth",
    status: "working",
    icon: Grid3x3,
    color: "text-green-600"
  },
  {
    title: "Value Streams",
    description: "Navigate through all 6 value streams and view unit details",
    href: "/streams",
    status: "working", 
    icon: Layers,
    color: "text-blue-600"
  },
  {
    title: "Evidence Log",
    description: "Complete audit trail with filters by stream, type, and unit",
    href: "/evidence",
    status: "working",
    icon: FileText,
    color: "text-indigo-600"
  },
  {
    title: "KPIs",
    description: "Leading/lagging metrics with aggregation transparency",
    href: "/kpis",
    status: "working",
    icon: BarChart3,
    color: "text-orange-600"
  },
  {
    title: "Finance",
    description: "Direct vs allocated P&L with SG&A distribution toggle",
    href: "/finance",
    status: "working",
    icon: DollarSign,
    color: "text-emerald-600"
  }
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-4">Rosetta Console</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Expose fiction vs reality, connect drivers to outcomes, and show dollars clearly.
        </p>
        <div className="mt-6 p-4 bg-purple-50 rounded-lg max-w-2xl mx-auto">
          <p className="text-sm font-medium text-purple-900">
            💡 <strong>Pro Tip:</strong> Use the new Workbench for the best experience - 
            it combines tree navigation with inline editing in a single interface
          </p>
        </div>
      </div>

      {/* Ownership Summary Dashboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <GitBranch className="h-6 w-6" />
          Ownership Alignment Overview
        </h2>
        <OwnershipSummary onFilterChange={(filters) => {
          // Could navigate to truth table with filters if desired
          console.log('Filter change:', filters);
        }} />
      </div>

      {/* Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Available Pages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            
            return (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${card.color}`} />
                      {card.title}
                      {card.badge && (
                        <span className="ml-auto bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          {card.badge}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Quick Start Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">📊 For Ownership Management:</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Go to <strong>Workbench</strong> for tree-based editing</li>
              <li>2. Or use <strong>Truth Table</strong> for grid view</li>
              <li>3. Click any field to update observed ownership</li>
              <li>4. Changes are logged in <strong>Evidence</strong></li>
            </ol>
          </div>
          <div>
            <h4 className="font-medium mb-2">📈 For Analysis:</h4>
            <ol className="text-sm space-y-1 text-muted-foreground">
              <li>1. Check <strong>KPIs</strong> for metrics status</li>
              <li>2. View <strong>Finance</strong> for P&L analysis</li>
              <li>3. Toggle between direct and allocated views</li>
              <li>4. All data flows from the same source of truth</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Status Footer */}
      <div className="bg-muted rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">6</div>
            <div className="text-sm text-muted-foreground">Pages Working</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">6</div>
            <div className="text-sm text-muted-foreground">Value Streams</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">32</div>
            <div className="text-sm text-muted-foreground">Atomic Units</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">View-Only</div>
            <div className="text-sm text-muted-foreground">Read Contract</div>
          </div>
        </div>
      </div>
    </div>
  );
}