import React, { useMemo, useState, useRef } from "react";
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
import { RoundedStackBar } from "../../components/ui/RoundedStackBar";

// Default Palette mapped by known scheme names
const DEFAULT_SCHEME_COLOR_MAP = [
  {
    "Discover & Learn": "#2563eb", // Deep Royal Blue
    SURA: "#86a6e5", // Light Blue
    "Student Startup Action": "#3261a9", // Navy Blue
  },
];

// dynamic fallback
const DYNAMIC_SHADES = [
  "#991b1b", // Deep Crimson Red
  "#1e3a8a", // Dark Navy Blue
  "#475569", // Slate Gray
  "#b91c1c", // Deep Ruby Red
  "#0f172a", // Midnight Slate
  "#334155", // Charcoal Gray
];

const getDynamicColor = (index) => {
  return DYNAMIC_SHADES[index % DYNAMIC_SHADES.length];
};

function BarChartStudentScheme({
  schemeData = [],
  selectedSchemes = [],
  allAvailableKeys = [],
  colorMap = DEFAULT_SCHEME_COLOR_MAP,
}) {
  const [selectedBarYear, setSelectedBarYear] = useState(null);
  const [maxStudentSchemeBarsCount, setMaxStudentSchemeBarsCount] =
    useState(15);

  // Convert array-based colorMap prop into a flattened lookup map
  const activeColorLookup = useMemo(() => {
    if (!Array.isArray(colorMap)) return {};
    return colorMap.reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});
  }, [colorMap]);

  // 1. Process base chart data, extract keys, and collect explicit inline colors (if present)
  const { fullChartData, extractedKeys, inlineColors } = useMemo(() => {
    const yearsMap = {};
    const namesSet = new Set();
    const colorsFromData = {};

    schemeData.forEach((scheme) => {
      const name = scheme.schemeName;
      if (!name) return;
      namesSet.add(name);

      if (scheme.color) {
        colorsFromData[name] = scheme.color;
      }

      if (Array.isArray(scheme.yearlyData)) {
        scheme.yearlyData.forEach(({ year, count }) => {
          if (!yearsMap[year]) {
            yearsMap[year] = { year: parseInt(year) };
          }
          yearsMap[year][name] = Number(count) || 0;
        });
      }
    });

    const sortedChartData = Object.values(yearsMap).sort(
      (a, b) => a.year - b.year,
    );

    return {
      fullChartData: sortedChartData,
      extractedKeys: Array.from(namesSet),
      inlineColors: colorsFromData,
    };
  }, [schemeData]);

  // 2. Lock index positions & assign persistent dynamic/fallback colors
  const masterKeyRegistry = useRef([]);
  const colorMapRef = useRef({});

  const keysToRegister =
    allAvailableKeys.length > 0 ? allAvailableKeys : extractedKeys;

  keysToRegister.forEach((key) => {
    if (!masterKeyRegistry.current.includes(key)) {
      masterKeyRegistry.current.push(key);

      const registeredIndex = masterKeyRegistry.current.length - 1;

      // Color Hierarchy:
      // 1. Explicit color inside scheme object (scheme.color)
      // 2. Dynamic map provided via colorMap prop
      // 3. Dynamic color sequence from shade array
      if (inlineColors[key]) {
        colorMapRef.current[key] = inlineColors[key];
      } else if (activeColorLookup[key]) {
        colorMapRef.current[key] = activeColorLookup[key];
      } else {
        colorMapRef.current[key] = getDynamicColor(registeredIndex);
      }
    } else {
      // Update color reference if prop map changes for existing keys
      if (inlineColors[key]) {
        colorMapRef.current[key] = inlineColors[key];
      } else if (activeColorLookup[key]) {
        colorMapRef.current[key] = activeColorLookup[key];
      }
    }
  });

  // Ensure all rows contain all keys to prevent Recharts layout distortion
  fullChartData.forEach((row) => {
    masterKeyRegistry.current.forEach((name) => {
      if (row[name] == null) {
        row[name] = 0;
      }
    });
  });

  // 3. Determine active displayed keys
  const effectiveSelectedSchemes = useMemo(() => {
    return masterKeyRegistry.current.filter(
      (key) => selectedSchemes.length === 0 || selectedSchemes.includes(key),
    );
  }, [selectedSchemes]);

  // 4. Filter data on click selection
  const StudentSchemeChartData = useMemo(() => {
    if (selectedBarYear) {
      return fullChartData.filter((item) => item.year === selectedBarYear);
    }
    return fullChartData;
  }, [fullChartData, selectedBarYear]);

  const displayedStudentSchemeChartData = useMemo(() => {
    return StudentSchemeChartData.slice(0, maxStudentSchemeBarsCount);
  }, [StudentSchemeChartData, maxStudentSchemeBarsCount]);

  const chartHeightStudentScheme = Math.max(
    350,
    displayedStudentSchemeChartData.length * 35,
  );

  const handleChartClick = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const clickedYear = state.activePayload[0].payload.year;
      setSelectedBarYear(clickedYear);
    } else if (state && state.activeLabel) {
      setSelectedBarYear(parseInt(state.activeLabel));
    }
  };

  return (
    <div className="border border-gray-200 p-4 rounded-md shadow-sm text-xs w-full min-h-[500px]">
      <div className="flex justify-between gap-2 items-center mb-3">
        <div>
          <h3 className="text-base font-semibold">
            Programme-wise Annual Participation
          </h3>
          <p className="text-sm text-gray-700">
            Click/Hover over a bar to view the Yearly Count for the Selected
            Student Scheme
          </p>
        </div>

        {selectedBarYear && (
          <div className="flex justify-between items-center gap-2 text-blue-700 px-3 py-2 rounded-md text-xs font-medium">
            <button
              onClick={() => setSelectedBarYear(null)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
            >
              <span className="whitespace-nowrap">Reset Chart</span>
              <RxCross1 />
            </button>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={chartHeightStudentScheme}>
        <BarChart
          layout="vertical"
          data={displayedStudentSchemeChartData}
          onClick={handleChartClick}
        >
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis
            type="category"
            dataKey="year"
            interval={0}
            stroke="#4b5563"
            reversed={true}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6", opacity: 0.4 }}
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          />

          <Legend />

          {masterKeyRegistry.current.map((name) => {
            const isSelected = effectiveSelectedSchemes.includes(name);

            return (
              <Bar
                key={name}
                dataKey={name}
                stackId="a"
                className="cursor-pointer"
                fill={colorMapRef.current[name]}
                hide={!isSelected}
                shape={(props) => (
                  <RoundedStackBar
                    {...props}
                    dataKey={name}
                    allKeys={masterKeyRegistry.current}
                  />
                )}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center mt-2 gap-2">
        {!selectedBarYear &&
          maxStudentSchemeBarsCount < StudentSchemeChartData.length && (
            <button
              onClick={() =>
                setMaxStudentSchemeBarsCount((prev) =>
                  Math.min(prev + 15, StudentSchemeChartData.length),
                )
              }
              className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
            >
              Show More
              <FaArrowDown className="animate-bounce" size={18} />
            </button>
          )}

        {maxStudentSchemeBarsCount > 15 && (
          <button
            onClick={() =>
              setMaxStudentSchemeBarsCount((prev) => Math.max(prev - 15, 15))
            }
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
          >
            Show Less
            <FaArrowUp className="animate-bounce" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default BarChartStudentScheme;

// import React, { useMemo, useState } from "react";
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
// import { RoundedStackBar } from "../../components/ui/RoundedStackBar";

// const BAR_COLORS = [
//   "#2563EB", // Blue discover & learn
//   "#86a6e5", //lightblue startup action
//   "#699bff", // midblue sura
// ];

// function BarChartStudentScheme({ schemeData = [] }) {
//   const [selectedBarYear, setSelectedBarYear] = useState(null);
//   const [maxStudentSchemeBarsCount, setMaxStudentSchemeBarsCount] =
//     useState(15); // for limit of bars

//   // Parse raw data safely
//   const { fullChartData, schemeNames } = useMemo(() => {
//     const yearsMap = {};
//     const names = new Set();

//     schemeData.forEach((scheme) => {
//       const name = scheme.schemeName;
//       if (!name) return;
//       names.add(name);

//       if (Array.isArray(scheme.yearlyData)) {
//         scheme.yearlyData.forEach(({ year, count }) => {
//           if (!yearsMap[year]) {
//             yearsMap[year] = { year: parseInt(year) };
//           }
//           yearsMap[year][name] = count;
//         });
//       }
//     });

//     const allNames = Array.from(names);

//     Object.values(yearsMap).forEach((row) => {
//       allNames.forEach((name) => {
//         if (row[name] == null) {
//           row[name] = 0;
//         }
//       });
//     });

//     const sortedChartData = Object.values(yearsMap).sort(
//       (a, b) => a.year - b.year,
//     );

//     return {
//       fullChartData: sortedChartData,
//       schemeNames: allNames,
//     };
//   }, [schemeData]);

//   // Handle drilldown filter
//   const StuentSchemeChartData = useMemo(() => {
//     if (selectedBarYear) {
//       return fullChartData.filter((item) => item.year === selectedBarYear);
//     }
//     return fullChartData;
//   }, [fullChartData, selectedBarYear]);

//   const displayedStuentSchemeChartData = StuentSchemeChartData.slice(
//     0,
//     maxStudentSchemeBarsCount,
//   );

//   const chartHeightStudentScheme = Math.max(
//     350,
//     displayedStuentSchemeChartData.length * 35,
//   );

//   // Fix: Safe payload tracking for vertical layout systems
//   const handleChartClick = (state) => {
//     if (state && state.activePayload && state.activePayload.length > 0) {
//       const clickedYear = state.activePayload[0].payload.year;
//       setSelectedBarYear(clickedYear);
//     } else if (state && state.activeLabel) {
//       setSelectedBarYear(parseInt(state.activeLabel));
//     }
//   };

//   return (
//     <>
//       <div className="border border-gray-200 p-4 rounded-md shadow-sm text-xs w-full h-[500px]">
//         <div className="flex justify-between gap-2 items-center">
//           <div>
//             <h3 className="text-base font-semibold">
//               Programme-wise Annual Participation
//             </h3>
//             <p className="text-sm text-gray-700">
//               Click/Hover over a bar to view the Yearly Count for the Selected
//               Student Scheme
//             </p>
//           </div>

//           {selectedBarYear && (
//             <div className="flex justify-between items-center gap-2 text-blue-700 px-3 py-2 rounded-md text-xs font-medium">
//               <button
//                 onClick={() => setSelectedBarYear(null)}
//                 className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
//               >
//                 <span className="whitespace-nowrap">Reset Chart</span>{" "}
//                 <RxCross1 />
//               </button>
//             </div>
//           )}
//         </div>
//         <ResponsiveContainer width="100%" height={chartHeightStudentScheme}>
//           <BarChart
//             layout="vertical"
//             data={displayedStuentSchemeChartData}
//             onClick={handleChartClick}
//           >
//             <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
//             <XAxis type="number" stroke="#6b7280" />
//             <YAxis
//               type="category"
//               dataKey="year"
//               interval={0}
//               stroke="#4b5563"
//               reversed={true}
//             />
//             <Tooltip
//               cursor={{ fill: "#f3f4f6", opacity: 0.4 }}
//               contentStyle={{
//                 backgroundColor: "#fff",
//                 borderRadius: "8px",
//                 border: "1px solid #e5e7eb",
//               }}
//             />
//             <Legend verticalAlign="top" height={36} />

//             {schemeNames.map((name, index) => (
//               <Bar
//                 key={name}
//                 dataKey={name}
//                 stackId="a"
//                 className="cursor-pointer"
//                 fill={BAR_COLORS[index % BAR_COLORS.length]}
//                 shape={(props) => (
//                   <RoundedStackBar
//                     {...props}
//                     dataKey={name}
//                     allKeys={schemeNames}
//                   />
//                 )}
//               />
//             ))}
//           </BarChart>
//         </ResponsiveContainer>

//         <div className="flex justify-center mt-2 gap-2">
//           {!selectedBarYear &&
//             maxStudentSchemeBarsCount < StuentSchemeChartData.length && (
//               <button
//                 onClick={() =>
//                   setMaxStudentSchemeBarsCount((prev) =>
//                     Math.min(prev + 15, StuentSchemeChartData.length),
//                   )
//                 }
//                 className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
//               >
//                 Show More
//                 <FaArrowDown className="animate-bounce" size={18} />
//               </button>
//             )}

//           {maxStudentSchemeBarsCount > 15 && (
//             <button
//               onClick={() =>
//                 setMaxStudentSchemeBarsCount((prev) => Math.max(prev - 15, 15))
//               }
//               className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
//             >
//               Show Less
//               <FaArrowUp className="animate-bounce" size={18} />
//             </button>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default BarChartStudentScheme;
