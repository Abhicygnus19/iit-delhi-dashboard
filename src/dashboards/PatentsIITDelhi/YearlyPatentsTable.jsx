import React, { useMemo } from "react";
import { RxCross1 } from "react-icons/rx";

function YearlyPatentsTable({
  transformedPatentChartData,
  patentTypes,
  visiblePatentData,
  isFiltered, // Updated prop
  clearFilter,
}) {
  // Map columns based on visible data so it mirrors chart slicing
  const yearsRange = useMemo(() => {
    return visiblePatentData.map((d) => d.year);
  }, [visiblePatentData]);

  // Helper function to dynamically color cells based on data value ranges
  const getCellBgClass = (count) => {
    if (!count || count === 0) return "bg-[#eff6ff] text-gray-400 font-normal";
    if (count < 50) return "bg-[#eff6ff] text-[#1e40af] font-medium";
    if (count < 100) return "bg-[#dbeafe] text-[#1e40af] font-semibold";
    if (count < 150) return "bg-[#bfdbfe] text-[#1e40af] font-semibold";
    if (count < 300) return "bg-[#60a5fa] text-white font-bold";
    return "bg-[#3b82f6] text-white font-bold";
  };

  return (
    <div className="border border-gray-200 p-5 rounded-md shadow-sm text-xs bg-white flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">
          Yearly records of Patents & Categories
        </h3>

        {/* Reset Filter Action */}
        {isFiltered && (
          <button
            onClick={clearFilter}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-separate border-spacing-x-2 border-spacing-y-2 p-1">
          <thead>
            <tr>
              <th className="text-left py-2 text-muted-foreground font-medium border-b capitalize min-w-[120px]">
                Patent types \ Years
              </th>
              {yearsRange.map((year) => (
                <th
                  key={year}
                  className="text-center font-semibold whitespace-nowrap"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="align-middle">
            {patentTypes.map((type) => (
              <tr key={type} className="group border-b">
                {/* Fixed Type Header Column */}
                <td>{type}</td>

                {/* Dynamically Colored Data Cells */}
                {yearsRange.map((year) => {
                  const yearRow = transformedPatentChartData.find(
                    (d) => d.year === year,
                  );
                  const count = yearRow ? yearRow[type] : 0;

                  return (
                    <td
                      key={year}
                      className={`text-center p-2 rounded-lg text-xs ${getCellBgClass(count)}`}
                    >
                      {count > 0 ? count : <span>--</span>}
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

export default YearlyPatentsTable;

// import React, { useMemo } from "react";
// import { RxCross1 } from "react-icons/rx";

// function YearlyPatentsTable({
//   transformedPatentChartData,
//   patentTypes,
//   visiblePatentData,
//   selectedYear,
//   clearFilter,
// }) {
//   // Map columns based on visible data so it mirrors chart slicing
//   const yearsRange = useMemo(() => {
//     return visiblePatentData.map((d) => d.year);
//   }, [visiblePatentData]);

//   // Helper function to dynamically color cells based on data value ranges
//   const getCellBgClass = (count) => {
//     if (!count || count === 0) return "bg-[#eff6ff] text-gray-400 font-normal";
//     if (count < 50) return "bg-[#eff6ff] text-[#1e40af] font-medium";
//     if (count < 100) return "bg-[#dbeafe] text-[#1e40af] font-semibold";
//     if (count < 150) return "bg-[#bfdbfe] text-[#1e40af] font-semibold";
//     if (count < 300) return "bg-[#60a5fa] text-white font-bold";
//     return "bg-[#3b82f6] text-white font-bold";
//   };

//   return (
//     <div className="border border-gray-200 p-5 rounded-md shadow-sm text-xs bg-white flex flex-col">
//       <div className="flex justify-between items-center mb-3">
//         <h3 className="text-sm font-semibold">
//           Yearly records of Patents & Categories
//         </h3>

//         {/* Reset Filter Action */}
//         {selectedYear && (
//           <button
//             onClick={clearFilter}
//             className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
//           >
//             <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
//           </button>
//         )}
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-xs text-left border-separate border-spacing-x-2 border-spacing-y-2 p-1">
//           <thead>
//             <tr>
//               <th className="text-left py-2 text-muted-foreground font-medium border-b capitalize min-w-[120px]">
//                 Patent types \ Years
//               </th>
//               {yearsRange.map((year) => (
//                 <th
//                   key={year}
//                   className="text-center font-semibold whitespace-nowrap"
//                 >
//                   {year}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody className="align-middle">
//             {patentTypes.map((type) => (
//               <tr key={type} className="group border-b">
//                 {/* Fixed Type Header Column */}
//                 <td>{type}</td>

//                 {/* Dynamically Colored Data Cells */}
//                 {yearsRange.map((year) => {
//                   const yearRow = transformedPatentChartData.find(
//                     (d) => d.year === year,
//                   );
//                   const count = yearRow ? yearRow[type] : 0;

//                   return (
//                     <td
//                       key={year}
//                       className={`text-center p-2 rounded-lg text-xs ${getCellBgClass(count)}`}
//                     >
//                       {count > 0 ? count : <span>--</span>}
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

// export default YearlyPatentsTable;
