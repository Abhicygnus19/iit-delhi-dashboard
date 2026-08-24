import React, { useMemo } from "react";

function ConsultancyYearlyProjects({ activeData = [] }) {
  // 1. Extract unique years dynamically from active data
  const yearsRange = useMemo(
    () => activeData.map((item) => item.year),
    [activeData],
  );

  // 2. Identify unique organization types dynamically with priority sorting
  const sponsorOrgTypes = useMemo(() => {
    const rawTypes = Array.from(
      new Set(
        activeData.flatMap((item) =>
          (item.types || []).map((type) => type.name),
        ),
      ),
    );

    const priorityOrder = ["government", "industry", "foreign"];

    return rawTypes.sort((a, b) => {
      const indexA = priorityOrder.indexOf(a.toLowerCase());
      const indexB = priorityOrder.indexOf(b.toLowerCase());

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.localeCompare(b);
    });
  }, [activeData]);

  // Helper function to pull project count for a specific year and org type
  const getProjectCount = (targetYear, targetOrg) => {
    const yearData = activeData.find((item) => item.year === targetYear);
    if (!yearData || !yearData.types) return 0;

    const orgData = yearData.types.find(
      (type) => type.name.toLowerCase() === targetOrg.toLowerCase(),
    );
    return orgData ? Number(orgData.projects) || 0 : 0;
  };

  // 3. Compute dynamic min and max values across all types/years for precise heatmap scaling
  const { minCount, maxCount } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    activeData.forEach((item) => {
      (item.types || []).forEach((type) => {
        const val = Number(type.projects) || 0;
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
  }, [activeData]);

  // 4. Intensity-based Heatmap Style Resolver
  const getHeatmapStyle = (value) => {
    if (value === 0) {
      return {
        backgroundColor: "#f9fafb", // Subtle gray for empty values
        color: "#9ca3af",
      };
    }

    // Calculate normalized intensity ratio between 0 and 1
    const intensity =
      maxCount === minCount ? 1 : (value - minCount) / (maxCount - minCount);

    // Map lightness dynamically from 85% (lightest blue for lowest value) to 35% (darkest blue for max value)
    const lightness = 85 - intensity * 50;

    // Dynamically toggle font color for optimal accessibility contrast
    const textColor = lightness < 60 ? "#ffffff" : "#0f172a";

    return {
      backgroundColor: `hsl(217, 91%, ${lightness}%)`,
      color: textColor,
    };
  };

  return (
    <div className="border-2 p-4 rounded-md shadow-sm text-xs chart-card bg-white">
      <h3 className="text-sm font-semibold mb-4 font-sans">
        Heatmap: Year-wise Project numbers
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-x-2 border-spacing-y-2">
          <thead>
            <tr>
              <th className="text-left text-muted-foreground font-semibold capitalize min-w-[140px]">
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
                  const style = getHeatmapStyle(count);

                  return (
                    <td
                      key={`${org}-${year}`}
                      style={style}
                      className="text-center rounded-md font-semibold transition-all duration-200 p-2"
                    >
                      {count || (
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

export default ConsultancyYearlyProjects;
