import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { RxCross1 } from "react-icons/rx";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

const ORG_TYPE_COLORS = {
  department: "#1e4a8d", // Blue
  centre: "rgb(48, 110, 255)", // Teal
  school: "rgb(147, 157, 250)", // Purple
};

const DEFAULT_BAR_COLOR = "#64748b";

const getBarColor = (orgType) => {
  if (!orgType) return DEFAULT_BAR_COLOR;
  const key = String(orgType).toLowerCase().trim();
  return ORG_TYPE_COLORS[key] || DEFAULT_BAR_COLOR;
};

export default function BarChartBoxPublications({
  entities = [],
  yearRange,
  onEntitySelect,
  onReset,
  showReset,
}) {
  const fullPublicationBarsData = useMemo(() => {
    const [startYear, endYear] = yearRange ?? [];

    return entities
      .map((item) => {
        const value =
          startYear != null && endYear != null
            ? item.publications?.reduce((sum, pub) => {
                if (pub.year >= startYear && pub.year <= endYear) {
                  return sum + Number(pub.value || 0);
                }
                return sum;
              }, 0) || 0
            : item.total || 0;

        return {
          code: item.code,
          name: item.name || "Unknown",
          value,
          citations: item.citations ?? 0,
          orgType: item.orgType || item.type || "orgType",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [entities, yearRange]);

  // Set default count to show all items initially
  const [maxPublicationBarCount, setMaxPublicationBarCount] = useState(
    fullPublicationBarsData.length || 12,
  );

  // Sync count whenever entities or year range changes
  useEffect(() => {
    setMaxPublicationBarCount(fullPublicationBarsData.length || 12);
  }, [fullPublicationBarsData.length]);

  const displayedPublicationBarData = useMemo(() => {
    return fullPublicationBarsData.slice(0, maxPublicationBarCount);
  }, [fullPublicationBarsData, maxPublicationBarCount]);

  const isSingleSelection = entities?.length === 1;
  const chartHeight = Math.max(450, displayedPublicationBarData.length * 35);

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <h3 className="font-semibold text-sm">
            Research Output by Academic Unit{" "}
          </h3>
          <p className="text-sm text-gray-700">
            Click/Hover a bar to view the Total Publications and Citations for
            the selected Academic Department, Centre & School
          </p>
        </div>

        {showReset && (
          <button
            onClick={onReset}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span>
            <RxCross1 />
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={displayedPublicationBarData} layout="vertical">
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={150}
            tickFormatter={(value) =>
              value.length > 30 ? `${value.slice(0, 30)}...` : value
            }
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            itemStyle={{ display: "block" }}
            formatter={(value, name, item) => [
              <>
                <span className="font-normal">{value}</span>
                <div className="mt-1 text-gray-700">
                  Citations: {item.payload.citations}
                </div>
              </>,
              "Total no of Publication :",
            ]}
          />
          <Bar
            dataKey="value"
            barSize={isSingleSelection ? 200 : 20}
            cursor="pointer"
            onClick={(data) => onEntitySelect?.(data?.payload?.code)}
            radius={[0, 6, 6, 0]}
          >
            {displayedPublicationBarData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.orgType)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* <div className="flex flex-col items-center mt-4 gap-2">
        <div className="flex justify-center gap-2">
          {maxPublicationBarCount < fullPublicationBarsData.length && (
            <button
              onClick={() =>
                setMaxPublicationBarCount((prev) =>
                  Math.min(prev + 12, fullPublicationBarsData.length),
                )
              }
              className="flex items-center gap-2 px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
            >
              Show More
              <FaArrowDown className="animate-bounce" size={18} />
            </button>
          )}

          {maxPublicationBarCount > 12 && (
            <button
              onClick={() =>
                setMaxPublicationBarCount((prev) => Math.max(prev - 12, 12))
              }
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
            >
              Show Less
              <FaArrowUp className="animate-bounce" size={18} />
            </button>
          )}
        </div>

        <div className="text-center text-gray-700 text-xs font-medium">
          Showing{" "}
          {Math.min(maxPublicationBarCount, fullPublicationBarsData.length)} of{" "}
          {fullPublicationBarsData.length} records
        </div>
      </div> */}
    </div>
  );
}

// import { useMemo, useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Cell,
//   Legend,
// } from "recharts";
// import { RxCross1 } from "react-icons/rx";
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";

// const ORG_TYPE_COLORS = {
//   department: "#1e4a8d", // Blue
//   centre: "rgb(48, 110, 255)", // Teal
//   school: "rgb(147, 157, 250)", // Purple
// };

// const DEFAULT_BAR_COLOR = "#64748b";

// const getBarColor = (orgType) => {
//   if (!orgType) return DEFAULT_BAR_COLOR;
//   const key = String(orgType).toLowerCase().trim();
//   return ORG_TYPE_COLORS[key] || DEFAULT_BAR_COLOR;
// };

// export default function BarChartBoxPublications({
//   entities = [],
//   yearRange,
//   onEntitySelect,
//   onReset,
//   showReset,
// }) {
//   const [maxPublicationBarCount, setMaxPublicationBarCount] = useState(12);

//   const fullPublicationBarsData = useMemo(() => {
//     const [startYear, endYear] = yearRange ?? [];

//     return entities
//       .map((item) => {
//         const value =
//           startYear != null && endYear != null
//             ? item.publications?.reduce((sum, pub) => {
//                 if (pub.year >= startYear && pub.year <= endYear) {
//                   return sum + Number(pub.value || 0);
//                 }
//                 return sum;
//               }, 0) || 0
//             : item.total || 0;

//         return {
//           code: item.code,
//           name: item.name || "Unknown",
//           value,
//           citations: item.citations ?? 0,
//           orgType: item.orgType || item.type || "orgType",
//         };
//       })
//       .sort((a, b) => b.value - a.value);
//   }, [entities, yearRange]);

//   const displayedPublicationBarData = useMemo(() => {
//     return fullPublicationBarsData.slice(0, maxPublicationBarCount);
//   }, [fullPublicationBarsData, maxPublicationBarCount]);

//   const isSingleSelection = entities?.length === 1;
//   const chartHeight = Math.max(450, displayedPublicationBarData.length * 35);

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs">
//       <div className="flex items-center justify-between gap-2 mb-2">
//         <div>
//           <h3 className="font-semibold text-sm">
//             Research Output by Academic Unit{" "}
//           </h3>
//           <p className="text-sm text-gray-700">
//             Click/Hover a bar to view the Total Publications and Citations for
//             the selected Academic Department, Centre & School
//           </p>
//         </div>

//         {showReset && (
//           <button
//             onClick={onReset}
//             className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
//           >
//             <span className="whitespace-nowrap">Reset Chart</span>
//             <RxCross1 />
//           </button>
//         )}
//       </div>

//       <ResponsiveContainer width="100%" height={chartHeight}>
//         <BarChart data={displayedPublicationBarData} layout="vertical">
//           <XAxis type="number" />
//           <YAxis
//             dataKey="name"
//             type="category"
//             width={150}
//             tickFormatter={(value) =>
//               value.length > 30 ? `${value.slice(0, 30)}...` : value
//             }
//           />
//           <Tooltip
//             cursor={{ fill: "#f3f4f6" }}
//             itemStyle={{ display: "block" }} // Overrides Recharts flex/line-break layout
//             formatter={(value, name, item) => [
//               <>
//                 <span className="font-normal">{value}</span>
//                 <div className="mt-1 text-gray-700">
//                   Citations: {item.payload.citations}
//                 </div>
//               </>,
//               "Total no of Publication :",
//             ]}
//           />
//           <Bar
//             dataKey="value"
//             barSize={isSingleSelection ? 200 : 20}
//             cursor="pointer"
//             onClick={(data) => onEntitySelect?.(data?.payload?.code)}
//             radius={[0, 6, 6, 0]}
//           >
//             {displayedPublicationBarData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={getBarColor(entry.orgType)} />
//             ))}
//           </Bar>{" "}
//         </BarChart>
//       </ResponsiveContainer>

//       <div className="flex flex-col items-center mt-4 gap-2">
//         <div className="flex justify-center gap-2">
//           {maxPublicationBarCount < fullPublicationBarsData.length && (
//             <button
//               onClick={() =>
//                 setMaxPublicationBarCount((prev) =>
//                   Math.min(prev + 12, fullPublicationBarsData.length),
//                 )
//               }
//               className="flex items-center gap-2 px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
//             >
//               Show More
//               <FaArrowDown className="animate-bounce" size={18} />
//             </button>
//           )}

//           {maxPublicationBarCount > 12 && (
//             <button
//               onClick={() =>
//                 setMaxPublicationBarCount((prev) => Math.max(prev - 12, 12))
//               }
//               className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
//             >
//               Show Less
//               <FaArrowUp className="animate-bounce" size={18} />
//             </button>
//           )}
//         </div>

//         <div className="text-center text-gray-700 text-xs font-medium">
//           Showing{" "}
//           {Math.min(maxPublicationBarCount, fullPublicationBarsData.length)} of{" "}
//           {fullPublicationBarsData.length} records
//         </div>
//       </div>
//     </div>
//   );
// }
