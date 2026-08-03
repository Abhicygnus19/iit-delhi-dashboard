import React, { useMemo } from "react";
import StatsCard from "../../components/ui/StatsCard"; // Ensure path matches your setup
import { FaFileSignature, FaAward, FaHandshake } from "react-icons/fa6";

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

  const cards = [
    {
      title: "Patents Filed",
      value: aggregatedStats["Patents Filed"] || 0,
      icon: FaFileSignature,
      bgClass: "bg-gradient-to-r from-blue-700  to-blue-800",
      textClass: "text-white",
      titleClass: "text-white",
      paraClass: "text-white",
      iconBgClass: "bg-blue-500",
      iconClass: "text-white",
    },
    {
      title: "Patents Granted",
      value: aggregatedStats["Patents Granted"] || 0,
      icon: FaAward,
      bgClass: "bg-gradient-to-r from-blue-500  to-blue-600",
      textClass: "text-white",
      titleClass: "text-white",
      paraClass: "text-white",
      iconBgClass: "bg-blue-700",
      iconClass: "text-white",
    },
    {
      title: "Technology License Deal",
      value: aggregatedStats["Technology License Deal"] || 0,
      icon: FaHandshake,

      bgClass: "bg-gradient-to-r from-emerald-600  to-emerald-700",
      borderClass: "border-l-emerald-800",
      iconBgClass: "bg-emerald-200",
      iconClass: "text-emerald-900",
      textClass: "text-white",
      titleClass: "text-white",
    },
  ];

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

      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(aggregatedStats).map(([title, value]) => (
          <StatsCard key={title} title={title} value={String(value)} />
        ))}  
      </div> */}

      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            bgClass={card.bgClass}
            borderClass={card.borderClass}
            iconBgClass={card.iconBgClass}
            iconClass={card.iconClass}
            textClass={card.textClass}
            titleClass={card.titleClass}
          />
        ))}
      </div>
    </div>
  );
}

export default StatCardsPatents;
