import React, { useEffect, useState, useMemo } from "react";
import OptionSelect from "../../components/ui/OptionSelect";
import { fetchConsultancyUnitProject } from "../../lib/consultancyProjectData";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { RxCross1 } from "react-icons/rx";

const PIE_COLORS = ["#3b82f6", "#10b981"];

// --- SUB-COMPONENT FOR INDIVIDUAL YEARS WITH DYNAMIC BAR-TO-PIE INTERACTION ---
function YearChartBlock({ yearObj, selectedConsultancyTypes }) {
  const [maxUnitsCount, setMaxUnitsCount] = useState(20);
  const [activeUnit, setActiveUnit] = useState(null);

  const rawList = yearObj.consultancyUnitWiseProjects || [];

  // Filter projects inside this specific year based on type
  const filteredProjectList = useMemo(() => {
    return rawList.filter((item) => {
      if (!selectedConsultancyTypes || selectedConsultancyTypes.length === 0)
        return true;
      const projectType = item.consultancyType
        ? item.consultancyType.trim()
        : "Others";
      return selectedConsultancyTypes.includes(projectType);
    });
  }, [rawList, selectedConsultancyTypes]);

  // Reset local state view to baseline if the filters change
  useEffect(() => {
    setMaxUnitsCount(20);
    setActiveUnit(null);
  }, [selectedConsultancyTypes]);

  if (filteredProjectList.length === 0) return null;

  // Format base chart data
  const fullChartData = useMemo(() => {
    return filteredProjectList.map((item) => ({
      name: item.academicUnit,
      Projects: Number(item.NoOfProjects) || 0,
      Funds:
        typeof item.SanctionedFunds === "number"
          ? Number(item.SanctionedFunds.toFixed(2))
          : Number(item.SanctionedFunds) || 0,
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
      { name: "No. of Projects", value: isolatedRow.Projects },
      { name: "Sanctioned Funds (Cr)", value: isolatedRow.Funds },
    ];
  }, [filteredUnitData, activeUnit]);

  // Interactive handler on clicking chart rows/bars
  const handleBarClick = (state) => {
    if (state && state.activeLabel) {
      setActiveUnit(state.activeLabel);
    }
  };

  const chartHeight = activeUnit
    ? 400
    : Math.max(220, displayedChartData.length * 55 + 40);

  // Custom tooltips adjusted dynamically depending on context view mode
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      if (activeUnit) {
        return (
          <div className="bg-white p-3 border border-gray-200 rounded shadow-md text-xs font-semibold">
            <p style={{ color: payload[0].payload.fill }}>
              {payload[0].name}: {payload[0].value}{" "}
              {payload[0].name.includes("Funds") ? "Cr" : ""}
            </p>
          </div>
        );
      }
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
              <BarChart
                data={displayedChartData}
                layout="vertical"
                onClick={handleBarClick}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis type="number" stroke="#888888" fontSize={11} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#4a5568"
                  fontSize={12}
                  tickLine={false}
                  width={130}
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
                <Bar
                  dataKey="Projects"
                  fill="#3b82f6"
                  name="No. of Projects"
                  className="cursor-pointer"
                  stackId="a"
                />
                <Bar
                  dataKey="Funds"
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

      {!activeUnit && (
        <>
          <div className="flex justify-center mt-4 gap-2">
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

// --- MAIN COMPONENT ---
function ConsultancyUnitProject() {
  const [consultancyUnitProeject, setConsultancyUnitProeject] = useState([]);
  const [selectedConsultancyUnitYear, setSelectedConsultancyUnitYear] =
    useState([]);
  const [selectedConsultancyTypes, setSelectedConsultancyTypes] = useState([]);

  useEffect(() => {
    const getConsultancyUnitProejectData = async () => {
      const apiConsultancyUnitProeject = await fetchConsultancyUnitProject();
      setConsultancyUnitProeject(apiConsultancyUnitProeject || []);
    };
    getConsultancyUnitProejectData();
  }, []);

  if (!consultancyUnitProeject || consultancyUnitProeject.length === 0) {
    return <div className="p-4">No Consultancy Unit Projects available.</div>;
  }

  const yearOptionsConsultancy = consultancyUnitProeject.map((item) => ({
    label: item.year,
    value: item.year,
  }));

  const uniqueConsultancyTypes = new Set();
  consultancyUnitProeject.forEach((yearObj) => {
    if (yearObj.consultancyUnitWiseProjects) {
      yearObj.consultancyUnitWiseProjects.forEach((item) => {
        const type = item.consultancyType
          ? item.consultancyType.trim()
          : "Others";
        uniqueConsultancyTypes.add(type);
      });
    }
  });

  const consultancyTypeOptions = Array.from(uniqueConsultancyTypes).map(
    (type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type,
    }),
  );

  const filteredConsultancyUnitProject =
    selectedConsultancyUnitYear && selectedConsultancyUnitYear.length > 0
      ? consultancyUnitProeject.filter((item) =>
          selectedConsultancyUnitYear.includes(item.year),
        )
      : consultancyUnitProeject;

  return (
    <div className="border-2 rounded-md">
      <div className="px-4 py-3 bg-gray-100 border-b-2">
        <h2 className="font-semibold mb-4">
          Consutancy Projects of Academic Unit (Consultancy Dept)
        </h2>
        <div className="flex gap-2 flex-wrap text-[14px] mb-2">
          <OptionSelect
            label="Select Year"
            options={yearOptionsConsultancy}
            selected={selectedConsultancyUnitYear}
            onChange={setSelectedConsultancyUnitYear}
            multiple={true}
          />{" "}
          <OptionSelect
            label="Consultancy Unit Type"
            options={consultancyTypeOptions}
            selected={selectedConsultancyTypes}
            onChange={setSelectedConsultancyTypes}
            multiple={true}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="border-2 p-4 rounded-md shadow-sm text-xs w-100 bg-gray-50/50">
          {filteredConsultancyUnitProject.map((yearObj, index) => (
            <YearChartBlock
              key={yearObj.year || index}
              yearObj={yearObj}
              selectedConsultancyTypes={selectedConsultancyTypes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConsultancyUnitProject;

// import React, { useEffect, useState } from "react";
// import OptionSelect from "../../components/ui/OptionSelect";

// import { fetchConsultancyUnitProject } from "../../lib/consultancyProjectData";

// // Helper function to generate truncated pagination range (e.g., [1, 2, '...', 29, 30])
// const getPaginationRange = (currentPage, totalPages) => {
//   const delta = 1; // Number of page buttons to show on either side of the active page
//   const range = [];
//   const rangeWithDots = [];
//   let l;

//   for (let i = 1; i <= totalPages; i++) {
//     if (
//       i === 1 ||
//       i === totalPages ||
//       (i >= currentPage - delta && i <= currentPage + delta)
//     ) {
//       range.push(i);
//     }
//   }

//   for (let i of range) {
//     if (l) {
//       if (i - l === 2) {
//         rangeWithDots.push(l + 1);
//       } else if (i - l > 2) {
//         rangeWithDots.push("...");
//       }
//     }
//     rangeWithDots.push(i);
//     l = i;
//   }

//   return rangeWithDots;
// };

// function ConsultancyUnitProject() {
//   const [consultancyUnitProeject, setConsultancyUnitProeject] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;

//   // Set initial states as empty arrays to prevent crashes inside OptionSelect
//   const [selectedConsultancyUnitYear, setSelectedConsultancyUnitYear] =
//     useState([]);
//   const [selectedConsultancyTypes, setSelectedConsultancyTypes] = useState([]);

//   // Fetch API data
//   useEffect(() => {
//     const getConsultancyUnitProejectData = async () => {
//       const apiConsultancyUnitProeject = await fetchConsultancyUnitProject();
//       setConsultancyUnitProeject(apiConsultancyUnitProeject || []);
//     };
//     getConsultancyUnitProejectData();
//   }, []);

//   // Reset page to 1 whenever filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedConsultancyUnitYear, selectedConsultancyTypes]);

//   // Handle empty or loading states safely
//   if (!consultancyUnitProeject || consultancyUnitProeject.length === 0) {
//     return <div className="p-4">No Consultancy Unit Projects available.</div>;
//   }

//   // Setup Year Options
//   const yearOptionsConsultancy = consultancyUnitProeject.map((item) => ({
//     label: item.year,
//     value: item.year,
//   }));

//   // Dynamic unique type extraction
//   const uniqueConsultancyTypes = new Set();
//   consultancyUnitProeject.forEach((yearObj) => {
//     if (yearObj.consultancyUnitWiseProjects) {
//       yearObj.consultancyUnitWiseProjects.forEach((item) => {
//         const type = item.consultancyType
//           ? item.consultancyType.trim()
//           : "Others";
//         uniqueConsultancyTypes.add(type);
//       });
//     }
//   });

//   const consultancyTypeOptions = Array.from(uniqueConsultancyTypes).map(
//     (type) => ({
//       label: type.charAt(0).toUpperCase() + type.slice(1),
//       value: type,
//     }),
//   );

//   // Filter pipeline for data blocks
//   const filteredConsultancyUnitProject = consultancyUnitProeject
//     .filter(
//       (item) =>
//         selectedConsultancyUnitYear.length === 0 ||
//         selectedConsultancyUnitYear.includes(item.year),
//     )
//     .map((yearObj) => ({
//       ...yearObj,
//       consultancyUnitWiseProjects:
//         selectedConsultancyTypes.length === 0
//           ? yearObj.consultancyUnitWiseProjects
//           : (yearObj.consultancyUnitWiseProjects || []).filter((item) =>
//               selectedConsultancyTypes.includes(item.consultancyType),
//             ),
//     }));

//   return (
//     <div className="border-2 rounded-md ">
//       <div className="px-4 py-3 bg-gray-100 border-b-2">
//         <h2 className="font-semibold mb-4">
//           Consutancy Projects of Academic Unit (Consultancy Dept)
//         </h2>
//         <div className="flex gap-2 flex-wrap text-[14px] mb-2">
//           <OptionSelect
//             label="Select Year"
//             options={yearOptionsConsultancy}
//             selected={selectedConsultancyUnitYear}
//             onChange={setSelectedConsultancyUnitYear}
//             multiple={true}
//           />{" "}
//           <OptionSelect
//             label="Consultancy Unit Type"
//             options={consultancyTypeOptions}
//             selected={selectedConsultancyTypes}
//             onChange={setSelectedConsultancyTypes}
//             multiple={true}
//           />
//         </div>
//       </div>

//       <div className="p-4">
//         <div className="border-2 p-4 rounded-md shadow-sm text-xs w-100">
//           {filteredConsultancyUnitProject.map((yearObj, yearIndex) => {
//             const targetYearKey = Object.keys(yearObj).find((key) =>
//               Array.isArray(yearObj[key]),
//             );

//             if (!targetYearKey) return null;

//             const sanctionedProjectListConsultancy =
//               yearObj.consultancyUnitWiseProjects || [];

//             // Skip rendering an entire year card if filters emptied out its projects
//             if (sanctionedProjectListConsultancy.length === 0) return null;

//             const totalPages = Math.ceil(
//               sanctionedProjectListConsultancy.length / itemsPerPage,
//             );
//             const startIndex = (currentPage - 1) * itemsPerPage;
//             const currentItemsConsultancy =
//               sanctionedProjectListConsultancy.slice(
//                 startIndex,
//                 startIndex + itemsPerPage,
//               );

//             // Compute smart pagination layout array
//             const paginationRange = getPaginationRange(currentPage, totalPages);

//             return (
//               <div
//                 className="overflow-x-auto mb-8 border-b pb-4 last:border-0 last:pb-0"
//                 key={yearIndex}
//               >
//                 <h6 className="text-base font-bold mb-4">
//                   Year:
//                   <span className="font-semibold ml-1">{yearObj?.year}</span>
//                 </h6>
//                 <table className="w-full text-xs border-collapse mb-4">
//                   <thead>
//                     <tr className="border-b border-border bg-muted/30">
//                       <th className="text-left p-2">Academic Unit</th>
//                       <th className="text-center p-2">No. of Projects</th>
//                       <th className="text-center p-2">
//                         Sanctioned Funds (Rs. in Crore)
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {currentItemsConsultancy.map((item, itemIndex) => (
//                       <tr
//                         key={itemIndex}
//                         className="border-b border-border/50 hover:bg-muted/40 transition-colors"
//                       >
//                         <td className="p-2 font-medium">{item.academicUnit}</td>
//                         <td className="p-2 text-center">{item.NoOfProjects}</td>
//                         <td className="p-2 text-center">
//                           {typeof item.SanctionedFunds === "number"
//                             ? item.SanctionedFunds.toFixed(2)
//                             : item.SanctionedFunds}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>

//                 {/* Refactored Pagination Interface */}
//                 {totalPages > 1 && (
//                   <div className="flex justify-center items-center flex-wrap gap-2 mt-4 select-none">
//                     <button
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.max(prev - 1, 1))
//                       }
//                       disabled={currentPage === 1}
//                       className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//                     >
//                       Prev
//                     </button>

//                     {paginationRange.map((page, index) => {
//                       if (page === "...") {
//                         return (
//                           <span
//                             key={`dots-${index}`}
//                             className="px-2 font-medium text-gray-400 text-sm"
//                           >
//                             ...
//                           </span>
//                         );
//                       }

//                       return (
//                         <button
//                           key={`page-${page}`}
//                           onClick={() => setCurrentPage(page)}
//                           className={`w-8 h-8 flex items-center justify-center font-medium text-sm border rounded-full transition-all ${
//                             currentPage === page
//                               ? "bg-blue-600 text-white border-blue-600 shadow-sm"
//                               : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
//                           }`}
//                         >
//                           {page}
//                         </button>
//                       );
//                     })}

//                     <button
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                       }
//                       disabled={currentPage === totalPages}
//                       className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ConsultancyUnitProject;
