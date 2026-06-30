import React, { useMemo } from "react";
import StatsCard from "../../components/ui/StatsCard"; // Ensure path matches your setup

function StatCardsPatents({
  transformedPatentChartData,
  visiblePatentNames,
  selectedYear,
}) {
  // Calculate dynamic totals based on whether a single year is isolated or not
  const aggregatedStats = useMemo(() => {
    const targetData = selectedYear
      ? transformedPatentChartData.filter((d) => d.year === selectedYear)
      : transformedPatentChartData;

    const totals = {};
    visiblePatentNames.forEach((name) => {
      totals[name] = 0;
    });

    targetData.forEach((row) => {
      visiblePatentNames.forEach((name) => {
        totals[name] += row[name] || 0;
      });
    });

    return totals;
  }, [transformedPatentChartData, visiblePatentNames, selectedYear]);

  return (
    <div className="max-w-[1500px] mx-auto mt-6 px-4">
      <div className="flex items-center gap-2 mb-3 h-6">
        <span className="text-gray-500 text-xs">
          Showing data for:{" "}
          <strong className="text-gray-800">
            {selectedYear ? selectedYear : "All Years Combined"}
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(aggregatedStats).map(([title, value]) => (
          <StatsCard key={title} title={title} value={String(value)} />
        ))}
      </div>
    </div>
  );
}

export default StatCardsPatents;
