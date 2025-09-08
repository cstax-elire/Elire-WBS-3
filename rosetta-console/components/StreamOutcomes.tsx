import { Badge } from "./ui";

type OutcomeData = {
  stream: string;
  stream_name: string;
  win_rate?: number;
  avg_margin?: number;
  realization?: number;
  on_time?: number;
  utilization?: number;
  dso?: number;
};

type StreamOutcomesProps = {
  data: OutcomeData[];
};

export default function StreamOutcomes({ data }: StreamOutcomesProps) {
  const getPerformanceColor = (value?: number, target: number = 75) => {
    if (!value) return "text-gray-400";
    if (value >= target) return "text-green-600";
    if (value >= target * 0.9) return "text-yellow-600";
    return "text-red-600";
  };

  const formatMetric = (value?: number, suffix: string = "%") => {
    if (value === null || value === undefined) return "—";
    return `${Math.round(value)}${suffix}`;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold">Stream Outcomes</h3>
        <p className="text-xs text-gray-600">Key performance indicators</p>
      </div>
      
      <div className="p-4 space-y-4">
        {data.map(stream => (
          <div key={stream.stream} className="border rounded p-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <Badge>{stream.stream}</Badge>
                <div className="text-xs text-gray-600 mt-1">{stream.stream_name}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Win Rate</span>
                <span className={`font-medium ${getPerformanceColor(stream.win_rate, 30)}`}>
                  {formatMetric(stream.win_rate)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Margin</span>
                <span className={`font-medium ${getPerformanceColor(stream.avg_margin, 20)}`}>
                  {formatMetric(stream.avg_margin)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Realization</span>
                <span className={`font-medium ${getPerformanceColor(stream.realization, 90)}`}>
                  {formatMetric(stream.realization)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">On-Time</span>
                <span className={`font-medium ${getPerformanceColor(stream.on_time, 85)}`}>
                  {formatMetric(stream.on_time)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Utilization</span>
                <span className={`font-medium ${getPerformanceColor(stream.utilization, 75)}`}>
                  {formatMetric(stream.utilization)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">DSO</span>
                <span className={`font-medium ${stream.dso && stream.dso <= 45 ? "text-green-600" : "text-red-600"}`}>
                  {formatMetric(stream.dso, " days")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}