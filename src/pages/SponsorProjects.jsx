import React, { useState, useMemo, useEffect } from "react";
import SponsorProjectFilter from "../dashboards/sponsor_projects/SponsorProjectFilter";
import SponsorStats from "../dashboards/sponsor_projects/SponsorStats";
import SponsorLineChartbox from "../dashboards/sponsor_projects/SponsorLineChartbox";
import SponsorBarChartbox from "../dashboards/sponsor_projects/SponsorBarChartbox";
import YearlyProjects from "../dashboards/sponsor_projects/YearlyProjects";
import SponsorYearlyBudget from "../dashboards/sponsor_projects/SponsorYearlyBudget";
import SanctionedProject from "../dashboards/sponsor_projects/SanctionedProject";

import {
  // sponsorProjectData,
  fetchSponsorProjectData,
} from "./../lib/sponsorData";

import { LuLoaderCircle } from "react-icons/lu";

function SponsorProjects() {
  const [sponsorProjectData, setSponsorProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFunding, setSelectedFunding] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedSponsorYear, setSelectedSponsorYear] = useState([]);

  const [activeSponsorYear, setActiveSponsorYear] = useState(null);

  useEffect(() => {
    const getSponsorProjectData = async () => {
      setLoading(true);

      const apiSponsorProject = await fetchSponsorProjectData();

      setSponsorProjectData(apiSponsorProject || []);

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

  // Dynamically filter data tree based on dropdown selections AND clicked chart items
  const filteredData = useMemo(() => {
    // 1. First, slice by active clicked year if one exists
    const baseData = activeSponsorYear
      ? sponsorProjectData.filter((item) => item.year === activeSponsorYear)
      : sponsorProjectData;

    return baseData.map((yearItem) => {
      const filteredTypes = yearItem.types.filter((t) => {
        const matchesProject =
          selectedFunding.length === 0 || selectedFunding.includes(t.name);
        const matchesBudget =
          selectedUnits.length === 0 || selectedUnits.includes(t.name);

        // Note: keeping state dropdown array check just in case
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
    sponsorProjectData,
  ]); // Added activeSponsorYear dependency

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <LuLoaderCircle className="animate-spin text-blue-900" size={60} />
        <span className="text-slate-700 font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Global Filter Dashboard bar */}
      <SponsorProjectFilter
        selectedFunding={selectedFunding}
        setSelectedFunding={setSelectedFunding}
        selectedUnits={selectedUnits}
        setSelectedUnits={setSelectedUnits}
        fundingOptionsSponsorProject={fundingOptionsSponsorProject}
      />

      {/* 2. Interactive Stats Metric Cards */}
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
    </div>
  );
}

export default SponsorProjects;
