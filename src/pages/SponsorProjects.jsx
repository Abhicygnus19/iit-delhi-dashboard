import React, { useState, useMemo, useEffect } from "react";
import SponsorProjectFilter from "../dashboards/sponsor_projects/SponsorProjectFilter";
import SponsorStats from "../dashboards/sponsor_projects/SponsorStats";
import SponsorLineChartbox from "../dashboards/sponsor_projects/SponsorLineChartbox";
import SponsorBarChartbox from "../dashboards/sponsor_projects/SponsorBarChartbox";
import YearlyProjects from "../dashboards/sponsor_projects/YearlyProjects";
import SponsorYearlyBudget from "../dashboards/sponsor_projects/SponsorYearlyBudget";
import OptionSelect from "../components/ui/OptionSelect";
import { LuLoaderCircle } from "react-icons/lu";
import YearChartBlock from "./../components/YearChartBlock";
import SanctionedProject from "../dashboards/sponsor_projects/SanctionedProject";
import { fetchSponsorProjectData } from "../lib/sponsorData";

// const staticSponsorData = [
//   {
//     year: "2016-17",
//     types: [
//       { name: "government", projects: 133, budget: 130.9 },
//       { name: "industry", projects: 12, budget: 72.27 },
//       { name: "foreign", projects: 19, budget: 38.81 },
//     ],
//   },
//   {
//     year: "2017-18",
//     types: [
//       { name: "government", projects: 251, budget: 395.24 },
//       { name: "industry", projects: 15, budget: 8.01 },
//       { name: "foreign", projects: 20, budget: 15.34 },
//     ],
//   },
//   {
//     year: "2018-19",
//     types: [
//       { name: "government", projects: 294, budget: 327.92 },
//       { name: "industry", projects: 24, budget: 24.92 },
//       { name: "foreign", projects: 12, budget: 7.81 },
//     ],
//   },
//   {
//     year: "2019-20",
//     types: [
//       { name: "government", projects: 255, budget: 312.37 },
//       { name: "industry", projects: 24, budget: 8.69 },
//       { name: "foreign", projects: 16, budget: 22.92 },
//     ],
//   },
//   {
//     year: "2020-21",
//     types: [
//       { name: "government", projects: 194, budget: 131.29 },
//       { name: "industry", projects: 36, budget: 29.81 },
//       { name: "foreign", projects: 24, budget: 25.67 },
//     ],
//   },
//   {
//     year: "2021-22",
//     types: [
//       { name: "government", projects: 223, budget: 303.21 },
//       { name: "industry", projects: 32, budget: 40.36 },
//       { name: "foreign", projects: 25, budget: 12.25 },
//     ],
//   },
//   {
//     year: "2022-23",
//     types: [
//       { name: "government", projects: 220, budget: 204.4 },
//       { name: "industry", projects: 59, budget: 21.65 },
//       { name: "foreign", projects: 30, budget: 36.4 },
//     ],
//   },
//   {
//     year: "2023-24",
//     types: [
//       { name: "government", projects: 250, budget: 330.7 },
//       { name: "industry", projects: 91, budget: 88.07 },
//       { name: "foreign", projects: 44, budget: 31.59 },
//     ],
//   },
//   {
//     year: "2024-25",
//     types: [
//       { name: "government", projects: 264, budget: 331.36 },
//       { name: "industry", projects: 103, budget: 52.32 },
//       { name: "foreign", projects: 55, budget: 34.33 },
//     ],
//   },
//   {
//     year: "2025-26",
//     types: [
//       { name: "government", projects: 247, budget: 499.37 },
//       { name: "industry", projects: 59, budget: 28.46 },
//       { name: "foreign", projects: 31, budget: 90.5 },
//     ],
//     sanctionedProjectsSRP: [
//       {
//         academicUnit:
//           "Bharti School of Telecommunication Technology & Management",
//         NoOfProjects: 4,
//         SanctionedFunds: 3.56,
//         SRPType: "Centre",
//       },
//       {
//         academicUnit: "Dept. of Applied Mechanics",
//         NoOfProjects: 8,
//         SanctionedFunds: 3.63,
//         SRPType: "Department",
//       },
//     ],
//   },
// ];

