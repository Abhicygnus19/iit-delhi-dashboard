import { useMemo, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { Range } from "react-range";
import { GoChevronDown } from "react-icons/go";

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

  // FIX: Map selected values back to their user-friendly option labels for display
  const displayLabel = useMemo(() => {
    if (multiple) {
      if (!selected || selected.length === 0) return label;
      if (selected.length === options.length) return `All ${label}`;

      return options
        .filter((opt) => selected.includes(opt.value))
        .map((opt) => opt.label)
        .join(", ");
    }
    const singleOpt = options.find((opt) => opt.value === selected);
    return singleOpt ? singleOpt.label : selected || label;
  }, [selected, options, multiple, label]);

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
          <div className="absolute z-20 mt-1 w-full bg-white border rounded-md shadow-lg max-h-72 overflow-x-hidden overflow-y-auto">
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
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer select-none transition-colors"
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

export default function FiltersPublications({
  categories = [],
  activeCategory = [],
  onCategoryChange,
  entities = [],
  selectedEntities = [],
  onSelectedEntitiesChange,
  years = [2020, 2026],
  yearRange = [2020, 2026],
  onYearRangeChange,
}) {
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
    [categories],
  );

  const entityOptions = useMemo(
    () =>
      entities.map((entity) => ({
        value: entity.code,
        label: entity.name || entity.fullName || entity.code,
      })),
    [entities],
  );

  const minYear = years.length ? Math.min(...years) : 2020;
  const maxYear = years.length ? Math.max(...years) : 2026;

  // Safety fallbacks for ranges
  const safeRange = [yearRange[0] ?? minYear, yearRange[1] ?? maxYear];

  return (
    <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
      <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
        <CustomSelect
          label="Org Type"
          options={categoryOptions}
          selected={activeCategory}
          onChange={onCategoryChange}
          multiple
        />

        <CustomSelect
          label="Dept/Units"
          options={entityOptions}
          selected={selectedEntities}
          onChange={onSelectedEntitiesChange}
          multiple
          searchEnabled
        />

        <div className="border p-3 rounded-md bg-white ">
          <div className="flex items-center gap-4 w-[300px] ">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Year:</p>
              <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
                {safeRange[0]} – {safeRange[1]}
              </p>
            </div>
            <Range
              values={safeRange}
              step={1}
              min={minYear}
              max={maxYear}
              onChange={(values) => onYearRangeChange?.(values)}
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
                        left: `${((safeRange[0] - minYear) / (maxYear - minYear || 1)) * 100}%`,
                        width: `${((safeRange[1] - safeRange[0]) / (maxYear - minYear || 1)) * 100}%`,
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
                    className="h-4 w-4 rounded-full bg-white border border-blue-600 shadow-md outline-none"
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

// import { useMemo, useState } from "react";
// import { CiSearch } from "react-icons/ci";
// import { Range } from "react-range";
// import { GoChevronDown } from "react-icons/go";

// const CustomSelect = ({
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

//   const displayLabel = multiple
//     ? selected.length === options.length
//       ? `All ${label}`
//       : selected.length > 0
//         ? selected.join(", ")
//         : label
//     : selected || label;

//   return (
//     <div className="relative w-56">
//       <div
//         className="flex items-center justify-between border p-2 rounded-md bg-white cursor-pointer hover:border-gray-400"
//         onClick={() => setIsOpen((prev) => !prev)}
//       >
//         <span className="truncate">{displayLabel}</span>

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

// export default function FiltersPublications({
//   categories,
//   activeCategory,
//   onCategoryChange,
//   entities,
//   selectedEntities,
//   onSelectedEntitiesChange,
//   years,
//   yearRange,
//   onYearRangeChange,
//   search,
//   onSearchChange,
// }) {
//   const categoryOptions = useMemo(
//     () =>
//       categories.map((category) => ({
//         value: category,
//         label: category.charAt(0).toUpperCase() + category.slice(1),
//       })),
//     [categories],
//   );

//   const entityOptions = useMemo(
//     () =>
//       entities.map((entity) => ({
//         value: entity.code,
//         label: entity.name,
//       })),
//     [entities],
//   );

//   const minYear = Math.min(...years);
//   const maxYear = Math.max(...years);

//   return (
//     <div className="border-t border-b px-2 py-4 mb-2 text-sm bg-gray-50">
//       <div className="flex flex-wrap items-center gap-6 max-w-[1500px] mx-auto">
//         <CustomSelect
//           label="Org Type"
//           options={categoryOptions}
//           selected={activeCategory}
//           onChange={onCategoryChange}
//           multiple
//         />

//         <CustomSelect
//           label="Dept/Units"
//           options={entityOptions}
//           selected={selectedEntities}
//           onChange={onSelectedEntitiesChange}
//           multiple
//           searchEnabled
//         />

//         <div className="border p-3 rounded-md bg-white ">
//           <div className="flex items-center gap-4 w-[300px] ">
//             <div className="flex items-center gap-2">
//               <p className="text-xs text-gray-500">Year:</p>
//               <p className="text-xs font-medium text-gray-800 whitespace-nowrap">
//                 {yearRange[0]} – {yearRange[1]}
//               </p>
//             </div>{" "}
//             <Range
//               values={yearRange}
//               step={1}
//               min={minYear}
//               max={maxYear}
//               onChange={(values) => onYearRangeChange(values)}
//               renderTrack={({ props, children }) => {
//                 const { key, ...restProps } = props;
//                 return (
//                   <div
//                     key={key}
//                     {...restProps}
//                     className="relative h-2 w-full rounded-full bg-slate-200"
//                     style={{ ...restProps.style }}
//                   >
//                     <div
//                       className="absolute h-2 rounded-full bg-blue-900"
//                       style={{
//                         left: `${((yearRange[0] - minYear) / (maxYear - minYear)) * 100}%`,
//                         width: `${((yearRange[1] - yearRange[0]) / (maxYear - minYear)) * 100}%`,
//                       }}
//                     />
//                     {children}
//                   </div>
//                 );
//               }}
//               renderThumb={({ props, index }) => {
//                 const { key, ...restProps } = props;
//                 return (
//                   <div
//                     key={key}
//                     {...restProps}
//                     className="h-4 w-4 rounded-full bg-white border border-blue-600 shadow-md"
//                     style={{
//                       ...restProps.style,
//                       transform: "translateY(-4px)",
//                     }}
//                   />
//                 );
//               }}
//             />
//           </div>{" "}
//         </div>
//       </div>
//     </div>
//   );
// }
