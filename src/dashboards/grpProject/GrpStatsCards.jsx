import React from "react";
import StatsCard from "./../../components/ui/StatsCard";

function GrpStatsCards({ grpStatsData }) {
  const stats = React.useMemo(() => {
    return grpStatsData.reduce((acc, item) => {
      const type = item.grpType || "Unknown";

      acc[type] = (acc[type] || 0) + Number(item.totalProjects || 0);

      return acc;
    }, {});
  }, [grpStatsData]);

  return (
    <div className="px-2 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4  max-w-[1500px] mx-auto">
      {Object.entries(stats).map(([type, total]) => (
        <StatsCard key={type} title={`Total ${type} Projects`} value={total} />
      ))}
    </div>
  );
}

export default GrpStatsCards;
