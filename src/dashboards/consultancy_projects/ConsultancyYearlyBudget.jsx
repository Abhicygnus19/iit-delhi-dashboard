import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

function ConsultancyYearlyBudget({ activeData }) {
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
      <h3 className=" font-semibold text-sm">
        Year-wise Total Funds (₹ In Crore)
      </h3>{" "}
      <p className="text-sm mb-4 text-gray-700">
        Hover over a bar to view the total budget for the selected year
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={yearlySponsorBudgetData}>
          <XAxis
            dataKey="year"
            angle={-20}
            textAnchor="end"
            height={50}
            interval={0}
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis tickLine={false} tick={{ fontSize: 11 }} />
          <Tooltip
            cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
            contentStyle={{ borderRadius: "3px", fontSize: "12px" }}
            formatter={(value, name) => [
              `₹${value.toLocaleString("en-IN")} Cr`,
              name,
            ]}
          />
          <Legend wrapperStyle={{ fontSize: "11px" }} />
          radius={[6, 6, 0, 0]}
          <Bar
            dataKey="budget"
            name="Total Budget (in Crore)"
            fill="#4185c5"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ConsultancyYearlyBudget;
