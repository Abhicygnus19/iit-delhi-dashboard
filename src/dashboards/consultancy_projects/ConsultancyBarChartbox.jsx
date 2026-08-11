import React, { useMemo, useState, useRef } from "react";
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
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

// Default Palette mapped by category key name
const DEFAULT_COLOR_MAP = {
  government: "#86a6e5",
  industry: "#2664ec",
  foreign: "#4c1d96",
};

// Helper function to generate distinct dynamic HSL colors for any additional/unknown bars
const getDynamicColor = (index) => {
  // Uses golden ratio hue distribution for maximum contrast
  const hue = (index * 137.508) % 360;
  return `hsl(${Math.floor(hue)}, 65%, 50%)`;
};

function ConsultancyBarChartbox({
  selectedBudgetTypes = [],
  setSelectedBudgetTypes,
  onConsultancyYearClick,
  activeConsultancyYear,
  activeData = [],
  allAvailableKeys = [],
}) {
  // Keeps track of how many rows should be loaded from the bottom up
  const [maxConsultancyCount, setMaxConsultancyCount] = useState(15);

  // 1. Process base chart data, extract dynamic categories, and parse custom colors from JSON
  const { fullChartData, extractedKeys, inlineColors } = useMemo(() => {
    const keysSet = new Set();
    const colorsFromData = {};

    const transformed = activeData.map((item) => {
      const dataRow = { year: item.year };
      if (Array.isArray(item.types)) {
        item.types.forEach((type) => {
          dataRow[type.name] = parseFloat(type.budget) || 0;
          keysSet.add(type.name);

          // Store color if explicitly defined inside the data object item
          if (type.color) {
            colorsFromData[type.name] = type.color;
          }
        });
      }
      return dataRow;
    });

    transformed.sort((a, b) => a.year.localeCompare(b.year));

    return {
      fullChartData: transformed,
      extractedKeys: Array.from(keysSet),
      inlineColors: colorsFromData,
    };
  }, [activeData]);

  // 2. Permanent Registry for dynamic keys to lock their index position and colors
  const masterKeyRegistry = useRef([]);
  const colorMapRef = useRef({});

  const keysToRegister =
    allAvailableKeys.length > 0 ? allAvailableKeys : extractedKeys;

  keysToRegister.forEach((key) => {
    if (!masterKeyRegistry.current.includes(key)) {
      masterKeyRegistry.current.push(key);

      const registeredIndex = masterKeyRegistry.current.length - 1;

      // Color selection hierarchy:
      // 1. Color defined directly in data object (type.color)
      // 2. Fixed color from DEFAULT_COLOR_MAP by name
      // 3. Fallback dynamically generated HSL color
      if (inlineColors[key]) {
        colorMapRef.current[key] = inlineColors[key];
      } else if (DEFAULT_COLOR_MAP[key]) {
        colorMapRef.current[key] = DEFAULT_COLOR_MAP[key];
      } else {
        colorMapRef.current[key] = getDynamicColor(registeredIndex);
      }
    }
  });

  // 3. Filter data dynamically based on active selected year click
  const filteredYearData = useMemo(() => {
    if (!activeConsultancyYear) return fullChartData;
    return fullChartData.filter((item) => item.year === activeConsultancyYear);
  }, [fullChartData, activeConsultancyYear]);

  // 4. Paginate from the BOTTOM up (Show latest records first, slice backward)
  const displayedChartData = useMemo(() => {
    if (activeConsultancyYear) return filteredYearData;

    const sliceStart = Math.max(
      0,
      filteredYearData.length - maxConsultancyCount,
    );
    return filteredYearData.slice(sliceStart);
  }, [filteredYearData, maxConsultancyCount, activeConsultancyYear]);

  // 5. Track active keys in locked order for Recharts stack calculations
  const activeKeysInOrder = useMemo(() => {
    return masterKeyRegistry.current.filter(
      (key) =>
        selectedBudgetTypes.length === 0 || selectedBudgetTypes.includes(key),
    );
  }, [selectedBudgetTypes]);

  // Click handler on bar tracks
  const handleSponsorbarClick = (state) => {
    if (state && state.activeLabel) {
      onConsultancyYearClick(state.activeLabel);
    }
  };

  const latestConsultancyUnitYear = useMemo(() => {
    const yearsWithUnits = activeData
      .filter(
        (item) =>
          item.consultancyUnitWiseProjects &&
          item.consultancyUnitWiseProjects.length > 0,
      )
      .map((item) => item.year);

    if (!yearsWithUnits.length) return "";

    const orderedYears = fullChartData
      .map((item) => item.year)
      .filter((year) => yearsWithUnits.includes(year));

    return orderedYears[orderedYears.length - 1] || "";
  }, [activeData, fullChartData]);

  // Is latest unit year visible in sliced window
  const isLatestUnitYearVisible = useMemo(() => {
    return displayedChartData.some(
      (item) => item.year === latestConsultancyUnitYear,
    );
  }, [displayedChartData, latestConsultancyUnitYear]);

  // Adjust height calculation dynamically based on item count
  const chartHeight = Math.max(350, displayedChartData.length * 35);

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs w-full bg-white">
      <div className="flex justify-between items-center gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-sm">
            Year-wise Sponsored Research Funds (₹ In Crore){" "}
            {activeConsultancyYear ? `- ${activeConsultancyYear}` : ""}
          </h3>

          <p className="text-sm text-gray-700">
            Click/Hover a bar to explore budget details by category
          </p>
        </div>
        {(selectedBudgetTypes.length > 0 || activeConsultancyYear) && (
          <button
            onClick={() => {
              setSelectedBudgetTypes([]);
              onConsultancyYearClick(null);
            }}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span> <RxCross1 />
          </button>
        )}
      </div>

      {latestConsultancyUnitYear && isLatestUnitYearVisible && (
        <button className="rounded-full px-4 py-1 bg-red-700 hover:bg-red-800 text-white text-sm font-medium mb-4 flex gap-2 items-center">
          <span>
            Click {latestConsultancyUnitYear} to view Sanctioned Research
            Projects
          </span>
          <FaArrowDown className="animate-bounce" size={16} />
        </button>
      )}

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={displayedChartData}
          layout="vertical"
          onClick={handleSponsorbarClick}
          style={{ cursor: "pointer" }}
        >
          <XAxis type="number" />
          <YAxis
            dataKey="year"
            type="category"
            tickLine={false}
            width={60}
            reversed={true}
          />
          <Tooltip
            cursor={{ fill: "#f3f4f6" }}
            formatter={(value, name) => [
              `₹${Number(value).toLocaleString("en-IN")} Cr`,
              name,
            ]}
          />
          <Legend />

          {masterKeyRegistry.current.map((name) => {
            const isSelected =
              selectedBudgetTypes.length === 0 ||
              selectedBudgetTypes.includes(name);

            return (
              <Bar
                key={name}
                dataKey={name}
                name={name.charAt(0).toUpperCase() + name.slice(1)}
                fill={colorMapRef.current[name]}
                stackId="a"
                className="cursor-pointer"
                isAnimationActive={true}
                hide={!isSelected}
                shape={(props) => {
                  const { x, y, width, height, payload } = props;
                  if (!width || width <= 0) return null;

                  // Get active non-zero keys for this specific row item
                  const activeRowKeys = activeKeysInOrder.filter(
                    (k) => payload[k] && payload[k] > 0,
                  );

                  // Check if this current key is the last non-zero visible segment
                  const isRightmost =
                    activeRowKeys[activeRowKeys.length - 1] === name;

                  const r = 6; // Corner radius size

                  return (
                    <path
                      d={
                        isRightmost
                          ? `M${x},${y} 
                             h${Math.max(0, width - r)} 
                             a${r},${r} 0 0 1 ${r},${r} 
                             v${Math.max(0, height - 2 * r)} 
                             a${r},${r} 0 0 1 -${r},${r} 
                             h-${Math.max(0, width - r)} 
                             z`
                          : `M${x},${y} h${width} v${height} h-${width} z`
                      }
                      fill={colorMapRef.current[name]}
                      className="cursor-pointer"
                    />
                  );
                }}
              />
            );
          })}
        </BarChart>
      </ResponsiveContainer>

      {/* Hide pagination controls if an activeConsultancyYear filter simplifies the dataset */}
      {!activeConsultancyYear && (
        <>
          <div className="flex justify-center mt-6 gap-4">
            {maxConsultancyCount < fullChartData.length && (
              <button
                onClick={() =>
                  setMaxConsultancyCount((prev) =>
                    Math.min(prev + 15, fullChartData.length),
                  )
                }
                className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
              >
                Show More
                <FaArrowDown className="animate-bounce" />
              </button>
            )}

            {maxConsultancyCount > 15 && (
              <button
                onClick={() =>
                  setMaxConsultancyCount((prev) => Math.max(prev - 15, 15))
                }
                className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl animate-pulse"
              >
                Show Less
                <FaArrowUp className="animate-bounce" size={18} />
              </button>
            )}
          </div>

          <div className="text-center text-gray-500 text-xs mt-2 font-medium">
            Showing {Math.min(maxConsultancyCount, fullChartData.length)} of{" "}
            {fullChartData.length} records
          </div>
        </>
      )}
    </div>
  );
}

export default ConsultancyBarChartbox;
