import React, { useMemo, useState } from "react";

import BarChartStudentScheme from "./../dashboards/student-schemes/BarChartStudentScheme";
import StudentSchemeFilter from "./../dashboards/student-schemes/StudentSchemeFilter";
import StatsStudentSchemes from "./../dashboards/student-schemes/StatsStudentSchemes";
import { studentSchemeData } from "./../lib/studentSchemeData";

// Pure helper function to dynamically pluck the absolute min and max years
// out of whatever API structural data maps down.
const getYearBounds = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return { minYear: 2000, maxYear: new Date().getFullYear() };
  }

  // 1. Extract all object keys from the nested 'yearly_data' objects
  const allYears = data.flatMap((scheme) =>
    scheme.yearly_data ? Object.keys(scheme.yearly_data).map(Number) : [],
  );

  if (allYears.length === 0) {
    return { minYear: 2000, maxYear: new Date().getFullYear() };
  }

  // 2. Determine limits dynamically from data
  return {
    minYear: Math.min(...allYears),
    maxYear: Math.max(...allYears),
  };
};

function StudentsSchemes() {
  const [selectedSchemes, setSelectedSchemes] = useState([]);

  // Compute boundaries safely away from state render lifecycle tracking blockers
  const { minYear, maxYear } = useMemo(
    () => getYearBounds(studentSchemeData),
    [],
  );

  // Initialize your range to match whatever the dataset rules dictate
  const [studentSchemeYearRange, setStudentSchemeYearRange] = useState([
    minYear,
    maxYear,
  ]);

  // Generate unique filter choices
  const filterSchemeOptions = useMemo(() => {
    if (!Array.isArray(studentSchemeData)) return [];
    return studentSchemeData.map((scheme) => ({
      label: scheme.schemeName,
      value: scheme.schemeName,
    }));
  }, []);

  // Filter raw dataset based on BOTH selection criteria array and the year interval
  const filteredSchemesData = useMemo(() => {
    if (!Array.isArray(studentSchemeData)) return [];

    return studentSchemeData
      .filter((scheme) => {
        // Condition A: Target filter matches selected options
        return (
          selectedSchemes.length === 0 ||
          selectedSchemes.includes(scheme.schemeName)
        );
      })
      .map((scheme) => {
        // Condition B: Filter out specific data entries inside 'yearly_data' that fall outside the range
        if (!scheme.yearly_data) return scheme;

        const filteredYearlyData = {};
        Object.entries(scheme.yearly_data).forEach(([yearStr, value]) => {
          const yr = Number(yearStr);
          if (
            yr >= studentSchemeYearRange[0] &&
            yr <= studentSchemeYearRange[1]
          ) {
            filteredYearlyData[yearStr] = value;
          }
        });

        return {
          ...scheme,
          yearly_data: filteredYearlyData,
        };
      });
  }, [selectedSchemes, studentSchemeYearRange]);

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-10">
      <StudentSchemeFilter
        options={filterSchemeOptions}
        selected={selectedSchemes}
        onChange={setSelectedSchemes}
        studentSchemeYearRange={studentSchemeYearRange}
        minYear={minYear}
        maxYear={maxYear}
        onstudentSchemeYearRangeChange={setStudentSchemeYearRange}
      />

      <StatsStudentSchemes studentsSchemesActiveData={filteredSchemesData} />

      <div className="mt-6 px-4 max-w-[1500px] mx-auto">
        <BarChartStudentScheme schemeData={filteredSchemesData} />
      </div>
    </div>
  );
}

export default StudentsSchemes;
