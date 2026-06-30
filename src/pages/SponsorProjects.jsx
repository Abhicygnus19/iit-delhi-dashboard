import React, { useState, useMemo, useEffect } from "react";
import SponsorProjectFilter from "../dashboards/sponsor_projects/SponsorProjectFilter";
import SponsorStats from "../dashboards/sponsor_projects/SponsorStats";
import SponsorLineChartbox from "../dashboards/sponsor_projects/SponsorLineChartbox";
import SponsorBarChartbox from "../dashboards/sponsor_projects/SponsorBarChartbox";
import YearlyProjects from "../dashboards/sponsor_projects/YearlyProjects";
import SponsorYearlyBudget from "../dashboards/sponsor_projects/SponsorYearlyBudget";
import SanctionedProject from "../dashboards/sponsor_projects/SanctionedProject";

import { fetchSponsorProjectData } from "./../lib/sponsorData";
import { LuLoaderCircle } from "react-icons/lu";

function SponsorProjects() {
  const [sponsorProjectData, setSponsorProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFunding, setSelectedFunding] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedSponsorYear, setSelectedSponsorYear] = useState([]);
  const [activeSponsorYear, setActiveSponsorYear] = useState(null);

  // Initialize range as null; we'll populate it dynamically once the API responds
  const [sponsorYearRange, setSponsorYearRange] = useState(null);

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

  // Compute absolute minimum and maximum years dynamically
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
        sponsorProjectData.flatMap((year) =>
          (year.types || []).map((type) => type.name),
        ),
      ),
    ].map((name) => ({
      label: name.charAt(0).toUpperCase() + name.slice(1),
      value: name,
    }));
  }, [sponsorProjectData]);

  // Dynamically filter data tree based on configurations
  const filteredData = useMemo(() => {
    let baseData = activeSponsorYear
      ? sponsorProjectData.filter((item) => item.year === activeSponsorYear)
      : sponsorProjectData;

    // Filter by the dynamic parsed Range Slider
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

      return {
        ...yearItem,
        types: filteredTypes,
      };
    });
  }, [
    selectedFunding,
    selectedUnits,
    selectedSponsorYear,
    activeSponsorYear,
    sponsorYearRange,
    sponsorProjectData,
  ]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
          <SponsorYearlyBudget activeData={filteredData} />
          <YearlyProjects activeData={filteredData} />
        </div>

        <div className="mb-12">
          <SanctionedProject />
        </div>
      </div>
    </>
  );
}

export default SponsorProjects;
