import React, { useState, useEffect, useMemo } from "react";
import OptionSelect from "./ui/OptionSelect";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RxCross1 } from "react-icons/rx";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

// Vibrant colors for the Pie slices when a single unit is isolated
const PIE_COLORS = ["#3b82f6", "#10b981"];

export default function YearChartBlock({ yearObj, selectedSrpTypes }) {
  const [maxUnitsCount, setMaxUnitsCount] = useState(20);
  const [activeUnit, setActiveUnit] = useState(null);

  // Safely looks for both possible properties depending on which API model is being viewed
  const rawList =
    yearObj?.sanctionedProjectsSRP ||
    yearObj?.consultancyUnitWiseProjects ||
    [];

  // Filter projects inside this specific year based on type
  const filteredProjectList = useMemo(() => {
    return rawList.filter((item) => {
      if (!selectedSrpTypes || selectedSrpTypes.length === 0) return true;
      const projectType = item.SRPType ? item.SRPType.trim() : "Others";
      return selectedSrpTypes.includes(projectType);
    });
  }, [rawList, selectedSrpTypes]);

  // Reset local state view to baseline if the SRP Type filters change
  useEffect(() => {
    setMaxUnitsCount(20);
    setActiveUnit(null);
  }, [selectedSrpTypes]);

  // Format base chart data
  const fullChartData = useMemo(() => {
    return filteredProjectList.map((item) => ({
      name: item.academicUnit,
      NoOfProjects: Number(item.NoOfProjects) || 0,
      SanctionedFunds: Number(item.SanctionedFunds) || 0,
    }));
  }, [filteredProjectList]);

  // Filter data dynamically based on active selected bar unit click
  const filteredUnitData = useMemo(() => {
    if (!activeUnit) return fullChartData;
    return fullChartData.filter((item) => item.name === activeUnit);
  }, [fullChartData, activeUnit]);

  // Truncate list up to threshold limits (only applies to Bar Chart view)
  const displayedChartData = useMemo(() => {
    if (activeUnit) return filteredUnitData;
    return filteredUnitData.slice(0, maxUnitsCount);
  }, [filteredUnitData, maxUnitsCount, activeUnit]);

  // Transform the isolated single unit data row into a key/value array for Pie rendering
  const pieChartData = useMemo(() => {
    if (!activeUnit || filteredUnitData.length === 0) return [];
    const isolatedRow = filteredUnitData[0];
    return [
      { name: "No. of Projects", value: isolatedRow.NoOfProjects },
      { name: "Sanctioned Funds (Cr)", value: isolatedRow.SanctionedFunds },
    ];
  }, [filteredUnitData, activeUnit]);

  // Interactive handler on clicking chart rows/bars
  const handleBarClick = (state) => {
    if (state && state.activeLabel) {
      setActiveUnit(state.activeLabel);
    }
  };

  // Guard clause handled gracefully below hooks declaration rules
  if (filteredProjectList.length === 0) {
    return (
      <div className="text-center text-gray-500 py-6 text-xs font-medium">
        No project records found for this selection.
      </div>
    );
  }

  // Height configurations: Bar stack is dynamic, Pie is comfortably deep and large
  const chartHeight = activeUnit
    ? 400
    : Math.max(220, displayedChartData.length * 55 + 40);

  // Custom tooltips adjusted dynamically depending on context view mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if (activeUnit) {
        // Pie Chart Custom Tooltip
        return (
          <div className="bg-white p-3 border border-gray-200 rounded shadow-md text-xs font-semibold">
            <p style={{ color: payload[0].payload.fill }}>
              {payload[0].name}: {payload[0].value}{" "}
              {payload[0].name.includes("Funds") ? "Cr" : ""}
            </p>
          </div>
        );
      }
      // Horizontal Bar Chart Custom Tooltip
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md text-xs">
          <p className="font-bold mb-1 text-gray-800">{label}</p>
          <p className="text-blue-600 font-medium">
            Projects: <span className="font-bold">{payload[0].value}</span>
          </p>
          <p className="text-emerald-600 font-medium">
            Funds: <span className="font-bold">{payload[1].value} Cr</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-8 border-b pb-6 last:border-0 last:pb-0">
      <div className="flex justify-between items-center gap-2 mb-4 bg-gray-50 p-2 rounded border-l-4 border-blue-600">
        <h6 className="text-xs font-bold text-gray-800">
          Year:{" "}
          <span className="font-semibold ml-1 text-gray-600">
            {yearObj?.year}
          </span>
          {activeUnit ? ` - Isolated View: ${activeUnit}` : ""}
        </h6>

        {activeUnit && (
          <button
            onClick={() => setActiveUnit(null)}
            className="whitespace-nowrap bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] flex gap-1.5 items-center transition-colors"
          >
            <span>Reset to Bars</span> <RxCross1 size={10} />
          </button>
        )}
      </div>

      {/* Chart Canvas Wrapper */}
      <div className="w-full bg-white p-2 overflow-x-auto">
        <div
          style={{
            width: "100%",
            minWidth: activeUnit ? "100%" : "600px",
            height: `${chartHeight}px`,
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            {activeUnit ? (
              /* --- PIE CHART VIEW MODE (TRIGGERED VIA CLICK) --- */
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  innerRadius="40%"
                  paddingAngle={4}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconSize={12}
                  wrapperStyle={{ fontSize: "12px" }}
                />
              </PieChart>
            ) : (
              /* --- SIDE-BY-SIDE HORIZONTAL BAR CHART MODE (INITIAL STATE) --- */
              <BarChart
                data={displayedChartData}
                layout="vertical"
                onClick={handleBarClick}
                margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f5f5f5"
                />
                <XAxis type="number" stroke="#888888" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#4a5568"
                  fontSize={11}
                  tickLine={false}
                  width={140}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  content={<CustomTooltip />}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconSize={12}
                  wrapperStyle={{ fontSize: "11px" }}
                />

                {/* Fixed side-by-side execution with stackId completely removed */}
                <Bar
                  dataKey="NoOfProjects"
                  fill="#3b82f6"
                  name="No. of Projects"
                  className="cursor-pointer"
                  stackId="a"
                />
                <Bar
                  dataKey="SanctionedFunds"
                  fill="#10b981"
                  name="Sanctioned Funds (Cr)"
                  className="cursor-pointer"
                  stackId="a"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Show More / Show Less Controls */}
      {!activeUnit && (
        <>
          <div className="flex justify-center mt-6 gap-4">
            {maxUnitsCount < fullChartData.length && (
              <button
                onClick={() =>
                  setMaxUnitsCount((prev) =>
                    Math.min(prev + 20, fullChartData.length),
                  )
                }
                className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
              >
                Show More
                <FaArrowDown className="animate-bounce" size={18} />
              </button>
            )}

            {maxUnitsCount > 20 && (
              <button
                onClick={() =>
                  setMaxUnitsCount((prev) => Math.max(prev - 20, 20))
                }
                className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
              >
                Show Less
                <FaArrowUp className="animate-bounce" size={18} />
              </button>
            )}
          </div>

          <div className="text-center text-gray-400 text-[11px] mt-2 font-medium">
            Showing {Math.min(maxUnitsCount, fullChartData.length)} of{" "}
            {fullChartData.length} academic units
          </div>
        </>
      )}
    </div>
  );
}

// import React, { useState, useEffect, useMemo } from "react";
// import OptionSelect from "./ui/OptionSelect";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { RxCross1 } from "react-icons/rx";

// // Vibrant colors for the Pie slices when a single unit is isolated
// const PIE_COLORS = ["#3b82f6", "#10b981"];

// export default function YearChartBlock({ yearObj, selectedSrpTypes }) {
//   const [maxUnitsCount, setMaxUnitsCount] = useState(20);
//   const [activeUnit, setActiveUnit] = useState(null);

//   const rawList =
//     yearObj.sanctionedProjectsSRP   || [];

//   // Filter projects inside this specific year based on type
//   const filteredProjectList = useMemo(() => {
//     return rawList.filter((item) => {
//       if (!selectedSrpTypes || selectedSrpTypes.length === 0) return true;
//       const projectType = item.SRPType ? item.SRPType.trim() : "Others";
//       return selectedSrpTypes.includes(projectType);
//     });
//   }, [rawList, selectedSrpTypes]);

//   // Reset local state view to baseline if the SRP Type filters change
//   useEffect(() => {
//     setMaxUnitsCount(20);
//     setActiveUnit(null);
//   }, [selectedSrpTypes]);

//   if (filteredProjectList.length === 0) return null;

//   // Format base chart data
//   const fullChartData = useMemo(() => {
//     return filteredProjectList.map((item) => ({
//       name: item.academicUnit,
//       Projects: Number(item.NoOfProjects) || 0,
//       Funds:
//         typeof item.SanctionedFunds === "number"
//           ? Number(item.SanctionedFunds.toFixed(2))
//           : Number(item.SanctionedFunds) || 0,
//     }));
//   }, [filteredProjectList]);

//   // Filter data dynamically based on active selected bar unit click
//   const filteredUnitData = useMemo(() => {
//     if (!activeUnit) return fullChartData;
//     return fullChartData.filter((item) => item.name === activeUnit);
//   }, [fullChartData, activeUnit]);

//   // Truncate list up to threshold limits (only applies to Bar Chart view)
//   const displayedChartData = useMemo(() => {
//     if (activeUnit) return filteredUnitData;
//     return filteredUnitData.slice(0, maxUnitsCount);
//   }, [filteredUnitData, maxUnitsCount, activeUnit]);

//   // Transform the isolated single unit data row into a key/value array for Pie rendering
//   const pieChartData = useMemo(() => {
//     if (!activeUnit || filteredUnitData.length === 0) return [];
//     const isolatedRow = filteredUnitData[0];
//     return [
//       { name: "No. of Projects", value: isolatedRow.Projects },
//       { name: "Sanctioned Funds (Cr)", value: isolatedRow.Funds },
//     ];
//   }, [filteredUnitData, activeUnit]);

//   // Interactive handler on clicking chart rows/bars
//   const handleBarClick = (state) => {
//     if (state && state.activeLabel) {
//       setActiveUnit(state.activeLabel);
//     }
//   };

//   // Height configurations: Bar stack is dynamic, Pie is comfortably deep and large
//   const chartHeight = activeUnit
//     ? 400
//     : Math.max(220, displayedChartData.length * 55 + 40);

//   // Custom tooltips adjusted dynamically depending on context view mode
//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       if (activeUnit) {
//         // Pie Chart Custom Tooltip
//         return (
//           <div className="bg-white p-3 border border-gray-200 rounded shadow-md text-xs font-semibold">
//             <p style={{ color: payload[0].payload.fill }}>
//               {payload[0].name}: {payload[0].value}{" "}
//               {payload[0].name.includes("Funds") ? "Cr" : ""}
//             </p>
//           </div>
//         );
//       }
//       // Horizontal Bar Chart Custom Tooltip
//       return (
//         <div className="bg-white p-3 border border-gray-200 rounded shadow-md text-xs">
//           <p className="font-bold mb-1 text-gray-800">{label}</p>
//           <p className="text-blue-600 font-medium">
//             Projects: <span className="font-bold">{payload[0].value}</span>
//           </p>
//           <p className="text-emerald-600 font-medium">
//             Funds: <span className="font-bold">{payload[1].value} Cr</span>
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="mb-8 border-b pb-6 last:border-0 last:pb-0">
//       <div className="flex justify-between items-center gap-2 mb-4 bg-gray-50 p-2 rounded border-l-4 border-blue-600">
//         <h6 className="text-xs font-bold text-gray-800">
//           Year:{" "}
//           <span className="font-semibold ml-1 text-gray-600">
//             {yearObj?.year}
//           </span>
//           {activeUnit ? ` - Isolated View: ${activeUnit}` : ""}
//         </h6>

//         {activeUnit && (
//           <button
//             onClick={() => setActiveUnit(null)}
//             className="whitespace-nowrap bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[11px] flex gap-1.5 items-center transition-colors"
//           >
//             <span>Reset to Bars</span> <RxCross1 size={10} />
//           </button>
//         )}
//       </div>

//       {/* Chart Canvas Wrapper */}
//       <div className="w-full bg-white p-2 overflow-x-auto">
//         <div
//           style={{
//             width: "100%",
//             /* Keeps it responsive on mobile for the Pie chart, but preserves 600px scroll for Bars */
//             minWidth: activeUnit ? "100%" : "600px",
//             height: `${chartHeight}px`,
//           }}
//         >
//           <ResponsiveContainer width="100%" height="100%">
//             {activeUnit ? (
//               /* --- PIE CHART VIEW MODE (TRIGGERED VIA CLICK) --- */
//               <PieChart>
//                 <Pie
//                   data={pieChartData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius="80%" // Uses container bounds to make it big on desktop, snug on mobile
//                   innerRadius="40%" // Donut style
//                   paddingAngle={4}
//                 >
//                   {pieChartData.map((entry, index) => (
//                     <Cell
//                       key={`cell-${index}`}
//                       fill={PIE_COLORS[index % PIE_COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip content={<CustomTooltip />} />
//                 <Legend
//                   verticalAlign="top"
//                   height={36}
//                   iconSize={12}
//                   wrapperStyle={{ fontSize: "12px" }}
//                 />
//               </PieChart>
//             ) : (
//               /* --- SIDE-BY-SIDE HORIZONTAL BAR CHART MODE (INITIAL STATE) --- */
//               <BarChart
//                 data={displayedChartData}
//                 layout="vertical"
//                 onClick={handleBarClick}
//                 margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
//               >
//                 <CartesianGrid
//                   strokeDasharray="3 3"
//                   horizontal={false}
//                   stroke="#f5f5f5"
//                 />
//                 <XAxis type="number" stroke="#888888" fontSize={11} />
//                 <YAxis
//                   dataKey="name"
//                   type="category"
//                   stroke="#4a5568"
//                   fontSize={12}
//                   tickLine={false}
//                   width={130}
//                 />
//                 <Tooltip
//                   cursor={{ fill: "#f9fafb" }}
//                   content={<CustomTooltip />}
//                 />
//                 <Legend
//                   verticalAlign="top"
//                   height={36}
//                   iconSize={12}
//                   wrapperStyle={{ fontSize: "11px" }}
//                 />

//                 {/* Side-by-side execution with stackId completely removed */}
//                 <Bar
//                   dataKey="Projects"
//                   fill="#3b82f6"
//                   name="No. of Projects"
//                   className="cursor-pointer"
//                   stackId="a"
//                 />
//                 <Bar
//                   dataKey="Funds"
//                   fill="#10b981"
//                   name="Sanctioned Funds (Cr)"
//                   className="cursor-pointer"
//                   stackId="a"
//                 />
//               </BarChart>
//             )}
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Show More / Show Less Controls (Hidden automatically during active Pie isolated phase) */}
//       {!activeUnit && (
//         <>
//           <div className="flex justify-center mt-4 gap-2">
//             {maxUnitsCount < fullChartData.length && (
//               <button
//                 onClick={() =>
//                   setMaxUnitsCount((prev) =>
//                     Math.min(prev + 20, fullChartData.length),
//                   )
//                 }
//                 className="px-3 py-1 text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-full transition-colors shadow-sm"
//               >
//                 Show More
//               </button>
//             )}

//             {maxUnitsCount > 20 && (
//               <button
//                 onClick={() =>
//                   setMaxUnitsCount((prev) => Math.max(prev - 20, 20))
//                 }
//                 className="px-3 py-1 text-xs font-medium border border-gray-400 text-gray-700 hover:bg-gray-50 rounded-full transition-colors shadow-sm"
//               >
//                 Show Less
//               </button>
//             )}
//           </div>

//           <div className="text-center text-gray-400 text-[11px] mt-2 font-medium">
//             Showing {Math.min(maxUnitsCount, fullChartData.length)} of{" "}
//             {fullChartData.length} academic units
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
