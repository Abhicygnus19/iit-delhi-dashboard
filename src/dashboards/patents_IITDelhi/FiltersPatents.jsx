import React, { useMemo, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { Range } from "react-range";

const CustomSelect = ({ label, options, selected = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic label based on selection status
  const displayLabel = useMemo(() => {
    if (selected.length === 0) return label;
    if (selected.length === 1) {
      return options.find((opt) => opt.value === selected[0])?.label || label;
    }
    return `${selected.length} Selected`;
  }, [selected, options, label]);

  const handleSelect = (value) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="relative w-64">
      {/* Selector Button */}
      <div
        className="flex items-center justify-between border p-2 rounded-md bg-white cursor-pointer hover:border-gray-400 select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="truncate text-gray-700 font-medium">
          {displayLabel}
        </span>
        <GoChevronDown
          size={16}
          className={`transition-transform duration-200 text-gray-500 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <>
          {/* Backdrop layer to safely close select on outside click */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Options Menu */}
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg overflow-hidden">
            {options.map((option) => {
              const isChecked = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer select-none transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleSelect(option.value)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

function FiltersPatents({
  options,
  selected,
  onChange,
  patentsYearRange,
  minYear,
  maxYear,
  onPatentsYearRangeChange,
}) {
  return (
    <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
      <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
        <CustomSelect
          label="Select type of Patents"
          options={options}
          selected={selected}
          onChange={onChange}
        />
        <div className="border p-3 rounded-md bg-white ">
          <div className="flex items-center gap-4 w-[300px]">
            {" "}
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Year:</p>
              <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
                {patentsYearRange[0]} – {patentsYearRange[1]}
              </p>
            </div>
            <Range
              values={patentsYearRange}
              step={1}
              min={minYear}
              max={maxYear}
              onChange={(values) => onPatentsYearRangeChange(values)}
              renderTrack={({ props, children }) => {
                const { key, ...restProps } = props;
                return (
                  <div
                    key={key}
                    {...restProps}
                    className="relative h-2 w-full rounded-full bg-slate-200"
                    style={{ ...restProps.style }}
                  >
                    <div
                      className="absolute h-2 rounded-full bg-blue-900"
                      style={{
                        left: `${((patentsYearRange[0] - minYear) / Math.max(1, maxYear - minYear)) * 100}%`,
                        width: `${((patentsYearRange[1] - patentsYearRange[0]) / Math.max(1, maxYear - minYear)) * 100}%`,
                      }}
                    />
                    {children}
                  </div>
                );
              }}
              renderThumb={({ props, index }) => {
                const { key, ...restProps } = props;
                return (
                  <div
                    key={key}
                    {...restProps}
                    className="h-4 w-4 rounded-full bg-white border border-blue-600 shadow-md focus:outline-none"
                    style={{
                      ...restProps.style,
                      transform: "translateY(-4px)",
                    }}
                  />
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FiltersPatents;
