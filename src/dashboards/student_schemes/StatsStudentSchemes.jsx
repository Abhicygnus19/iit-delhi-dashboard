import React, { useMemo } from "react";
import { LuBookText } from "react-icons/lu";
import { BsChatRightQuoteFill } from "react-icons/bs";
import { FaRocket } from "react-icons/fa6";
import { HiOutlineChartBar } from "react-icons/hi";

import StatsCard from "../../components/ui/StatsCard";

function StatsStudentSchemes({ studentsSchemesActiveData = [] }) {
  const grandTotal = useMemo(() => {
    return studentsSchemesActiveData.reduce((acc, scheme) => {
      return (
        acc +
        (scheme.yearlyData || []).reduce(
          (sum, item) => sum + Number(item.count || 0),
          0,
        )
      );
    }, 0);
  }, [studentsSchemesActiveData]);

  const getTotal = (schemeName) => {
    const scheme = studentsSchemesActiveData.find(
      (item) => item.schemeName === schemeName,
    );

    if (!scheme) return 0;

    return (scheme.yearlyData || []).reduce(
      (sum, item) => sum + Number(item.count || 0),
      0,
    );
  };

  return (
    <div className="max-w-[1500px] mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Discover & Learn"
          value={getTotal("Discover & Learn")}
          icon={LuBookText}
          bgClass="bg-gradient-to-r from-blue-500  to-blue-600"
          textClass="text-white"
          titleClass="text-white"
          paraClass="text-white"
          iconBgClass="bg-blue-700"
          iconClass="text-white"
        />

        <StatsCard
          title="Total SURA"
          value={getTotal("SURA")}
          icon={BsChatRightQuoteFill}
          bgClass="bg-gradient-to-r from-emerald-500 to-emerald-600"
          borderClass="border-l-emerald-800"
          iconBgClass="bg-emerald-200"
          iconClass="text-emerald-700"
          textClass="text-white"
          titleClass="text-white"
        />

        <StatsCard
          title="Total Student Startup Action"
          value={getTotal("Student Startup Action")}
          icon={FaRocket}
          bgClass="bg-gradient-to-r from-amber-400  to-amber-500"
          borderClass="border-l-amber-800"
          iconBgClass="bg-amber-200"
          iconClass="text-amber-700"
          textClass="text-amber-800"
        />

        <StatsCard
          title="Total Applications Received"
          value={grandTotal}
          icon={HiOutlineChartBar}
          bgClass="bg-gradient-to-r from-violet-50   to-violet-100"
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
