import React, { useMemo } from "react";
import { RxCross1 } from "react-icons/rx";

function YearlyPatentsTable({
  transformedPatentChartData = [],
  patentTypes = [],
  visiblePatentData = [],
  isFiltered,
  clearFilter,
}) {
  // Map columns based on visible data so it mirrors chart slicing
  const yearsRange = useMemo(() => {
    return visiblePatentData.map((d) => d.year);
  }, [visiblePatentData]);

  // Compute dynamic minimum and maximum non-zero values across the dataset
  const { minCount, maxCount } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    transformedPatentChartData.forEach((yearRow) => {
      patentTypes.forEach((type) => {
        const cleanType = type.trim();
        const val = Number(yearRow[type] ?? yearRow[cleanType]) || 0;
        if (val > 0) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });

    return {
      minCount: min === Infinity ? 0 : min,
      maxCount: max === -Infinity ? 0 : max,
    };
  }, [transformedPatentChartData, patentTypes]);

  // Calculate dynamic heatmap styling based on value intensity
  const getHeatmapStyle = (value) => {
    if (!value || value === 0) {
      return {
        backgroundColor: "#f9fafb", // Default light background for empty cells
        color: "#9ca3af",
      };
    }

    // Normalize value intensity between 0 and 1
    const intensity =
      maxCount === minCount ? 1 : (value - minCount) / (maxCount - minCount);

    // Scale lightness from 85% (light blue) down to 35% (deep dark blue)
    const lightness = 85 - intensity * 50;

    // Use dark text for light cells and white text for darker cells
    const textColor = lightness < 60 ? "#ffffff" : "#1e293b";

    return {
      backgroundColor: `hsl(217, 91%, ${lightness}%)`,
      color: textColor,
    };
  };

  return (
    <div className="border border-gray-200 p-4 rounded-md shadow-sm text-xs bg-white">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold">
            Heatmap: Patents and Technology Transfer
          </h3>
        </div>
        {/* Reset Filter Action */}
        {isFiltered && (
          <button
            onClick={clearFilter}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-separate border-spacing-x-2 border-spacing-y-2 p-1">
          <thead>
            <tr>
              <th className="text-left py-2 text-muted-foreground font-medium border-b capitalize min-w-[120px] bg-white">
                Patent types \ Years
              </th>
              {yearsRange.map((year) => (
                <th
                  key={year}
                  className="text-center font-semibold whitespace-nowrap bg-white"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="align-middle">
            {patentTypes.map((type) => (
              <tr key={type} className="group border-b">
                {/* Fixed Type Header Column */}
                <td className="font-medium pr-2 whitespace-nowrap">{type}</td>

                {/* Dynamically Heat-mapped Data Cells */}
                {yearsRange.map((year) => {
                  const yearRow = transformedPatentChartData.find(
                    (d) => d.year === year,
                  );

                  const cleanType = type.trim();
                  const count = yearRow
                    ? Number(yearRow[type] ?? yearRow[cleanType]) || 0
                    : 0;

                  const style = getHeatmapStyle(count);

                  return (
                    <td
                      key={year}
                      style={style}
                      className="rounded-lg p-2 text-center text-xs font-semibold transition-all duration-200"
                    >
                      {count > 0 ? count : <span>--</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default YearlyPatentsTable;