function SponsorProjects() {
  // Initialize state directly with the static mock array data
  const [sponsorProjectData, setSponsorProjectData] = useState([]);
  const [loading, setLoading] = useState(false); // Set to false since data is available instantly

  const [selectedFunding, setSelectedFunding] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedSponsorYear, setSelectedSponsorYear] = useState([]);
  const [activeSponsorYear, setActiveSponsorYear] = useState(null);
  const [selectedSrpTypes, setSelectedSrpTypes] = useState([]);

  const [sponsorYearRange, setSponsorYearRange] = useState(null);

  const getStartYear = (yearStr) => {
    if (!yearStr) return null;
    const match = yearStr.match(/^(\d{4})/);
    return match ? Number(match[1]) : null;
  };

  const getEndYear = (yearStr) => {
    if (!yearStr) return null;
    const match = yearStr.match(/^(\d{2})(\d{2})-(\d{2})$/);
    if (match) {
      return Number(match[1] + match[3]);
    }
    return getStartYear(yearStr);
  };

  const [minYear, maxYear] = useMemo(() => {
    if (sponsorProjectData.length === 0) return [0, 0];
    const startYears = sponsorProjectData
      .map((item) => getStartYear(item.year))
      .filter((y) => y !== null && !isNaN(y));
    const endYears = sponsorProjectData
      .map((item) => getEndYear(item.year))
      .filter((y) => y !== null && !isNaN(y));
    if (startYears.length === 0 || endYears.length === 0) return [0, 0];
    return [Math.min(...startYears), Math.max(...endYears)];
  }, [sponsorProjectData]);

  //api calling
  useEffect(() => {
    const getSponsorProjectData = async () => {
      setLoading(true);
      const apiSponsorProject = await fetchSponsorProjectData();
      const data = apiSponsorProject || [];
      setSponsorProjectData(data);

      if (data.length > 0) {
        const startYears = data
          .map((item) => getStartYear(item.year))
          .filter((y) => y !== null);
        const endYears = data
          .map((item) => getEndYear(item.year))
          .filter((y) => y !== null);

        if (startYears.length > 0 && endYears.length > 0) {
          setSponsorYearRange([Math.min(...startYears), Math.max(...endYears)]);
        }
      }
      setLoading(false);
    };

    getSponsorProjectData();
  }, []);

  const fundingOptionsSponsorProject = useMemo(() => {
    return [
      ...new Set(
        (sponsorProjectData || []).flatMap((year) =>
          (year.types || []).map((type) => type.name),
        ),
      ),
    ].map((name) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      value: name,
    }));
  }, [sponsorProjectData]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let baseData = activeSponsorYear
      ? sponsorProjectData.filter((item) => item.year === activeSponsorYear)
      : sponsorProjectData;

    if (
      sponsorYearRange &&
      sponsorYearRange[0] !== 0 &&
      sponsorYearRange[1] !== 0
    ) {
      baseData = baseData.filter((item) => {
        const itemStart = getStartYear(item.year);
        const itemEnd = getEndYear(item.year);
        return (
          itemStart &&
          itemEnd &&
          itemStart >= sponsorYearRange[0] &&
          itemEnd <= sponsorYearRange[1]
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
          selectedSponsorYear.length === 0 ||
          selectedSponsorYear.includes(yearItem.year);
        return matchesProject && matchesBudget && matchesYear;
      });

      return { ...yearItem, types: filteredTypes };
    });
  }, [
    selectedFunding,
    selectedUnits,
    selectedSponsorYear,
    activeSponsorYear,
    sponsorYearRange,
    sponsorProjectData,
  ]);

  // Filter SRP types exclusively based on the selected year's data array
  const inlineSrpTypeOptions = useMemo(() => {
    if (!activeSponsorYear) return [];
    const targetedYearObj = sponsorProjectData.find(
      (item) => item.year === activeSponsorYear,
    );
    if (!targetedYearObj || !targetedYearObj.sanctionedProjectsSRP) return [];

    const uniqueSrpTypes = new Set();
    targetedYearObj.sanctionedProjectsSRP.forEach((project) => {
      const type = project.SRPType ? project.SRPType.trim() : "Others";
      uniqueSrpTypes.add(type);
    });

    return Array.from(uniqueSrpTypes).map((type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: type,
    }));
  }, [activeSponsorYear, sponsorProjectData]);

  // Watch for a clicked year that has sanctioned projects array entries
  const activeYearDataMatch = useMemo(() => {
    if (!activeSponsorYear) return null;
    return sponsorProjectData.find(
      (item) =>
        item.year === activeSponsorYear &&
        item.sanctionedProjectsSRP &&
        item.sanctionedProjectsSRP.length > 0,
    );
  }, [activeSponsorYear, sponsorProjectData]);

  // Reset the type filter whenever the active year is switched or reset
  useEffect(() => {
    setSelectedSrpTypes([]);
  }, [activeSponsorYear]);

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
      <SponsorProjectFilter
        selectedFunding={selectedFunding}
        setSelectedFunding={setSelectedFunding}
        selectedUnits={selectedUnits}
        setSelectedUnits={setSelectedUnits}
        fundingOptionsSponsorProject={fundingOptionsSponsorProject}
        sponsorYearRange={sponsorYearRange}
        minYear={minYear}
        maxYear={maxYear}
        onSponsorYearRangeChange={setSponsorYearRange}
      />

      <SponsorStats
        activeData={filteredData}
        selectedFundingTypes={selectedFunding}
        selectedBudgetTypes={selectedUnits}
      />

      <div className="px-2 min-h-screen max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
          <SponsorLineChartbox
            activeData={filteredData}
            selectedFundingTypes={selectedFunding}
            activeSponsorYear={activeSponsorYear}
            onSponsorYearClick={setActiveSponsorYear}
          />
          <SponsorBarChartbox
            activeData={filteredData}
            selectedBudgetTypes={selectedUnits}
            setSelectedBudgetTypes={setSelectedUnits}
            activeSponsorYear={activeSponsorYear}
            onSponsorYearClick={setActiveSponsorYear}
          />
        </div>

        {/* CONDITIONALLY RENDERED SRP COMPONENT BETWEEN CHARTS SECTIONS */}
        {activeYearDataMatch && (
          <div className="border-2 rounded-md mb-12 bg-white shadow-sm">
            <div className="px-4 py-3 bg-gray-100 border-b-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="font-semibold text-sm text-gray-800">
                Sanctioned Research Projects in IRD for {activeSponsorYear}
              </h2>
              <div className="flex gap-2 flex-wrap text-[14px]">
                <OptionSelect
                  label="Select SRP type"
                  options={inlineSrpTypeOptions}
                  selected={selectedSrpTypes}
                  onChange={setSelectedSrpTypes}
                  multiple={true}
                />
              </div>
            </div>
            <div className="p-4">
              <div className="border-2 p-4 rounded-md text-xs w-100 bg-gray-50/50">
                <YearChartBlock
                  yearObj={activeYearDataMatch}
                  selectedSrpTypes={selectedSrpTypes}
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto pb-12">
          <SponsorYearlyBudget activeData={filteredData} />
          <YearlyProjects activeData={filteredData} />
        </div>

        {/* <div className="pb-12">
          <SanctionedProject />
        </div>  */}
      </div>
    </>
  );
}

export default SponsorProjects;
