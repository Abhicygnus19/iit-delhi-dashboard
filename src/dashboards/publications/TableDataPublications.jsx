import React, { useEffect, useMemo, useState } from "react";

function TableDataPublications({ entities = [], yearRange }) {
  const tableData = useMemo(() => {
    const rows = [];
    const [startYear, endYear] = yearRange ?? [];

    entities.forEach((dept) => {
      let calculatedTotalPubs = 0;

      // 1. Format organizational type safely
      const formattedType = dept.orgType
        ? dept.orgType.charAt(0).toUpperCase() + dept.orgType.slice(1)
        : "—";

      // 2. Process yearly publications and calculate total dynamically
      dept.publications?.forEach((pub) => {
        const numYear = pub.year;

        // Filter by year range if provided
        if (startYear != null && endYear != null) {
          if (numYear < startYear || numYear > endYear) {
            return; // Skip this year if it falls outside the range
          }
        }

        // Add to our dynamic total calculation
        calculatedTotalPubs += pub.value || 0;

        rows.push({
          type: formattedType,
          orgUnit: dept.name,
          metric: "publications",
          year: numYear,
          value: pub.value,
        });
      });

      // 3. Add dynamic total publications entry for the selected range
      rows.push({
        type: formattedType,
        orgUnit: dept.name,
        metric: "publications_total",
        year: "—",
        value: calculatedTotalPubs, // Dynamically computed
      });

      // 4. Handle Citations
      // Note: If your API provides dynamic citations per year, you should filter them
      // like publications above. Otherwise, fallback safely to API root property or 0.
      rows.push({
        type: formattedType,
        orgUnit: dept.name,
        metric: "citations_total",
        year: "—",
        value: dept.citations ?? 0,
      });

      // 5. Handle Dynamic Last 5 Years Average (Optional)
      // If you want to list this metric in the table rows later:
      /*
      const currentYear = new Date().getFullYear();
      const last5YearsPubs = dept.publications?.filter(
        (pub) => pub.year > currentYear - 5 && pub.year <= currentYear
      ) || [];
      const calculatedAvg = last5YearsPubs.length 
        ? (last5YearsPubs.reduce((acc, p) => acc + p.value, 0) / last5YearsPubs.length).toFixed(2)
        : 0;
      */
    });

    return rows;
  }, [entities, yearRange]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(tableData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = tableData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [tableData]);

  return (
    <div>
      <div className="border-2 p-4 rounded-md shadow-sm text-xs w-100">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h3 className="text-sm font-semibold">
            Publication Data ({tableData.length} rows)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Type
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Org Unit
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Metric
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Year
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Value
                </th>
              </tr>
            </thead>

            <tbody>
              {currentTableData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <td className="p-2">{row.type}</td>
                  <td className="p-2 font-medium max-w-[200px] truncate">
                    {row.orgUnit}
                  </td>
                  <td className="p-2 text-blue-600">{row.metric}</td>
                  <td className="p-2">{row.year}</td>
                  <td className="p-2 font-medium">
                    {typeof row.value === "number"
                      ? row.value.toLocaleString()
                      : row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-8 h-8 flex items-center justify-center border rounded-full ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white"
                    : "bg-white border-2"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TableDataPublications;
