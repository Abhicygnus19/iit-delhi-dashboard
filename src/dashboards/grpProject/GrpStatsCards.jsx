import React from "react";
import StatsCard from "./../../components/ui/StatsCard";
import { FaGlobeAsia, FaFlag } from "react-icons/fa";

function GrpStatsCards({ grpStatsData }) {
  const stats = React.useMemo(() => {
    return grpStatsData.reduce((acc, item) => {
      const type = item.grpType || "Unknown";

      acc[type] = (acc[type] || 0) + Number(item.totalProjects || 0);

      return acc;
    }, {});
  }, [grpStatsData]);

  const carditem = {
    International: {
      title: "International Collaborations",
      icon: FaGlobeAsia,
      bgClass: "bg-gradient-to-r from-indigo-400  to-indigo-600",
      // borderClass: "border-l-indigo-800",
      iconBgClass: "bg-indigo-200",
      iconClass: "text-blue-700",
      textClass: "text-white",
      titleClass: "text-white",
    },
    National: {
      title: "National Collaborations",
      icon: FaFlag,
      bgClass: "bg-gradient-to-r from-red-600  to-red-800",
      // borderClass: "border-l-red-800",
      iconBgClass: "bg-red-200",
      iconClass: "text-red-700",
      textClass: "text-white",
      titleClass: "text-white",
    },
  };

  return (
    // <div className="px-2 py-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4  max-w-[1500px] mx-auto">
    //   {Object.entries(stats).map(([type, total]) => (
    //     <StatsCard key={type} title={`Total ${type} Projects`} value={total} />
    //   ))}
    // </div>

    <div className="px-2 py-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-[1500px] mx-auto">
      {Object.entries(stats).map(([type, total]) => {
        const item = carditem[type] || {
          title: `Total ${type} Projects`,
        };

        return (
          <StatsCard
            key={type}
            title={item.title}
            value={total}
            icon={item.icon}
            bgClass={item.bgClass}
            borderClass={item.borderClass}
            iconBgClass={item.iconBgClass}
            iconClass={item.iconClass}
            textClass={item.textClass}
            titleClass={item.titleClass}
          />
        );
      })}
    </div>
  );
}

export default GrpStatsCards;
