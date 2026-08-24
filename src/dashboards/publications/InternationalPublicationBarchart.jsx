import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

import { fetchIntenationalPublication } from "../../lib/publicationData";
import WorldMap from "../../components/WorldMap";
import { CustomSelect } from "../../components/selectDropdown/CustomSelect";

export default function InternationalPublicationBarchart() {
  const [internationalPublicationData, setInternationalPublicationData] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(40);
  const [selectedYears, setSelectedYears] = useState([]);

  const containerRef = useRef(null);

  useEffect(() => {
    const getInternationalPublicationData = async () => {
      setLoading(true);
      const apiDataInternationalPub = await fetchIntenationalPublication();
      setInternationalPublicationData(apiDataInternationalPub || []);

      if (apiDataInternationalPub && apiDataInternationalPub[0]) {
        setSelectedYears([apiDataInternationalPub[0].year]);
      }
      setLoading(false);
    };
    getInternationalPublicationData();
  }, []);

  const yearOptions = internationalPublicationData.map((item) => ({
    label: String(item.year),
    value: item.year,
  }));

  const { internationalChartData, displayYear } = useMemo(() => {
    if (internationalPublicationData.length === 0) {
      return { internationalChartData: [], displayYear: "" };
    }

    const yearsToCompute =
      selectedYears.length > 0
        ? selectedYears
        : internationalPublicationData.map((item) => item.year);

    const countryTotals = {};

    yearsToCompute.forEach((year) => {
      const yearData = internationalPublicationData.find(
        (item) => item.year === year,
      );
      if (!yearData) return;

      const arrayKey = Object.keys(yearData).find((key) =>
        Array.isArray(yearData[key]),
      );
      if (!arrayKey) return;

      yearData[arrayKey].forEach((item) => {
        if (!item.country) return;
        const countryName = item.country.trim();
        const pubs = parseInt(item.publications || 0, 10);

        if (countryTotals[countryName]) {
          countryTotals[countryName] += pubs;
        } else {
          countryTotals[countryName] = pubs;
        }
      });
    });

    const formattedData = Object.keys(countryTotals)
      .map((country) => ({
        name: country,
        value: countryTotals[country],
      }))
      .sort((a, b) => b.value - a.value);

    const displayYearStr =
      selectedYears.length > 0 ? selectedYears.join(", ") : "All Years";

    return {
      displayYear: displayYearStr,
      internationalChartData: formattedData,
    };
  }, [selectedYears, internationalPublicationData]);

  // Controls map pin visibility limit
  const visibleData = internationalChartData.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(40);
  }, [selectedYears]);

  const handleShowLess = () => {
    setVisibleCount((prev) => Math.max(prev - 40, 40));
    containerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) {
    return (
      <div className="p-4 text-xs font-semibold text-gray-700">
        Loading Chart Data...
      </div>
    );
  }

  // Calculate maximum value across all items for accurate heatmap scaling
  const maxVal = Math.max(
    ...internationalChartData.map((item) => item.value),
    1,
  );

  return (
    <div ref={containerRef} className="border-2 rounded-md shadow-sm text-xs">
      <div className="flex justify-center gap-2 items-center mb-2 p-4 bg-gray-100 border-b-2">
        <h3 className="font-semibold text-xl text-center">
          International Publications ({displayYear})
        </h3>
      </div>

      <div className="relative z-0">
        <WorldMap mapData={visibleData} maptooltiptext="Total Publication" />
      </div>

      <div className="flex justify-center gap-2 my-6 font-semibold">
        {visibleCount < internationalChartData.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 40)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            Show More on Map <FaArrowDown className="text-xs" />
          </button>
        )}

        {visibleCount > 40 && (
          <button
            onClick={handleShowLess}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            Show Less on Map
            <FaArrowUp className="text-xs" />
          </button>
        )}
      </div>

      {/* Heatmap Grid Layout - Renders ALL items */}
      {/* <div className="my-4 mx-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {internationalChartData.map((row, index) => {
          const ratio = row.value / maxVal;

          return (
            <div
              key={row.name || index}
              className="relative overflow-hidden rounded-xl border border-slate-200 bg-gray-100 p-3 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-2 items-center text-slate-600 font-medium text-sm mb-1">
                  <span>#{index + 1}</span>
                  <h4
                    className=" text-blue-800 text-sm font-bold truncate"
                    title={row.name}
                  >
                    {row.name}
                  </h4>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-sm text-slate-700">Publications</span>
                <span
                  className="rounded-md px-2 py-0.5 text-base font-bold transition-colors"
                  style={{
                    backgroundColor:
                      ratio > 0.75
                        ? `rgba(225, 29, 72, ${Math.max(ratio * 0.35, 0.15)})` // Red for top 25%
                        : ratio > 0.4
                          ? `rgba(217, 119, 6, ${Math.max(ratio * 0.35, 0.15)})` // Amber/Orange for middle
                          : `rgba(59, 130, 246, ${Math.max(ratio * 0.35, 0.12)})`, // Blue for lower values
                    color:
                      ratio > 0.75
                        ? "#881337"
                        : ratio > 0.4
                          ? "#78350f"
                          : "#1e3a8a",
                  }}
                >
                  {row.value?.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div> */}

      {/* Heatmap Grid Layout */}
      {/* <div className="my-4 mx-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {internationalChartData.map((row, index) => {
          let cardBg = "";
          let badgeBg = "";
          let textColor = "";

          if (row.value <= 50) {
            // 1–50
            cardBg = "bg-red-50 border-red-200 hover:border-red-300";
            badgeBg = "bg-red-100 text-red-800";
            textColor = "text-red-900";
          } else if (row.value <= 100) {
            // 51–100
            cardBg = "bg-green-50 border-green-200 hover:border-green-300";
            badgeBg = "bg-green-100 text-green-800";
            textColor = "text-green-900";
          } else if (row.value <= 150) {
            // 101–150
            cardBg = "bg-yellow-50 border-yellow-200 hover:border-yellow-300";
            badgeBg = "bg-yellow-100 text-yellow-800";
            textColor = "text-yellow-900";
          } else if (row.value <= 200) {
            // 151–200
            cardBg = "bg-orange-50 border-orange-200 hover:border-orange-300";
            badgeBg = "bg-orange-100 text-orange-800";
            textColor = "text-orange-900";
          } else if (row.value <= 250) {
            // 201–250
            cardBg = "bg-red-50 border-red-200 hover:border-red-300";
            badgeBg = "bg-red-100 text-red-800";
            textColor = "text-red-900";
          } else {
            // Above 250
            cardBg = "bg-blue-50 border-blue-200 hover:border-blue-300";
            badgeBg = "bg-blue-100 text-blue-800";
            textColor = "text-blue-900";
          }
          return (
            <div
              key={row.name || index}
              className={`relative overflow-hidden rounded-xl border p-4 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between ${cardBg}`}
            >
              <div className="flex gap-1.5 items-center font-medium mb-1">
                <span className={`text-sm ${textColor}`}>#{index + 1}</span>

                <h4 className={`text-sm ${textColor}`} title={row.name}>
                  {row.name}
                </h4>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-gray-600 text-sm">Publications</span>

                <span
                  className={`rounded-md text-base px-2 py-0.5 font-bold transition-colors ${badgeBg}`}
                >
                  {row.value?.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div> */}

      {/* heatmap grid layout red color  */}
      <div className="my-4 mx-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {internationalChartData.map((row, index) => {
          const values = internationalChartData.map((item) => item.value);

          const minValue = Math.min(...values);
          const maxValue = Math.max(...values);

          // Convert value to 0 → 1 range
          const intensity =
            maxValue === minValue
              ? 0
              : (row.value - minValue) / (maxValue - minValue);

          // Background becomes deeper as value increases
          const backgroundLightness = 96 - intensity * 50;

          // Low value = dark text
          // High value = white text
          const textColor =
            intensity > 0.55
              ? "#ffffff"
              : `hsl(0, 70%, ${25 - intensity * 10}%)`;

          return (
            <div
              key={row.name || index}
              style={{
                backgroundColor: `hsl(0, 75%, ${backgroundLightness}%)`,
                borderColor: `hsl(0, 70%, ${backgroundLightness - 8}%)`,
                color: textColor,
              }}
              className="relative overflow-hidden rounded-xl border p-4 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex gap-1.5 items-center font-medium mb-1">
                <span className="text-sm">#{index + 1}</span>

                <h4 className="text-sm" title={row.name}>
                  {row.name}
                </h4>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm opacity-80">Publications</span>

                <span
                  className="rounded-md text-base px-2 py-0.5 font-bold"
                  style={{
                    backgroundColor:
                      intensity > 0.55
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(255,255,255,0.45)",
                    color: textColor,
                  }}
                >
                  {row.value?.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
