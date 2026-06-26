import React, { useState, useMemo, useEffect } from "react";
import FiltersPatents from "./../dashboards/PatentsIITDelhi/FiltersPatents";
import StatCardsPatents from "./../dashboards/PatentsIITDelhi/StatCardsPatents";
import PatentsBarChartBox from "./../dashboards/PatentsIITDelhi/PatentsBarChartBox";
import YearlyPatentsTable from "./../dashboards/PatentsIITDelhi/YearlyPatentsTable";
import { LuLoaderCircle } from "react-icons/lu";
import { fetchPatentsData } from "./../lib/patentsData";

function PatentsIITDelhi() {
  const [patentsData, setPatentsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPatentTypes, setselectedPatentTypes] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);

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

    const allYears = data
      .map((item) => {
        if (!item.year) return null;
        const startYear = item.year.split("-")[0];
        return Number(startYear);
      })
      .filter(Boolean);

    if (allYears.length === 0) {
      return { minYear: 2016, maxYear: new Date().getFullYear() };
    }

    return {
      minYear: Math.min(...allYears),
      maxYear: Math.max(...allYears),
    };
  };

  const { minYear, maxYear } = useMemo(
    () => getPatentsYearBounds(patentsData),
    [],
  );

  const [patentsYearRange, setPatentsYearRange] = useState([minYear, maxYear]);

  // Determine if any filters are active compared to their defaults
  const isFiltered = useMemo(() => {
    const isYearClicked = selectedYear !== null;
    const isTypeSelected = selectedPatentTypes.length > 0;
    const isRangeChanged =
      patentsYearRange[0] !== minYear || patentsYearRange[1] !== maxYear;

    return isYearClicked || isTypeSelected || isRangeChanged;
  }, [selectedYear, selectedPatentTypes, patentsYearRange, minYear, maxYear]);

  // Master reset function to wipe all dashboard filters at once
  const handleResetAllFilters = () => {
    setSelectedYear(null);
    setselectedPatentTypes([]);
    setPatentsYearRange([minYear, maxYear]);
  };

  const allUniquePatentTypeNames = useMemo(() => {
    const types = new Set();
    patentsData.forEach((yearData) => {
      yearData.patentTypes.forEach((pt) => {
        if (pt.name) types.add(pt.name.trim());
      });
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

    return patentsData.filter((item) => {
      if (!item.year) return false;
      const numericStartYear = Number(item.year.split("-")[0]);
      return (
        numericStartYear >= patentsYearRange[0] &&
        numericStartYear <= patentsYearRange[1]
      );
    });
  }, [patentsYearRange, patentsData]);

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
        patentsYearRange={patentsYearRange}
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

// import React, { useState, useMemo, useEffect } from "react";
// import FiltersPatents from "./../dashboards/PatentsIITDelhi/FiltersPatents";
// import StatCardsPatents from "./../dashboards/PatentsIITDelhi/StatCardsPatents";
// import PatentsBarChartBox from "./../dashboards/PatentsIITDelhi/PatentsBarChartBox";
// import YearlyPatentsTable from "./../dashboards/PatentsIITDelhi/YearlyPatentsTable";
// import { fetchPatentsData, patentsData } from "./../lib/patentsData";

// const getPatentsYearBounds = (data) => {
//   if (!Array.isArray(data) || data.length === 0) {
//     return { minYear: 2016, maxYear: new Date().getFullYear() };
//   }

//   // Parse out the base starting year as an integer
//   const allYears = data
//     .map((item) => {
//       if (!item.year) return null;
//       const startYear = item.year.split("-")[0]; // Grabs "2016" from "2016-17"
//       return Number(startYear);
//     })
//     .filter(Boolean);

//   if (allYears.length === 0) {
//     return { minYear: 2016, maxYear: new Date().getFullYear() };
//   }

//   return {
//     minYear: Math.min(...allYears),
//     maxYear: Math.max(...allYears),
//   };
// };

// function PatentsIITDelhi() {
//   // const [patentsData, setPatentsData] = useState([]);
//   // const [loading, setLoading] = useState(true);
//   const [selectedPatentTypes, setselectedPatentTypes] = useState([]);
//   const [selectedYear, setSelectedYear] = useState(null);

//   // Compute boundaries safely away from state render lifecycle tracking blockers
//   const { minYear, maxYear } = useMemo(
//     () => getPatentsYearBounds(patentsData),
//     [],
//   );

//   // fetching patents data
//   // useEffect(() => {
//   //   const getPatentsData = async () => {
//   //     setLoading(true);
//   //     const apiPatentsData = await fetchPatentsData();

//   //     // setPatentsData(apiPatentsData || []);
//   //     setLoading(false);
//   //   };
//   //   getPatentsData();
//   // }, []);

//   // Initialize your range to match whatever the dataset rules dictate
//   const [patentsYearRange, setPatentsYearRange] = useState([minYear, maxYear]);

//   // Extract ALL unique patent type names across all years dynamically
//   const allUniquePatentTypeNames = useMemo(() => {
//     const types = new Set();
//     patentsData.forEach((yearData) => {
//       yearData.patentTypes.forEach((pt) => {
//         if (pt.name) types.add(pt.name.trim()); // trim whitespace
//       });
//     });
//     return Array.from(types);
//   }, []);

//   // 3. Format dropdown options
//   const filterPatentOptions = useMemo(() => {
//     return allUniquePatentTypeNames.map((name) => ({
//       label: name,
//       value: name,
//     }));
//   }, [allUniquePatentTypeNames]);

//   // year range filtering
//   const dataFilteredByYearRange = useMemo(() => {
//     if (!Array.isArray(patentsData)) return [];

//     return patentsData.filter((item) => {
//       if (!item.year) return false;
//       const numericStartYear = Number(item.year.split("-")[0]);
//       return (
//         numericStartYear >= patentsYearRange[0] &&
//         numericStartYear <= patentsYearRange[1]
//       );
//     });
//   }, [patentsYearRange]);

//   // 4. Flatten array data into a robust cross-tabulated structure
//   const transformedPatentChartData = useMemo(() => {
//     return dataFilteredByYearRange.map((yearObj) => {
//       const row = { year: yearObj.year };

//       // Initialize every possible metric to 0 for this year
//       allUniquePatentTypeNames.forEach((name) => {
//         row[name] = 0;
//       });

//       // Fill in actual values from API data
//       if (Array.isArray(yearObj.patentTypes)) {
//         yearObj.patentTypes.forEach((pt) => {
//           const normalizedName = pt.name.trim();
//           row[normalizedName] = pt.patentNumbers;
//         });
//       }

//       return row;
//     });
//   }, [dataFilteredByYearRange, allUniquePatentTypeNames]);

//   // 5. Compute metrics that are allowed to show based on dropdown selection
//   const visiblePatentNames = useMemo(() => {
//     // If nothing is explicitly checked, show ALL discovered metrics
//     if (selectedPatentTypes.length === 0) return allUniquePatentTypeNames;
//     return selectedPatentTypes;
//   }, [selectedPatentTypes, allUniquePatentTypeNames]);

//   // 6. Handle filtering data for the Bar Chart when a year is clicked
//   const visiblePatentChartData = useMemo(() => {
//     if (!selectedYear) return transformedPatentChartData;
//     return transformedPatentChartData.filter(
//       (item) => item.year === selectedYear,
//     );
//   }, [transformedPatentChartData, selectedYear]);

//   return (
//     <div className="bg-gray-100 min-h-screen pb-12">
//       <FiltersPatents
//         options={filterPatentOptions}
//         selected={selectedPatentTypes}
//         onChange={setselectedPatentTypes}
//         patentsYearRange={patentsYearRange}
//         minYear={minYear}
//         maxYear={maxYear}
//         onPatentsYearRangeChange={setPatentsYearRange}
//       />

//       {/* Pass the computed metrics dynamically here */}
//       <StatCardsPatents
//         transformedPatentChartData={transformedPatentChartData}
//         visiblePatentNames={visiblePatentNames}
//         selectedYear={selectedYear}
//         clearFilter={() => setSelectedYear(null)}
//       />

//       <div className="px-4 max-w-[1500px] mx-auto">
//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
//           <PatentsBarChartBox
//             visiblePatentData={visiblePatentChartData}
//             PatentNames={visiblePatentNames}
//             selectedYear={selectedYear}
//             onYearClick={setSelectedYear}
//             clearFilter={() => setSelectedYear(null)}
//           />

//           <YearlyPatentsTable
//             visiblePatentData={visiblePatentChartData}
//             transformedPatentChartData={transformedPatentChartData}
//             patentTypes={visiblePatentNames}
//             selectedYear={selectedYear}
//             clearFilter={() => setSelectedYear(null)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PatentsIITDelhi;
