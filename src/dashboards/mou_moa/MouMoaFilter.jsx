import React, { useMemo, useState } from "react";
import { GoChevronDown } from "react-icons/go";

const CustomSelect = ({ label, options, selected = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

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
      <div
        className="flex items-center justify-between border p-2 rounded-md bg-white cursor-pointer border-gray-200 hover:border-gray-200 select-none"
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
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-x-hidden overflow-y-auto">
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

function MouMoaFilter({ options, selected, onChange, optionValue }) {
  return (
    <div className="flex  flex-wrap text-sm">
      <CustomSelect
        label={optionValue}
        options={options}
        selected={selected}
        onChange={onChange}
      />{" "}
    </div>
  );
}

export default MouMoaFilter;
