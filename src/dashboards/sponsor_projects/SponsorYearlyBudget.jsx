import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Label,
} from "recharts";

function SponsorYearlyBudget({ activeData }) {
  // Dynamically calculate the budget total for each year based on the active filters
  const yearlySponsorBudgetData = activeData.map((item) => {
    const combinedBudget = item.types.reduce(
      (sum, type) => sum + type.budget,
      0,
    );

    return {
      year: item.year,
      budget: Number(combinedBudget.toFixed(2)), // Keeps floating point precision clean
    };
  });

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs bg-white">
      <h3 className="mb-4 font-semibold text-sm">
        Budget Comparison Year wise (In Crore)
      </h3>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          data={yearlySponsorBudgetData}
          margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
        >
          <XAxis
            dataKey="year"
            angle={-20}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{ fontSize: 11 }}
            tickLine={false}
          >
            <Label
              value="Financial Year"
              position="insideBottom"
              offset={-15}
              style={{ fontSize: "14px", fill: "#1e4a8d", fontWeight: "bold" }}
            />
          </XAxis>

          <YAxis tickLine={false} tick={{ fontSize: 11 }}>
            <Label
              value="Yearly Budget (in Crore)"
              angle={-90}
              position="insideLeft"
              offset={-10}
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                fill: "#1e4a8d",
                textAnchor: "middle",
              }}
            />
          </YAxis>

          <Tooltip
            cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
            contentStyle={{ borderRadius: "3px", fontSize: "12px" }}
            formatter={(value, name) => [
              `₹${value.toLocaleString("en-IN")} Cr`,
              name,
            ]}
          />

          <Legend wrapperStyle={{ fontSize: "11px" }} verticalAlign="top" />

          <Bar dataKey="budget" name="Total Budget (in Crore)" fill="#4185c5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SponsorYearlyBudget;
