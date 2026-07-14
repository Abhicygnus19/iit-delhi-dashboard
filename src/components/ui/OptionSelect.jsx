import React, { useMemo, useState } from "react";
import { GoChevronDown } from "react-icons/go";
import { CiSearch } from "react-icons/ci"; // Fixed: Added missing icon import

const OptionSelect = ({
  label,
  options = [], // Safe fallback for options
  selected = [], // Safe fallback default parameters
  onChange,
  multiple = false,
  searchEnabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Safeguard: Ensure safeSelected is always an array for 'multiple' operations
  // Even if a parent element passes `selected={null}`, this handles it smoothly.
  const safeSelected = multiple
    ? Array.isArray(selected)
      ? selected
      : []
    : selected;

  const safeOptions = Array.isArray(options) ? options : [];

  const handleSelect = (value) => {
    if (multiple) {
      const next = safeSelected.includes(value)
        ? safeSelected.filter((item) => item !== value)
        : [...safeSelected, value];

      onChange(next);
      return;
    }

    onChange(value);
    setIsOpen(false);
  };

  const filteredOptions = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return searchEnabled
      ? safeOptions.filter((opt) =>
          opt?.label?.toLowerCase().includes(lowerSearch),
        )
      : safeOptions;
  }, [safeOptions, searchEnabled, search]);

  // Use the safe arrays to construct display text strings
  const displayLabel = multiple
    ? safeSelected.length === safeOptions.length
      ? `All ${label}s`
      : safeSelected.length > 0
        ? safeSelected.join(", ")
        : label
    : safeSelected || label;

  return (
    <div className="relative w-56">
      <div
        className="flex items-center justify-between border-2 p-2 rounded-md bg-white cursor-pointer hover:border-gray-300"
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
                <CiSearch className="absolute right-3 top-3 text-gray-400" />
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
                      ? safeSelected.includes(option.value)
                      : safeSelected === option.value
                  }
                  onChange={() => handleSelect(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}

            {filteredOptions.length === 0 && (
              <div className="p-3 text-center text-xs text-gray-400">
                No options found
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OptionSelect;

// import React, { useMemo, useState } from "react";
// import { GoChevronDown } from "react-icons/go";

// const OptionSelect = ({
//   label,
//   options,
//   selected = [],
//   onChange,
//   multiple = false,
//   searchEnabled = false,
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState("");

//   const handleSelect = (value) => {
//     if (multiple) {
//       const next = selected.includes(value)
//         ? selected.filter((item) => item !== value)
//         : [...selected, value];

//       onChange(next);
//       return;
//     }

//     onChange(value);
//     setIsOpen(false);
//   };

//   const filteredOptions = useMemo(() => {
//     const lowerSearch = search.toLowerCase();
//     return searchEnabled
//       ? options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch))
//       : options;
//   }, [options, searchEnabled, search]);

//   // CHANGE: Display "All Selected" if array contains everything, or "Select Year" if empty
//   const displayLabel = multiple
//     ? selected.length === options.length
//       ? `All ${label}s`
//       : selected.length > 0
//         ? selected.join(", ")
//         : label
//     : selected || label;

//   return (
//     <div className="relative w-56">
//       <div
//         className="flex items-center justify-between border-2 p-2 rounded-md bg-white cursor-pointer hover:border-gray-300"
//         onClick={() => setIsOpen((prev) => !prev)}
//       >
//         <span className="truncate text-gray-700 font-medium">
//           {displayLabel}
//         </span>
//         <GoChevronDown
//           size={16}
//           className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
//         />
//       </div>

//       {isOpen && (
//         <>
//           <div
//             className="fixed inset-0 z-10"
//             onClick={() => setIsOpen(false)}
//           />

//           <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-y-auto">
//             {searchEnabled && (
//               <div className="relative">
//                 <input
//                   type="search"
//                   placeholder="Search..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full py-2 px-3 border-b bg-gray-50 outline-none"
//                 />
//                 <CiSearch className="absolute right-3 top-3" />
//               </div>
//             )}

//             {filteredOptions.map((option) => (
//               <label
//                 key={option.value}
//                 className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
//               >
//                 <input
//                   type={multiple ? "checkbox" : "radio"}
//                   checked={
//                     multiple
//                       ? selected.includes(option.value)
//                       : selected === option.value
//                   }
//                   onChange={() => handleSelect(option.value)}
//                 />
//                 <span>{option.label}</span>
//               </label>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default OptionSelect;
