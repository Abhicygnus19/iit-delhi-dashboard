import React, { useState, useMemo, useEffect } from "react";

import { fetchConsultancyProjectData } from "../lib/consultancyProjectData";
import ConsultancyProjectFilter from "./../dashboards/consultancy_projects/ConsultancyProjectFilter";
import ConsultancyStats from "./../dashboards/consultancy_projects/ConsultancyStats";
import ConsultancyLineChartbox from "./../dashboards/consultancy_projects/ConsultancyLineChartbox";
import ConsultancyBarChartbox from "./../dashboards/consultancy_projects/ConsultancyBarChartbox";
import ConsultancyYearlyBudget from "./../dashboards/consultancy_projects/ConsultancyYearlyBudget";
import ConsultancyYearlyProjects from "./../dashboards/consultancy_projects/ConsultancyYearlyProjects";
import ConsultancyUnitProject from "./../dashboards/consultancy_projects/ConsultancyUnitProject";

// Shared common UI Block components
import OptionSelect from "../components/ui/OptionSelect";

import { LuLoaderCircle } from "react-icons/lu";
import YearChartBlock from "./../components/YearChartBlock";

function ConsultancyProjects() {
  const [consultancyProjectData, setConsultancyProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFunding, setSelectedFunding] = useState([]); // Projects Filter
  const [selectedUnits, setSelectedUnits] = useState([]); // Budget Filter
  const [selectedConsultancyYear, setSelectedConsultancyYear] = useState([]);

  const [activeConsultancyYear, setActiveConsultancyYear] = useState(null);
  const [selectedSrpTypes, setSelectedSrpTypes] = useState([]); // New sub-filter state

  // Initialize range as null to safely update when data streams in
  const [consultancyProjectYearRange, setConsultancyProjectYearRange] =
    useState(null);

  // Helper function to safely extract the start year from formats like "2016-17"
  const getStartYear = (yearStr) => {
    if (!yearStr) return null;
    const match = yearStr.match(/^(\d{4})/);
    return match ? Number(match[1]) : null;
  };

  // Helper function to extract the 4-digit end year from formats like "2016-17" -> 2017
  const getEndYear = (yearStr) => {
    if (!yearStr) return null;
    const match = yearStr.match(/^(\d{2})(\d{2})-(\d{2})$/);
    if (match) {
      const century = match[1]; // "20"
      const endDecade = match[3]; // "17"
      return Number(century + endDecade); // 2017
    }
    return getStartYear(yearStr);
  };

  // Compute the absolute minimum and maximum years based purely on API data
  const [minYear, maxYear] = useMemo(() => {
    if (consultancyProjectData.length === 0) return [0, 0];

    const startYears = consultancyProjectData
      .map((item) => getStartYear(item.year))
      .filter((y) => y !== null && !isNaN(y));

    const endYears = consultancyProjectData
      .map((item) => getEndYear(item.year))
      .filter((y) => y !== null && !isNaN(y));

    if (startYears.length === 0 || endYears.length === 0) return [0, 0];
    return [Math.min(...startYears), Math.max(...endYears)];
  }, [consultancyProjectData]);

  //api calling
  useEffect(() => {
    const getConsultancyProjectData = async () => {
      setLoading(true);
      const apiConsultancyProjectData = await fetchConsultancyProjectData();
      const data = apiConsultancyProjectData || [];
      setConsultancyProjectData(data);

      if (data.length > 0) {
        const startYears = data
          .map((item) => getStartYear(item.year))
          .filter((y) => y !== null);
        const endYears = data
          .map((item) => getEndYear(item.year))
          .filter((y) => y !== null);

        if (startYears.length > 0 && endYears.length > 0) {
          setConsultancyProjectYearRange([
            Math.min(...startYears),
            Math.max(...endYears),
          ]);
        }
      }
      setLoading(false);
    };

    getConsultancyProjectData();
  }, []);

  // funding option fetching like govt, industry, foreign
  const fundingOptionsConsultancyProject = useMemo(() => {
    return [
      ...new Set(
        consultancyProjectData.flatMap((year) =>
          (year.types || []).map((type) => type.name),
        ),
      ),
    ].map((name) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      value: name,
    }));
  }, [consultancyProjectData]);

  const filteredData = useMemo(() => {
    // 1. Slice by active clicked year if one exists
    let baseData = activeConsultancyYear
      ? consultancyProjectData.filter(
          (item) => item.year === activeConsultancyYear,
        )
      : consultancyProjectData;

    // 2. Filter by the dynamic parsed Slider Range
    if (
      consultancyProjectYearRange &&
      consultancyProjectYearRange[0] !== 0 &&
      consultancyProjectYearRange[1] !== 0
    ) {
      baseData = baseData.filter((item) => {
        const itemYear = getStartYear(item.year);
        return (
          itemYear &&
          itemYear >= consultancyProjectYearRange[0] &&
          itemYear <= consultancyProjectYearRange[1]
        );
      });
    }

    return baseData.map((yearItem) => {
      const filteredTypes = (yearItem.types || []).filter((t) => {
        const matchesProject =
          selectedFunding.length === 0 || selectedFunding.includes(t.name);
        const matchesBudget =
          selectedUnits.length === 0 || selectedUnits.includes(t.name);

        const matchesYear =
          selectedConsultancyYear.length === 0 ||
          selectedConsultancyYear.includes(yearItem.year);

        return matchesProject && matchesBudget && matchesYear;
      });

      return {
        ...yearItem,
        types: filteredTypes,
      };
    });
  }, [
    selectedFunding,
    selectedUnits,
    selectedConsultancyYear,
    activeConsultancyYear,
    consultancyProjectYearRange,
    consultancyProjectData,
  ]);

  // Filter SRP types exclusively based on the selected year's data array
  // const inlineCrpTypeOptions = useMemo(() => {
  //   if (!activeConsultancyYear) return [];
  //   const targetedYearObj = consultancyProjectData.find(
  //     (item) => item.year === activeConsultancyYear,
  //   );
  //   if (!targetedYearObj || !targetedYearObj.sanctionedProjectsSRP) return [];

  //   const uniqueSrpTypes = new Set();
  //   targetedYearObj.sanctionedProjectsSRP.forEach((project) => {
  //     const type = project.SRPType ? project.SRPType.trim() : "Others";
  //     uniqueSrpTypes.add(type);
  //   });

  //   return Array.from(uniqueSrpTypes).map((type) => ({
  //     label: type.charAt(0).toUpperCase() + type.slice(1),
  //     value: type,
  //   }));
  // }, [activeConsultancyYear, consultancyProjectData]);

  // Filter SRP types exclusively based on the selected year's data array
  const inlineCrpTypeOptions = useMemo(() => {
    if (!activeConsultancyYear) return [];
    const targetedYearObj = consultancyProjectData.find(
      (item) => item.year === activeConsultancyYear,
    );
    // Updated from sanctionedProjectsSRP to consultancyUnitWiseProjects
    if (!targetedYearObj || !targetedYearObj.consultancyUnitWiseProjects)
      return [];

    const uniqueSrpTypes = new Set();
    targetedYearObj.consultancyUnitWiseProjects.forEach((project) => {
      const type = project.SRPType ? project.SRPType.trim() : "Others";
      uniqueSrpTypes.add(type);
    });

    return Array.from(uniqueSrpTypes).map((type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type,
    }));
  }, [activeConsultancyYear, consultancyProjectData]);

  // Watch for a clicked year that has sanctioned projects array entries
  // const activeYearDataMatch = useMemo(() => {
  //   if (!activeConsultancyYear) return null;
  //   return consultancyProjectData.find(
  //     (item) =>
  //       item.year === activeConsultancyYear &&
  //       item.sanctionedProjectsSRP &&
  //       item.sanctionedProjectsSRP.length > 0,
  //   );
  // }, [activeConsultancyYear, consultancyProjectData]);

  // Watch for a clicked year that has project data array entries
  const activeYearDataMatch = useMemo(() => {
    if (!activeConsultancyYear) return null;
    return consultancyProjectData.find(
      (item) =>
        item.year === activeConsultancyYear &&
        item.consultancyUnitWiseProjects && // Updated key name
        item.consultancyUnitWiseProjects.length > 0, // Updated key name
    );
  }, [activeConsultancyYear, consultancyProjectData]);

  // Reset the type filter whenever the active year is switched or reset
  useEffect(() => {
    setSelectedSrpTypes([]);
  }, [activeConsultancyYear]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <LuLoaderCircle className="animate-spin text-blue-900" size={60} />
        <span className="text-slate-700 font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <>
      {/* 1. Global Filter Dashboard bar */}
      <ConsultancyProjectFilter
        selectedFunding={selectedFunding}
        setSelectedFunding={setSelectedFunding}
        selectedUnits={selectedUnits}
        setSelectedUnits={setSelectedUnits}
        fundingOptionsConsultancyProject={fundingOptionsConsultancyProject}
        consultancyProjectYearRange={consultancyProjectYearRange}
        minYear={minYear}
        maxYear={maxYear}
        onConsultancyProjectYearRangeChange={setConsultancyProjectYearRange}
      />

      {/* 2. Interactive Stats Metric Cards */}
      <ConsultancyStats
        activeData={filteredData}
        selectedFundingTypes={selectedFunding}
        selectedBudgetTypes={selectedUnits}
      />

      <div className="px-2 min-h-screen max-w-[1500px] mx-auto">
        {/* 3. Primary Chart Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
          <ConsultancyLineChartbox
            activeData={filteredData}
            selectedFundingTypes={selectedFunding}
            activeConsultancyYear={activeConsultancyYear}
            onConsultancyYearClick={setActiveConsultancyYear}
          />
          <ConsultancyBarChartbox
            activeData={filteredData}
            selectedBudgetTypes={selectedUnits}
            setSelectedBudgetTypes={setSelectedUnits}
            activeConsultancyYear={activeConsultancyYear}
            onConsultancyYearClick={setActiveConsultancyYear}
          />
        </div>

        {/* CONDITIONALLY RENDERED SRP COMPONENT BETWEEN CHARTS SECTIONS */}
        {activeYearDataMatch && (
          <div className="border-2 rounded-md mb-12 bg-white shadow-sm">
            <div className="px-4 py-3 bg-gray-100 border-b-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-semibold text-sm text-gray-800">
                Consutancy Projects in IRD for {activeConsultancyYear}
              </h2>
              <div className="flex gap-2 flex-wrap text-[14px]">
                <OptionSelect
                  label="Select SRP type"
                  options={inlineCrpTypeOptions}
                  selected={selectedSrpTypes}
                  onChange={setSelectedSrpTypes}
                  multiple={true}
                />
              </div>
            </div>
            <div className="p-4">
              <div className="border-2 p-4 rounded-md text-xs w-100 bg-gray-50/50">
                {/* FIXED: Changed from chartData back to yearObj to match what your component reads */}
                <YearChartBlock
                  yearObj={activeYearDataMatch}
                  selectedSrpTypes={selectedSrpTypes}
                />
              </div>
            </div>
          </div>
        )}

        {/* Heatmaps & Secondary Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
          <ConsultancyYearlyBudget activeData={filteredData} />
          <ConsultancyYearlyProjects activeData={filteredData} />
        </div>

        {/* <div className="mb-12">
          <ConsultancyUnitProject />
        </div> */}
      </div>
    </>
  );
}

export default ConsultancyProjects;

// import React, { useState, useMemo, useEffect } from "react";

// import { fetchConsultancyProjectData } from "../lib/consultancyProjectData";
// import ConsultancyProjectFilter from "./../dashboards/consultancy_projects/ConsultancyProjectFilter";
// import ConsultancyStats from "./../dashboards/consultancy_projects/ConsultancyStats";
// import ConsultancyLineChartbox from "./../dashboards/consultancy_projects/ConsultancyLineChartbox";
// import ConsultancyBarChartbox from "./../dashboards/consultancy_projects/ConsultancyBarChartbox";
// import ConsultancyYearlyBudget from "./../dashboards/consultancy_projects/ConsultancyYearlyBudget";
// import ConsultancyYearlyProjects from "./../dashboards/consultancy_projects/ConsultancyYearlyProjects";
// import ConsultancyUnitProject from "./../dashboards/consultancy_projects/ConsultancyUnitProject";

// import { LuLoaderCircle } from "react-icons/lu";

// function ConsultancyProjects() {
//   const [consultancyProjectData, setConsultancyProjectData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedFunding, setSelectedFunding] = useState([]); // Projects Filter
//   const [selectedUnits, setSelectedUnits] = useState([]); // Budget Filter
//   const [selectedConsultancyYear, setSelectedConsultancyYear] = useState([]);

//   const [activeConsultancyYear, setActiveConsultancyYear] = useState(null);

//   // Initialize range as null to safely update when data streams in
//   const [consultancyProjectYearRange, setConsultancyProjectYearRange] =
//     useState(null);

//   // Helper function to safely extract the start year from formats like "2016-17"
//   const getStartYear = (yearStr) => {
//     if (!yearStr) return null;
//     const match = yearStr.match(/^(\d{4})/);
//     return match ? Number(match[1]) : null;
//   };

//   // Helper function to extract the 4-digit end year from formats like "2016-17" -> 2017
//   const getEndYear = (yearStr) => {
//     if (!yearStr) return null;
//     const match = yearStr.match(/^(\d{2})(\d{2})-(\d{2})$/);
//     if (match) {
//       const century = match[1]; // "20"
//       const endDecade = match[3]; // "17"
//       return Number(century + endDecade); // 2017
//     }
//     return getStartYear(yearStr);
//   };

//   // Compute the absolute minimum and maximum years based purely on API data
//   const [minYear, maxYear] = useMemo(() => {
//     if (consultancyProjectData.length === 0) return [0, 0];

//     const startYears = consultancyProjectData
//       .map((item) => getStartYear(item.year))
//       .filter((y) => y !== null && !isNaN(y));

