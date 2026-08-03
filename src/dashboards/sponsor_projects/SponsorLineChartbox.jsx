import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
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

  const handleChartClick = (state) => {
    if (state && state.activeLabel) {
      onSponsorYearClick(state.activeLabel);
    }
  };

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-sm">
      <div className="flex justify-between items-center gap-2 mb-4">
        <div>
          {" "}
          <h3 className="font-semibold">
            {" "}
            Year-wise Sponsored Project Portfolio{" "}
          </h3>
          <p className=" text-gray-700">
            Click/Hover over a point to view details
          </p>
        </div>

        {activeSponsorYear && (
          <button
            onClick={() => onSponsorYearClick(null)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
          </button>
        )}
      </div>

      {/* Adjusted margins so axis labels aren't cut off */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          onClick={handleChartClick}
          margin={{ top: 10, right: 20, left: 20, bottom: 35 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#cacaca" />

          <XAxis
            dataKey="year"
            angle={-20}
            tick={{ fontSize: 11 }}
            textAnchor="end"
            tickLine={false}
          >
            <Label
              value="Analysis Period"
              offset={-25}
              position="insideBottom"
              style={{
                fontSize: "14px",
                fill: "#1e4a8d",
                fontWeight: "bold",
              }}
            />
          </XAxis>

          <YAxis tickLine={false}>
            <Label
              value="Number of Projects"
              angle={-90}
              position="insideLeft"
              style={{
                textAnchor: "middle",
                fontSize: "12px",
                fill: "#1e4a8d",
                fontWeight: "bold",
              }}
            />
          </YAxis>

          <Tooltip formatter={(value) => [`${value} Projects`, "Projects"]} />

          <Line
            type="monotone"
            dataKey="projects"
            stroke="#2563eb"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;

              if (activeSponsorYear && payload.year !== activeSponsorYear) {
                return null;
              }

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={"#2563eb"}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{ cursor: "pointer" }}
                  key={`dot-${payload.year}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSponsorYearClick(payload.year);
                  }}
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

// import React, { useMemo } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import { RxCross1 } from "react-icons/rx";

// function SponsorLineChartbox({
//   activeData,
//   selectedFundingTypes,
//   activeSponsorYear,
//   onSponsorYearClick,
// }) {
//   const chartData = useMemo(() => {
//     return activeData.map((item) => {
//       const totalProjects = item.types
//         .filter(
//           (t) =>
//             selectedFundingTypes.length === 0 ||
//             selectedFundingTypes.includes(t.name),
//         )
//         .reduce((sum, t) => sum + t.projects, 0);

//       return {
//         year: item.year,
//         projects: totalProjects,
//       };
//     });
//   }, [activeData, selectedFundingTypes]);

//   const handleLineClick = (state) => {
//     if (state && state.activeLabel) {
//       onSponsorYearClick(state.activeLabel);
//     }
//   };

//   return (
//     <div className="border-2 p-4 rounded-md shadow-sm text-sm">
//       <div className="flex justify-between items-center gap-2 mb-4">
//         <h3 className="font-semibold">Projects Over Time</h3>
//         {activeSponsorYear && (
//           <button
//             onClick={() => onSponsorYearClick(null)}
//             className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
//           >
//             <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
//           </button>
//         )}
//       </div>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={chartData} onClick={handleLineClick}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#cacaca" />
//           <XAxis
//             dataKey="year"
//             angle={-20}
//             tick={{ fontSize: 11 }}
//             textAnchor="end"
//             tickLine={false}
//           />
//           <YAxis tickLine={false} />
//           <Tooltip formatter={(value) => [`${value} Projects`, "Projects"]} />
//           <Line
//             type="monotone"
//             dataKey="projects"
//             stroke="#2563eb"
//             strokeWidth={3}
//             // Custom dot logic to vanish unselected points completely
//             dot={(props) => {
//               const { cx, cy, payload } = props;

//               // If a year is active and this point isn't it, vanish it!
//               if (activeSponsorYear && payload.year !== activeSponsorYear) {
//                 return null;
//               }

//               return (
//                 <circle
//                   cx={cx}
//                   cy={cy}
//                   r={4} // Active dot becomes thick
//                   fill={"#2563eb"}
//                   stroke="#fff"
//                   style={{ cursor: "pointer" }}
//                   key={`dot-${payload.year}`}
//                 />
//               );
//             }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }

// export default SponsorLineChartbox;
