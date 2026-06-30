import React, { useState, useMemo, useEffect } from "react";
import FiltersPatents from "../dashboards/patents_IITDelhi/FiltersPatents";
import StatCardsPatents from "../dashboards/patents_IITDelhi/StatCardsPatents";
import PatentsBarChartBox from "../dashboards/patents_IITDelhi/PatentsBarChartBox";
import YearlyPatentsTable from "../dashboards/patents_IITDelhi/YearlyPatentsTable";
import { LuLoaderCircle } from "react-icons/lu";
import { fetchPatentsData } from "./../lib/patentsData";

function PatentsIITDelhi() {
  const [patentsData, setPatentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatentTypes, setselectedPatentTypes] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

  // 1. Keep range state null initially. Let it fallback to real min/max automatically.
  const [patentsYearRange, setPatentsYearRange] = useState(null);

  // fetch patents data
  useEffect(() => {
    const getPatentsData = async () => {
      setLoading(true);
      const apiPatentsData = await fetchPatentsData();
      setPatentsData(apiPatentsData || []);
      setLoading(false);
    };

    getPatentsData();
  }, []);

  const getPatentsYearBounds = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { minYear: 2016, maxYear: new Date().getFullYear() };
    }

    const minYears = [];
    const maxYears = [];

    data.forEach((item) => {
      if (!item.year) return;
      const parts = item.year.split("-");
      const start = Number(parts[0]);
      if (!isNaN(start)) {
        minYears.push(start);

        // Parse the end year safely handling both 2-digit ("17") and 4-digit ("2027") formats
        if (parts[1]) {
          let end = Number(parts[1]);
          if (parts[1].length === 2) {
            // Convert "17" to 2017 based on the start century
            end = Math.floor(start / 100) * 100 + end;
          }
          maxYears.push(end);
        } else {
          maxYears.push(start);
        }
      }
    });

    return {
      minYear: minYears.length > 0 ? Math.min(...minYears) : 2016,
      maxYear:
        maxYears.length > 0 ? Math.max(...maxYears) : new Date().getFullYear(),
    };
  };
  // 2. FIXED: Added patentsData to the dependency array so it recalculates when API returns
  const { minYear, maxYear } = useMemo(
    () => getPatentsYearBounds(patentsData),
    [patentsData],
  );

  // Determine if any filters are active compared to their defaults
  const isFiltered = useMemo(() => {
    const isYearClicked = selectedYear !== null;
    const isTypeSelected = selectedPatentTypes.length > 0;

    // Safely match active range against current min/max bounds
    const activeRange = patentsYearRange || [minYear, maxYear];
    const isRangeChanged =
      activeRange[0] !== minYear || activeRange[1] !== maxYear;

    return isYearClicked || isTypeSelected || isRangeChanged;
  }, [selectedYear, selectedPatentTypes, patentsYearRange, minYear, maxYear]);

  // Master reset function to wipe all dashboard filters at once
  const handleResetAllFilters = () => {
    setSelectedYear(null);
    setselectedPatentTypes([]);
    setPatentsYearRange(null); // Resets back to full dataset range
  };

  const allUniquePatentTypeNames = useMemo(() => {
    const types = new Set();
    patentsData.forEach((yearData) => {
      if (Array.isArray(yearData.patentTypes)) {
        yearData.patentTypes.forEach((pt) => {
          if (pt.name) types.add(pt.name.trim());
        });
      }
    });
    return Array.from(types);
  }, [patentsData]);

  const filterPatentOptions = useMemo(() => {
    return allUniquePatentTypeNames.map((name) => ({
      label: name,
      value: name,
    }));
  }, [allUniquePatentTypeNames]);

  const dataFilteredByYearRange = useMemo(() => {
    if (!Array.isArray(patentsData)) return [];

    const startYear = patentsYearRange ? patentsYearRange[0] : minYear;
    const endYear = patentsYearRange ? patentsYearRange[1] : maxYear;

    return patentsData.filter((item) => {
      if (!item.year) return false;

      // Extract both start and end numeric values for clean comparison
      const parts = item.year.split("-");
      const itemStart = Number(parts[0]);
      let itemEnd = parts[1] ? Number(parts[1]) : itemStart;
      if (parts[1] && parts[1].length === 2) {
        itemEnd = Math.floor(itemStart / 100) * 100 + itemEnd;
      }

      return itemStart >= startYear && itemEnd <= endYear;
    });
  }, [patentsYearRange, patentsData, minYear, maxYear]);

  const transformedPatentChartData = useMemo(() => {
    return dataFilteredByYearRange.map((yearObj) => {
      const row = { year: yearObj.year };

      allUniquePatentTypeNames.forEach((name) => {
        row[name] = 0;
      });

      if (Array.isArray(yearObj.patentTypes)) {
        yearObj.patentTypes.forEach((pt) => {
          const normalizedName = pt.name.trim();
          row[normalizedName] = pt.patentNumbers;
        });
      }

      return row;
    });
  }, [dataFilteredByYearRange, allUniquePatentTypeNames]);

  const visiblePatentNames = useMemo(() => {
    if (selectedPatentTypes.length === 0) return allUniquePatentTypeNames;
    return selectedPatentTypes;
  }, [selectedPatentTypes, allUniquePatentTypeNames]);

  const visiblePatentChartData = useMemo(() => {
    if (!selectedYear) return transformedPatentChartData;
    return transformedPatentChartData.filter(
      (item) => item.year === selectedYear,
    );
  }, [transformedPatentChartData, selectedYear]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <LuLoaderCircle className="animate-spin text-blue-900" size={60} />
        <span className="text-slate-700 font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      <FiltersPatents
        options={filterPatentOptions}
        selected={selectedPatentTypes}
        onChange={setselectedPatentTypes}
        // 4. Safely forward values down to your filter component
        patentsYearRange={patentsYearRange || [minYear, maxYear]}
        minYear={minYear}
        maxYear={maxYear}
        onPatentsYearRangeChange={setPatentsYearRange}
      />

      <StatCardsPatents
        transformedPatentChartData={transformedPatentChartData}
        visiblePatentNames={visiblePatentNames}
        selectedYear={selectedYear}
        clearFilter={() => setSelectedYear(null)}
      />

      <div className="px-4 max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
          <PatentsBarChartBox
            visiblePatentData={visiblePatentChartData}
            PatentNames={visiblePatentNames}
            isFiltered={isFiltered}
            clearFilter={handleResetAllFilters}
            onYearClick={setSelectedYear}
          />

          <YearlyPatentsTable
            visiblePatentData={visiblePatentChartData}
            transformedPatentChartData={transformedPatentChartData}
            patentTypes={visiblePatentNames}
            isFiltered={isFiltered}
            clearFilter={handleResetAllFilters}
          />
        </div>
      </div>
    </div>
  );
}

export default PatentsIITDelhi;
