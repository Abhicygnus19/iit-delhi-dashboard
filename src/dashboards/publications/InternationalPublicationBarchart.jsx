import { useEffect, useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { GoChevronDown } from "react-icons/go";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { fetchIntenationalPublication } from "../../lib/publicationData";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

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
      setInternationalPublicationData(apiDataInternationalPub);

      // Auto-select the loaded year array once data arrives
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
    // Return empty placeholders if data hasn't loaded yet
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

      // Find the array containing country statistics dynamically
      const arrayKey = Object.keys(yearData).find((key) =>
        Array.isArray(yearData[key]),
      );
      if (!arrayKey) return;

      yearData[arrayKey].forEach((item) => {
        if (countryTotals[item.country]) {
          countryTotals[item.country] += item.publications;
        } else {
          countryTotals[item.country] = item.publications;
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

  if (loading) {
    return (
      <div className="p-4 text-xs font-semibold text-gray-700">
        Loading Chart Data...
      </div>
    );
  }

  return (
    <div className="border-2 rounded-md shadow-sm text-xs">
      <div className="flex justify-between gap-2 items-center mb-4 p-4 bg-gray-100 border-b-2">
        <h3 className="font-semibold text-base ">
          International Publications from ({displayYear})
        </h3>
        <div className="text-sm">
          <CustomSelect
            label="Select Year"
            options={yearOptions}
            selected={selectedYears}
            onChange={setSelectedYears}
            multiple={true}
          />
        </div>{" "}
      </div>

      <ResponsiveContainer
        width="100%"
        height={Math.max(visibleData.length * 35, 350)}
      >
        <BarChart data={visibleData} layout="vertical">
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tickFormatter={(value) =>
              value.length > 20 ? `${value.slice(0, 20)}...` : value
            }
          />
          <Tooltip />
          <Bar dataKey="value" fill="#1e4a8d" barSize={24} />
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-2 my-4 font-semibold">
        {visibleCount < internationalChartData.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + 20)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
          >
            Show More
            <FaArrowDown className="animate-bounce" size={18} />
          </button>
        )}

        {visibleCount > 20 && (
          <button
            onClick={() => setVisibleCount(20)}
            className="flex items-center gap-2 px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-full font-semibold shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl  animate-pulse"
          >
            Show Less
            <FaArrowUp className="animate-bounce" size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

const CustomSelect = ({
  label,
  options,
  selected = [],
  onChange,
  multiple = false,
  searchEnabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (value) => {
    if (multiple) {
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];

      onChange(next);
      return;
    }

    onChange(value);
    setIsOpen(false);
  };

  const filteredOptions = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return searchEnabled
      ? options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch))
      : options;
  }, [options, searchEnabled, search]);

  // CHANGE: Display "All Selected" if array contains everything, or "Select Year" if empty
  const displayLabel = multiple
    ? selected.length === options.length
      ? `All ${label}s`
      : selected.length > 0
        ? selected.join(", ")
        : label
    : selected || label;

  return (
    <div className="relative w-56">
      <div
        className="flex items-center justify-between border p-2 rounded-md bg-white cursor-pointer hover:border-gray-400"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate text-gray-700 font-medium">
          {displayLabel}
        </span>
        <GoChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto">
            {searchEnabled && (
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-2 px-3 border-b bg-gray-50 outline-none"
                />
                <CiSearch className="absolute right-3 top-3" />
              </div>
            )}

            {filteredOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
              >
                <input
                  type={multiple ? "checkbox" : "radio"}
                  checked={
                    multiple
                      ? selected.includes(option.value)
                      : selected === option.value
                  }
                  onChange={() => handleSelect(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
