import React, { useMemo } from "react";
import { RxCross1 } from "react-icons/rx";

function HeatmapYearlyScheme({
  transformedSchemeChartData = [],
  schemeTypes = [],
  visibleSchemeData = [],
  isFiltered = false,
  clearFilter,
}) {
  // 1. Extract visible years array for column headers
  const yearsRange = useMemo(() => {
    return visibleSchemeData.map((d) => d.year);
  }, [visibleSchemeData]);

  // 2. Compute dynamic min and max non-zero counts across the dataset for heat intensity
  const { minCount, maxCount } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    transformedSchemeChartData.forEach((row) => {
      schemeTypes.forEach((type) => {
        const cleanType = type.trim();
        const val = Number(row[type] ?? row[cleanType]) || 0;
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
  }, [transformedSchemeChartData, schemeTypes]);

  // 3. Dynamic HSL-based Heatmap Cell Style Generator
  const getHeatmapStyle = (value) => {
    if (value === 0) {
      return {
        backgroundColor: "#cbdcf6", // Light gray for empty cells
        color: "#9ca3af",
      };
    }

    // Normalize intensity between 0 and 1
    const intensity =
      maxCount === minCount ? 1 : (value - minCount) / (maxCount - minCount);

    // Adjust lightness: 85% (lightest blue for min) down to 35% (darkest blue for max)
    const lightness = 85 - intensity * 50;

    // Contrast text color selection
    const textColor = lightness < 60 ? "#ffffff" : "#1e293b";

    return {
      backgroundColor: `hsl(217, 91%, ${lightness}%)`,
      color: textColor,
    };
  };

  return (
    <div className="border border-gray-200 p-4 rounded-md shadow-sm text-xs bg-white">
      {/* Header Bar */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-sm font-semibold">Yearly Student Schemes</h3>
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

      {/* Heatmap Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-separate border-spacing-x-2 border-spacing-y-2 p-1">
          <thead>
            <tr>
              <th className="text-left py-2 text-gray-500 font-medium border-b capitalize min-w-[140px] bg-white">
                Scheme Types \ Years
              </th>
              {yearsRange.map((year) => (
                <th
                  key={year}
                  className="text-center font-semibold whitespace-nowrap px-2 bg-white"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="align-middle">
            {schemeTypes.map((type) => (
              <tr key={type} className="group border-b">
                {/* Scheme Type Name */}
                <td className="font-medium pr-2 whitespace-nowrap">{type}</td>

                {/* Heatmap Data Cells */}
                {yearsRange.map((year) => {
                  const yearRow = transformedSchemeChartData.find(
                    (d) => d.year === year,
                  );

                  const cleanType = type.trim();
                  const count = yearRow
                    ? Number(yearRow[type] ?? yearRow[cleanType]) || 0
                    : 0;

                  const style = getHeatmapStyle(count);

                  return (
                    <td
                      key={`${type}-${year}`}
                      style={style}
                      className="rounded-lg p-2 text-center text-xs font-semibold transition-all duration-200"
                    >
                      {count > 0 ? (
                        count
                      ) : (
                        <span className="font-extrabold opacity-70">--</span>
                      )}
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

export default HeatmapYearlyScheme;
