import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";
import { RxCross1 } from "react-icons/rx";

export default function LinechartCitiatonPub({
  entities = [],
  yearRange,
  selectedYear,
  onYearSelect,
  onReset,
  showReset,
}) {
  // Aggregate yearly data directly from the entities passed from Publications page
  const data = useMemo(() => {
    if (!entities || entities.length === 0) return [];

    const [startYear, endYear] = yearRange ?? [];
    const yearlyMap = {};

    // 1. Calculate total publications per year for the filtered entities
    entities.forEach((entity) => {
      if (Array.isArray(entity.publications)) {
        entity.publications.forEach((pub) => {
          const year = pub.year;

          // Apply selected year filter OR year range filter
          if (selectedYear != null && year !== selectedYear) return;
          if (
            selectedYear == null &&
            startYear != null &&
            endYear != null &&
            (year < startYear || year > endYear)
          ) {
            return;
          }

          if (!yearlyMap[year]) {
            yearlyMap[year] = { year, publications: 0, citations: 0 };
          }
          yearlyMap[year].publications += pub.value || 0;
        });
      }
    });

    // 2. Estimate yearly citation contribution weighted by publication distribution
    const years = Object.keys(yearlyMap)
      .map(Number)
      .sort((a, b) => a - b);

    return years.map((yr) => yearlyMap[yr]);
  }, [entities, yearRange, selectedYear]);

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs bg-white">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-sm"> Annual Publication Output</h3>
          <p className="text-sm text-gray-700">
            Hover on a point to view Total no of Publication for each year
          </p>
        </div>
        {showReset && (
          <button
            onClick={onReset}
            className="bg-blue-50 hover:bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs flex gap-2 items-center"
          >
            <span className="whitespace-nowrap">Reset Chart</span>
            <RxCross1 />
          </button>
        )}
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 20, bottom: 35 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#cacaca"
            vertical={true}
            horizontal={true}
          />

          <XAxis
            dataKey="year"
            angle={-20}
            tick={{ fontSize: 11 }}
            textAnchor="end"
            tickLine={false}
          />
          <Label
            value="Year-wise Total Publications"
            offset={-55}
            position="insideBottom"
            style={{
              fontSize: "14px",
              fill: "#1e4a8d",
              fontWeight: "bold",
            }}
          />

          {/* Left YAxis for Publications */}
          <YAxis yAxisId="left" tickLine={false} />

          {/* Right YAxis for Citations (since citation values are usually higher) */}
          <YAxis yAxisId="right" orientation="right" tickLine={false} />

          <Label
            value="Publications Count"
            angle={-90}
            position="insideLeft"
            offset={-55}
            style={{
              textAnchor: "middle",
              fontSize: "12px",
              fill: "#1e4a8d",
              fontWeight: "bold",
            }}
          />

          <Tooltip />
          <Legend verticalAlign="top" height={36} iconType="square" />

          {/* Publications Line */}
          <Line
            yAxisId="left"
            name="Total Publications"
            dataKey="publications"
            stroke="#2563eb"
            strokeWidth={2}
            activeDot={{
              onClick: (event, payload) => {
                const year = payload?.payload?.year;
                if (year != null) {
                  onYearSelect?.(year);
                }
              },
              cursor: "pointer",
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
