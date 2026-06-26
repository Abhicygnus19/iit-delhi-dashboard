import React, { useMemo } from "react";

function HeatmapYearPublications({
  entities = [], // Use global data context array passed down from parent
  selectedYear,
  selectedOrgType,
  onYearSelect,
}) {
  const years = useMemo(() => {
    return [
      ...new Set(
        entities.flatMap((dept) =>
          (dept.publications || []).map((p) => p.year),
        ),
      ),
    ].sort((a, b) => a - b);
  }, [entities]);

  const uniqueOrgTypes = useMemo(() => {
    return [...new Set(entities.map((dept) => dept.orgType).filter(Boolean))];
  }, [entities]);

  const getCellValue = (orgType, year) => {
    return entities
      .filter((dept) => dept.orgType === orgType)
      .reduce((sum, dept) => {
        const pubYear = dept.publications?.find((p) => p.year === year);
        return sum + (pubYear ? pubYear.value : 0);
      }, 0);
  };

  const getCellStyle = (value) => {
    const maxExpectedValue = 450;
    const intensity = Math.min(value / maxExpectedValue, 1);
    return {
      backgroundColor: `rgba(59, 130, 246, ${Math.max(intensity, 0.12)})`,
      color: intensity > 0.6 ? "#ffffff" : "inherit",
    };
  };

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs chart-card">
      <h3 className="text-sm font-semibold mb-3 font-sans capitalize">
        Heatmap: Year × Org Type
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left p-1.5 text-muted-foreground font-medium border-b capitalize">
                Type \ Year
              </th>
              {years.map((year) => (
                <th
                  key={year}
                  className={
                    "p-1.5 text-center text-muted-foreground font-medium " +
                    (selectedYear === year ? "bg-blue-50 text-blue-700" : "")
                  }
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {uniqueOrgTypes.map((orgType) => (
              <tr key={orgType} className="hover:bg-muted/30">
                <td className="p-1.5 font-medium whitespace-nowrap capitalize">
                  {orgType}
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
                        "p-1 text-center cursor-pointer transition-all hover:scale-105 " +
                        (isSelected
                          ? "border-2 border-blue-500 rounded bg-blue-50"
                          : "")
                      }
                      onClick={() => onYearSelect?.(year, orgType)}
                    >
                      <div
                        className="rounded px-2 py-1.5 font-medium min-w-[45px]"
                        title={`${orgType}, ${year}: ${cellValue}`}
                        style={getCellStyle(cellValue)}
                      >
                        {cellValue}
                      </div>
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

export default HeatmapYearPublications;

// import React from "react";
// import { publicationData } from "../../lib/publicationData";

// function HeatmapYearPublications({
//   selectedYear,
//   selectedOrgType,
//   onYearSelect,
// }) {
//   const years = [
//     ...new Set(
//       publicationData.departments.flatMap((dept) =>
//         dept.publications.map((p) => p.year),
//       ),
//     ),
//   ].sort((a, b) => a - b);

//   const uniqueOrgTypes = [
//     ...new Set(publicationData.departments.map((dept) => dept.orgType)),
//   ];

//   // 2. Helper function to calculate total publications for a specific type and year
//   const getCellValue = (orgType, year) => {
//     return publicationData.departments
//       .filter((dept) => dept.orgType === orgType) // Filter by matching orgType
//       .reduce((sum, dept) => {
//         // Find the publication record for that specific year
//         const pubYear = dept.publications.find((p) => p.year === year);
//         return sum + (pubYear ? pubYear.value : 0);
//       }, 0);
//   };

//   // 3. Generate a dynamic background color based on the value intensity
//   const getCellStyle = (value) => {
//     // Determine opacity/intensity (Max value in your dataset is roughly ~400 for 'department' in peak years)
//     const maxExpectedValue = 450;
//     const intensity = Math.min(value / maxExpectedValue, 1);

//     // Mix between a light blue and a deep slate/blue brand color
//     return {
//       backgroundColor: `rgba(59, 130, 246, ${Math.max(intensity, 0.12)})`, // Tailwind blue-500 base
//       color: intensity > 0.6 ? "#ffffff" : "inherit",
//     };
//   };

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs chart-card">
//       <h3 className="text-sm font-semibold mb-3 font-sans capitalize">
//         Heatmap: Year × Org Type
//       </h3>
//       <div className="overflow-x-auto">
//         <table className="w-full text-xs border-collapse">
//           <thead>
//             <tr>
//               <th className="text-left p-1.5 text-muted-foreground font-medium border-b capitalize">
//                 Type \ Year
//               </th>
//               {/* Dynamically render Year headers */}
//               {years.map((year) => (
//                 <th
//                   key={year}
//                   className={
//                     "p-1.5 text-center text-muted-foreground font-medium" +
//                     (selectedYear === year ? "bg-blue-50 text-blue-700" : "")
//                   }
//                 >
//                   {year}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {/* Dynamically render rows based on Org Types */}
//             {uniqueOrgTypes.map((orgType) => (
//               <tr key={orgType} className="hover:bg-muted/30">
//                 <td className="p-1.5 font-medium whitespace-nowrap capitalize">
//                   {orgType}
//                 </td>

//                 {/* Dynamically render cells calculating intersected data */}
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
//     </div>
//   );
// }

// export default HeatmapYearPublications;
