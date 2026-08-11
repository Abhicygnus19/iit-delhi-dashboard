import React, { useMemo } from "react";

const ORG_TYPE_COLORS = {
  department: "#1e4a8d", // navy
  centre: "rgb(48 110 255)", // blue
  school: "rgb(147 157 250)", // light blue
};
const DEFAULT_BAR_COLOR = "#64748b";

function HeatmapYearPublications({
  entities = [], // Dynamic departmental entities array passed from parent
  yearlyStatsData = [], // Yearly aggregate data: [{ year, total, citations, hindex }]
  selectedYear,
  selectedOrgType,
  onYearSelect,
}) {
  // Extract all unique sorted years across both datasets
  const years = useMemo(() => {
    const yearsFromEntities = entities.flatMap((dept) =>
      (dept.publications || []).map((p) => Number(p.year)),
    );
    const yearsFromStats = yearlyStatsData.map((item) =>
      Number(item.year || item.Year),
    );

    const combinedYears = [
      ...new Set([...yearsFromEntities, ...yearsFromStats]),
    ];
    return combinedYears.sort((a, b) => a - b);
  }, [entities, yearlyStatsData]);

  // Extract unique org types dynamically (e.g., Department, Centre, School)
  const uniqueOrgTypes = useMemo(() => {
    return [...new Set(entities.map((dept) => dept.orgType).filter(Boolean))];
  }, [entities]);

  // Map yearly summary statistics for O(1) lookup
  const yearlyStatsMap = useMemo(() => {
    const map = new Map();
    yearlyStatsData.forEach((item) => {
      const yearKey = Number(item.year || item.Year);
      map.set(yearKey, {
        total: Number(item.total || item.TotalPublications || 0),
        citations: Number(item.citations || item.citation || 0),
        hindex: Number(item.hindex || 0),
      });
    });
    return map;
  }, [yearlyStatsData]);

  // Calculate sum of publications for a given org type and year
  const getCellValue = (orgType, year) => {
    return entities
      .filter((dept) => dept.orgType === orgType)
      .reduce((sum, dept) => {
        const pubYear = dept.publications?.find((p) => Number(p.year) === year);
        return sum + (pubYear ? Number(pubYear.value) : 0);
      }, 0);
  };

  // 3-shade red heat styling
  const getCellStyle = (value, maxVal) => {
    const ratio = value / maxVal;

    let backgroundColor = "#fee2e2"; // Light red
    let color = "#991b1b";

    if (ratio >= 0.66) {
      backgroundColor = "#b91c1c"; // Dark red
      color = "#fff";
    } else if (ratio >= 0.33) {
      backgroundColor = "#ef4444"; // Medium red
      color = "#fff";
    }

    return {
      backgroundColor,
      color,
    };
  };

  // Dynamic cell styling per Organisation Type color scheme
  const getCellcolorOrg = (orgType) => {
    const key = orgType?.toLowerCase().trim();
    const backgroundColor = ORG_TYPE_COLORS[key] || DEFAULT_BAR_COLOR;

    return {
      backgroundColor,
      color: "#ffffff", // Crisp white text as shown in image
    };
  };

  return (
    <div className="border-2 p-4 rounded-md shadow-sm  chart-card bg-white ">
      <div className="mb-6  border-b pb-3">
        <h3 className="text-base font-semibold mb-3 font-sans   text-slate-800">
          Heatmap: Publications of Academic Units
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 text-muted-foreground font-semibold border-b capitalize min-w-[140px] text-slate-600">
                  Academic Units \ Year
                </th>
                {years.map((year) => (
                  <th
                    key={year}
                    className={
                      "p-2 text-center text-muted-foreground font-semibold border-b transition-colors " +
                      (selectedYear === year
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-600")
                    }
                  >
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uniqueOrgTypes.map((orgType) => (
                <tr key={orgType}>
                  <td className="p-2 font-semibold whitespace-nowrap capitalize text-slate-700">
                    {orgType + "s"}{" "}
                  </td>

                  {years.map((year) => {
                    const cellValue = getCellValue(orgType, year);
                    const isSelected =
                      selectedYear === year &&
                      selectedOrgType?.toLowerCase() === orgType.toLowerCase();
                    return (
                      <td
                        key={`${orgType}-${year}`}
                        className={
                          "p-1 text-center cursor-pointer transition-all " +
                          (isSelected
                            ? "border-2 border-blue-500 rounded bg-blue-50"
                            : "")
                        }
                        // onClick={() => onYearSelect?.(year, orgType)}
                      >
                        <div
                          className="rounded-lg px-2 py-2 font-bold min-w-[45px] text-center shadow-sm"
                          title={`${orgType}, ${year}: ${cellValue}`}
                          style={getCellcolorOrg(orgType)}
                        >
                          {cellValue.toLocaleString()}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>{" "}
      </div>
      <div className="mb-10 mt-4 ">
        <h3 className="text-base font-semibold mb-3 font-sans capitalize text-slate-800">
          Heatmap: Publications, Citations & H-Index
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 text-muted-foreground font-semibold border-b capitalize min-w-[140px] text-slate-600">
                  Metric \ Year
                </th>
                {years.map((year) => (
                  <th
                    key={year}
                    className={
                      "p-2 text-center text-muted-foreground font-semibold border-b transition-colors " +
                      (selectedYear === year
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-600")
                    }
                  >
                    {year}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Total Publications Row */}
              <tr className="hover:bg-slate-50">
                <td className="p-2 font-semibold text-slate-800 whitespace-nowrap">
                  Total Publications
                </td>
                {years.map((year) => {
                  const totalVal = yearlyStatsMap.get(year)?.total || 0;
                  return (
                    <td key={`total-${year}`} className="p-1 text-center">
                      <div
                        className="rounded px-2 py-1.5 font-semibold min-w-[45px] bg-blue-100"
                        title={`Total Publications, ${year}: ${totalVal.toLocaleString()}`}
                      >
                        {totalVal.toLocaleString()}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Citations Row */}
              <tr className="hover:bg-slate-50">
                <td className="p-2 font-semibold text-slate-800 whitespace-nowrap">
                  Citations
                </td>
                {years.map((year) => {
                  const citationVal = yearlyStatsMap.get(year)?.citations || 0;
                  return (
                    <td key={`citation-${year}`} className="p-1 text-center">
                      <div
                        className="rounded px-2 py-1.5 font-medium min-w-[45px] bg-blue-300"
                        title={`Citations, ${year}: ${citationVal.toLocaleString()}`}
                      >
                        {citationVal.toLocaleString()}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* H-Index Row */}
              <tr className="hover:bg-slate-50">
                <td className="p-2 font-semibold text-slate-800 whitespace-nowrap">
                  H-Index
                </td>
                {years.map((year) => {
                  const hindexVal = yearlyStatsMap.get(year)?.hindex || 0;
                  return (
                    <td key={`hindex-${year}`} className="p-1 text-center">
                      <div
                        className="rounded px-2 py-1.5 font-medium min-w-[45px] bg-blue-500 text-white"
                        title={`H-Index, ${year}: ${hindexVal}`}
                      >
                        {hindexVal}
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>{" "}
    </div>
  );
}

export default HeatmapYearPublications;

// import React, { useMemo } from "react";

// export default function HeatmapYearPublications({
//   entities = [], // Use global data context array passed down from parent
//   selectedYear,
//   selectedOrgType,
//   onYearSelect,
// }) {
//   const years = useMemo(() => {
//     return [
//       ...new Set(
//         entities.flatMap((dept) =>
//           (dept.publications || []).map((p) => p.year),
//         ),
//       ),
//     ].sort((a, b) => a - b);
//   }, [entities]);

//   const uniqueOrgTypes = useMemo(() => {
//     return [...new Set(entities.map((dept) => dept.orgType).filter(Boolean))];
//   }, [entities]);

//   const getCellValue = (orgType, year) => {
//     return entities
//       .filter((dept) => dept.orgType === orgType)
//       .reduce((sum, dept) => {
//         const pubYear = dept.publications?.find((p) => p.year === year);
//         return sum + (pubYear ? pubYear.value : 0);
//       }, 0);
//   };

//   const getCellStyle = (value) => {
//     const maxExpectedValue = 450;
//     const intensity = Math.min(value / maxExpectedValue, 1);
//     return {
//       backgroundColor: `rgba(59, 130, 246, ${Math.max(intensity, 0.12)})`,
//       color: intensity > 0.6 ? "#ffffff" : "inherit",
//     };
//   };

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs chart-card">
//       <h3 className="text-sm font-semibold mb-3 font-sans capitalize">
//         Heatmap: Year × Org Type
//       </h3>

//       <div className="overflow-x-auto mb-12">
//         <table className="w-full text-xs border-collapse">
//           <thead>
//             <tr>
//               <th className="text-left p-1.5 text-muted-foreground font-medium border-b capitalize">
//                 Type \ Year
//               </th>
//               {years.map((year) => (
//                 <th
//                   key={year}
//                   className={
//                     "p-1.5 text-center text-muted-foreground font-medium " +
//                     (selectedYear === year ? "bg-blue-50 text-blue-700" : "")
//                   }
//                 >
//                   {year}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {uniqueOrgTypes.map((orgType) => (
//               <tr key={orgType} className="hover:bg-muted/30">
//                 <td className="p-1.5 font-medium whitespace-nowrap capitalize">
//                   {orgType}
//                 </td>

//                 {years.map((year) => {
//                   const cellValue = getCellValue(orgType, year);
//                   const isSelected =
//                     selectedYear === year &&
//                     selectedOrgType?.toLowerCase() === orgType.toLowerCase();
//                   return (
//                     <td
//                       key={`${orgType}-${year}`}
//                       className={
//                         "p-1 text-center cursor-pointer transition-all hover:scale-105 " +
//                         (isSelected
//                           ? "border-2 border-blue-500 rounded bg-blue-50"
//                           : "")
//                       }
//                       onClick={() => onYearSelect?.(year, orgType)}
//                     >
//                       <div
//                         className="rounded px-2 py-1.5 font-medium min-w-[45px]"
//                         title={`${orgType}, ${year}: ${cellValue}`}
//                         style={getCellStyle(cellValue)}
//                       >
//                         {cellValue}
//                       </div>
//                     </td>
//                   );
//                 })}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-xs border-collapse">
//           <thead>
//             <tr>
//               <th className="text-left p-1.5 text-muted-foreground font-medium border-b capitalize">
//                 All type & Year
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr className="hover:bg-muted/30">
//               <td className="p-1.5 font-medium whitespace-nowrap capitalize">
//                 Citation
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       <h3 className="mt-10 text-center text-sm font-medium ">
//         Yearly total publication of each Academic Units
//       </h3>
//     </div>
//   );
// }
