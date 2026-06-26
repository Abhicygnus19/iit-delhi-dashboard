import React, { useState, useMemo, useEffect } from "react";

import {
  // consultancyProjectData,
  fetchConsultancyProjectData,
} from "../lib/consultancyProjectData";
import ConsultancyProjectFilter from "./../dashboards/consultancy_projects/ConsultancyProjectFilter";
import ConsultancyStats from "./../dashboards/consultancy_projects/ConsultancyStats";
import ConsultancyLineChartbox from "./../dashboards/consultancy_projects/ConsultancyLineChartbox";
import ConsultancyBarChartbox from "./../dashboards/consultancy_projects/ConsultancyBarChartbox";
import ConsultancyYearlyBudget from "./../dashboards/consultancy_projects/ConsultancyYearlyBudget";
import ConsultancyYearlyProjects from "./../dashboards/consultancy_projects/ConsultancyYearlyProjects";
import ConsultancyUnitProject from "./../dashboards/consultancy_projects/ConsultancyUnitProject";

import { LuLoaderCircle } from "react-icons/lu";

function SponsorProjects() {
  const [consultancyProjectData, setConsultancyProjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFunding, setSelectedFunding] = useState([]); // Projects Filter
  const [selectedUnits, setSelectedUnits] = useState([]); // Budget Filter
  const [selectedConsultancyYear, setSelectedConsultancyYear] = useState([]);

  const [activeConsultancyYear, setActiveConsultancyYear] = useState(null);

  useEffect(() => {
    const getConsultancyProjectData = async () => {
      setLoading(true);

      const apiConsultancyProjectData = await fetchConsultancyProjectData();

      setConsultancyProjectData(apiConsultancyProjectData || []);

      setLoading(false);
    };
    getConsultancyProjectData();
  }, []);

  // funding option fetching like govt,industry,foreign
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
    //  First, slice by active clicked year if one exists
    const baseData = activeConsultancyYear
      ? consultancyProjectData.filter(
          (item) => item.year === activeConsultancyYear,
        )
      : consultancyProjectData;

    return baseData.map((yearItem) => {
      const filteredTypes = yearItem.types.filter((t) => {
        const matchesProject =
          selectedFunding.length === 0 || selectedFunding.includes(t.name);
        const matchesBudget =
          selectedUnits.length === 0 || selectedUnits.includes(t.name);

        // Note: keeping state dropdown array check just in case
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
    consultancyProjectData,
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
    <div>
      {/* 1. Global Filter Dashboard bar */}
      <ConsultancyProjectFilter
        selectedFunding={selectedFunding}
        setSelectedFunding={setSelectedFunding}
        selectedUnits={selectedUnits}
        setSelectedUnits={setSelectedUnits}
        fundingOptionsConsultancyProject={fundingOptionsConsultancyProject}
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

        {/*  Heatmaps & Secondary Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
          <ConsultancyYearlyBudget activeData={filteredData} />
          <ConsultancyYearlyProjects activeData={filteredData} />
        </div>

        <div className="mb-12">
          <ConsultancyUnitProject />
        </div>
      </div>
    </div>
  );
}

export default SponsorProjects;
