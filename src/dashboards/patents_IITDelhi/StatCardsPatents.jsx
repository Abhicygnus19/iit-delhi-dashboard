import React, { useMemo } from "react";
import StatsCard from "../../components/ui/StatsCard"; // Ensure path matches your setup
import {
  FaFileSignature,
  FaAward,
  FaHandshake,
  FaLightbulb,
  FaMicroscope,
  FaBuilding,
  FaGraduationCap,
  FaCertificate,
} from "react-icons/fa6";
import { HiOutlineChartBar } from "react-icons/hi";

// Pool of 5 fallback icons for dynamic categories
const ICON_POOL = [
  FaLightbulb,
  FaMicroscope,
  FaBuilding,
  FaGraduationCap,
  FaCertificate,
];

// Styles for known key categories (Note trimmed key name for "Technology License")
const KNOWN_PATENT_STYLES = {
  "Patents Filed": {
    icon: FaFileSignature,
    bgClass: "bg-gradient-to-r from-blue-700 to-blue-800",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-blue-500",
    iconClass: "text-white",
  },
  "Patents Granted": {
    icon: FaAward,
    bgClass: "bg-gradient-to-r from-blue-500 to-blue-600",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-blue-700",
    iconClass: "text-white",
  },
  "Technology License": {
    icon: FaHandshake,
    bgClass: "bg-gradient-to-r from-blue-200 to-blue-400",
    borderClass: "border-l-blue-800",
    iconBgClass: "bg-blue-500",
    iconClass: "text-white",
    textClass: "text-black",
    titleClass: "text-black",
  },
};

// Fallback style presets mapped across dynamic themes
const FALLBACK_STYLES = [
  {
    bgClass: "bg-gradient-to-r from-indigo-500 to-indigo-700",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-indigo-800",
    iconClass: "text-white",
  },
  {
    bgClass: "bg-gradient-to-r from-sky-400 to-sky-600",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-sky-700",
    iconClass: "text-white",
  },
  {
    bgClass: "bg-gradient-to-r from-slate-100 to-slate-200",
    iconBgClass: "bg-slate-700",
    iconClass: "text-white",
    textClass: "text-slate-800",
    titleClass: "text-slate-800",
  },
  {
    bgClass: "bg-gradient-to-r from-emerald-500 to-emerald-700",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-emerald-800",
    iconClass: "text-white",
  },
  {
    bgClass: "bg-gradient-to-r from-gray-200 to-gray-300",
    iconBgClass: "bg-gray-600",
    iconClass: "text-white",
    textClass: "text-gray-900",
    titleClass: "text-gray-900",
  },
];

const PREFERRED_ORDER = [
  "Patents Filed",
  "Patents Granted",
  "Technology License",
];

function StatCardsPatents({
  transformedPatentChartData = [],
  visiblePatentNames = [],
  selectedYear,
}) {
  // Compute aggregated values per category and total grand sum
  const { aggregatedStats, grandTotal } = useMemo(() => {
    const targetData = selectedYear
      ? transformedPatentChartData.filter((d) => d.year === selectedYear)
      : transformedPatentChartData;

    const totals = {};
    let totalSum = 0;

    visiblePatentNames.forEach((name) => {
      totals[name.trim()] = 0;
    });

    targetData.forEach((row) => {
      visiblePatentNames.forEach((name) => {
        const cleanName = name.trim();
        const value = Number(row[name] || row[cleanName] || 0);
        totals[cleanName] += value;
        totalSum += value;
      });
    });

    return { aggregatedStats: totals, grandTotal: totalSum };
  }, [transformedPatentChartData, visiblePatentNames, selectedYear]);

  // Ensure deterministic visual ordering
  const sortedCategories = useMemo(() => {
    const cleanNames = visiblePatentNames.map((n) => n.trim());
    return [...cleanNames].sort((a, b) => {
      const indexA = PREFERRED_ORDER.indexOf(a);
      const indexB = PREFERRED_ORDER.indexOf(b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }, [visiblePatentNames]);

  return (
    <div className="max-w-[1500px] mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedCategories.map((category, index) => {
          const isKnown = KNOWN_PATENT_STYLES[category];

          // Dynamic icon selection from 5 fallback options
          const DynamicIcon = ICON_POOL[index % ICON_POOL.length];

          // Dynamic style selection
          const style =
            isKnown || FALLBACK_STYLES[index % FALLBACK_STYLES.length];
          const IconComponent = style.icon || DynamicIcon;

          return (
            <StatsCard
              key={category}
              title={category}
              value={aggregatedStats[category] || 0}
              icon={IconComponent}
              {...style}
            />
          );
        })}
      </div>
    </div>
  );
}

export default StatCardsPatents;
