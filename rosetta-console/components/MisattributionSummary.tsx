type SummaryData = {
  aligned: number;
  misattributed: number;
  not_observed: number;
  total_cost: number;
};

type MisattributionSummaryProps = {
  data: SummaryData;
};

export default function MisattributionSummary({ data }: MisattributionSummaryProps) {
  const total = data.aligned + data.misattributed + data.not_observed;
  const alignedPct = total > 0 ? Math.round((data.aligned / total) * 100) : 0;
  
  return (
    <div className="bg-white border-b">
      <div className="container py-4">
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{data.aligned}</div>
            <div className="text-sm text-gray-600">Aligned</div>
            <div className="text-xs text-gray-500">{alignedPct}%</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{data.misattributed}</div>
            <div className="text-sm text-gray-600">Misattributed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">{data.not_observed}</div>
            <div className="text-sm text-gray-600">Not Observed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-600">Total Units</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-red-700">
              ${data.total_cost ? (data.total_cost / 1000000).toFixed(1) : "0"}M
            </div>
            <div className="text-sm text-gray-600">Misattribution Cost</div>
            <div className="text-xs text-gray-500">Annual Impact</div>
          </div>
        </div>
      </div>
    </div>
  );
}