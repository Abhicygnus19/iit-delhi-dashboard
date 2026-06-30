import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { RxCross1 } from "react-icons/rx";

function GrpBarchart({ grpData, projectType, barColor }) {
  // State to track the active/clicked university's full name
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [maxGrpBarsCount, setMaxGrpBarsCount] = useState(15); // for limit of bars

  // Reset the isolated view if the underlying filtered data changes via global dropdowns
  useEffect(() => {
    setSelectedUniversity(null);
  }, [grpData]);

  if (!grpData || grpData.length === 0) {
    return (
      <div className="text-gray-400 italic border p-4 rounded bg-gray-50 text-center">
        No projects fit these criteria.
      </div>
    );
  }

  // 1. Format raw data safely
  const formattedData = grpData.map((item) => ({
    name: item.universityName,
    Projects: parseInt(item.totalProjects || 0, 10),
  }));

  // 2. Drill Down Filtering: If a bar is selected, filter data down to just that one bar
  const grpChartData = selectedUniversity
    ? formattedData.filter((item) => item.name === selectedUniversity)
    : formattedData;

  const displayedGrpData = grpChartData.slice(0, maxGrpBarsCount);

  // 3. Click handler for the individual bars
  const handleBarClick = (clickedState) => {
    if (clickedState?.name) {
      setSelectedUniversity((prev) =>
        prev === clickedState.name ? null : clickedState.name,
      );
    }
  };

  const chartHeightGrp = Math.max(350, displayedGrpData.length * 35);

  return (
    <div className="relative text-xs border-2 rounded-md p-4 w-full group">
      {/* Dynamic Instruction Banner */}
      <div className="flex justify-between items-center mb-2 px-2 text-xs  ">
        <h4 className="text-base font-semibold capitalize">
          {projectType} Projects
        </h4>

        <div className="flex justify-between items-center gap-2 mb-2 px-2 text-xs ">
          {selectedUniversity && (
            <button
              onClick={() => setSelectedUniversity(null)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
            >
              <span className="whitespace-nowrap"> Reset Chart</span>
              <RxCross1 />
            </button>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeightGrp}>
        <BarChart data={displayedGrpData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            dataKey="name"
            type="category"
            width={100}
            tick={{ fontSize: 11, fill: "#4b5563" }}
            tickFormatter={(value) =>
              value.length > 28 ? `${value.substring(0, 28)}...` : value
            }
          />
          <Tooltip
            formatter={(value) => [`${value} Projects`, "Total"]}
            labelFormatter={(label, items) => items[0]?.payload?.name || label}
          />
          <Bar dataKey="Projects" cursor="pointer">
            {displayedGrpData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={barColor || "#1e4a8d"}
                // Attach the click handler inside the Cell component context
                onClick={() => handleBarClick(entry)}
                className="transition-opacity duration-200 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center mt-2 gap-2">
        {!selectedUniversity && maxGrpBarsCount < grpChartData.length && (
          <button
            onClick={() =>
              setMaxGrpBarsCount((prev) =>
                Math.min(prev + 15, grpChartData.length),
              )
            }
            className="px-3 py-1 text-sm text-white bg-blue-900 rounded-full"
          >
            Show More
          </button>
        )}

        {maxGrpBarsCount > 15 && (
          <button
            onClick={() =>
              setMaxGrpBarsCount((prev) => Math.max(prev - 15, 15))
            }
            className="px-3 py-1 text-sm border border-gray-500 rounded-full"
          >
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}

export default GrpBarchart;
