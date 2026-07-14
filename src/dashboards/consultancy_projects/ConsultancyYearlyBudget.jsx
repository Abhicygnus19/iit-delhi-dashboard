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
      <h3 className="mb-4 font-semibold text-sm">
        Budget Comparison Year wise (In Crore)
      </h3>

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
          />

          <Legend wrapperStyle={{ fontSize: "11px" }} />

          <Bar dataKey="budget" name="Total Budget (in Crore)" fill="#1e4a8d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ConsultancyYearlyBudget;
