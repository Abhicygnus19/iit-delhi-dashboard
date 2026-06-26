import { useEffect, useMemo, useState } from "react";
import BarChartBoxPublications from "../dashboards/publications/BarChartBoxPublication";
import StatsPublications from "../dashboards/publications/StatsPublications";
import MetricComparisonPublications from "../dashboards/publications/MetricComparisonPublications";
import TableDataPublications from "../dashboards/publications/TableDataPublications";
import HeatmapYearPublications from "../dashboards/publications/HeatmapYearPublications";
import FiltersPublications from "./../dashboards/publications/FiltersPublications";
import LineChartBoxPublications from "./../dashboards/publications/LineChartBoxPublications";
import InternationalPublicationBarchart from "./../dashboards/publications/InternationalPublicationBarchart";

import { fetchPublicationData } from "../lib/publicationData";

import { LuLoaderCircle } from "react-icons/lu";

export default function Publications() {
  const [apiPublications, setApiPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState([]);
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedOrgType, setSelectedOrgType] = useState(null);
  const [search, setSearch] = useState("");

  // Compute true labels dynamically from the real parsed API state
  const categoryLabels = useMemo(() => {
    if (apiPublications.length === 0) return [];
    const uniqueTypes = [
      ...new Set(apiPublications.map((item) => item.orgType)),
    ];
    return uniqueTypes.map(
      (type) => type.charAt(0).toUpperCase() + type.slice(1),
    );
  }, [apiPublications]);

  const yearLabels = useMemo(() => {
    if (apiPublications.length === 0 || !apiPublications[0].publications)
      return [];
    return apiPublications[0].publications
      .map((pub) => pub.year)
      .sort((a, b) => a - b);
  }, [apiPublications]);

  const [yearRange, setYearRange] = useState([]);

  // Sync year slider bounds once data drops in
  useEffect(() => {
    if (apiPublications.length > 0) {
      const liveYears = apiPublications[0].publications
        .map((p) => p.year)
        .sort((a, b) => a - b);
      setYearRange([Math.min(...liveYears), Math.max(...liveYears)]);
    }
  }, [apiPublications]);

  useEffect(() => {
    const getPublicationData = async () => {
      setLoading(true);
      const apiPubliationData = await fetchPublicationData();
      setApiPublications(apiPubliationData);

      setLoading(false);
    };
    getPublicationData();
  }, []);

  // Process filters directly against the flat dynamic array
  const categoryEntities = useMemo(() => {
    let source = apiPublications;

    if (activeCategories.length > 0) {
      source = source.filter((item) =>
        activeCategories.some(
          (cat) => cat.toLowerCase() === item.orgType.toLowerCase(),
        ),
      );
    }

    if (selectedOrgType) {
      source = source.filter(
        (item) => item.orgType.toLowerCase() === selectedOrgType.toLowerCase(),
      );
    }

    return source;
  }, [apiPublications, activeCategories, selectedOrgType]);

  const filteredEntities = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return categoryEntities.filter(
      (item) =>
        item.code.toLowerCase().includes(lowerSearch) ||
        item.name.toLowerCase().includes(lowerSearch),
    );
  }, [categoryEntities, search]);

  const selectedData = useMemo(() => {
    if (selectedEntities.length === 0) {
      return filteredEntities;
    }

    return filteredEntities.filter((item) =>
      selectedEntities.includes(item.code),
    );
  }, [filteredEntities, selectedEntities]);

  const handleEntitySelect = (code) => {
    setSelectedEntities((prev) =>
      prev.length === 1 && prev[0] === code ? [] : [code],
    );
  };

  const handleYearSelect = (year, orgType = null) => {
    const isAlreadySelected =
      selectedYear === year && selectedOrgType === orgType;

    if (isAlreadySelected) {
      setSelectedYear(null);
      setSelectedOrgType(null);
      setYearRange([Math.min(...yearLabels), Math.max(...yearLabels)]);
      return;
    }

    setSelectedYear(year);
    setSelectedOrgType(orgType);
    setYearRange([year, year]);
  };

  const resetFilters = () => {
    setSelectedEntities([]);
    setSelectedYear(null);
    setSelectedOrgType(null);
    setActiveCategories([]);
    setSearch("");
    setYearRange([Math.min(...yearLabels), Math.max(...yearLabels)]);
  };

  const hasActiveFilters =
    selectedEntities.length > 0 ||
    selectedYear !== null ||
    selectedOrgType !== null ||
    activeCategories.length > 0 ||
    search.trim() !== "" ||
    yearRange[0] !== Math.min(...yearLabels) ||
    yearRange[1] !== Math.max(...yearLabels);

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
      <FiltersPublications
        categories={categoryLabels}
        activeCategory={activeCategories}
        onCategoryChange={(value) => {
          setActiveCategories(value);
          setSelectedEntities([]);
          setSelectedYear(null);
          setSelectedOrgType(null);
        }}
        entities={filteredEntities}
        selectedEntities={selectedEntities}
        onSelectedEntitiesChange={setSelectedEntities}
        years={yearLabels}
        yearRange={yearRange}
        onYearRangeChange={(values) => {
          setSelectedYear(null);
          setSelectedOrgType(null);
          setYearRange(values);
        }}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="px-2 max-w-[1500px] mx-auto">
        <StatsPublications
          entities={selectedData}
          yearRange={yearRange}
          activeCategories={activeCategories}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
          <LineChartBoxPublications
            yearRange={yearRange}
            selectedYear={selectedYear}
            onYearSelect={handleYearSelect}
            onReset={resetFilters}
            showReset={hasActiveFilters}
          />

          <BarChartBoxPublications
            entities={selectedData}
            yearRange={yearRange}
            onEntitySelect={handleEntitySelect}
            onReset={resetFilters}
            showReset={hasActiveFilters}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 mx-auto">
          <MetricComparisonPublications
            entities={selectedData}
            yearRange={yearRange}
            selectedOrgType={selectedOrgType}
          />

          <HeatmapYearPublications
            selectedYear={selectedYear}
            selectedOrgType={selectedOrgType}
            onYearSelect={handleYearSelect}
            entities={selectedData}
          />
        </div>

        <div className="mb-12">
          <TableDataPublications
            entities={selectedData}
            yearRange={yearRange}
          />
        </div>

        <div className="pb-20">
          <InternationalPublicationBarchart />
        </div>
      </div>
    </>
  );
}

// import { useEffect, useMemo, useState } from "react";
// import BarChartBoxPublications from "../dashboards/publications/BarChartBoxPublication";
// import StatsPublications from "../dashboards/publications/StatsPublications";
// import MetricComparisonPublications from "../dashboards/publications/MetricComparisonPublications";
// import TableDataPublications from "../dashboards/publications/TableDataPublications";
// import HeatmapYearPublications from "../dashboards/publications/HeatmapYearPublications";
// import FiltersPublications from "./../dashboards/publications/FiltersPublications";
// import LineChartBoxPublications from "./../dashboards/publications/LineChartBoxPublications";
// import InternationalPublicationBarchart from "./../dashboards/publications/InternationalPublicationBarchart";

// import { publicationData } from "../lib/publicationData";

// const categoryLabels = [
//   ...new Set(publicationData.departments.map((item) => item.orgType)),
// ].map((type) => type.charAt(0).toUpperCase() + type.slice(1));

// const yearLabels = publicationData.departments[0].publications
//   .map((pub) => pub.year)
//   .sort((a, b) => a - b);

// export default function Publications() {
//   const [loading, setLoading] = useState(true);
//   const [activeCategories, setActiveCategories] = useState([]);
//   const [selectedEntities, setSelectedEntities] = useState([]);
//   const [selectedYear, setSelectedYear] = useState(null);
//   const [selectedOrgType, setSelectedOrgType] = useState(null);
//   const [search, setSearch] = useState("");
//   const [yearRange, setYearRange] = useState([
//     Math.min(...yearLabels),
//     Math.max(...yearLabels),
//   ]);

//   const categoryEntities = useMemo(() => {
//     let source = publicationData.departments;

//     if (activeCategories.length > 0) {
//       source = source.filter((item) =>
//         activeCategories.some(
//           (cat) => cat.toLowerCase() === item.orgType.toLowerCase(),
//         ),
//       );
//     }

