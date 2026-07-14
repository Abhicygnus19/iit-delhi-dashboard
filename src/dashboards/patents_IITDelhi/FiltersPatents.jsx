import React, { useMemo, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { Range } from "react-range";
import { CustomSelect } from "./../../components/selectDropdown/CustomSelect";

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
          <div className="flex items-center gap-4 w-[340px] md:w-[400px]">
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
