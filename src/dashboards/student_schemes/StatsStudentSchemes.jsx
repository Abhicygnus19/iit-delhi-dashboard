import React, { useMemo } from "react";
import { LuBookText } from "react-icons/lu";
import { BsChatRightQuoteFill } from "react-icons/bs";
import {
  FaRocket,
  FaGraduationCap,
  FaLightbulb,
  FaAward,
  FaBuilding,
  FaMicroscope,
} from "react-icons/fa6";
import { HiOutlineChartBar } from "react-icons/hi";

import StatsCard from "../../components/ui/StatsCard";

// Distinct icons pool for dynamic scheme cards
const ICON_POOL = [
  FaGraduationCap,
  FaLightbulb,
  FaAward,
  FaBuilding,
  FaMicroscope,
];

// Primary known scheme styles
const KNOWN_SCHEME_STYLES = {
  "Discover & Learn": {
    icon: LuBookText,
    bgClass: "bg-gradient-to-r from-blue-500 to-blue-600",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-blue-700",
    iconClass: "text-white",
  },
  SURA: {
    icon: BsChatRightQuoteFill,
    bgClass: "bg-gradient-to-r from-blue-300 to-blue-400",
    // borderClass: "border-l-blue-800",
    iconBgClass: "bg-blue-200",
    iconClass: "text-blue-700",
    textClass: "text-black",
    titleClass: "text-black",
  },
  "Student Startup Action": {
    icon: FaRocket,
    bgClass: "bg-gradient-to-r from-blue-100 to-blue-200",
    // borderClass: "border-l-blue-800",
    iconBgClass: "bg-blue-600",
    iconClass: "text-white",
    textClass: "text-blue-800",
  },
};

// Fallback style presets mapped to dynamic shade themes (Red, Slate, Sky, Emerald, Gray)
const FALLBACK_STYLES = [
  {
    bgClass: "bg-gradient-to-r from-red-600 to-red-800",
    // borderClass: "border-l-red-800",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-red-500",
    iconClass: "text-white",
  },
  {
    bgClass: "bg-gradient-to-r from-slate-100 to-slate-200",
    // borderClass: "border-l-slate-800",
    iconBgClass: "bg-slate-700",
    iconClass: "text-white",
    textClass: "text-slate-800",
  },
  {
    bgClass: "bg-gradient-to-r from-sky-400 to-sky-500",
    textClass: "text-white",
    titleClass: "text-white",
    paraClass: "text-white",
    iconBgClass: "bg-sky-700",
    iconClass: "text-white",
  },

  {
    bgClass: "bg-gradient-to-r from-gray-200 to-gray-300",
    // borderClass: "border-l-gray-700",
    iconBgClass: "bg-gray-600",
    iconClass: "text-white",
    textClass: "text-gray-900",
  },
];

function StatsStudentSchemes({ studentsSchemesActiveData = [] }) {
  // Aggregate individual totals and total applications
  const { schemeTotals, grandTotal } = useMemo(() => {
    let total = 0;
    const totalsMap = {};

    studentsSchemesActiveData.forEach((scheme) => {
      const schemeSum = (scheme.yearlyData || []).reduce(
        (sum, item) => sum + Number(item.count || 0),
        0,
      );
      totalsMap[scheme.schemeName] = schemeSum;
      total += schemeSum;
    });

    return { schemeTotals: totalsMap, grandTotal: total };
  }, [studentsSchemesActiveData]);

  const PREFERRED_ORDER = [
    "Discover & Learn",
    "SURA",
    "Student Startup Action",
  ];

  // Keep top 3 in order, follow with dynamic additions
  const sortedSchemes = useMemo(() => {
    return [...studentsSchemesActiveData].sort((a, b) => {
      const indexA = PREFERRED_ORDER.indexOf(a.schemeName);
      const indexB = PREFERRED_ORDER.indexOf(b.schemeName);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return 0;
    });
  }, [studentsSchemesActiveData]);

  return (
    <div className="max-w-[1500px] mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sortedSchemes.map((scheme, index) => {
          const isKnown = KNOWN_SCHEME_STYLES[scheme.schemeName];

          // Pick dynamic icon from icon pool if not known
          const DynamicIcon = ICON_POOL[index % ICON_POOL.length];

          const style =
            isKnown || FALLBACK_STYLES[index % FALLBACK_STYLES.length];
          const IconComponent = style.icon || DynamicIcon;

          return (
            <StatsCard
              key={scheme.schemeName || index}
              title={`Total ${scheme.schemeName}`}
              value={schemeTotals[scheme.schemeName] || 0}
              icon={IconComponent}
              {...style}
            />
          );
        })}

        {/* Aggregate Grand Total Card */}
        <StatsCard
          title="Total Projects Awarded"
          value={grandTotal}
          icon={HiOutlineChartBar}
          bgClass="bg-gradient-to-r from-violet-50 to-violet-100"
          borderClass="border-l-violet-800"
          iconBgClass="bg-violet-200"
          iconClass="text-violet-700"
          textClass="text-violet-800"
        />
      </div>
    </div>
  );
}

export default StatsStudentSchemes;

// import React, { useMemo } from "react";
// import StatsCard from "../../components/ui/StatsCard";

// function StatsStudentSchemes({ studentsSchemesActiveData = [] }) {
//   // 1. Calculate the grand total of ALL currently active/filtered items combined
//   const grandTotal = useMemo(() => {
//     return studentsSchemesActiveData.reduce((acc, scheme) => {
//       const yearlyValues = Array.isArray(scheme.yearlyData)
//         ? scheme.yearlyData
//         : [];
//       const schemeSum = yearlyValues.reduce(
//         (sum, item) => sum + (Number(item.count) || 0),
//         0,
//       );
//       return acc + schemeSum;
//     }, 0);
//   }, [studentsSchemesActiveData]);

//   // 2. Map whatever array items are inside studentsSchemesActiveData into distinct metric cards
//   const dynamicCards = useMemo(() => {
//     return studentsSchemesActiveData.map((scheme, index) => {
//       const yearlyValues = Array.isArray(scheme.yearlyData)
//         ? scheme.yearlyData
//         : [];
//       const totalValue = yearlyValues.reduce(
//         (sum, item) => sum + (Number(item.count) || 0),
//         0,
//       );

//       return {
//         id: scheme.schemeName || `scheme-${index}`,
//         title: `Total ${scheme.schemeName}`,
//         value: totalValue,
//       };
//     });
//   }, [studentsSchemesActiveData]);

//   return (
//     <div className="max-w-[1500px] mx-auto mt-6 px-4">
//       {/* Responsive Grid Layout System */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {/* Dynamically generated boxes based on selected/active filters */}
//         {dynamicCards.map((card) => (
//           <StatsCard key={card.id} title={card.title} value={card.value} />
//         ))}
//         {/* Overall Summary Box - Always displays active aggregate count */}
//         <StatsCard
//           title="Overall Submissions"
//           value={grandTotal}
//           color="border-indigo-600"
//         />
//       </div>
//     </div>
//   );
// }

// export default StatsStudentSchemes;
