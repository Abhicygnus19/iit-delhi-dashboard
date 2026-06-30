import { useState, useMemo } from "react";
import { GoChevronDown } from "react-icons/go";
import { Range } from "react-range";

// 2. Streamlined Multi-Select Dropdown Component
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

// 3. Parent Component
function ConsultancyProjectFilter({
  selectedFunding,
  setSelectedFunding,
  selectedUnits,
  setSelectedUnits,
  fundingOptionsConsultancyProject,
  consultancyProjectYearRange,
  onConsultancyProjectYearRangeChange,
  minYear,
  maxYear,
}) {
  // If the parent hasn't collected min/max details yet, show a clean disabled layout
  if (!consultancyProjectYearRange || minYear === 0 || maxYear === 0) {
    return (
      <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50 opacity-60 pointer-events-none">
        <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
          <div>Initializing Filters...</div>
        </div>
      </div>
    );
  }

  const sliderMin = minYear;
  const sliderMax = maxYear === minYear ? minYear + 1 : maxYear;

  // Dynamically configure values, clamped safely within runtime values and strictly sorted
  const sliderValues = [
    Math.max(sliderMin, Math.min(sliderMax, consultancyProjectYearRange[0])),
    Math.max(sliderMin, Math.min(sliderMax, consultancyProjectYearRange[1])),
  ].sort((a, b) => a - b);

  return (
    <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
      <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
        <CustomSelect
          label="Projects of Each Units"
          options={fundingOptionsConsultancyProject}
          selected={selectedFunding}
          onChange={setSelectedFunding}
        />
        <CustomSelect
          label="Total budget of Units"
          options={fundingOptionsConsultancyProject}
          selected={selectedUnits}
          onChange={setSelectedUnits}
        />{" "}
        <div className="border p-3 rounded-md bg-white">
          <div className="flex items-center gap-4 w-[300px]">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Year:</p>
              <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
                {sliderValues[0]} – {sliderValues[1]}
              </p>
            </div>
            <Range
              values={sliderValues}
              step={1}
              min={sliderMin}
              max={sliderMax}
              onChange={(values) => onConsultancyProjectYearRangeChange(values)}
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
  );
}

export default ConsultancyProjectFilter;
