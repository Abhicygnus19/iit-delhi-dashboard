import React, { useState, useRef, useMemo } from "react";
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
  "#1e4a8d", // Navy Patents Filed
  "#3b82f6", // Blue Patents Granted

  "#86a6e5", // Light Blue Technology License
];

function PatentsBarChartBox({
  visiblePatentData,
  PatentNames = [], // Currently selected/active keys from dropdown
  allAvailableKeys = [], // Master list of ALL available keys (or pass options from parent)
  isFiltered,
  clearFilter,
  onYearClick,
}) {
  const [maxPatentCount, setMaxPatentCount] = useState(15);

  // 1. Permanent Registry for dynamic keys to lock their index position forever
  const masterKeyRegistry = useRef([]);
  const colorMapRef = useRef({});

  // 2. Track all unique keys ever seen
  const keysToRegister =
    allAvailableKeys.length > 0 ? allAvailableKeys : PatentNames;

  keysToRegister.forEach((key) => {
    if (!masterKeyRegistry.current.includes(key)) {
      masterKeyRegistry.current.push(key);

      // Lock color permanently per key
      const colorIndex =
        (masterKeyRegistry.current.length - 1) % COLOR_PALETTE.length;
      colorMapRef.current[key] = COLOR_PALETTE[colorIndex];
    }
  });

  // 3. Get all active visible keys in their fixed order
  const activeKeysInOrder = useMemo(() => {
    return masterKeyRegistry.current.filter((key) => PatentNames.includes(key));
  }, [PatentNames]);

  const displayedPatentData = visiblePatentData.slice(0, maxPatentCount);

  const handleChartClick = (state) => {
    if (state && state.activeLabel) {
      onYearClick(state.activeLabel);
    }
  };

  const chartHeight = Math.max(350, displayedPatentData.length * 35);

  return (
    <div className="border border-gray-200 bg-white p-4 rounded-md shadow-sm text-xs w-full">
      <div className="flex justify-between items-center gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">
            Patents and Technology Transfer
          </h3>
          <p className="text-sm text-gray-700">
            Click/Hover over a bar to view the Yearly Breakdown
          </p>
        </div>
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
          <Legend />

          {/* Render ALL registered keys in fixed order permanently */}
          {masterKeyRegistry.current.map((name) => {
            const isSelected = PatentNames.includes(name);
            const isLastVisible =
              activeKeysInOrder[activeKeysInOrder.length - 1] === name;

            return (
              <Bar
                key={name}
                dataKey={name}
                stackId="a"
                fill={colorMapRef.current[name]}
                hide={!isSelected} // Prevents DOM re-mounting so order remains locked
                radius={isLastVisible ? [0, 4, 4, 0] : [0, 0, 0, 0]}
              />
            );
          })}
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
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
          >
            Show More
            <FaArrowDown className="animate-bounce" size={18} />
          </button>
        )}

        {maxPatentCount > 15 && (
          <button
            onClick={() => setMaxPatentCount((prev) => Math.max(prev - 15, 15))}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
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
// import { FaArrowDown, FaArrowUp } from "react-icons/fa";

// // Updated color palette to use only 4 specific colors
// const COLOR_PALETTE = [
//   "#1e4a8d", // Dark Navy Patents Filed
//   "#3b82f6", // Normal Blue Patents Granted
//   "#86a6e5", // light blue technology deal
// ];

// function PatentsBarChartBox({
//   visiblePatentData,
//   PatentNames,
//   isFiltered,
//   clearFilter,
//   onYearClick,
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
//     <div className="border border-gray-200 bg-white p-4 rounded-md shadow-sm text-xs w-full">
//       <div className="flex justify-between items-center gap-2 mb-4">
//         <div>
//           <h3 className="font-semibold text-gray-800 text-sm">
//             Patents and Technology Transfer
//           </h3>{" "}
//           <p className="text-sm text-gray-700">
//             Click/Hover over a bar to view the Yearly Breakdown of Patents
//             Filed, Patents Granted, and Technology Licensing
//           </p>
//         </div>
//         {isFiltered && (
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
//             reversed={true}
//           />
//           <Tooltip
//             contentStyle={{ backgroundColor: "#fff", borderRadius: "6px" }}
//           />
//           <Legend verticalAlign="top" height={40} />

//           {PatentNames.map((name, index) => {
//             const isFirst = index === 0;
//             const isLast = index === PatentNames.length - 1;

//             return (
//               <Bar
//                 key={name}
//                 dataKey={name}
//                 stackId="a"
//                 fill={COLOR_PALETTE[index % COLOR_PALETTE.length]}
//                 radius={
//                   isFirst
//                     ? [0, 0, 0, 0] // Left end
//                     : isLast
//                       ? [0, 4, 4, 0] // Right end
//                       : [0, 0, 0, 0] // Middle segments
//                 }
//               />
//             );
//           })}
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
//             className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
//           >
//             Show More
//             <FaArrowDown className="animate-bounce" size={18} />
//           </button>
//         )}

//         {maxPatentCount > 15 && (
//           <button
//             onClick={() => setMaxPatentCount((prev) => Math.max(prev - 15, 15))}
//             className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
//           >
//             Show Less
//             <FaArrowUp className="animate-bounce" size={18} />
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