//     const endYears = consultancyProjectData
//       .map((item) => getEndYear(item.year))
//       .filter((y) => y !== null && !isNaN(y));

//     if (startYears.length === 0 || endYears.length === 0) return [0, 0];
//     return [Math.min(...startYears), Math.max(...endYears)];
//   }, [consultancyProjectData]);

//   //api calling
//   useEffect(() => {
//     const getConsultancyProjectData = async () => {
//       setLoading(true);
//       const apiConsultancyProjectData = await fetchConsultancyProjectData();
//       const data = apiConsultancyProjectData || [];
//       setConsultancyProjectData(data);

//       if (data.length > 0) {
//         const startYears = data
//           .map((item) => getStartYear(item.year))
//           .filter((y) => y !== null);
//         const endYears = data
//           .map((item) => getEndYear(item.year))
//           .filter((y) => y !== null);

//         if (startYears.length > 0 && endYears.length > 0) {
//           setConsultancyProjectYearRange([
//             Math.min(...startYears),
//             Math.max(...endYears),
//           ]);
//         }
//       }
//       setLoading(false);
//     };

//     getConsultancyProjectData();
//   }, []);

//   // funding option fetching like govt, industry, foreign
//   const fundingOptionsConsultancyProject = useMemo(() => {
//     return [
//       ...new Set(
//         consultancyProjectData.flatMap((year) =>
//           (year.types || []).map((type) => type.name),
//         ),
//       ),
//     ].map((name) => ({
//       label: name.charAt(0).toUpperCase() + name.slice(1),
//       value: name,
//     }));
//   }, [consultancyProjectData]);

