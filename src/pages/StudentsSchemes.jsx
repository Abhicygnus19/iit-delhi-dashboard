import React, { useEffect, useMemo, useState } from "react";

import BarChartStudentScheme from "../dashboards/student_schemes/BarChartStudentScheme";
import StudentSchemeFilter from "../dashboards/student_schemes/StudentSchemeFilter";
import StatsStudentSchemes from "../dashboards/student_schemes/StatsStudentSchemes";

import { fetchStudentSchemeData } from "./../lib/studentSchemeData";
import { LuLoaderCircle } from "react-icons/lu";

function StudentsSchemes() {
  const [studentSchemeData, setStudentSchemeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemes, setSelectedSchemes] = useState([]);

  // start range as null. If null, we use absolute min/max.
  const [studentSchemeYearRange, setStudentSchemeYearRange] = useState(null);

  const getYearBounds = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { minYear: 2000, maxYear: new Date().getFullYear() };
    }
    const allYears = data.flatMap((scheme) =>
      Array.isArray(scheme.yearlyData)
        ? scheme.yearlyData.map((d) => d.year)
        : [],
    );
    if (allYears.length === 0) {
      return { minYear: 2000, maxYear: new Date().getFullYear() };
    }
    return { minYear: Math.min(...allYears), maxYear: Math.max(...allYears) };
  };

  useEffect(() => {
    const getStudentSchemeData = async () => {
      setLoading(true);
      const apiStudentSchemeData = await fetchStudentSchemeData();
      setStudentSchemeData(apiStudentSchemeData || []);
      setLoading(false);
    };
    getStudentSchemeData();
  }, []);

  const { minYear, maxYear } = useMemo(
    () => getYearBounds(studentSchemeData),
    [studentSchemeData],
  );

  const filterSchemeOptions = useMemo(() => {
    if (!Array.isArray(studentSchemeData)) return [];
    return studentSchemeData.map((scheme) => ({
      label: scheme.schemeName,
      value: scheme.schemeName,
    }));
  }, [studentSchemeData]);

  // Simplified filtering
  const filteredSchemesData = useMemo(() => {
    if (!Array.isArray(studentSchemeData)) return [];

    // Use selected range if user moved slider, otherwise fall back to the absolute data limits
    const startYear = studentSchemeYearRange
      ? studentSchemeYearRange[0]
      : minYear;
    const endYear = studentSchemeYearRange
      ? studentSchemeYearRange[1]
      : maxYear;

    return studentSchemeData
      .filter((scheme) => {
        return (
          selectedSchemes.length === 0 ||
          selectedSchemes.includes(scheme.schemeName)
        );
      })
      .map((scheme) => {
        if (!Array.isArray(scheme.yearlyData)) return scheme;

        const filteredYearlyData = scheme.yearlyData.filter((item) => {
          return item.year >= startYear && item.year <= endYear;
        });

        return { ...scheme, yearlyData: filteredYearlyData };
      });
  }, [
    studentSchemeData,
    selectedSchemes,
    studentSchemeYearRange,
    minYear,
    maxYear,
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
    <div className="w-full min-h-screen bg-gray-50 pb-10">
      <StudentSchemeFilter
        options={filterSchemeOptions}
        selected={selectedSchemes}
        onChange={setSelectedSchemes}
        studentSchemeYearRange={studentSchemeYearRange || [minYear, maxYear]}
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
