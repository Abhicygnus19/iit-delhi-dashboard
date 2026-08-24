import React, { useMemo } from "react";
import SponsorStatCard from "../../components/ui/SponsorStatCard";
import {
  FaIndustry,
  FaGlobe,
  FaRegBuilding,
  FaHandshake,
  FaGraduationCap,
  FaCoins,
  FaChartPie,
  FaBriefcase,
  FaFlask,
  FaBuildingColumns,
  FaSackDollar,
} from "react-icons/fa6";

// Configuration map for titles and icons for standard categories
const CATEGORY_CONFIG = {
  government: {
    title: "Government Funded Projects",
    icon: FaRegBuilding,
  },
  industry: {
    title: "Industry Funded Projects",
    icon: FaIndustry,
  },
  foreign: {
    title: "Internationally Funded Projects",
    icon: FaGlobe,
  },
};

// Defined priority ordering
const PRIORITY_ORDER = ["government", "industry", "foreign"];

// Curated array of distinct icons for dynamic extra categories
const EXTRA_CATEGORY_ICONS = [
  FaHandshake,
  FaGraduationCap,
  FaCoins,
  FaBriefcase,
  FaFlask,
  FaBuildingColumns,
  FaChartPie,
  FaSackDollar,
];

function ConsultancyStats({
  activeData = [],
  selectedFundingTypes = [],
  selectedBudgetTypes = [],
}) {
  // Aggregate projects and budget per dynamic category name
  const statsMap = useMemo(() => {
    const map = {};

    activeData.forEach((yearData) => {
      (yearData.types || []).forEach((t) => {
        if (!t.name) return;
        const categoryKey = t.name.toLowerCase().trim();

        if (!map[categoryKey]) {
          map[categoryKey] = {
            name: t.name,
            totalProjects: 0,
            totalBudget: 0,
          };
        }

        // Convert string budget/projects to numbers safely
        map[categoryKey].totalProjects += Number(t.projects) || 0;
        map[categoryKey].totalBudget += Number(t.budget) || 0;
      });
    });

    return map;
  }, [activeData]);

  // Filter and Sort Categories: Government -> Industry -> Foreign -> Rest
  const sortedCategories = useMemo(() => {
    // 1. Filter based on selected props filters
    const availableCategories = Object.keys(statsMap).filter((catName) => {
      const matchesFunding =
        selectedFundingTypes.length === 0 ||
        selectedFundingTypes.includes(catName);
      const matchesBudget =
        selectedBudgetTypes.length === 0 ||
        selectedBudgetTypes.includes(catName);

      return matchesFunding && matchesBudget;
    });

    // 2. Sort categories based on priority order array
    return availableCategories.sort((a, b) => {
      const indexA = PRIORITY_ORDER.indexOf(a);
      const indexB = PRIORITY_ORDER.indexOf(b);

      // If both items are in priority list, follow PRIORITY_ORDER
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only A is in priority list, place A first
      if (indexA !== -1) return -1;
      // If only B is in priority list, place B first
      if (indexB !== -1) return 1;

      // For rest of the categories, sort alphabetically
      return a.localeCompare(b);
    });
  }, [statsMap, selectedFundingTypes, selectedBudgetTypes]);

  // Dynamic icon assignment strategy for extra dynamic categories
  const getCategoryIcon = (key) => {
    if (CATEGORY_CONFIG[key]?.icon) {
      return CATEGORY_CONFIG[key].icon;
    }

    // Filter out extra categories that don't match core keys
    const extraCategories = sortedCategories.filter(
      (catKey) => !CATEGORY_CONFIG[catKey],
    );

    const extraIndex = extraCategories.indexOf(key);

    return EXTRA_CATEGORY_ICONS[
      (extraIndex >= 0 ? extraIndex : 0) % EXTRA_CATEGORY_ICONS.length
    ];
  };

  return (
    <div>
      <div className="mx-auto my-6 grid max-w-[1500px] grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3">
        {sortedCategories.map((key) => {
          const stat = statsMap[key];
          const config = CATEGORY_CONFIG[key];

          // Dynamic Title formatting (e.g., "test" -> "Test Funded Projects")
          const title =
            config?.title ||
            `${key.charAt(0).toUpperCase() + key.slice(1)} Funded Projects`;

          const IconComponent = getCategoryIcon(key);

          return (
            <SponsorStatCard
              key={key}
              title={title}
              value={stat.totalProjects}
              icon={IconComponent}
              para="Projects"
              budgetpara="Budget"
              text="Cr"
              symbol="₹"
              budgetvalue={Number(stat.totalBudget.toFixed(2))}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ConsultancyStats;
