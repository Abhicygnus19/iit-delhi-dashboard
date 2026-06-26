// import { useMemo } from "react";

// function SponsorProjectTable({
//   sponsorEntities = [],
//   sponsorProjectYearRange,
// }) {
//   const SponsorProjectTableData = useMemo(() => {}, []);

//   return (
//     <div>
//       <div className="border-2 p-4 rounded-md shadow-sm text-xs w-100">
//         <div className="flex items-center justify-between mb-3 gap-3">
//           <h3 className="text-sm font-semibold">
//             Filtered Data ({SponsorProjectTable.length} )
//           </h3>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-xs">
//             <thead>
//               <tr className="border-b border-border">
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Type
//                 </th>
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Org Unit
//                 </th>
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Metric
//                 </th>
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Year
//                 </th>
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Value
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {tableData.map((row, index) => (
//                 <tr
//                   key={index}
//                   className="border-b border-border/50 cursor-pointer hover:bg-gray-100 transition-colors"
//                 >
//                   <td className="p-2">{row.type}</td>
//                   <td className="p-2 font-medium max-w-[200px] truncate">
//                     {row.orgUnit}
//                   </td>
//                   <td className="p-2 text-blue-600">{row.metric}</td>
//                   <td className="p-2">{row.year}</td>
//                   <td className="p-2 font-medium">
//                     {row.value.toLocaleString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SponsorProjectTable;
