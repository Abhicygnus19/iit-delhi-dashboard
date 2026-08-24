import React, { useEffect, useMemo, useState } from "react";

import BarChartStudentScheme from "../dashboards/student_schemes/BarChartStudentScheme";
import StudentSchemeFilter from "../dashboards/student_schemes/StudentSchemeFilter";
import StatsStudentSchemes from "../dashboards/student_schemes/StatsStudentSchemes";

import {
  fetchStudentSchemeData,
  fecthStudentSchemePDF,
  schemePDF,
} from "./../lib/studentSchemeData";
import { LuLoaderCircle } from "react-icons/lu";
import { FiArrowUpRight } from "react-icons/fi";
import Heading from "../components/ui/Heading";
import HeatmapYearlyScheme from "../dashboards/student_schemes/HeatmapYearlyScheme";

function StudentsSchemes() {
  const [studentSchemeData, setStudentSchemeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemes, setSelectedSchemes] = useState([]);

  const [studentSchemeYearRange, setStudentSchemeYearRange] = useState(null);

  const [studentSchemePDF, setStudentSchemePDF] = useState([]);

  const getStartYear = (yearVal) => {
    if (!yearVal) return null;
    const yearStr = String(yearVal);
    const match = yearStr.match(/^(\d{4})/);
    return match ? Number(match[1]) : null;
  };

  const getEndYear = (yearVal) => {
    if (!yearVal) return null;
    const yearStr = String(yearVal);
    const match = yearStr.match(/^(\d{2})(\d{2})-(\d{2})$/);
    if (match) {
      const century = match[1];
      const endDecade = match[3];
      return Number(century + endDecade);
    }
    return getStartYear(yearVal);
  };

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

  useEffect(() => {
    const getStudentSchemePDF = async () => {
      const apiStudentSchemePDF = await fecthStudentSchemePDF();
      const data = apiStudentSchemePDF || [];
      setStudentSchemePDF(data);

      if (setStudentSchemePDF < 0) {
        console.log("student scheme pdf is nto avaliable");
      }
    };
    getStudentSchemePDF();
  }, []);

  const filterSchemeOptions = useMemo(() => {
    if (!Array.isArray(studentSchemeData)) return [];
    return studentSchemeData.map((scheme) => ({
      label: scheme.schemeName,
      value: scheme.schemeName,
    }));
  }, [studentSchemeData]);

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

  // Extract scheme names for table row headers
  const schemeTypes = useMemo(() => {
    return filteredSchemesData.map((scheme) => scheme.schemeName);
  }, [filteredSchemesData]);

  // List unique years across current dataset
  const visibleSchemeData = useMemo(() => {
    const yearsSet = new Set();
    filteredSchemesData.forEach((scheme) => {
      if (Array.isArray(scheme.yearlyData)) {
        scheme.yearlyData.forEach((d) => yearsSet.add(d.year));
      }
    });
    return Array.from(yearsSet).map((year) => ({ year }));
  }, [filteredSchemesData]);

  // Pivot data: Convert scheme-centric data into year-keyed objects for heatmap lookup
  const transformedSchemeChartData = useMemo(() => {
    const map = {};

    filteredSchemesData.forEach((scheme) => {
      const name = scheme.schemeName;
      if (Array.isArray(scheme.yearlyData)) {
        scheme.yearlyData.forEach((item) => {
          if (!map[item.year]) {
            map[item.year] = { year: item.year };
          }
          map[item.year][name] = item.count || item.value || item.students || 0;
        });
      }
    });

    return Object.values(map);
  }, [filteredSchemesData]);

  // Filter state indicators
  const isFiltered = useMemo(() => {
    const isSchemeFiltered = selectedSchemes.length > 0;
    const isYearFiltered =
      studentSchemeYearRange &&
      (studentSchemeYearRange[0] !== minYear ||
        studentSchemeYearRange[1] !== maxYear);
    return isSchemeFiltered || isYearFiltered;
  }, [selectedSchemes, studentSchemeYearRange, minYear, maxYear]);

  // Clear filters callback
  const handleClearFilter = () => {
    setSelectedSchemes([]);
    setStudentSchemeYearRange([minYear, maxYear]);
  };

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
      <Heading pageheading={"Students Schemes"} />

      <StudentSchemeFilter
        options={filterSchemeOptions}
        selected={selectedSchemes}
        onChange={setSelectedSchemes}
        studentSchemeYearRange={studentSchemeYearRange || [minYear, maxYear]}
        minYear={minYear}
        maxYear={maxYear}
        onstudentSchemeYearRangeChange={setStudentSchemeYearRange}
      />

      <div className="max-w-[1500px] mx-auto">
        <StatsStudentSchemes studentsSchemesActiveData={filteredSchemesData} />

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 items-start my-6 px-4">
          <div>
            <BarChartStudentScheme
              schemeData={filteredSchemesData}
              selectedSchemes={selectedSchemes}
            />
          </div>

          {/* <div>
            <HeatmapYearlyScheme
              transformedSchemeChartData={transformedSchemeChartData}
              schemeTypes={schemeTypes}
              visibleSchemeData={visibleSchemeData}
              isFiltered={isFiltered}
              clearFilter={handleClearFilter}
            />
          </div> */}
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-center">
          {studentSchemePDF
            .filter((item) => item.pdflink && item.pdflink !== "#")
            .map((item, index) => (
              <div
                key={index}
                className="group shadow-lg rounded-full bg-white border border-gray-200 overflow-hidden font-semibold"
              >
                <a
                  href={item.pdflink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 hover:bg-red-800 hover:text-white w-full h-full px-6 py-3 transition-all duration-300"
                >
                  {item.label}
                  <FiArrowUpRight className="text-xl transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default StudentsSchemes;
