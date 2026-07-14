import React, { useMemo, useState } from "react";
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

const BAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

function BarChartStudentScheme({ schemeData = [] }) {
  const [selectedBarYear, setSelectedBarYear] = useState(null);
  const [maxStudentSchemeBarsCount, setMaxStudentSchemeBarsCount] =
    useState(15); // for limit of bars

  // Parse raw data safely
  const { fullChartData, schemeNames } = useMemo(() => {
    const yearsMap = {};
    const names = new Set();

    schemeData.forEach((scheme) => {
      const name = scheme.schemeName;
      if (!name) return;
      names.add(name);

      if (Array.isArray(scheme.yearlyData)) {
        scheme.yearlyData.forEach(({ year, count }) => {
          if (!yearsMap[year]) {
            yearsMap[year] = { year: parseInt(year) };
          }
          yearsMap[year][name] = count;
        });
      }
    });

    const sortedChartData = Object.values(yearsMap).sort(
      (a, b) => a.year - b.year,
    );

    return {
      fullChartData: sortedChartData,
      schemeNames: Array.from(names),
    };
  }, [schemeData]);

  // Handle drilldown filter
  const StuentSchemeChartData = useMemo(() => {
    if (selectedBarYear) {
      return fullChartData.filter((item) => item.year === selectedBarYear);
    }
    return fullChartData;
  }, [fullChartData, selectedBarYear]);

  const displayedStuentSchemeChartData = StuentSchemeChartData.slice(
    0,
    maxStudentSchemeBarsCount,
  );

  const chartHeightStudentScheme = Math.max(
    350,
    displayedStuentSchemeChartData.length * 35,
  );

  // Fix: Safe payload tracking for vertical layout systems
  const handleChartClick = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const clickedYear = state.activePayload[0].payload.year;
      setSelectedBarYear(clickedYear);
    } else if (state && state.activeLabel) {
      setSelectedBarYear(parseInt(state.activeLabel));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <div className="border border-gray-200 p-2 rounded-md shadow-sm text-xs w-full h-[500px]">
        {selectedBarYear && (
          <div className="flex justify-between items-center gap-2 text-blue-700 px-3 py-2 rounded-md text-xs font-medium">
            <span>
              Showing data only for year: <strong>{selectedBarYear}</strong>
            </span>
            <button
              onClick={() => setSelectedBarYear(null)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
            >
              <span className="whitespace-nowrap">Reset Chart</span>{" "}
              <RxCross1 />
            </button>
          </div>
        )}

        <ResponsiveContainer width="100%" height={chartHeightStudentScheme}>
          <BarChart
            layout="vertical"
            data={displayedStuentSchemeChartData}
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
            <Legend verticalAlign="top" height={36} iconType="circle" />

            {schemeNames.map((name, index) => (
              <Bar
                key={name}
                dataKey={name}
                fill={BAR_COLORS[index % BAR_COLORS.length]}
                stackId="a"
                className="cursor-pointer"
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <div className="flex justify-center mt-2 gap-2">
          {!selectedBarYear &&
            maxStudentSchemeBarsCount < StuentSchemeChartData.length && (
              <button
                onClick={() =>
                  setMaxStudentSchemeBarsCount((prev) =>
                    Math.min(prev + 15, StuentSchemeChartData.length),
                  )
                }
                className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
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
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
            >
              Show Less
              <FaArrowUp className="animate-bounce" size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BarChartStudentScheme;
