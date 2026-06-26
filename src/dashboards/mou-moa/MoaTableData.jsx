import React, { useEffect, useState } from "react";

function MoaTableData({ MoaData }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(MoaData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentDataMoaData = MoaData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );
  useEffect(() => {
    setCurrentPage(1);
  }, [MoaData]);

  return (
    <>
      <div className="w-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  University/Organization
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Country
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Region
                </th>{" "}
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Continent
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Fallback to show an empty state cleanly if everything is filtered out */}
              {MoaData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500 font-medium"
                  >
                    No records found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                currentDataMoaData?.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-border/50 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <td className="p-2">{item.universityAndOrganization}</td>
                    <td className="p-2 font-medium">
                      {item.country.charAt(0).toUpperCase() +
                        item.country.slice(1)}
                    </td>
                    <td className="p-2 text-blue-600 hover:text-blue-900">
                      {item.region}
                    </td>{" "}
                    <td className="p-2 text-blue-600 hover:text-blue-900">
                      {item.continent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
                  className={`w-8 h-8 flex items-center justify-center border rounded-full  ${
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
    </>
  );
}

export default MoaTableData;
