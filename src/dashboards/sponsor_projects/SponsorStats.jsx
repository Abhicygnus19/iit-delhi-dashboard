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

function SponsorStats({
  activeData = [],
  selectedFundingTypes = [],
  selectedBudgetTypes = [],
}) {
  // 1. Aggregate projects and budget per dynamic category name
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

  // 2. Filter and Sort Categories: Government -> Industry -> Foreign -> Rest
  const sortedCategories = useMemo(() => {
    // Filter based on selected props filters
    const availableCategories = Object.keys(statsMap).filter((catName) => {
      const matchesFunding =
        selectedFundingTypes.length === 0 ||
        selectedFundingTypes.includes(catName);
      const matchesBudget =
        selectedBudgetTypes.length === 0 ||
        selectedBudgetTypes.includes(catName);

      return matchesFunding && matchesBudget;
    });

    // Sort categories based on priority order array
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

  // 3. Helper function to assign distinct icons dynamically
  const getCategoryIcon = (key) => {
    if (CATEGORY_CONFIG[key]?.icon) {
      return CATEGORY_CONFIG[key].icon;
    }

    // Get list of all dynamic extra categories present in current view
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

          // Dynamic Title formatting (e.g. "consultancy" -> "Consultancy Funded Projects")
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

export default SponsorStats;

// import React from "react";
// import StatsCard from "../../components/ui/StatsCard";
// import { FaIndustry, FaGlobe, FaIndianRupeeSign } from "react-icons/fa6";
// import { FaRegBuilding } from "react-icons/fa";
// import SponsorStatCard from "../../components/ui/SponsorStatCard";

// function SponsorStats({
//   activeData,
//   selectedFundingTypes = [], // Falls back to empty array to avoid undefined errors
//   selectedBudgetTypes = [], // Falls back to empty array to avoid undefined errors
// }) {
//   // Dynamically compute based on what's passed from parent
//   let totalGovtProject = 0,
//     totalIndustryProject = 0,
//     totalForeignProject = 0;
//   let totalGovBudget = 0,
//     totalIndustryBudget = 0,
//     totalForeignBudget = 0;

//   activeData.forEach((yearData) => {
//     yearData.types.forEach((t) => {
//       if (t.name === "government") {
//         totalGovtProject += t.projects;
//         totalGovBudget += t.budget;
//       }
//       if (t.name === "industry") {
//         totalIndustryProject += t.projects;
//         totalIndustryBudget += t.budget;
//       }
//       if (t.name === "foreign") {
//         totalForeignProject += t.projects;
//         totalForeignBudget += t.budget;
//       }
//     });
//   });

//   return (
//     <div>
//       <div className="mx-auto my-6 grid max-w-[1500px] grid-cols-1 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3">
//         {(!selectedFundingTypes.length ||
//           selectedFundingTypes.includes("government")) &&
//           (!selectedBudgetTypes.length ||
//             selectedBudgetTypes.includes("government")) && (
//             <SponsorStatCard
//               title="Government Funded Projects"
//               value={totalGovtProject}
//               icon={FaRegBuilding}
//               para="Projects"
//               budgetpara="Budget"
//               text="Cr"
//               symbol="₹"
//               budgetvalue={Number(totalGovBudget.toFixed(2))}
//             />
//           )}

//         {(!selectedFundingTypes.length ||
//           selectedFundingTypes.includes("industry")) &&
//           (!selectedBudgetTypes.length ||
//             selectedBudgetTypes.includes("industry")) && (
//             <SponsorStatCard
//               title="Industry Funded Projects"
//               value={totalIndustryProject}
//               icon={FaIndustry}
//               para="Projects"
//               budgetpara="Budget"
//               text="Cr"
//               symbol="₹"
//               budgetvalue={Number(totalIndustryBudget.toFixed(2))}
//             />
//           )}

//         {(!selectedFundingTypes.length ||
//           selectedFundingTypes.includes("foreign")) &&
//           (!selectedBudgetTypes.length ||
//             selectedBudgetTypes.includes("foreign")) && (
//             <SponsorStatCard
//               title="Internationally Funded Projects"
//               value={totalForeignProject}
//               icon={FaGlobe}
//               para="Projects"
//               budgetpara="Budget"
//               text="Cr"
//               symbol="₹"
//               budgetvalue={Number(totalForeignBudget.toFixed(2))}
//             />
//           )}
//       </div>
//     </div>
//   );
// }

// export default SponsorStats;
