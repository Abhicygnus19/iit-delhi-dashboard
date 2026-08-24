import React, { useState, useEffect, useMemo } from "react";
import { FiSearch, FiExternalLink } from "react-icons/fi";

// Helper function to generate truncated pagination ranges
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

function CoeTableData({ data = [] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 20;

  // Search filter
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data || [];
    const query = searchQuery.toLowerCase();
    return (data || []).filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.sponsoringAgency?.toLowerCase().includes(query) ||
        item.coordinatorAndDepartment?.toLowerCase().includes(query),
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil((filteredData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = (filteredData || []).slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchQuery]);

  const paginationRange = getPaginationRange(currentPage, totalPages);

  return (
    <div>
      <div className="border border-gray-200 bg-white rounded-xl shadow-sm w-full overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-gray-200 bg-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Centres of Excellence
            </h3>

            <p className="mt-0.5 text-xs text-gray-700">
              Explore research centres & details
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search centres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </div>
        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/80 font-medium ">
                <th className="p-3 w-20 text-center">Sl No.</th>
                <th className="p-3 min-w-[200px]">Centre Name</th>
                <th className="p-3">Funding Category</th>
                <th className="p-3 min-w-[180px]"> Funding Agency</th>
                <th className="p-3 min-w-[200px]">Coordinator & Department</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 text-gray-700 ">
              {!filteredData || filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-400 font-medium"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                currentData.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 text-center  font-medium">
                      {startIndex + index + 1}
                    </td>
                    <td className="p-3 font-semibold text-gray-900">
                      {item.title}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {item.category ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {item.category.charAt(0).toUpperCase() +
                            item.category.slice(1)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 font-medium">
                      {item.sponsoringAgencyLink ? (
                        <a
                          href={item.sponsoringAgencyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          {item.sponsoringAgency}
                          <FiExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span>{item.sponsoringAgency || "—"}</span>
                      )}
                    </td>
                    <td className="p-3 ">
                      {item.coordinatorAndDepartment || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* EXACT UNCHANGED Pagination Controls */}
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

        {/* Card Content */}
        {/* <div className="p-4 sm:p-5">
          {!filteredData || filteredData.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-100">
                <FiSearch className="size-5 text-gray-400" />
              </div>

              <p className="font-medium text-gray-500">No records found</p>

              <p className="mt-1 text-xs text-gray-400">
                Try searching with a different keyword
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentData.map((item, index) => (
                <div
                  key={index}
                  className="group relative flex flex-col rounded-xl border border-gray-200 bg-blue-50 p-4 shadow-sm transition-all duration-300   hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-500 text-white text-sm font-semibold  ">
                      {startIndex + index + 1}
                    </div>

                    {item.category && (
                      <span className="inline-flex items-center rounded-full border border-gray-300 bg-red-50 px-3 py-1 text-sm text-black">
                        {item.category.charAt(0).toUpperCase() +
                          item.category.slice(1)}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <h3 className="text-base font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-700">
                      {item.title}
                    </h3>
                  </div>

                  <div className="my-4">
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Funding Agency
                    </p>

                    {item.sponsoringAgencyLink ? (
                      <a
                        href={item.sponsoringAgencyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-start gap-1.5 text-sm font-medium leading-relaxed text-blue-600 transition-colors hover:text-blue-900 hover:underline"
                      >
                        <span>{item.sponsoringAgency}</span>
                        <FiExternalLink className="mt-1 size-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-sm font-medium leading-relaxed text-gray-700">
                        {item.sponsoringAgency || "—"}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto rounded-lg border border-gray-100 bg-white p-3">
                    <p className="mb-1  text-sm font-semibold  text-gray-700">
                      Coordinator & Department
                    </p>

                    <p className="text-sm leading-relaxed text-gray-700">
                      {item.coordinatorAndDepartment || "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div> */}

        {/* EXACT UNCHANGED Showing results count */}
        <div className="text-center text-gray-800 text-xs mt-2 pb-4">
          Showing {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length} records
        </div>
      </div>
    </div>
  );
}

export default CoeTableData;

// import React, { useState, useEffect } from "react";

// function CoeTableData({ data }) {
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;

//   const totalPages = Math.ceil(data.length / itemsPerPage);

//   const startIndex = (currentPage - 1) * itemsPerPage;

//   const currentData = data.slice(startIndex, startIndex + itemsPerPage);
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [data]);

//   return (
//     <div>
//       <div className="border-2 p-4 rounded-md shadow-sm   w-100">
//         <div className="flex items-center justify-between mb-3 gap-3">
//           <h3 className="text-base font-semibold">COE-Projects Data</h3>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b">
//                 {/* <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap"></th> */}
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Title
//                 </th>
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Category
//                 </th>
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Sponsoring Agency
//                 </th>
//                 <th className="text-left p-2 text-muted-foreground font-medium whitespace-nowrap">
//                   Coordinator & Department
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {/* Fallback to show an empty state cleanly if everything is filtered out */}
//               {data.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={4}
//                     className="p-8 text-center text-gray-500 font-medium"
//                   >
//                     No records found
//                   </td>
//                 </tr>
//               ) : (
//                 currentData.map((item, index) => (
//                   <tr key={index}>
//                     {/* <td className="p-2">
//                         <div className="w-10 overflow-hidden">
//                           <img
//                             src={item.logo}
//                             alt={item.sponsoringAgency}
//                             className="w-full object-contain bg-white"
//                           />
//                         </div>
//                       </td> */}
//                     <td className="p-2">{item.title}</td>
//                     <td className="p-2 font-medium">
//                       {item.category.charAt(0).toUpperCase() +
//                         item.category.slice(1)}
//                     </td>
//                     <td className="p-2 text-blue-600 hover:text-blue-900 cursor-pointer">
//                       {item.sponsoringAgencyLink ? (
//                         <a
//                           href={item.sponsoringAgencyLink}
//                           target="_blank"
//                           rel="noreferrer"
//                         >
//                           {item.sponsoringAgency}
//                         </a>
//                       ) : (
//                         <span>{item.sponsoringAgency}</span>
//                       )}
//                     </td>
//                     <td className="p-2">{item.coordinatorAndDepartment}</td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>

//           {totalPages > 1 && (
//             <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
//               <button
//                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                 disabled={currentPage === 1}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Prev
//               </button>

//               {[...Array(totalPages)].map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentPage(index + 1)}
//                   className={`w-8 h-8 flex items-center justify-center border rounded-full  ${
//                     currentPage === index + 1
//                       ? "bg-blue-600 text-white"
//                       : "bg-white border-2"
//                   }`}
//                 >
//                   {index + 1}
//                 </button>
//               ))}

//               <button
//                 onClick={() =>
//                   setCurrentPage((prev) => Math.min(prev + 1, totalPages))
//                 }
//                 disabled={currentPage === totalPages}
//                 className="px-3 py-1 border rounded disabled:opacity-50"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CoeTableData;
