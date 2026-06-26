import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { RxCross1 } from "react-icons/rx";

export default function BarChartBoxPublications({
  entities = [],
  yearRange,
  onEntitySelect,
  onReset,
  showReset,
}) {
  // 1. Unified initial step value to 12 for clean incremental math
  const [maxPublicationBarCount, setMaxPublicationBarCount] = useState(12);

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
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [entities, yearRange]);

  const displayedPublicationBarData = useMemo(() => {
    return fullPublicationBarsData.slice(0, maxPublicationBarCount);
  }, [fullPublicationBarsData, maxPublicationBarCount]);

  const isSingleSelection = entities?.length === 1;

  const chartHeight = Math.max(350, displayedPublicationBarData.length * 35);

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm">Department wise Publications</h3>

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
              value.length > 20 ? `${value.slice(0, 20)}...` : value
            }
          />
          <Tooltip cursor={{ fill: "#f3f4f6" }} />
          <Bar
            dataKey="value"
            fill="#1e4a8d"
            barSize={isSingleSelection ? 200 : 20}
            cursor="pointer"
            onClick={(data) => onEntitySelect?.(data?.payload?.code)}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex flex-col items-center mt-4 gap-2">
        <div className="flex justify-center gap-2">
          {maxPublicationBarCount < fullPublicationBarsData.length && (
            <button
              onClick={() =>
                setMaxPublicationBarCount((prev) =>
                  Math.min(prev + 12, fullPublicationBarsData.length),
                )
              }
              className="px-3 py-1 text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-full transition-colors"
            >
              Show More
            </button>
          )}

          {maxPublicationBarCount > 12 && (
            <button
              onClick={() =>
                setMaxPublicationBarCount((prev) => Math.max(prev - 12, 12))
              }
              className="px-3 py-1 text-xs font-medium border border-gray-400 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
            >
              Show Less
            </button>
          )}
        </div>

        <div className="text-center text-gray-700 text-xs font-medium">
          Showing{" "}
          {Math.min(maxPublicationBarCount, fullPublicationBarsData.length)} of{" "}
          {fullPublicationBarsData.length} records
        </div>
      </div>
    </div>
  );
}

// // dashboards/publications/BarChartBox.tsx
// import { useMemo } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { RxCross1 } from "react-icons/rx";

// import { publicationData } from "../../lib/publicationData";

// export default function BarChartBoxPublications({
//   entities,
//   yearRange,
//   onEntitySelect,
//   onReset,
//   showReset,
// }) {
//   const chartData = useMemo(() => {
//     const source = entities?.length ? entities : publicationData.departments;
//     const [startYear, endYear] = yearRange ?? [];

//     return source
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
//           name: item.fullName || item.name || item.shortCode || "Unknown",
//           value,
//         };
//       })
//       .sort((a, b) => b.value - a.value);
//   }, [entities, yearRange]);

//   const isSingleSelection = entities?.length === 1;

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs">
//       <div className="flex items-center justify-between gap-2 mb-2">
//         <h3 className=" font-semibold text-sm">
//           Department wise Publications{" "}
//         </h3>

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

//       <ResponsiveContainer
//         width="100%"
//         height={Math.max(chartData.length * 30, 300)}
//       >
//         <BarChart data={chartData} layout="vertical">
//           <XAxis type="number" />
//           <YAxis
//             dataKey="name"
//             type="category"
//             width={150}
//             tickFormatter={(value) =>
//               value.length > 20 ? `${value.slice(0, 20)}...` : value
//             }
//           />
//           <Tooltip cursor={{ fill: "#f3f4f6" }} />
//           <Bar
//             dataKey="value"
//             fill="#1e4a8d"
//             barSize={isSingleSelection ? 200 : 20}
//             cursor="pointer"
//             onClick={(data) => onEntitySelect?.(data?.payload?.code)}
//           />
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
