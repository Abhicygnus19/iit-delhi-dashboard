import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

import { fetchIntenationalPublication } from "../../lib/publicationData";
import WorldMap from "../../components/WorldMap";
import { CustomSelect } from "../../components/selectDropdown/CustomSelect";

export default function InternationalPublicationBarchart() {
  const [internationalPublicationData, setInternationalPublicationData] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedYears, setSelectedYears] = useState([]);

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

      // Dynamically locate the array containing publication stats regardless of property name
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

  const visibleData = internationalChartData.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(20);
  }, [selectedYears]);

  const handleShowLess = () => {
    setVisibleCount((prev) => Math.max(prev - 20, 20));
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

  return (
    <div className="border-2 rounded-md shadow-sm text-xs">
      <div className="flex justify-center gap-2 items-center mb-2 p-4 bg-gray-100 border-b-2">
        <h3 className="font-semibold text-xl text-center">
          International Publications ({displayYear})
        </h3>

        {/* <div className="text-sm">
          <CustomSelect
            label="Select Year"
            options={yearOptions}
            selected={selectedYears}
            onChange={setSelectedYears}
            multiple={true}
          />
        </div> */}
      </div>
      {/* <ResponsiveContainer
        width="100%"
        height={Math.max(visibleData.length * 35, 350)}
      >
        <BarChart data={visibleData} layout="vertical">
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.slice(0, 20)}...` : value
            }
          />
          <Label
            value="Countries"
            angle={-45}
            position="insideLeft"
            offset={-125}
            style={{
              textAnchor: "middle",
              fontSize: "15px",
              fill: "#1e4a8d",
              fontWeight: "bold",
            }}
          />
          <Tooltip
            formatter={(value) => [value, "Number of Publications"]}
            labelFormatter={(label) => `Country: ${label}`}
          />
          <Bar dataKey="value" fill="#1e4a8d" barSize={24} />
        </BarChart>
      </ResponsiveContainer> */}

      {/* <h3 className="text-base mt-4 font-medium pl-4">
        Click on a pin to view total publication for that country
      </h3> */}

      <div className="relative z-0">
        <WorldMap mapData={visibleData} maptooltiptext="Total Publication" />
      </div>

      <div className="flex justify-center gap-2 my-4 font-semibold">
        {visibleCount < internationalChartData.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            Show More
          </button>
        )}

        {visibleCount > 20 && (
          <button
            onClick={handleShowLess}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02]"
          >
            Show Less
          </button>
        )}
      </div>
    </div>
  );
}
