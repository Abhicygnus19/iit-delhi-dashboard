import React, { useEffect, useState, useMemo } from "react";
import { FiSearch } from "react-icons/fi";

// Helper function to generate truncated pagination range
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
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 20;

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return Moudata || [];
    const query = searchQuery.toLowerCase();
    return (Moudata || []).filter(
      (item) =>
        item.mouSignedOrganization?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.mouSigningDate?.toLowerCase().includes(query),
    );
  }, [Moudata, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentDataMoudata = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [Moudata, searchQuery]);

  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div>
      <div className="border border-gray-200 bg-white rounded-xl shadow-sm w-full overflow-hidden">
        {/* Table Top Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
          <h3 className="text-base font-semibold text-gray-900">MOU</h3>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input
              type="text"
              placeholder="Search MOUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/80 font-medium  uppercase tracking-wider">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3 min-w-[220px]">MoU signed with</th>
                <th className="p-3 min-w-[140px]">Category</th>
                <th className="p-3 min-w-[160px]">Date of MoU Signing</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 ">
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-400 font-medium"
                  >
                    No records found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                currentDataMoudata.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="p-3 text-center text-gray-400 font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {item.mouSignedOrganization || "--"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {item.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {item.category.charAt(0).toUpperCase() +
                            item.category.slice(1)}
                        </span>
                      ) : (
                        "--"
                      )}
                    </td>
                    <td className="p-3 font-medium text-blue-600">
                      {item.mouSigningDate || "--"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 flex-wrap select-none pb-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Prev
              </button>

              {paginationRange.map((page, index) => {
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
    </div>
  );
}

export default MouTableData;
