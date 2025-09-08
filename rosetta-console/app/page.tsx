"use client";

import { OwnershipSummary } from "@/components/OwnershipSummary";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  BarChart3, 
  Building2, 
  DollarSign,
  Layers,
  TrendingUp
} from "lucide-react";

const navigationCards = [
  {
    title: "Truth Table",
    description: "Compare expected vs observed ownership with real-time editing",
    href: "/truth",
    status: "working",
    icon: CheckCircle2,
    color: "text-green-600"
  },
  {
    title: "Value Streams",
    description: "Navigate through all 6 value streams including EXPAND",
    href: "/streams",
    status: "working", 
    icon: Layers,
    color: "text-blue-600"
  },
  {
    title: "Evidence Log",
    description: "Audit trail of all ownership changes and updates",
    href: "/evidence",
    status: "coming-soon",
    icon: FileText,
    color: "text-gray-400"
  },
  {
    title: "KPIs",
    description: "Driver and outcome metrics management",
    href: "/kpis",
    status: "coming-soon",
    icon: BarChart3,
    color: "text-gray-400"
  },
  {
    title: "Organization",
    description: "Hierarchical org structure with financial rollups",
    href: "/org",
    status: "coming-soon",
    icon: Building2,
    color: "text-gray-400"
  },
  {
    title: "Finance",
    description: "Direct and allocated P&L views",
    href: "/finance",
    status: "coming-soon",
    icon: DollarSign,
    color: "text-gray-400"
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
      </div>

      {/* Ownership Summary Dashboard */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-semibold mb-6">Ownership Alignment Overview</h2>
        <OwnershipSummary />
      </div>

      {/* Navigation Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">System Navigation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {navigationCards.map((card) => {
            const Icon = card.icon;
            const isWorking = card.status === "working";
            
            return isWorking ? (
              <Link key={card.title} href={card.href}>
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${card.color}`} />
                      {card.title}
                      <span className="ml-auto">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card key={card.title} className="opacity-60 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className={card.color} />
                    {card.title}
                    <span className="ml-auto">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{card.description}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2 font-medium">
                    Coming Soon
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Status Footer */}
      <div className="bg-muted rounded-lg p-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">2</div>
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
        </div>
      </div>
    </div>
  );
}