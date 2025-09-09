"use client";

import { StreamTreeWithUnits } from "@/components/StreamTreeWithUnits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layers, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function StreamsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Value Streams</h1>
        <p className="text-muted-foreground">
          Navigate value stream hierarchy with unit ownership details and real-time editing
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How to Use This View</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Click on streams to expand and see their units</li>
          <li>• Each unit shows expected vs observed ownership</li>
          <li>• Click "Click to set" to assign ownership using dropdowns</li>
          <li>• Changes are saved immediately and rollups update automatically</li>
          <li>• Color coding: Green = Aligned, Red = Misattributed, Gray = Not Observed</li>
        </ul>
      </div>

      {/* Legend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Aligned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Observed ownership matches expected ownership
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Misattributed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Observed ownership differs from expected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              Not Observed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              No ownership has been set yet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stream Tree */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Stream Hierarchy with Unit Ownership</h2>
        </div>
        <StreamTreeWithUnits />
      </div>
    </div>
  );
}