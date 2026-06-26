import React, { useEffect, useState } from "react";
import OptionSelect from "../../components/ui/OptionSelect";

import {
  // consultancyUnitProeject,
  fetchConsultancyUnitProject,
} from "../../lib/consultancyProjectData";

function ConsultancyUnitProject() {
  const [consultancyUnitProeject, setConsultancyUnitProeject] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [selectedConsultancyUnitYear, setSelectedConsultancyUnitYear] =
    useState([]);
  const [selectedConsultancyTypes, setSelectedConsultancyTypes] = useState([]);

  // fetch consultancy sanctioned proeject

  useEffect(() => {
    const getConsultancyUnitProejectData = async () => {
      const apiConsultancyUnitProeject = await fetchConsultancyUnitProject();
      setConsultancyUnitProeject(apiConsultancyUnitProeject || []);
    };
    getConsultancyUnitProejectData();
  }, []);

  // Reset page to 1 whenever the selected year changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedConsultancyUnitYear, selectedConsultancyTypes]);

  // Handle empty or loading states safely
  if (!consultancyUnitProeject || consultancyUnitProeject.length === 0) {
    return <div className="p-4">No Consultancy Unit Projects available.</div>;
  }

  const yearOptionsConsultancy = consultancyUnitProeject.map((item) => ({
    label: item.year,
    value: item.year,
  }));

  const uniqueConsultancyTypes = new Set();

  consultancyUnitProeject.forEach((yearObj) => {
    if (yearObj.consultancyUnitWiseProjects) {
      yearObj.consultancyUnitWiseProjects.forEach((item) => {
        // console.log(
        //   "yearwise consultancy units projects",
        //   yearObj.consultancyUnitWiseProjects,
        // );
        const type = item.consultancyType
          ? item.consultancyType.trim()
          : "Others";
        uniqueConsultancyTypes.add(type);
      });
    }
  });

  const consultancyTypeOptions = Array.from(uniqueConsultancyTypes).map(
    (type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type,
    }),
  );

  // console.log("consultancyTypeOptions", consultancyTypeOptions);

  // const filteredConsultancyUnitProject =
  //   selectedConsultancyUnitYear.length === 0
  //     ? consultancyUnitProeject
  //     : consultancyUnitProeject.filter((item) =>
  //         selectedConsultancyUnitYear.includes(item.year),
  //       );

  const filteredConsultancyUnitProject = consultancyUnitProeject
    .filter(
      (item) =>
        selectedConsultancyUnitYear.length === 0 ||
        selectedConsultancyUnitYear.includes(item.year),
    )
    .map((yearObj) => ({
      ...yearObj,
      consultancyUnitWiseProjects:
        selectedConsultancyTypes.length === 0
          ? yearObj.consultancyUnitWiseProjects
          : yearObj.consultancyUnitWiseProjects.filter((item) =>
              selectedConsultancyTypes.includes(item.consultancyType),
            ),
    }));

  return (
    <div className="border-2 rounded-md ">
      <div className="px-4 py-3 bg-gray-100 border-b-2">
        <h2 className="font-semibold mb-4">
          Consutancy Projects of Academic Unit (Consultancy Dept)
        </h2>
        <div className="flex gap-2 flex-wrap text-[14px] mb-2">
          <OptionSelect
            label="Select Year"
            options={yearOptionsConsultancy}
            selected={selectedConsultancyUnitYear}
            onChange={setSelectedConsultancyUnitYear}
            multiple={true}
          />{" "}
          <OptionSelect
            label="Consultancy Unit Type"
            options={consultancyTypeOptions}
            selected={selectedConsultancyTypes}
            onChange={setSelectedConsultancyTypes}
            multiple={true}
          />
        </div>
      </div>

      <div className="m-4 border-2 p-4 rounded-md shadow-sm text-xs w-100">
        {filteredConsultancyUnitProject.map((yearObj, yearIndex) => {
          // console.log("All years of sanctioned project", targetYearKey);

          const targetYearKey = Object.keys(yearObj).find((key) =>
            Array.isArray(yearObj[key]),
          );

          if (!targetYearKey) return null;

          const sanctionedProjectListConsultancy =
            yearObj.consultancyUnitWiseProjects || [];

          const totalPages = Math.ceil(
            sanctionedProjectListConsultancy.length / itemsPerPage,
          );

          const startIndex = (currentPage - 1) * itemsPerPage;

          const currentItemsConsultancy =
            sanctionedProjectListConsultancy.slice(
              startIndex,
              startIndex + itemsPerPage,
            );

          return (
            <div className="overflow-x-auto mb-4" key={yearIndex}>
              <h6 className="text-base font-bold mb-4">
                Year:
                <span className="font-semibold ml-1">{yearObj?.year}</span>
              </h6>
              <table className="w-full text-xs border-collapse mb-4">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left p-2">Academic Unit</th>
                    <th className="text-center p-2">No. of Projects</th>
                    <th className="text-center p-2">
                      Sanctioned Funds (Rs. in Crore)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentItemsConsultancy.map((item, itemIndex) => (
                    <tr
                      key={itemIndex}
                      className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-2 font-medium">{item.academicUnit}</td>
                      <td className="p-2 text-center">{item.NoOfProjects}</td>
                      <td className="p-2 text-center">
                        {typeof item.SanctionedFunds === "number"
                          ? item.SanctionedFunds.toFixed(2)
                          : item.SanctionedFunds}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="flex justify-center flex-wrap gap-2 mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
          );
        })}
      </div>
    </div>
  );
}

export default ConsultancyUnitProject;
