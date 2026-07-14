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

  // Initialize range as null; populated explicitly on API response
  const [studentSchemeYearRange, setStudentSchemeYearRange] = useState(null);

  // Helper function to safely extract the start year from formats like "2016-17" or standard numbers
  const getStartYear = (yearVal) => {
    if (!yearVal) return null;
    const yearStr = String(yearVal);
    const match = yearStr.match(/^(\d{4})/);
    return match ? Number(match[1]) : null;
  };

  // Helper function to extract the 4-digit end year from formats like "2016-17" -> 2017 or standard numbers
  const getEndYear = (yearVal) => {
    if (!yearVal) return null;
    const yearStr = String(yearVal);
    const match = yearStr.match(/^(\d{2})(\d{2})-(\d{2})$/);
    if (match) {
      const century = match[1]; // "20"
      const endDecade = match[3]; // "17"
      return Number(century + endDecade); // 2017
    }
    return getStartYear(yearVal);
  };

  // Compute absolute minimum and maximum years dynamically
  const [minYear, maxYear] = useMemo(() => {
    if (studentSchemeData.length === 0) return [0, 0];

    const allYears = studentSchemeData.flatMap((scheme) =>
      Array.isArray(scheme.yearlyData)
        ? scheme.yearlyData.map((d) => d.year)
        : [],
    );

    const startYears = allYears
      .map((y) => getStartYear(y))
      .filter((y) => y !== null && !isNaN(y));
    const endYears = allYears
      .map((y) => getEndYear(y))
      .filter((y) => y !== null && !isNaN(y));

    if (startYears.length === 0 || endYears.length === 0) return [0, 0];

    return [Math.min(...startYears), Math.max(...endYears)];
  }, [studentSchemeData]);

  // API loading and range initialization technique
  useEffect(() => {
    const getStudentSchemeData = async () => {
      setLoading(true);
      const apiStudentSchemeData = await fetchStudentSchemeData();
      const data = apiStudentSchemeData || [];
      setStudentSchemeData(data);

      if (data.length > 0) {
        const allYears = data.flatMap((scheme) =>
          Array.isArray(scheme.yearlyData)
            ? scheme.yearlyData.map((d) => d.year)
            : [],
        );

        const startYears = allYears
          .map((y) => getStartYear(y))
          .filter((y) => y !== null);
        const endYears = allYears
          .map((y) => getEndYear(y))
          .filter((y) => y !== null);

        if (startYears.length > 0 && endYears.length > 0) {
          setStudentSchemeYearRange([
            Math.min(...startYears),
            Math.max(...endYears),
          ]);
        }
      }
      setLoading(false);
    };
    getStudentSchemeData();
  }, []);

  const filterSchemeOptions = useMemo(() => {
    if (!Array.isArray(studentSchemeData)) return [];
    return studentSchemeData.map((scheme) => ({
      label: scheme.schemeName,
      value: scheme.schemeName,
    }));
  }, [studentSchemeData]);

  // Dynamically filter data tree based on configurations
  const filteredSchemesData = useMemo(() => {
    if (!Array.isArray(studentSchemeData)) return [];

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
          const itemStart = getStartYear(item.year);
          const itemEnd = getEndYear(item.year);

          if (studentSchemeYearRange) {
            return (
              itemStart &&
              itemEnd &&
              itemStart >= studentSchemeYearRange[0] &&
              itemEnd <= studentSchemeYearRange[1]
            );
          }
          return true;
        });

        return { ...scheme, yearlyData: filteredYearlyData };
      });
  }, [studentSchemeData, selectedSchemes, studentSchemeYearRange]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <LuLoaderCircle className="animate-spin text-blue-900" size={60} />
        <span className="text-slate-700 font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-12">
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