//     if (selectedOrgType) {
//       source = source.filter(
//         (item) => item.orgType.toLowerCase() === selectedOrgType.toLowerCase(),
//       );
//     }

//     return source;
//   }, [activeCategories, selectedOrgType]);

//   const filteredEntities = useMemo(() => {
//     const lowerSearch = search.toLowerCase();

//     return categoryEntities.filter(
//       (item) =>
//         item.code.toLowerCase().includes(lowerSearch) ||
//         item.name.toLowerCase().includes(lowerSearch),
//     );
//   }, [categoryEntities, search]);

//   const selectedData = useMemo(() => {
//     if (selectedEntities.length === 0) {
//       return filteredEntities;
//     }

//     return filteredEntities.filter((item) =>
//       selectedEntities.includes(item.code),
//     );
//   }, [filteredEntities, selectedEntities]);

//   const handleEntitySelect = (code) => {
//     setSelectedEntities((prev) =>
//       prev.length === 1 && prev[0] === code ? [] : [code],
//     );
//   };

//   const handleYearSelect = (year, orgType = null) => {
//     const isAlreadySelected =
//       selectedYear === year && selectedOrgType === orgType;

//     if (isAlreadySelected) {
//       setSelectedYear(null);
//       setSelectedOrgType(null);
//       setYearRange([Math.min(...yearLabels), Math.max(...yearLabels)]);
//       return;
//     }

//     setSelectedYear(year);
//     setSelectedOrgType(orgType);
//     setYearRange([year, year]);
//   };

//   // filters reset
//   const resetFilters = () => {
//     setSelectedEntities([]);
//     setSelectedYear(null);
//     setSelectedOrgType(null);
//     setActiveCategories([]);
//     setSearch("");

//     setYearRange([Math.min(...yearLabels), Math.max(...yearLabels)]);
//   };

//   const hasActiveFilters =
//     selectedEntities.length > 0 ||
//     selectedYear !== null ||
//     selectedOrgType !== null ||
//     activeCategories.length > 0 ||
//     search.trim() !== "" ||
//     yearRange[0] !== Math.min(...yearLabels) ||
//     yearRange[1] !== Math.max(...yearLabels);

//   return (
//     <>
//       <FiltersPublications
//         categories={categoryLabels}
//         activeCategory={activeCategories}
//         onCategoryChange={(value) => {
//           setActiveCategories(value);
//           setSelectedEntities([]);
//           setSelectedYear(null);
//           setSelectedOrgType(null);
//         }}
//         entities={filteredEntities}
//         selectedEntities={selectedEntities}
//         onSelectedEntitiesChange={setSelectedEntities}
//         years={yearLabels}
//         yearRange={yearRange}
//         onYearRangeChange={(values) => {
//           setSelectedYear(null);
//           setSelectedOrgType(null);
//           setYearRange(values);
//         }}
//         search={search}
//         onSearchChange={setSearch}
//       />

//       <div className="px-2  max-w-[1500px] mx-auto">
//         <StatsPublications
//           entities={selectedData}
//           yearRange={yearRange}
//           activeCategories={activeCategories}
//         />

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto mb-12">
//           <LineChartBoxPublications
//             yearRange={yearRange}
//             selectedYear={selectedYear}
//             onYearSelect={handleYearSelect}
//             onReset={resetFilters}
//             showReset={hasActiveFilters}
//           />

//           <BarChartBoxPublications
//             entities={selectedData}
//             yearRange={yearRange}
//             onEntitySelect={handleEntitySelect}
//             onReset={resetFilters}
//             showReset={hasActiveFilters}
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 mx-auto">
//           <MetricComparisonPublications
//             entities={selectedData}
//             yearRange={yearRange}
//             selectedOrgType={selectedOrgType}
//           />

//           <HeatmapYearPublications
//             selectedYear={selectedYear}
//             selectedOrgType={selectedOrgType}
//             onYearSelect={handleYearSelect}
//           />
//         </div>

//         <div className="mb-12 ">
//           <TableDataPublications
//             entities={selectedData}
//             yearRange={yearRange}
//           />
//         </div>

//         <div className="pb-20">
//           <InternationalPublicationBarchart />
//         </div>
//       </div>
//     </>
//   );
// }
