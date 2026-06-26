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
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
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
function SponsorProjectFilter({
  selectedFunding,
  setSelectedFunding,
  selectedUnits,
  setSelectedUnits,
  fundingOptionsSponsorProject,
}) {
  return (
    <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
      <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
        <CustomSelect
          label="Projects of Each Units"
          options={fundingOptionsSponsorProject}
          selected={selectedFunding}
          onChange={setSelectedFunding}
        />
        <CustomSelect
          label="Total budget of Units"
          options={fundingOptionsSponsorProject}
          selected={selectedUnits}
          onChange={setSelectedUnits}
        />{" "}
      </div>
    </div>
  );
}

export default SponsorProjectFilter;
