import React, { useState, useEffect, useMemo } from "react";
import { fetchSanctionedResearchProject } from "./../../lib/sponsorData";
import OptionSelect from "./../../components/ui/OptionSelect";
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

// --- SUB-COMPONENT FOR INDIVIDUAL YEARS WITH DYNAMIC BAR-TO-PIE INTERACTION ---
function YearChartBlock({ yearObj, selectedSrpTypes }) {
  const [maxUnitsCount, setMaxUnitsCount] = useState(20);
  const [activeUnit, setActiveUnit] = useState(null);

  const rawList = yearObj.sanctionedProjectsSRP || [];

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

  const truncateLabel = (label, maxLength = 22) => {
    if (!label) return "";
    return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
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
            /* Keeps it responsive on mobile for the Pie chart, but preserves 600px scroll for Bars */
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
                  label={({ name, value }) =>
                    `${name}: ${value}${name.includes("Funds") ? " Cr" : ""}`
                  }
                  labelLine={true}
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
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
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
                  fontSize={12}
                  tickLine={false}
                  width={150}
                  tickFormatter={(value) => truncateLabel(value)}
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

                {/* Side-by-side execution with stackId completely removed */}
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

      {/* Show More / Show Less Controls (Hidden automatically during active Pie isolated phase) */}
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
function SanctionedProject() {
  const [sanctionedResearchProject, setSanctionedResearchProject] = useState(
    [],
  );
  const [selectedSanctionedYear, setSelectedSanctionedYear] = useState([]);
  const [selectedSrpTypes, setSelectedSrpTypes] = useState([]);

  useEffect(() => {
    const getSanctionedResearchProjectData = async () => {
      const apiSanctionedResearchProject =
        await fetchSanctionedResearchProject();
      setSanctionedResearchProject(apiSanctionedResearchProject || []);
    };
    getSanctionedResearchProjectData();
  }, []);

  if (!sanctionedResearchProject || sanctionedResearchProject.length === 0) {
    return <div className="p-4">No Sanctioned Research Project available.</div>;
  }

  const yearOptions = sanctionedResearchProject.map((item) => ({
    label: item.year,
    value: item.year,
  }));

  const uniqueSrpTypes = new Set();
  sanctionedResearchProject.forEach((yearObj) => {
    if (yearObj.sanctionedProjectsSRP) {
      yearObj.sanctionedProjectsSRP.forEach((project) => {
        const type = project.SRPType ? project.SRPType.trim() : "Others";
        uniqueSrpTypes.add(type);
      });
    }
  });

  const srpTypeOptions = Array.from(uniqueSrpTypes).map((type) => ({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    value: type,
  }));

  const filteredSanctionedData =
    selectedSanctionedYear && selectedSanctionedYear.length > 0
      ? sanctionedResearchProject.filter((item) =>
          selectedSanctionedYear.includes(item.year),
        )
      : sanctionedResearchProject;

  return (
    <div className="border-2 rounded-md">
      <div className="px-4 py-3 bg-gray-100 border-b-2">
        <h2 className="font-semibold mb-4">
          Sanctioned Research Projects in IRD of Academic Unit (SRP Dept IRD &
          FITT)
        </h2>
        <div className="flex gap-2 flex-wrap text-[14px] mb-2">
          <OptionSelect
            label="Select Year"
            options={yearOptions}
            selected={selectedSanctionedYear}
            onChange={setSelectedSanctionedYear}
            multiple={true}
          />
          <OptionSelect
            label="Select SRP type"
            options={srpTypeOptions}
            selected={selectedSrpTypes}
            onChange={setSelectedSrpTypes}
            multiple={true}
          />
        </div>
      </div>

      <div className="p-4">
        <div className="border-2 p-4 rounded-md shadow-sm text-xs w-100 bg-gray-50/50">
          {filteredSanctionedData.map((yearObj, index) => (
            <YearChartBlock
              key={yearObj.year || index}
              yearObj={yearObj}
              selectedSrpTypes={selectedSrpTypes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SanctionedProject;

// import React, { useState, useEffect } from "react";
// import { fetchSanctionedResearchProject } from "./../../lib/sponsorData";
// import OptionSelect from "./../../components/ui/OptionSelect";

// // Helper function to generate truncated pagination range
// const getPaginationRange = (currentPage, totalPages) => {
//   const delta = 1;
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

// // --- NEW SUB-COMPONENT FOR INDIVIDUAL YEARS ---
// function YearTableBlock({ yearObj, selectedSrpTypes }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;

//   const rawList = yearObj.sanctionedProjectsSRP || [];

//   // Filter projects inside this specific year
//   const sanctionedProjectList = rawList.filter((item) => {
//     if (!selectedSrpTypes || selectedSrpTypes.length === 0) return true;
//     const projectType = item.SRPType ? item.SRPType.trim() : "Others";
//     return selectedSrpTypes.includes(projectType);
//   });

//   // Reset local page to 1 if the SRP Type filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [selectedSrpTypes]);

//   // Skip rendering this year entirely if no projects match the filter
//   if (sanctionedProjectList.length === 0) return null;

//   const totalPages = Math.ceil(sanctionedProjectList.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentItems = sanctionedProjectList.slice(
//     startIndex,
//     startIndex + itemsPerPage,
//   );
//   const paginationRange = getPaginationRange(currentPage, totalPages);

//   return (
//     <div className="overflow-x-auto mb-8 border-b pb-6 last:border-0 last:pb-0">
//       <h6 className="text-base font-bold mb-4">
//         Year: <span className="font-semibold ml-1">{yearObj?.year}</span>
//       </h6>
//       <table className="w-full text-xs border-collapse mb-4">
//         <thead>
//           <tr className="border-b border-border bg-muted/30">
//             <th className="text-left p-2">Academic Unit</th>
//             <th className="text-center p-2">No. of Projects</th>
//             <th className="text-center p-2">Sanctioned Funds (Rs. in Crore)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentItems.map((sanctionedProject, itemIndex) => (
//             <tr
//               key={itemIndex}
//               className="border-b border-border/50 hover:bg-muted/40 transition-colors"
//             >
//               <td className="p-2 font-medium">
//                 {sanctionedProject.academicUnit}
//               </td>
//               <td className="p-2 text-center">
//                 {sanctionedProject.NoOfProjects}
//               </td>
//               <td className="p-2 text-center">
//                 {typeof sanctionedProject.SanctionedFunds === "number"
//                   ? sanctionedProject.SanctionedFunds.toFixed(2)
//                   : sanctionedProject.SanctionedFunds}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Pagination isolated exclusively to this year block */}
//       {totalPages > 1 && (
//         <div className="flex justify-center items-center flex-wrap gap-2 mt-4 select-none">
//           <button
//             onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//             disabled={currentPage === 1}
//             className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//           >
//             Prev
//           </button>

//           {paginationRange.map((page, index) => {
//             if (page === "...") {
//               return (
//                 <span
//                   key={`dots-${index}`}
//                   className="px-2 text-gray-400 font-medium text-sm"
//                 >
//                   ...
//                 </span>
//               );
//             }

//             return (
//               <button
//                 key={`page-${page}`}
//                 onClick={() => setCurrentPage(page)}
//                 className={`w-8 h-8 flex items-center justify-center border font-medium text-sm rounded-full transition-all ${
//                   currentPage === page
//                     ? "bg-blue-600 text-white border-blue-600"
//                     : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
//                 }`}
//               >
//                 {page}
//               </button>
//             );
//           })}

//           <button
//             onClick={() =>
//               setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//             }
//             disabled={currentPage === totalPages}
//             className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
//           >
//             Next
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // --- MAIN COMPONENT ---
// function SanctionedProject() {
//   const [sanctionedResearchProject, setSanctionedResearchProject] = useState(
//     [],
//   );
//   const [selectedSanctionedYear, setSelectedSanctionedYear] = useState([]);
//   const [selectedSrpTypes, setSelectedSrpTypes] = useState([]);

//   useEffect(() => {
//     const getSanctionedResearchProjectData = async () => {
//       const apiSanctionedResearchProject =
//         await fetchSanctionedResearchProject();
//       setSanctionedResearchProject(apiSanctionedResearchProject || []);
//     };
//     getSanctionedResearchProjectData();
//   }, []);

//   if (!sanctionedResearchProject || sanctionedResearchProject.length === 0) {
//     return <div className="p-4">No Sanctioned Research Project available.</div>;
//   }

//   // Setup Year Dropdown Options dynamically
//   const yearOptions = sanctionedResearchProject.map((item) => ({
//     label: item.year,
//     value: item.year,
//   }));

//   // Dynamic Unique SRP Types Extractor
//   const uniqueSrpTypes = new Set();
//   sanctionedResearchProject.forEach((yearObj) => {
//     if (yearObj.sanctionedProjectsSRP) {
//       yearObj.sanctionedProjectsSRP.forEach((project) => {
//         const type = project.SRPType ? project.SRPType.trim() : "Others";
//         uniqueSrpTypes.add(type);
//       });
//     }
//   });

//   const srpTypeOptions = Array.from(uniqueSrpTypes).map((type) => ({
//     label: type.charAt(0).toUpperCase() + type.slice(1),
//     value: type,
//   }));

//   // Filters years based on checkboxes selected
//   const filteredSanctionedData =
//     selectedSanctionedYear && selectedSanctionedYear.length > 0
//       ? sanctionedResearchProject.filter((item) =>
//           selectedSanctionedYear.includes(item.year),
//         )
//       : sanctionedResearchProject;

//   return (
//     <div className="border-2 rounded-md">
//       <div className="px-4 py-3 bg-gray-100 border-b-2">
//         <h2 className="font-semibold mb-4">
//           Sanctioned Research Projects in IRD of Academic Unit (SRP Dept IRD &
//           FITT)
//         </h2>
//         <div className="flex gap-2 flex-wrap text-[14px] mb-2">
//           <OptionSelect
//             label="Select Year"
//             options={yearOptions}
//             selected={selectedSanctionedYear}
//             onChange={setSelectedSanctionedYear}
//             multiple={true}
//           />
//           <OptionSelect
//             label="Select SRP type"
//             options={srpTypeOptions}
//             selected={selectedSrpTypes}
//             onChange={setSelectedSrpTypes}
//             multiple={true}
//           />
//         </div>
//       </div>

//       <div className="p-4">
//         <div className="border-2 p-4 rounded-md shadow-sm text-xs w-100">
//           {filteredSanctionedData.map((yearObj, index) => (
//             <YearTableBlock
//               key={yearObj.year || index}
//               yearObj={yearObj}
//               selectedSrpTypes={selectedSrpTypes}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SanctionedProject;
