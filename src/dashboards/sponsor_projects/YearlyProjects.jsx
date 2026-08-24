import React, { useMemo } from "react";

function YearlyProjects({ activeData = [] }) {
  // 1. Extract unique years dynamically from active data
  const yearsRange = useMemo(
    () => activeData.map((item) => item.year),
    [activeData],
  );

  // 2. Identify unique organization types dynamically with priority sorting
  const sponsorOrgTypes = useMemo(() => {
    const rawTypes = Array.from(
      new Set(
        activeData.flatMap((item) =>
          (item.types || []).map((type) => type.name),
        ),
      ),
    );

    const priorityOrder = ["government", "industry", "foreign"];

    return rawTypes.sort((a, b) => {
      const indexA = priorityOrder.indexOf(a.toLowerCase());
      const indexB = priorityOrder.indexOf(b.toLowerCase());

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b);
    });
  }, [activeData]);

  // Helper function to pull project count for a specific year and org type
  const getProjectCount = (targetYear, targetOrg) => {
    const yearData = activeData.find((item) => item.year === targetYear);
    if (!yearData || !yearData.types) return 0;

    const orgData = yearData.types.find(
      (type) => type.name.toLowerCase() === targetOrg.toLowerCase(),
    );
    return orgData ? Number(orgData.projects) || 0 : 0;
  };

  // 3. Compute dynamic min and max non-zero values across the dataset for heat intensity calculation
  const { minCount, maxCount } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    activeData.forEach((item) => {
      (item.types || []).forEach((type) => {
        const val = Number(type.projects) || 0;
        if (val > 0) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });

    return {
      minCount: min === Infinity ? 0 : min,
      maxCount: max === -Infinity ? 0 : max,
    };
  }, [activeData]);

  // 4. Heatmap Cell Style Generator (HSL-based scale from light to dark)
  const getHeatmapStyle = (value) => {
    if (value === 0) {
      return {
        backgroundColor: "#f9fafb", // Default light gray background for empty cells
        color: "#9ca3af",
      };
    }

    // Normalize intensity between 0 and 1
    const intensity =
      maxCount === minCount ? 1 : (value - minCount) / (maxCount - minCount);

    // Adjust lightness: 85% (lightest color for low values) down to 35% (darkest for high values)
    const lightness = 85 - intensity * 50;

    // Switch text color to white for darker backgrounds (< 60% lightness)
    const textColor = lightness < 60 ? "#ffffff" : "#1e293b";

    return {
      backgroundColor: `hsl(217, 91%, ${lightness}%)`, // Blue hue heatmap
      color: textColor,
    };
  };

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs chart-card bg-white">
      <h3 className="text-sm font-semibold mb-4 font-sans">
        Heatmap: Year-wise Project numbers
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-x-2 border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-semibold capitalize min-w-[140px]">
                Organizations \ Years
              </th>
              {yearsRange.map((year) => (
                <th
                  key={year}
                  className="text-center text-muted-foreground font-semibold whitespace-nowrap align-middle"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sponsorOrgTypes.map((org) => (
              <tr key={org}>
                <td className="text-left p-2 font-medium capitalize text-foreground/80 align-middle">
                  {org}
                </td>
                {yearsRange.map((year) => {
                  const count = getProjectCount(year, org);
                  const style = getHeatmapStyle(count);

                  return (
                    <td
                      key={`${org}-${year}`}
                      style={style}
                      className="text-center rounded-md font-semibold transition-all duration-200 p-2"
                    >
                      {count || (
                        <span className="font-extrabold opacity-70">--</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YearlyProjects;

// import React, { useMemo } from "react";

// // Default API-structured color response (Array of Key-Value maps)
// const DEFAULT_SPONSOR_COLOR_MAP = [
//   {
//     government: "#3b82f6", // Blue
//     industry: "#1e4a8d", // Navy
//     foreign: "#86a6e5", // Light Blue
//   },
// ];

// // Fallback pool of hex colors for dynamic extra types not in colorMap
// const FALLBACK_HEX_COLORS = [
//   "#991b1b", // Deep Crimson Red
//   "#334155", // Slate Charcoal
//   "#0f172a", // Dark Slate/Midnight
//   "#b91c1c", // Ruby Red
//   "#2563eb", // Royal Blue
// ];

// function YearlyProjects({
//   activeData = [],
//   sponsorColorMap = DEFAULT_SPONSOR_COLOR_MAP,
// }) {
//   // Convert API array response into a single flat key-value lookup object
//   const colorLookupMap = useMemo(() => {
//     if (!Array.isArray(sponsorColorMap)) return {};
//     return sponsorColorMap.reduce((acc, currMap) => {
//       return { ...acc, ...currMap };
//     }, {});
//   }, [sponsorColorMap]);

//   // 1. Extract unique years dynamically from active data
//   const yearsRange = useMemo(
//     () => activeData.map((item) => item.year),
//     [activeData],
//   );

//   // 2. Identify unique organization types dynamically and ensure government, industry, foreign are prioritized
//   const sponsorOrgTypes = useMemo(() => {
//     const rawTypes = Array.from(
//       new Set(
//         activeData.flatMap((item) =>
//           (item.types || []).map((type) => type.name),
//         ),
//       ),
//     );

//     const priorityOrder = ["government", "industry", "foreign"];

//     return rawTypes.sort((a, b) => {
//       const indexA = priorityOrder.indexOf(a.toLowerCase());
//       const indexB = priorityOrder.indexOf(b.toLowerCase());

//       if (indexA !== -1 && indexB !== -1) return indexA - indexB;
//       if (indexA !== -1) return -1;
//       if (indexB !== -1) return 1;

//       return a.localeCompare(b);
//     });
//   }, [activeData]);

//   // Helper function to pull project count for a specific year and org type
//   const getProjectCount = (targetYear, targetOrg) => {
//     const yearData = activeData.find((item) => item.year === targetYear);
//     if (!yearData || !yearData.types) return 0;

//     const orgData = yearData.types.find(
//       (type) => type.name.toLowerCase() === targetOrg.toLowerCase(),
//     );
//     return orgData ? Number(orgData.projects) || 0 : 0;
//   };

//   // 3. Dynamic Cell Style Resolver (Hex color based)
//   const getCellStyle = (org, value) => {
//     if (value === 0) {
//       return {
//         style: { backgroundColor: "#f9fafb", color: "black" }, // Equivalent to bg-gray-50 text-gray-400
//       };
//     }

//     const orgKey = org.toLowerCase().trim();

//     // Check if color is explicitly available from API map
//     if (colorLookupMap[orgKey]) {
//       return {
//         style: {
//           backgroundColor: colorLookupMap[orgKey],
//           color: "#ffffff",
//         },
//       };
//     }

//     // Fallback logic for dynamic types not defined in API map
//     const extraTypeIndex = sponsorOrgTypes
//       .filter((name) => !colorLookupMap[name.toLowerCase().trim()])
//       .indexOf(org);

//     const fallbackHex =
//       FALLBACK_HEX_COLORS[
//         (extraTypeIndex >= 0 ? extraTypeIndex : 0) % FALLBACK_HEX_COLORS.length
//       ];

//     return {
//       style: {
//         backgroundColor: fallbackHex,
//         color: "#ffffff",
//       },
//     };
//   };

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs chart-card bg-white">
//       <h3 className="text-sm font-semibold mb-4 font-sans">
//         Year-wise Project numbers
//       </h3>
//       <div className="overflow-x-auto">
//         <table className="w-full text-xs border-separate border-spacing-x-2 border-spacing-y-2">
//           <thead>
//             <tr>
//               <th className="text-left text-muted-foreground font-semibold capitalize min-w-[140px]">
//                 Organizations \ Years
//               </th>
//               {yearsRange.map((year) => (
//                 <th
//                   key={year}
//                   className="text-center text-muted-foreground font-semibold whitespace-nowrap align-middle"
//                 >
//                   {year}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {sponsorOrgTypes.map((org) => (
//               <tr key={org}>
//                 <td className="text-left p-2 font-medium capitalize text-foreground/80 align-middle">
//                   {org}
//                 </td>
//                 {yearsRange.map((year) => {
//                   const count = getProjectCount(year, org);
//                   const { style } = getCellStyle(org, count);

//                   return (
//                     <td
//                       key={`${org}-${year}`}
//                       style={style}
//                       className="text-center rounded-md font-semibold transition-all duration-200 p-2"
//                     >
//                       {count || (
//                         <span className="font-extrabold opacity-70">--</span>
//                       )}
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default YearlyProjects;
