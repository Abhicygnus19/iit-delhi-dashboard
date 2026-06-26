import React, { useEffect, useMemo, useState } from "react";
import CoeTableData from "../dashboards/Coeprojects/CoeTableData";
import CoeFilters from "../dashboards/Coeprojects/CoeFilters";
import { coeProjectData, fetchCoeProjectData } from "../lib/coeProjectData";

function CoeProjects() {
  // const [coeProjectData, setCoeProjectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // useEffect(() => {
  //   const getCoeProjectData = async () => {
  //     setLoading(true);
  //     const apiCoeProjectData = await fetchCoeProjectData();
  //     setCoeProjectData(apiCoeProjectData || []);
  //     setLoading(false);
  //   };
  //   getCoeProjectData();
  // }, []);

  //  Dynamically extract unique categories for the filter dropdown options
  const filterOptions = useMemo(() => {
    const uniqueCategories = [
      ...new Set(coeProjectData?.map((item) => item.category)),
    ];
    return uniqueCategories.map((cat) => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1), // Capitalize label text cleanly
      value: cat,
    }));
  }, []);

  //  Filter the data based on selection. If nothing is selected, show all data.
  const filteredData = useMemo(() => {
    if (selectedCategories.length === 0) return coeProjectData;
    return coeProjectData.filter((item) =>
      selectedCategories.includes(item.category),
    );
  }, [selectedCategories]);

  return (
    <div>
      {/* Pass filter controls and available options down */}
      <CoeFilters
        options={filterOptions}
        selected={selectedCategories}
        onChange={setSelectedCategories}
      />
      <div className="px-2 min-h-screen max-w-[1500px] mx-auto">
        {/* Pass the dynamic filtered array instead of reading hardcoded data inside */}
        <CoeTableData data={filteredData} />
      </div>
    </div>
  );
}

export default CoeProjects;
