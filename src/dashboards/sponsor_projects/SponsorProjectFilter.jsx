import { useState, useMemo } from "react";
import { GoChevronDown } from "react-icons/go";
import { Range } from "react-range";
import { CustomSelect } from "../../components/selectDropdown/CustomSelect";
import { SlCalender } from "react-icons/sl";
import Heading from "../../components/ui/Heading";

function SponsorProjectFilter({
  selectedFunding,
  setSelectedFunding,
  selectedUnits,
  setSelectedUnits,
  fundingOptionsSponsorProject,
  sponsorYearRange,
  onSponsorYearRangeChange,
  minYear,
  maxYear,
}) {
  // If the parent hasn't collected min/max details yet, show a clean disabled layout
  if (!sponsorYearRange || minYear === 0 || maxYear === 0) {
    return (
      <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50 opacity-60 pointer-events-none">
        <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
          <div className="text-gray-400">Initializing Filters...</div>
        </div>
      </div>
    );
  }

  const sliderMin = minYear;
  const sliderMax = maxYear === minYear ? minYear + 1 : maxYear;

  // Dynamically configure values, clamped safely within runtime values and strictly sorted
  const sliderValues = [
    Math.max(sliderMin, Math.min(sliderMax, sponsorYearRange[0])),
    Math.max(sliderMin, Math.min(sliderMax, sponsorYearRange[1])),
  ].sort((a, b) => a - b);

  return (
    <div className="border-t border-b px-2 py-3 mb-2 text-sm bg-gray-50">
      {/* <Heading pageheading={" Sponsored Research Projects"} /> */}
      <div className="max-w-[1500px] mx-auto">
        <h3 className="mb-2 text-base font-medium">
          Select a category to explore project counts and sanctioned funding.
        </h3>
        <div className="flex flex-wrap items-center gap-6 ">
          <CustomSelect
            label="Select Funding Category"
            options={fundingOptionsSponsorProject}
            selected={selectedFunding}
            onChange={setSelectedFunding}
          />
          {/* <CustomSelect
            label="Category for Sanctioned Funds"
            options={fundingOptionsSponsorProject}
            selected={selectedUnits}
            onChange={setSelectedUnits}
          />{" "} */}
          <div className="border p-3 h-11 rounded-md bg-white">
            <div className="flex items-center gap-4 w-[360px] md:w-[400px]">
              <div className="flex items-center gap-2">
                {/* <div className="w-10 h-10 flex justify-center items-center bg-blue-50 rounded-full ">
                <SlCalender className="text-sm" />
              </div> */}
                <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
                  {sliderValues[0]} – {sliderValues[1]}
                </p>
              </div>
              <Range
                values={sliderValues}
                step={1}
                min={sliderMin}
                max={sliderMax}
                onChange={(values) => onSponsorYearRangeChange(values)}
                renderTrack={({ props, children }) => {
                  const { key, ...restProps } = props;
                  const delta = sliderMax - sliderMin || 1;
                  const leftOffset =
                    ((sliderValues[0] - sliderMin) / delta) * 100;
                  const trackWidth =
                    ((sliderValues[1] - sliderValues[0]) / delta) * 100;

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
                          left: `${leftOffset}%`,
                          width: `${trackWidth}%`,
                        }}
                      />
                      {children}
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
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
    </div>
  );
}

export default SponsorProjectFilter;
