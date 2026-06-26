import React, { useState, useEffect } from "react";
import { fetchSanctionedResearchProject } from "./../../lib/sponsorData";
import OptionSelect from "./../../components/ui/OptionSelect";

function SanctionedProject() {
  const [sanctionedResearchProject, setSanctionedResearchProject] = useState(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSanctionedYear, setSelectedSanctionedYear] = useState([]);
  const [selectedSrpTypes, setSelectedSrpTypes] = useState([]);
  const itemsPerPage = 20;

  // Fetch API data
  useEffect(() => {
    const getSanctionedResearchProjectData = async () => {
      const apiSanctionedResearchProject =
        await fetchSanctionedResearchProject();
      setSanctionedResearchProject(apiSanctionedResearchProject || []);
    };
    getSanctionedResearchProjectData();
  }, []);

  // Reset pagination to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSanctionedYear, selectedSrpTypes]);

  // Handle empty or loading states safely
  if (!sanctionedResearchProject || sanctionedResearchProject.length === 0) {
    return (
      <div className="p-4 ">No Sanctioned Research Project available.</div>
    );
  }

  // Setup Year Options
  const yearOptions = sanctionedResearchProject.map((item) => ({
    label: item.year,
    value: item.year,
  }));

  // Dynamic Unique SRP Types Extractor
  const uniqueSrpTypes = new Set();

  sanctionedResearchProject.forEach((yearObj) => {
    if (yearObj.sanctionedProjectsSRP) {
      yearObj.sanctionedProjectsSRP.forEach((project) => {
        // console.log("yearObj.sanctionedProjectsSRP", yearObj.sanctionedProjectsSRP);
        const type = project.SRPType ? project.SRPType.trim() : "Others";
        uniqueSrpTypes.add(type);
      });
    }
  });

  const srpTypeOptions = Array.from(uniqueSrpTypes).map((type) => ({
    label: type.charAt(0).toUpperCase() + type.slice(1),
    value: type,
  }));

  // Filter data blocks by selected Year
  const filteredSanctionedData =
    selectedSanctionedYear.length === 0
      ? sanctionedResearchProject
      : sanctionedResearchProject.filter((item) =>
          selectedSanctionedYear.includes(item.year),
        );

  return (
    <div className="border-2 rounded-md">
      <div className="px-4 py-3 bg-gray-100 border-b-2">
        <h2 className="font-semibold mb-4">
          Sanctioned Research Projects in IRD of Academic Unit(SRP Dept IRD &
          FITT){" "}
        </h2>
        <div className="flex gap-2 flex-wrap text-[14px] mb-2 ">
          <OptionSelect
            label="Select Year"
            options={yearOptions}
            selected={selectedSanctionedYear}
            onChange={setSelectedSanctionedYear}
            multiple={true}
          />
          <OptionSelect
            label="Select SRP type"
            options={srpTypeOptions}
            selected={selectedSrpTypes}
            onChange={setSelectedSrpTypes}
            multiple={true}
          />
        </div>{" "}
      </div>

      <div className="m-4 border-2 p-4 rounded-md shadow-sm text-xs w-100">
        {filteredSanctionedData.map((yearObj, yearIndex) => {
          const rawList = yearObj.sanctionedProjectsSRP || [];

          const sanctionedProjectList = rawList.filter((item) => {
            if (selectedSrpTypes.length === 0) return true;
            const projectType = item.SRPType ? item.SRPType.trim() : "Others";
            return selectedSrpTypes.includes(projectType);
          });

          // Skip rendering empty years if filter criteria don't match
          if (sanctionedProjectList.length === 0) return null;

          const totalPages = Math.ceil(
            sanctionedProjectList.length / itemsPerPage,
          );
          const startIndex = (currentPage - 1) * itemsPerPage;
          const currentItems = sanctionedProjectList.slice(
            startIndex,
            startIndex + itemsPerPage,
          );

          return (
            <div
              className="overflow-x-auto mb-8 border-b pb-4 last:border-0 last:pb-0"
              key={yearIndex}
            >
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
                  {currentItems.map((sanctionedProject, itemIndex) => (
                    <tr
                      key={itemIndex}
                      className="border-b border-border/50 hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-2 font-medium">
                        {sanctionedProject.academicUnit}
                      </td>
                      <td className="p-2 text-center">
                        {sanctionedProject.NoOfProjects}
                      </td>
                      <td className="p-2 text-center">
                        {typeof sanctionedProject.SanctionedFunds === "number"
                          ? sanctionedProject.SanctionedFunds.toFixed(2)
                          : sanctionedProject.SanctionedFunds}
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

export default SanctionedProject;
