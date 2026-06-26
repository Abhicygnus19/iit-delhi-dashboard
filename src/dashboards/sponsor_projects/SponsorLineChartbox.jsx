// import React from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";

// function SponsorLineChartbox({ activeData, selectedFundingTypes }) {
//   // Re-calculate yearly totals on the fly based on selected funding categories
//   const chartData = activeData.map((item) => {
//     const totalProjects = item.types
//       .filter(
//         (t) =>
//           selectedFundingTypes.length === 0 ||
//           selectedFundingTypes.includes(t.name),
//       )
//       .reduce((sum, t) => sum + t.projects, 0);

//     return {
//       year: item.year,
//       projects: totalProjects,
//     };
//   });

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-xs">
//       <h3 className="mb-4 font-semibold">Projects Over Time</h3>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#cacaca" />
//           <XAxis dataKey="year" />
//           <YAxis />
//           <Tooltip formatter={(value) => [`${value} Projects`, "Projects"]} />
//           <Line
//             type="monotone"
//             dataKey="projects"
//             stroke="#2563eb"
//             strokeWidth={3}
//             dot={{ r: 4 }}
//             activeDot={{ r: 6 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default SponsorLineChartbox;

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { RxCross1 } from "react-icons/rx";

function SponsorLineChartbox({
  activeData,
  selectedFundingTypes,
  activeSponsorYear,
  onSponsorYearClick,
}) {
  const chartData = useMemo(() => {
    return activeData.map((item) => {
      const totalProjects = item.types
        .filter(
          (t) =>
            selectedFundingTypes.length === 0 ||
            selectedFundingTypes.includes(t.name),
        )
        .reduce((sum, t) => sum + t.projects, 0);

      return {
        year: item.year,
        projects: totalProjects,
      };
    });
  }, [activeData, selectedFundingTypes]);

  const handleLineClick = (state) => {
    if (state && state.activeLabel) {
      onSponsorYearClick(state.activeLabel);
    }
  };

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-sm">
      <div className="flex justify-between items-center gap-2 mb-4">
        <h3 className="font-semibold">Projects Over Time</h3>
        {activeSponsorYear && (
          <button
            onClick={() => onSponsorYearClick(null)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} onClick={handleLineClick}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cacaca" />
          <XAxis
            dataKey="year"
            angle={-20}
            tick={{ fontSize: 11 }}
            textAnchor="end"
            tickLine={false}
          />
          <YAxis tickLine={false} />
          <Tooltip formatter={(value) => [`${value} Projects`, "Projects"]} />
          <Line
            type="monotone"
            dataKey="projects"
            stroke="#2563eb"
            strokeWidth={3}
            // Custom dot logic to vanish unselected points completely
            dot={(props) => {
              const { cx, cy, payload } = props;

              // If a year is active and this point isn't it, vanish it!
              if (activeSponsorYear && payload.year !== activeSponsorYear) {
                return null;
              }

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4} // Active dot becomes thick
                  fill={"#2563eb"}
                  stroke="#fff"
                  style={{ cursor: "pointer" }}
                  key={`dot-${payload.year}`}
                />
              );
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SponsorLineChartbox;
