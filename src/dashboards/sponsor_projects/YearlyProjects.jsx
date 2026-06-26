import React from "react";

function YearlyProjects({ activeData }) {
  // 1. Extract unique years dynamically from active data
  const yearsRange = activeData.map((item) => item.year);

  // 2. Identify the unique organization types dynamically from the current data slice
  const sponsorOrgTypes = Array.from(
    new Set(activeData.flatMap((item) => item.types.map((type) => type.name))),
  );

  // Helper function to pull the project count for a specific year and organization type
  const getProjectCount = (targetYear, targetOrg) => {
    const yearData = activeData.find((item) => item.year === targetYear);
    if (!yearData) return 0;

    const orgData = yearData.types.find((type) => type.name === targetOrg);
    return orgData ? orgData.projects : 0;
  };

  // 3. Find the maximum value dynamically to calibrate the heatmap scale live
  const maxProjectCount = Math.max(
    ...activeData.flatMap((item) => item.types.map((t) => t.projects)),
    1,
    // Fallback to 1 to prevent division by zero if all data is cleared
  );

  // Helper to generate heatmap background colors dynamically
  const getcellcolorStyle = (value) => {
    if (value === 0) return { backgroundColor: "transparent" };

    const minOpacity = 0.08;
    const maxOpacity = 0.85;
    const ratio = value / maxProjectCount;
    const opacity = minOpacity + ratio * (maxOpacity - minOpacity);

    return {
      backgroundColor: `rgba(59, 130, 246, ${opacity})`,
    };
  };

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs chart-card">
      <h3 className="text-sm font-semibold mb-4 font-sans">
        Yearly Projects of each Organization
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-x-2 border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-semibold capitalize min-w-[140px] ">
                Organizations \ Years
              </th>
              {yearsRange.map((year) => (
                <th
                  key={year}
                  className="text-center text-muted-foreground font-semibold whitespace-nowrap align-middle"
                >
                  {year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sponsorOrgTypes.map((org) => (
              <tr key={org}>
                <td className="text-left p-2 font-medium capitalize text-foreground/80 align-middle">
                  {org}
                </td>
                {yearsRange.map((year) => {
                  const count = getProjectCount(year, org);
                  const cellStyle = getcellcolorStyle(count);

                  return (
                    <td
                      key={`${org}-${year}`}
                      style={cellStyle}
                      className="text-center rounded-md font-semibold transition-all duration-200 p-2"
                    >
                      {count}
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

export default YearlyProjects;
