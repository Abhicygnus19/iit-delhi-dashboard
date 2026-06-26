import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { RxCross1 } from "react-icons/rx";

const COLOR_PALETTE = {
  government: "#1e4a8d",
  industry: "#3b82f6",
  foreign: "#f59e0b",
};

function SponsorBarChartbox({
  selectedBudgetTypes,
  setSelectedBudgetTypes,
  onSponsorYearClick,
  activeSponsorYear,
  activeData,
}) {
  // Keeps track of how many rows should be loaded from the bottom up
  const [maxSponsorCount, setMaxSponsorCount] = useState(15);

  // 1. Process the base chart data and get unique keys
  const { fullChartData, uniqueKeys } = useMemo(() => {
    const keysSet = new Set();
    const transformed = activeData.map((item) => {
      const dataRow = { year: item.year };
      item.types.forEach((type) => {
        dataRow[type.name] = type.budget;
        keysSet.add(type.name);
      });
      return dataRow;
    });
    return { fullChartData: transformed, uniqueKeys: Array.from(keysSet) };
  }, [activeData]);

  // 2. Filter data dynamically based on active selected year click
  const filteredYearData = useMemo(() => {
    if (!activeSponsorYear) return fullChartData;
    return fullChartData.filter((item) => item.year === activeSponsorYear);
  }, [fullChartData, activeSponsorYear]);

  // 3. Paginate from the BOTTOM up (Show latest records first, append old records to top)
  const displayedChartData = useMemo(() => {
    if (activeSponsorYear) return filteredYearData; // Don't paginate if a single year is selected

    // Calculate starting index from the tail end of the dataset
    const sliceStart = Math.max(0, filteredYearData.length - maxSponsorCount);
    return filteredYearData.slice(sliceStart);
  }, [filteredYearData, maxSponsorCount, activeSponsorYear]);

  const visibleKeys = uniqueKeys.filter(
    (key) =>
      selectedBudgetTypes.length === 0 || selectedBudgetTypes.includes(key),
  );

  // Click handler on one bar track
  const handleSponsorbarClick = (state) => {
    if (state && state.activeLabel) {
      onSponsorYearClick(state.activeLabel);
    }
  };

  // Adjust height calculation smoothly based on chunk size
  const chartHeight = Math.max(350, displayedChartData.length * 35);

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs w-full bg-white">
      <div className="flex justify-between items-center gap-2 mb-4">
        <h3 className="font-semibold text-sm">
          Yearly budget of each Organizations (In Crore){" "}
          {activeSponsorYear ? `- ${activeSponsorYear}` : ""}
        </h3>
        {(selectedBudgetTypes.length > 0 || activeSponsorYear) && (
          <button
            onClick={() => {
              setSelectedBudgetTypes([]);
              onSponsorYearClick(null);
            }}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={displayedChartData}
          layout="vertical"
          onClick={handleSponsorbarClick}
          // barCategoryGap={activeSponsorYear ? "35%" : "20%"}
        >
          <XAxis type="number" />
          <YAxis dataKey="year" type="category" tickLine={false} width={60} />
          <Tooltip cursor={{ fill: "#f3f4f6" }} />
          <Legend />

          {visibleKeys.map((key) => (
            <Bar
              key={key}
              dataKey={key}
              name={key.charAt(0).toUpperCase() + key.slice(1)}
              fill={COLOR_PALETTE[key] || "#8884d8"}
              stackId="a"
              className="cursor-pointer"
              isAnimationActive={true}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* Hide controls if an activeSponsorYear filter simplifies the dataset to 1 */}
      {!activeSponsorYear && (
        <>
          <div className="flex justify-center mt-4 gap-2">
            {maxSponsorCount < fullChartData.length && (
              <button
                onClick={() =>
                  setMaxSponsorCount((prev) =>
                    Math.min(prev + 15, fullChartData.length),
                  )
                }
                className="px-3 py-1 text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-full transition-colors"
              >
                Show More
              </button>
            )}

            {maxSponsorCount > 15 && (
              <button
                onClick={() =>
                  setMaxSponsorCount((prev) => Math.max(prev - 15, 15))
                }
                className="px-3 py-1 text-xs font-medium border border-gray-400 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
              >
                Show Less
              </button>
            )}
          </div>

          <div className="text-center text-gray-500 text-xs mt-2 font-medium">
            Showing {Math.min(maxSponsorCount, fullChartData.length)} of{" "}
            {fullChartData.length} records
          </div>
        </>
      )}
    </div>
  );
}

export default SponsorBarChartbox;
