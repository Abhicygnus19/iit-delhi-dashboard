import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RxCross1 } from "react-icons/rx";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

const COLOR_PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

function PatentsBarChartBox({
  visiblePatentData,
  PatentNames,
  isFiltered, // Updated prop
  clearFilter, // Updated handler
  onYearClick,
}) {
  const [maxPatentCount, setMaxPatentCount] = useState(15);

  const displayedPatentData = visiblePatentData.slice(0, maxPatentCount);

  const handleChartClick = (state) => {
    if (state && state.activeLabel) {
      onYearClick(state.activeLabel);
    }
  };

  const chartHeight = Math.max(350, displayedPatentData.length * 35);

  return (
    <div className="border border-gray-200 bg-white p-4 rounded-md shadow-sm text-xs w-full  ">
      <div className="flex justify-between items-center gap-2 mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">
          Data of Patents & Technology deals{" "}
        </h3>
        {isFiltered && (
          <button
            onClick={clearFilter}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={displayedPatentData}
          layout="vertical"
          onClick={handleChartClick}
          style={{ cursor: "pointer" }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#f0f0f0"
          />
          <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} />
          <YAxis
            dataKey="year"
            type="category"
            tick={{ fill: "#666", fontSize: 11 }}
            tickLine={false}
            reversed={true}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", borderRadius: "6px" }}
          />
          <Legend verticalAlign="top" height={40} />

          {PatentNames.map((name, index) => (
            <Bar
              key={name}
              dataKey={name}
              stackId="a"
              fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center mt-2 gap-2">
        {maxPatentCount < visiblePatentData.length && (
          <button
            onClick={() =>
              setMaxPatentCount((prev) =>
                Math.min(prev + 15, visiblePatentData.length),
              )
            }
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
          >
            Show More
            <FaArrowDown className="animate-bounce" size={18} />
          </button>
        )}

        {maxPatentCount > 15 && (
          <button
            onClick={() => setMaxPatentCount((prev) => Math.max(prev - 15, 15))}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
          >
            Show Less
            <FaArrowUp className="animate-bounce" size={18} />
          </button>
        )}
      </div>

      <div className="text-center text-gray-800 text-xs mt-2">
        Showing {Math.min(maxPatentCount, visiblePatentData.length)} of{" "}
        {visiblePatentData.length} records
      </div>
    </div>
  );
}

export default PatentsBarChartBox;

// import React, { useState } from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { RxCross1 } from "react-icons/rx";

// const COLOR_PALETTE = [
//   "#3b82f6",
//   "#10b981",
//   "#f59e0b",
//   "#8b5cf6",
//   "#ec4899",
//   "#06b6d4",
// ];

// function PatentsBarChartBox({
//   visiblePatentData,
//   PatentNames,
//   selectedYear,
//   onYearClick,
//   clearFilter,
// }) {
//   const [maxPatentCount, setMaxPatentCount] = useState(15);

//   const displayedPatentData = visiblePatentData.slice(0, maxPatentCount);

//   const handleChartClick = (state) => {
//     if (state && state.activeLabel) {
//       onYearClick(state.activeLabel);
//     }
//   };

//   const chartHeight = Math.max(350, displayedPatentData.length * 35);

//   return (
//     <div className="border border-gray-200 bg-white p-4 rounded-md shadow-sm text-xs w-full  ">
//       <div className="flex justify-between items-center gap-2 mb-4">
//         <h3 className="font-semibold text-gray-800 text-sm">
//           Data of Patents & Technology deals{" "}
//         </h3>
//         {selectedYear && (
//           <button
//             onClick={clearFilter}
//             className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
//           >
//             <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
//           </button>
//         )}
//       </div>

//       <ResponsiveContainer width="100%" height={chartHeight}>
//         <BarChart
//           data={displayedPatentData}
//           layout="vertical"
//           onClick={handleChartClick}
//           style={{ cursor: "pointer" }}
//         >
//           <CartesianGrid
//             strokeDasharray="3 3"
//             horizontal={false}
//             stroke="#f0f0f0"
//           />
//           <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} />
//           <YAxis
//             dataKey="year"
//             type="category"
//             tick={{ fill: "#666", fontSize: 11 }}
//             tickLine={false}
//           />
//           <Tooltip
//             contentStyle={{ backgroundColor: "#fff", borderRadius: "6px" }}
//           />
//           <Legend verticalAlign="top" height={40} />

//           {PatentNames.map((name, index) => (
//             <Bar
//               key={name}
//               dataKey={name}
//               stackId="a"
//               fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
//             />
//           ))}
//         </BarChart>
//       </ResponsiveContainer>
//       <div className="flex justify-center mt-2 gap-2">
//         {maxPatentCount < visiblePatentData.length && (
//           <button
//             onClick={() =>
//               setMaxPatentCount((prev) =>
//                 Math.min(prev + 15, visiblePatentData.length),
//               )
//             }
//             className="px-3 py-1 text-sm text-white bg-blue-900 rounded-full"
//           >
//             Show More
//           </button>
//         )}

//         {maxPatentCount > 15 && (
//           <button
//             onClick={() => setMaxPatentCount((prev) => Math.max(prev - 15, 15))}
//             className="px-3 py-1 text-sm border border-gray-500 rounded-full"
//           >
//             Show Less
//           </button>
//         )}
//       </div>

//       <div className="text-center text-gray-800 text-xs mt-2">
//         Showing {Math.min(maxPatentCount, visiblePatentData.length)} of{" "}
//         {visiblePatentData.length} records
//       </div>
//     </div>
//   );
// }

// export default PatentsBarChartBox;
