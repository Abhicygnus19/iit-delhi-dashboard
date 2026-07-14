import React, { useEffect, useState } from "react";

// Helper function to generate truncated pagination range (e.g., [1, 2, '...', 14, 15])
const getPaginationRange = (currentPage, totalPages) => {
  const delta = 1;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l > 2) {
        rangeWithDots.push("...");
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
};

function MouTableData({ Moudata = [] }) {
  // Safe default parameter fallback
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(Moudata.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentDataMoudata = Moudata.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [Moudata]);

  // Compute the smart truncated range array
  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <>
      <div className="border-2 p-4 rounded-md shadow-sm w-100">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h3 className="text-base font-semibold">MOU</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  MoU signed with
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Category
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Date of MoU Signing
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Fallback to show an empty state cleanly if everything is filtered out */}
              {Moudata.length === 0 ? (
                <tr>
                  <td
                    colSpan={3} // Adjusted colSpan to match 3 standard columns
                    className="p-8 text-center text-gray-500 font-medium"
                  >
                    No records found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                currentDataMoudata.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <td className="p-2">
                      {item.mouSignedOrganization || "--"}
                    </td>
                    <td className="p-2 font-medium">
                      {item.category
                        ? item.category.charAt(0).toUpperCase() +
                          item.category.slice(1)
                        : "--"}
                    </td>
                    <td className="p-2 text-blue-600 hover:text-blue-900">
                      {item.mouSigningDate || "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Clean Smart Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 flex-wrap select-none">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Prev
              </button>

              {paginationRange.map((page, index) => {
                // Render the static dots indicator
                if (page === "...") {
                  return (
                    <span
                      key={`dots-${index}`}
                      className="px-2 font-medium text-gray-400 text-sm"
                    >
                      ...
                    </span>
                  );
                }

                // Render active/inactive interactive buttons
                return (
                  <button
                    key={`page-${page}`}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center font-medium text-sm border rounded-full transition-all ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MouTableData;
