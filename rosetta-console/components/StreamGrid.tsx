"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Package, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Settings,
  LucideIcon
} from "lucide-react";

// Stream configuration from v4 spec lines 229-240
const streamConfig: Record<string, { 
  name: string; 
  icon: LucideIcon; 
  color: string;
  description: string;
}> = {
  WIN: { 
    name: 'Win Work', 
    icon: Trophy, 
    color: 'text-blue-600',
    description: 'Pursue and win new business'
  },
  DELIVER: { 
    name: 'Deliver Work', 
    icon: Package, 
    color: 'text-green-600',
    description: 'Execute and deliver client work'
  },
  COLLECT: { 
    name: 'Collect Cash', 
    icon: DollarSign, 
    color: 'text-yellow-600',
    description: 'Invoice and collect payments'
  },
  EXPAND: { 
    name: 'Expand Clients', 
    icon: TrendingUp, 
    color: 'text-purple-600',
    description: 'Grow existing client relationships'
  },
  TALENT: { 
    name: 'Talent Engine', 
    icon: Users, 
    color: 'text-pink-600',
    description: 'Recruit and develop talent'
  },
  OPERATE: { 
    name: 'Operate Business', 
    icon: Settings, 
    color: 'text-gray-600',
    description: 'Run business operations'
  }
};

interface StreamData {
  code: string;
  name: string;
  stream_id: number;
  is_enabler: boolean;
  unit_count: number;
  units_with_ownership: number;
  coverage_pct: number;
}

interface StreamGridProps {
  streams: StreamData[];
}

export default function StreamGrid({ streams }: StreamGridProps) {
  // Order streams as specified
  const orderedCodes = ['WIN', 'DELIVER', 'COLLECT', 'EXPAND', 'TALENT', 'OPERATE'];
  
  // Create a map for easy lookup
  const streamMap = new Map(streams.map(s => [s.code, s]));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orderedCodes.map(code => {
        const stream = streamMap.get(code);
        const config = streamConfig[code];
        
        if (!config) return null;
        
        const Icon = config.icon;
        const hasData = stream && stream.unit_count > 0;
        const coverage = Number(stream?.coverage_pct) || 0;
        
        return (
          <Link 
            key={code} 
            href={`/stream/${code.toLowerCase()}`}
            className="block"
          >
            <Card className="h-full hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${config.color}`} />
                    {config.name}
                  </span>
                  {hasData && coverage > 0 && (
                    <Badge 
                      variant={coverage >= 80 ? "default" : coverage >= 50 ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {coverage.toFixed(0)}%
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {config.description}
                </p>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Units</span>
                      <span className="text-2xl font-bold">{stream.unit_count}</span>
                    </div>
                    {stream.units_with_ownership > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Observed</span>
                        <span className="text-lg font-medium text-green-600">
                          {stream.units_with_ownership}
                        </span>
                      </div>
                    )}
                    {stream.is_enabler && (
                      <Badge variant="outline" className="w-full justify-center mt-2">
                        Enabler Stream
                      </Badge>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <Icon className={`h-12 w-12 mx-auto mb-2 opacity-20 ${config.color}`} />
                    <p className="text-sm">No units defined</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}