//   const filteredData = useMemo(() => {
//     // 1. Slice by active clicked year if one exists
//     let baseData = activeConsultancyYear
//       ? consultancyProjectData.filter(
//           (item) => item.year === activeConsultancyYear,
//         )
//       : consultancyProjectData;

//     // 2. FIXED/COMPLETED: Filter by the dynamic parsed Slider Range
//     if (
//       consultancyProjectYearRange &&
//       consultancyProjectYearRange[0] !== 0 &&
//       consultancyProjectYearRange[1] !== 0
//     ) {
//       baseData = baseData.filter((item) => {
//         const itemYear = getStartYear(item.year);
//         return (
//           itemYear &&
//           itemYear >= consultancyProjectYearRange[0] &&
//           itemYear <= consultancyProjectYearRange[1]
//         );
//       });
//     }

//     return baseData.map((yearItem) => {
//       const filteredTypes = (yearItem.types || []).filter((t) => {
//         const matchesProject =
//           selectedFunding.length === 0 || selectedFunding.includes(t.name);
//         const matchesBudget =
//           selectedUnits.length === 0 || selectedUnits.includes(t.name);

//         const matchesYear =
//           selectedConsultancyYear.length === 0 ||
//           selectedConsultancyYear.includes(yearItem.year);

//         return matchesProject && matchesBudget && matchesYear;
//       });

//       return {
//         ...yearItem,
//         types: filteredTypes,
//       };
//     });
//   }, [
//     selectedFunding,
//     selectedUnits,
//     selectedConsultancyYear,
//     activeConsultancyYear,
//     consultancyProjectYearRange, // Added missing dependency
//     consultancyProjectData,
//   ]);

//   if (loading) {
//     return (
//       <div className="flex h-screen flex-col items-center justify-center gap-3">
//         <LuLoaderCircle className="animate-spin text-blue-900" size={60} />
//         <span className="text-slate-700 font-medium">Loading...</span>
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* 1. Global Filter Dashboard bar */}
//       <ConsultancyProjectFilter
//         selectedFunding={selectedFunding}
//         setSelectedFunding={setSelectedFunding}
//         selectedUnits={selectedUnits}
//         setSelectedUnits={setSelectedUnits}
//         fundingOptionsConsultancyProject={fundingOptionsConsultancyProject}
//         consultancyProjectYearRange={consultancyProjectYearRange}
//         minYear={minYear}
//         maxYear={maxYear}
//         // FIXED: Was referencing onConsultancyProjectYearRangeChange={setSponsorYearRange}
//         onConsultancyProjectYearRangeChange={setConsultancyProjectYearRange}
//       />

//       {/* 2. Interactive Stats Metric Cards */}
//       <ConsultancyStats
//         activeData={filteredData}
//         selectedFundingTypes={selectedFunding}
//         selectedBudgetTypes={selectedUnits}
//       />

//       <div className="px-2 min-h-screen max-w-[1500px] mx-auto">
//         {/* 3. Primary Chart Grids */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
//           <ConsultancyLineChartbox
//             activeData={filteredData}
//             selectedFundingTypes={selectedFunding}
//             activeConsultancyYear={activeConsultancyYear}
//             onConsultancyYearClick={setActiveConsultancyYear}
//           />
//           <ConsultancyBarChartbox
//             activeData={filteredData}
//             selectedBudgetTypes={selectedUnits}
//             setSelectedBudgetTypes={setSelectedUnits}
//             activeConsultancyYear={activeConsultancyYear}
//             onConsultancyYearClick={setActiveConsultancyYear}
//           />
//         </div>

//         {/* Heatmaps & Secondary Panels */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
//           <ConsultancyYearlyBudget activeData={filteredData} />
//           <ConsultancyYearlyProjects activeData={filteredData} />
//         </div>

//         <div className="mb-12">
//           <ConsultancyUnitProject />
//         </div>
//       </div>
//     </>
//   );
// }

// export default ConsultancyProjects;
