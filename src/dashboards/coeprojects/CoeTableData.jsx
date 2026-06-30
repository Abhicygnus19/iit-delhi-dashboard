import React, { useState, useEffect } from "react";
import drdoimg from "../../assets/drdo_logo.png";

function CoeTableData({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentData = data.slice(startIndex, startIndex + itemsPerPage);
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  return (
    <div>
      <div className="border-2 p-4 rounded-md shadow-sm   w-100">
        <div className="flex items-center justify-between mb-3 gap-3">
          <h3 className="text-base font-semibold">COE-Projects Data</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {/* <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap"></th> */}
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Title
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Category
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Sponsoring Agency
                </th>
                <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
                  Coordinator & Department
                </th>
              </tr>
            </thead>

            <tbody>
              {/* Fallback to show an empty state cleanly if everything is filtered out */}
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-gray-500 font-medium"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr key={index}>
                    {/* <td className="p-2">
                        <div className="w-10 overflow-hidden">
                          <img
                            src={item.logo}
                            alt={item.sponsoringAgency}
                            className="w-full object-contain bg-white"
                          />
                        </div>
                      </td> */}
                    <td className="p-2">{item.title}</td>
                    <td className="p-2 font-medium">
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
                    </td>
                    <td className="p-2 text-blue-600 hover:text-blue-900 cursor-pointer">
                      {item.sponsoringAgencyLink ? (
                        <a
                          href={item.sponsoringAgencyLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.sponsoringAgency}
                        </a>
                      ) : (
                        <span>{item.sponsoringAgency}</span>
                      )}
                    </td>
                    <td className="p-2">{item.coordinatorAndDepartment}</td>
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
    </div>
  );
}

export default CoeTableData;
